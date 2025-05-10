import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, Progress, Account, Chat, Invoice } from '@/types'

export const useStore = defineStore('main', () => {
  const user = ref<User | null>(null)
  const userProgress = ref<Progress>({
    mathMinistry: 0,
    mathSupplementary: 0,
    physics: 0,
    practiceCount: 0,
    examCount: 0,
    successRate: 0,
    studyTime: 0
  })
  const userChats = ref<Chat[]>([])
  const userInvoices = ref<Invoice[]>([])
  const remainingQuestions = ref(10) // Initial 10 free questions

  // Actions
  async function loadUserProfile() {
    try {
      const response = await fetch('/api/user/profile')
      if (!response.ok) throw new Error('Failed to load profile')
      user.value = await response.json()
    } catch (error) {
      console.error('Error loading profile:', error)
      throw error
    }
  }

  async function loadPracticeQuestion(chapter: string) {
    try {
      const response = await fetch(`/api/practice/${chapter}`)
      if (!response.ok) throw new Error('Failed to load question')
      return await response.json()
    } catch (error) {
      console.error('Error loading practice question:', error)
      throw error
    }
  }

  async function loadExamQuestions(type: 'chapter' | 'cumulative') {
    try {
      const response = await fetch(`/api/exam/${type}`)
      if (!response.ok) throw new Error('Failed to load exam questions')
      return await response.json()
    } catch (error) {
      console.error('Error loading exam questions:', error)
      throw error
    }
  }

  async function submitExam(answers: string[]) {
    try {
      const response = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      if (!response.ok) throw new Error('Failed to submit exam')
      const result = await response.json()
      // Update progress stats
      userProgress.value.examCount++
      userProgress.value.successRate = result.successRate
    } catch (error) {
      console.error('Error submitting exam:', error)
      throw error
    }
  }

  async function loadChatHistory(page: number = 1) {
    try {
      const response = await fetch(`/api/chat/history?page=${page}`)
      if (!response.ok) throw new Error('Failed to load chat history')
      return await response.json()
    } catch (error) {
      console.error('Error loading chat history:', error)
      throw error
    }
  }

  async function sendChat(message: string, subject: string, book: string, chapter: string) {
    try {
      if (remainingQuestions.value <= 0) {
        throw new Error('No questions remaining')
      }

      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, subject, book, chapter })
      })
      if (!response.ok) throw new Error('Failed to send chat')
      
      remainingQuestions.value--
      const chat = await response.json()
      userChats.value.unshift(chat)
      return chat
    } catch (error) {
      console.error('Error sending chat:', error)
      throw error
    }
  }

  async function purchaseQuestions(packageId: number) {
    try {
      const response = await fetch(`/api/purchase/${packageId}`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Purchase failed')
      const invoice = await response.json()
      userInvoices.value.unshift(invoice)
      remainingQuestions.value += invoice.questions
      return invoice
    } catch (error) {
      console.error('Error purchasing questions:', error)
      throw error
    }
  }

  function updateUserQuestions(newCount: number) {
    remainingQuestions.value = newCount
  }

  return {
    user,
    userProgress,
    userChats,
    userInvoices,
    remainingQuestions,
    loadUserProfile,
    loadPracticeQuestion,
    loadExamQuestions,
    submitExam,
    loadChatHistory,
    sendChat,
    purchaseQuestions,
    updateUserQuestions
  }
})

export default useStore
