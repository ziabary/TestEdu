import { defineStore } from 'pinia'
import { ref } from 'vue'

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
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        user.value = null
        isAuthenticated.value = false
        return
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        user.value = await response.json()
        isAuthenticated.value = true
      } else {
        user.value = null
        isAuthenticated.value = false
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      user.value = null
      isAuthenticated.value = false
      localStorage.removeItem('token')
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No token found')

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        user.value = { ...user.value, ...profileData } as User
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating profile:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      user.value = null
      isAuthenticated.value = false
      localStorage.removeItem('token')
    }
  }

  const updateProgress = async (subject: string, chapter: string, completion: number, lastActivity: string, data: Record<string, any>) => {
    if (!user.value) return

    try {
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          chapter,
          completion,
          lastActivity,
          data
        })
      })

      if (!response.ok) {
        throw new Error('Progress update failed')
      }

      const progress = await response.json()
      const index = user.value.progress.findIndex(p => p.subject === subject && p.chapter === chapter)
      
      if (index >= 0) {
        user.value.progress[index] = progress
      } else {
        user.value.progress.push(progress)
      }
    } catch (error) {
      console.error('Progress update error:', error)
      throw error
    }
  }

  const sendChat = async (question: string, subject?: string, chapter?: string) => {
    if (!user.value) return

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question,
          subject,
          chapter
        })
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No questions remaining')
        }
        throw new Error('Chat failed')
      }

      const chat = await response.json()
      user.value.chats.unshift(chat)
      user.value.usrQuestions--
    } catch (error) {
      console.error('Chat error:', error)
      throw error
    }
  }

  const getChatHistory = async (page = 1, limit = 10) => {
    if (!user.value) return []

    try {
      const response = await fetch(
        `/api/chat/history?page=${page}&limit=${limit}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch chat history')
      }

      return await response.json()
    } catch (error) {
      console.error('Chat history error:', error)
      throw error
    }
  }

  const buyQuestions = async (questions: number) => {
    if (!user.value) return

    try {
      const response = await fetch('/api/payment/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questions })
      })

      if (!response.ok) {
        throw new Error('Purchase failed')
      }

      const user = await response.json()
      user.value = user
    } catch (error) {
      console.error('Purchase error:', error)
      throw error
    }
  }

  return {
    user,
    isAuthenticated,
    loadUserProfile,
    updateProfile,
    logout,
    updateProgress,
    sendChat,
    getChatHistory,
    buyQuestions
  }
}) 