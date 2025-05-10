import { mockApi } from './mockApi'
import * as realApi from './api'

// Use mock API in development, real API in production
const isDevelopment = import.meta.env.DEV

export const api = isDevelopment ? mockApi : {
  // Auth
  requestOTP: realApi.authApi.requestOTP,
  verifyOTP: realApi.authApi.verifyOTP,

  // User
  getUserProfile: realApi.userApi.getProfile,
  updateProfile: realApi.userApi.updateProfile,

  // Progress
  updateProgress: realApi.progressApi.updateProgress,

  // Chat
  sendChat: realApi.chatApi.sendChat,
  getChatHistory: realApi.chatApi.getHistory,

  // Payment
  buyQuestions: realApi.paymentApi.buyQuestions
}

// Export types
export type { User, Progress, Chat, ApiResponse } from './mockApi' 