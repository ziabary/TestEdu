import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import Cookies from 'js-cookie'

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
  darkMode?: boolean
}

interface AuthStore {
  user: Ref<User | null>
  isAuthenticated: Ref<boolean>
  isDarkMode: Ref<boolean>
  showLoginModal: Ref<boolean>
  loadDarkMode: () => void
  toggleDarkMode: () => void
  loadUserProfile: () => Promise<void>
  updateProfile: (profileData: Partial<User>) => Promise<void>
  logout: () => Promise<void>
  updateProgress: (subject: string, chapter: string, completion: number, lastActivity: string, data: Record<string, any>) => Promise<void>
  sendChat: (question: string, subject?: string, chapter?: string) => Promise<void>
  getChatHistory: (page?: number, limit?: number) => Promise<void>
  buyQuestions: (questions: number) => Promise<void>
  showLoginDialog: () => void
  closeLoginDialog: () => void
}

export const useAuthStore = defineStore('auth', (): AuthStore => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isDarkMode = ref(false)
  const showLoginModal = ref(false)

  const showLoginDialog = () => {
    console.log('showLoginDialog called')
    showLoginModal.value = true
    console.log('showLoginModal value:', showLoginModal.value)
  }

  const closeLoginDialog = () => {
    console.log('closeLoginDialog called')
    showLoginModal.value = false
    console.log('showLoginModal value:', showLoginModal.value)
  }

  const loadDarkMode = () => {
    const savedDarkMode = Cookies.get('darkMode')
    if (savedDarkMode !== undefined) {
      isDarkMode.value = savedDarkMode === 'true'
    } else {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  }

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    Cookies.set('darkMode', isDarkMode.value.toString(), { expires: 365 })
    if (user.value) {
      // Save dark mode preference to user profile
      user.value.darkMode = isDarkMode.value
    }
    // Update document class
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  }

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
        user.value = { ...user.value, ...await response.json() }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
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
    isDarkMode,
    showLoginModal,
    loadDarkMode,
    toggleDarkMode,
    loadUserProfile,
    updateProfile,
    logout,
    updateProgress,
    sendChat,
    getChatHistory,
    buyQuestions,
    showLoginDialog,
    closeLoginDialog
  }
}) 