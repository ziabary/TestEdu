// Error codes and messages
export const ErrorMessages = {
  // Auth errors
  INVALID_PHONE: {
    code: 'AUTH_001',
    message: 'Invalid phone number',
    translation: 'شماره موبایل نامعتبر است'
  },
  INVALID_OTP: {
    code: 'AUTH_002',
    message: 'Invalid OTP code',
    translation: 'کد تایید نامعتبر است'
  },
  OTP_SENT: {
    code: 'AUTH_003',
    message: 'OTP sent successfully',
    translation: 'کد تایید ارسال شد'
  },
  LOGIN_SUCCESS: {
    code: 'AUTH_004',
    message: 'Login successful',
    translation: 'ورود موفقیت‌آمیز'
  },
  WAIT_FOR_OTP: {
    code: 'AUTH_005',
    message: 'Please wait before requesting a new OTP',
    translation: 'لطفاً صبر کنید'
  },

  // User errors
  USER_NOT_FOUND: {
    code: 'USER_001',
    message: 'User not found',
    translation: 'کاربر یافت نشد'
  },
  INVALID_TOKEN: {
    code: 'USER_002',
    message: 'Invalid token',
    translation: 'توکن نامعتبر است'
  },
  PROFILE_UPDATE_SUCCESS: {
    code: 'USER_003',
    message: 'Profile updated successfully',
    translation: 'پروفایل با موفقیت بروزرسانی شد'
  },
  SELECT_PACKAGE: {
    code: 'USER_004',
    message: 'Please select a package',
    translation: 'لطفاً یک پکیج انتخاب کنید'
  },
  PACKAGE_PURCHASE_SUCCESS: {
    code: 'USER_005',
    message: 'Package purchased successfully',
    translation: 'پکیج با موفقیت خریداری شد'
  },

  // System errors
  NETWORK_ERROR: {
    code: 'SYS_001',
    message: 'Network error occurred',
    translation: 'خطا در ارتباط با سرور'
  },
  UNKNOWN_ERROR: {
    code: 'SYS_002',
    message: 'An unknown error occurred',
    translation: 'خطای ناشناخته رخ داد'
  }
} as const

// Error types
export type ErrorCode = keyof typeof ErrorMessages
export type ErrorResponse = {
  success: false
  code: string
  message: string
  translation: string
}

// Success types
export type SuccessResponse<T = any> = {
  success: true
  code: string
  message: string
  translation: string
  data?: T
}

// Response type
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

// Error handler
export function handleError(error: any): ErrorResponse {
  console.error('Error:', error)

  // If it's already an ErrorResponse, return it
  if (error && typeof error === 'object' && 'code' in error) {
    return error as ErrorResponse
  }

  // If it's a known error code
  if (error && typeof error === 'string' && error in ErrorMessages) {
    const errorInfo = ErrorMessages[error as ErrorCode]
    return {
      success: false,
      code: errorInfo.code,
      message: errorInfo.message,
      translation: errorInfo.translation
    }
  }

  // Default error
  return {
    success: false,
    code: ErrorMessages.UNKNOWN_ERROR.code,
    message: ErrorMessages.UNKNOWN_ERROR.message,
    translation: ErrorMessages.UNKNOWN_ERROR.translation
  }
}

// Success handler
export function handleSuccess<T>(code: ErrorCode, data?: T): SuccessResponse<T> {
  const successInfo = ErrorMessages[code]
  return {
    success: true,
    code: successInfo.code,
    message: successInfo.message,
    translation: successInfo.translation,
    data
  }
} 