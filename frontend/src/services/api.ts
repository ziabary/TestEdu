import { ref } from 'vue'
import { handleError, handleSuccess, type ApiResponse } from '@/utils/errorMessages'

// Mock data
const mockUsers = ref([
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

// Mock JWT token
const generateToken = (userId: number) => {
  return `mock-jwt-token-${userId}-${Date.now()}`
}

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const api = {
  // Request OTP
  async requestOTP(phone: string): Promise<ApiResponse> {
    try {
      await delay(1000)
      
      if (!/^09[0-9]{9}$/.test(phone)) {
        return handleError('INVALID_PHONE')
      }

      return handleSuccess('OTP_SENT')
    } catch (error) {
      return handleError(error)
    }
  },

  // Verify OTP
  async verifyOTP(phone: string, otp: string): Promise<ApiResponse<{ token: string }>> {
    try {
      await delay(1000)

      if (otp !== '123456') {
        return handleError('INVALID_OTP')
      }

      let user = mockUsers.value.find(u => u.usrPhone === phone)
      if (!user) {
        user = {
          usrID: mockUsers.value.length + 1,
          usrName: 'کاربر جدید',
          usrPhone: phone,
          usrEmail: '',
          usrAvatar: '/images/default-avatar.png',
          usrGrade: 7,
          usrQuestions: 0,
          progress: [],
          chats: []
        }
        mockUsers.value.push(user)
      }

      const token = generateToken(user.usrID)
      return handleSuccess('LOGIN_SUCCESS', { token })
    } catch (error) {
      return handleError(error)
    }
  },

  // Get user profile
  async getUserProfile(token: string): Promise<ApiResponse> {
    try {
      await delay(500)
      
      const userId = parseInt(token.split('-')[3])
      if (isNaN(userId)) {
        return handleError('INVALID_TOKEN')
      }

      const user = mockUsers.value.find(u => u.usrID === userId)
      if (!user) {
        return handleError('USER_NOT_FOUND')
      }

      return handleSuccess('PROFILE_UPDATE_SUCCESS', user)
    } catch (error) {
      return handleError(error)
    }
  }
} 