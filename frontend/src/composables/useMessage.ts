import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/utils/errorMessages'

export function useMessage() {
  const showMessage = (response: ApiResponse) => {
    if (response.success) {
      ElMessage.success(response.translation)
    } else {
      ElMessage.error(response.translation)
      // Log English message to console
      console.error(`[${response.code}] ${response.message}`)
    }
  }

  return {
    showMessage
  }
} 