import axios from 'axios'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const AVVALAI_API_KEY = process.env.AVVALAI_API_KEY
const AVVALAI_API_URL = process.env.AVVALAI_API_URL || 'https://api.avvalai.com/v1'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  choices: Array<{
    delta: {
      content: string
    }
  }>
}

export class AvvalaiService {
  private static instance: AvvalaiService
  private apiClient: any

  private constructor() {
    this.apiClient = axios.create({
      baseURL: AVVALAI_API_URL,
      headers: {
        'Authorization': `Bearer ${AVVALAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
  }

  public static getInstance(): AvvalaiService {
    if (!AvvalaiService.instance) {
      AvvalaiService.instance = new AvvalaiService()
    }
    return AvvalaiService.instance
  }

  private async validateQuestion(question: string): Promise<boolean> {
    // Basic validation
    if (!question || question.trim().length < 5) return false
    
    // Check if question is related to math or physics
    const keywords = ['جمع', 'تفریق', 'ضرب', 'تقسیم', 'نیرو', 'حرکت', 'سرعت']
    return keywords.some(keyword => question.includes(keyword))
  }

  private async getSystemPrompt(): Promise<string> {
    return `شما یک معلم ریاضی و فیزیک برای کلاس هفتم هستید. 
    پاسخ‌های شما باید:
    1. به فارسی باشند
    2. مناسب دانش‌آموزان کلاس هفتم باشند
    3. کوتاه و دقیق باشند
    4. از MathJax برای نمایش فرمول‌ها استفاده کنند
    5. فقط به سؤالات مرتبط با ریاضی و فیزیک کلاس هفتم پاسخ دهید
    6. اگر سؤال خارج از موضوع درسه، بگویید: "این سؤال خارج از موضوع درسه!"`
  }

  public async sendMessage(
    question: string,
    subject: string,
    chapter: string,
    userId: number
  ): Promise<string> {
    try {
      if (!await this.validateQuestion(question)) {
        throw new Error('سوال معتبر نیست یا خارج از موضوع درسه')
      }

      const systemPrompt = await this.getSystemPrompt()
      const conversation = await prisma.tblChat.findMany({
        where: { chtUserID: userId },
        orderBy: { chtCreatedDateTime: 'asc' }
      })

      const messages: ChatMessage[] = [
        { role: 'system' as const, content: systemPrompt }
      ]

      // Add conversation history
      messages.push(...conversation.map(c => ({
        role: 'user' as const,
        content: c.chtQuestion
      })))

      // Add current question
      messages.push({
        role: 'user' as const,
        content: question
      })

      const response = await this.apiClient.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages,
        stream: true
      })

      let answer = ''
      for await (const chunk of response.data) {
        const content = chunk.choices[0]?.delta?.content || ''
        answer += content
        // Stream response to client
      }

      return answer

    } catch (error) {
      console.error('Error in avvalai service:', error)
      throw error
    }
  }

  public async getConversationTitle(
    sessionId: string,
    conversation: ChatMessage[]
  ): Promise<string> {
    const prompt = `برای مکالمه زیر یک عنوان کوتاه (حداکثر ۵۰ کاراکتر) به فارسی رسمی بساز:
    ${conversation.map(c => `${c.role}: ${c.content}`).join('\n')}`

    try {
      const response = await this.apiClient.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 50
      })

      return response.data.choices[0].message.content.trim().slice(0, 50)
    } catch (error) {
      console.error('Error generating conversation title:', error)
      return `مکالمه ${conversation[0].content.slice(0, 40)}`
    }
  }
}

export const avvalaiService = AvvalaiService.getInstance()
