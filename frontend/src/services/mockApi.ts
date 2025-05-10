import { ref } from 'vue'

// Types
interface User {
  usrID: number
  usrName: string
  usrPhone: string
  usrEmail?: string
  usrAvatar?: string
  usrGrade: number
  usrQuestions: number
  progress: Progress[]
  chats: Chat[]
  darkMode?: boolean
}

interface Progress {
  id: number
  subject: string
  chapter: string
  completion: number
  lastActivity: string
  data: Record<string, any>
}

interface Chat {
  id: number
  subject: string | null
  chapter: string | null
  question: string
  response: string
  createdAt: string
}

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

// Mock Data Store
class MockStore {
  private users = ref<User[]>([
    {
      usrID: 1,
      usrName: 'کاربر تست',
      usrPhone: '09123456789',
      usrEmail: 'test@example.com',
      usrAvatar: '/images/default-avatar.png',
      usrGrade: 7,
      usrQuestions: 10,
      progress: [],
      chats: []
    }
  ])

  private tokens = new Map<string, number>() // token -> userId

  // Helper Functions
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateToken(userId: number) {
    const token = `mock-jwt-token-${userId}-${Date.now()}`
    this.tokens.set(token, userId)
    return token
  }

  private validateToken(token: string): number | null {
    const userId = this.tokens.get(token)
    return userId || null
  }

  private getUserById(userId: number): User | undefined {
    return this.users.value.find(u => u.usrID === userId)
  }

  // Auth API
  async requestOTP(phone: string): Promise<ApiResponse> {
    await this.delay(1000)
    
    if (!/^09[0-9]{9}$/.test(phone)) {
      return {
        success: false,
        message: 'شماره موبایل نامعتبر است'
      }
    }

    return {
      success: true,
      message: 'کد تایید ارسال شد'
    }
  }

  async verifyOTP(phone: string, otp: string): Promise<ApiResponse<{ token: string }>> {
    await this.delay(1000)

    if (otp !== '123456') {
      return {
        success: false,
        message: 'کد تایید نامعتبر است'
      }
    }

    let user = this.users.value.find(u => u.usrPhone === phone)
    if (!user) {
      user = {
        usrID: this.users.value.length + 1,
        usrName: 'کاربر جدید',
        usrPhone: phone,
        usrGrade: 7,
        usrQuestions: 0,
        progress: [],
        chats: []
      }
      this.users.value.push(user)
    }

    const token = this.generateToken(user.usrID)
    return {
      success: true,
      message: 'ورود موفقیت‌آمیز',
      data: { token }
    }
  }

  // User API
  async getUserProfile(token: string): Promise<ApiResponse<User>> {
    await this.delay(500)
    
    const userId = this.validateToken(token)
    if (!userId) {
      return {
        success: false,
        message: 'توکن نامعتبر است'
      }
    }

    const user = this.getUserById(userId)
    if (!user) {
      return {
        success: false,
        message: 'کاربر یافت نشد'
      }
    }

    return {
      success: true,
      message: 'اطلاعات کاربر با موفقیت دریافت شد',
      data: user
    }
  }

  async updateProfile(token: string, profileData: Partial<User>): Promise<ApiResponse<User>> {
    await this.delay(1000)
    
    const userId = this.validateToken(token)
    if (!userId) {
      return {
        success: false,
        message: 'توکن نامعتبر است'
      }
    }

    const userIndex = this.users.value.findIndex(u => u.usrID === userId)
    if (userIndex === -1) {
      return {
        success: false,
        message: 'کاربر یافت نشد'
      }
    }

    this.users.value[userIndex] = {
      ...this.users.value[userIndex],
      ...profileData
    }

    return {
      success: true,
      message: 'پروفایل با موفقیت بروزرسانی شد',
      data: this.users.value[userIndex]
    }
  }

  // Progress API
  async updateProgress(token: string, progress: Omit<Progress, 'id'>): Promise<ApiResponse<Progress>> {
    await this.delay(800)
    
    const userId = this.validateToken(token)
    if (!userId) {
      return {
        success: false,
        message: 'توکن نامعتبر است'
      }
    }

    const user = this.getUserById(userId)
    if (!user) {
      return {
        success: false,
        message: 'کاربر یافت نشد'
      }
    }

    const progressId = Date.now()
    const newProgress = { ...progress, id: progressId }
    
    const existingIndex = user.progress.findIndex(
      p => p.subject === progress.subject && p.chapter === progress.chapter
    )

    if (existingIndex >= 0) {
      user.progress[existingIndex] = newProgress
    } else {
      user.progress.push(newProgress)
    }

    return {
      success: true,
      message: 'پیشرفت با موفقیت ثبت شد',
      data: newProgress
    }
  }

  // Chat API
  async sendChat(token: string, chat: Omit<Chat, 'id' | 'createdAt'>): Promise<ApiResponse<Chat>> {
    await this.delay(1500)
    
    const userId = this.validateToken(token)
    if (!userId) {
      return {
        success: false,
        message: 'توکن نامعتبر است'
      }
    }

    const user = this.getUserById(userId)
    if (!user) {
      return {
        success: false,
        message: 'کاربر یافت نشد'
      }
    }

    if (user.usrQuestions <= 0) {
      return {
        success: false,
        message: 'سوال باقی‌مانده ندارید'
      }
    }

    const newChat = {
      ...chat,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }

    user.chats.unshift(newChat)
    user.usrQuestions--

    return {
      success: true,
      message: 'سوال با موفقیت ارسال شد',
      data: newChat
    }
  }

  async getChatHistory(token: string, page = 1, limit = 10): Promise<ApiResponse<{ chats: Chat[], total: number }>> {
    await this.delay(500)
    
    const userId = this.validateToken(token)
    if (!userId) {
      return {
        success: false,
        message: 'توکن نامعتبر است'
      }
    }

    const user = this.getUserById(userId)
    if (!user) {
      return {
        success: false,
        message: 'کاربر یافت نشد'
      }
    }

    const start = (page - 1) * limit
    const end = start + limit
    const chats = user.chats.slice(start, end)

    return {
      success: true,
      message: 'تاریخچه چت با موفقیت دریافت شد',
      data: {
        chats,
        total: user.chats.length
      }
    }
  }

  // Payment API
  async buyQuestions(token: string, questions: number): Promise<ApiResponse<User>> {
    await this.delay(2000)
    
    const userId = this.validateToken(token)
    if (!userId) {
      return {
        success: false,
        message: 'توکن نامعتبر است'
      }
    }

    const user = this.getUserById(userId)
    if (!user) {
      return {
        success: false,
        message: 'کاربر یافت نشد'
      }
    }

    user.usrQuestions += questions

    return {
      success: true,
      message: 'سوال با موفقیت خریداری شد',
      data: user
    }
  }
}

// Export singleton instance
export const mockApi = new MockStore()

// Export types for use in other files
export type { User, Progress, Chat, ApiResponse } 