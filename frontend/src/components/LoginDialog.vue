<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { api } from '@/services/api'
import { useMessage } from '@/composables/useMessage'

const auth = useAuthStore()

const phone = ref('')
const otp = ref(['', '', '', '', '', ''])
const otpInputs = ref<HTMLInputElement[]>([])
const isLoading = ref(false)
const showOTP = ref(false)
const countdown = ref(0)
const timer = ref<number | null>(null)

const { showMessage } = useMessage()

// Phone validation
const phoneError = computed(() => {
  if (!phone.value) return 'شماره موبایل الزامی است'
  if (!/^09[0-9]{9}$/.test(phone.value)) return 'شماره موبایل نامعتبر است'
  return ''
})

// OTP validation
const otpError = computed(() => {
  if (otp.value.some(digit => !digit)) return 'کد تایید را کامل وارد کنید'
  if (!/^\d{6}$/.test(otp.value.join(''))) return 'کد تایید باید عددی باشد'
  return ''
})

// Start countdown timer
const startCountdown = () => {
  countdown.value = 60
  if (timer.value) clearInterval(timer.value)
  timer.value = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      if (timer.value) clearInterval(timer.value)
    }
  }, 1000)
}

// Handle phone input
const handlePhoneInput = (value: string) => {
  // Convert Persian numbers to English
  phone.value = value.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
}

// Handle OTP input
const handleOTPInput = (index: number, value: string) => {
  // Convert Persian numbers to English
  const digit = value.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
  
  // Only allow single digit
  if (digit.length > 1) {
    otp.value[index] = digit.slice(-1)
  } else {
    otp.value[index] = digit
  }

  // Auto focus next input
  if (digit && index < 5) {
    otpInputs.value[index + 1]?.focus()
  }

  // Check if OTP is complete
  if (index === 5 && digit) {
    verifyOTP()
  }
}

// Request OTP
const requestOTP = async () => {
  if (phoneError.value) {
    showMessage({
      success: false,
      code: 'AUTH_001',
      message: 'Invalid phone number',
      translation: phoneError.value
    })
    return
  }

  isLoading.value = true
  try {
    const response = await api.requestOTP(phone.value)
    if (response.success) {
      showOTP.value = true
      startCountdown()
    }
    showMessage(response)
  } catch (error) {
    showMessage({
      success: false,
      code: 'SYS_001',
      message: 'Network error occurred',
      translation: 'خطا در ارتباط با سرور'
    })
  } finally {
    isLoading.value = false
  }
}

// Verify OTP
const verifyOTP = async () => {
  if (otpError.value) {
    showMessage({
      success: false,
      code: 'AUTH_002',
      message: 'Invalid OTP code',
      translation: otpError.value
    })
    return
  }

  isLoading.value = true
  try {
    const response = await api.verifyOTP(phone.value, otp.value.join(''))
    if (response.success && response.data?.token) {
      localStorage.setItem('token', response.data.token)
      await auth.loadUserProfile()
      auth.closeLoginDialog()
    }
    showMessage(response)
  } catch (error) {
    showMessage({
      success: false,
      code: 'SYS_001',
      message: 'Network error occurred',
      translation: 'خطا در ارتباط با سرور'
    })
  } finally {
    isLoading.value = false
  }
}

// Resend OTP
const resendOTP = async () => {
  if (countdown.value > 0) {
    showMessage({
      success: false,
      code: 'AUTH_005',
      message: 'Please wait before requesting a new OTP',
      translation: `لطفاً ${countdown.value} ثانیه صبر کنید`
    })
    return
  }
  await requestOTP()
}

// Cleanup timer on component unmount
onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})

// Reset form when dialog closes
watch(() => auth.showLoginModal, (newValue) => {
  if (!newValue) {
    phone.value = ''
    otp.value = ['', '', '', '', '', '']
    showOTP.value = false
    countdown.value = 0
    if (timer.value) clearInterval(timer.value)
  }
})
</script>

<template>
  <el-dialog
    v-model="auth.showLoginModal"
    title="ورود / ثبت‌نام"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="rtl"
  >
    <el-form class="mt-4">
      <!-- Phone Input -->
      <el-form-item :error="phoneError">
        <el-input
          v-model="phone"
          placeholder="شماره موبایل خود را وارد کنید"
          class="default-placeholder"
          :disabled="showOTP"
          dir="ltr"
          @input="handlePhoneInput"
        />
      </el-form-item>

      <!-- OTP Input -->
      <template v-if="showOTP">
        <div class="flex justify-center space-x-2 mb-4" dir="ltr">
          <el-input
            v-for="(_, index) in otp"
            :key="index"
            v-model="otp[index]"
            :ref="el => { if (el) otpInputs[index] = (el as HTMLInputElement) }"
            class="w-12 h-12 text-center "
            maxlength="1"
            @input="value => handleOTPInput(index, value)"
          />
        </div>
        <div class="text-center text-sm text-gray-500 mb-4">
          <template v-if="countdown > 0">
            ارسال مجدد کد در {{ countdown }} ثانیه
          </template>
          <el-button
            v-else
            link
            type="primary"
            @click="resendOTP"
          >
            ارسال مجدد کد
          </el-button>
        </div>
      </template>

      <!-- Action Buttons -->
      <el-form-item>
        <el-button
          v-if="!showOTP"
          type="primary"
          class="w-full"
          :loading="isLoading"
          @click="requestOTP"
        >
          دریافت کد تایید
        </el-button>
        <el-button
          v-else
          type="primary"
          class="w-full"
          :loading="isLoading"
          @click="verifyOTP"
        >
          تایید کد
        </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped>
.rtl {
  direction: rtl;
}

:deep(.el-input__wrapper) {
  text-align: center;
  font-size: 1.2rem;
  letter-spacing: 0.5rem;
}

:deep(.el-input__inner) {
  text-align: center;
  font-size: 1.2rem;
  letter-spacing: 0.5rem;
}
</style> 