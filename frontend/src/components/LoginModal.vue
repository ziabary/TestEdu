<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'

const auth = useAuthStore()
const { t } = useI18n()
const phone = ref('')
const name = ref('')
const email = ref('')
const isLoading = ref(false)
const showProfileForm = ref(false)

const handleSubmit = async () => {
  if (!phone.value.match(/^[0-9]{11}$/)) {
    alert(t('errors.invalidPhone'))
    return
  }

  isLoading.value = true
  try {
    await auth.login(phone.value)
    showProfileForm.value = true
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

const handleProfileSubmit = async () => {
  if (!name.value) return
  
  isLoading.value = true
  try {
    await auth.updateProfile({
      name: name.value,
      email: email.value || undefined
    })
    emit('close')
  } catch (error) {
    console.error('Profile update error:', error)
  } finally {
    isLoading.value = false
  }
}

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'login', phone: string): void
}>()
</script>

<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-900">{{ t('auth.loginTitle') }}</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-500"
        >
          <span class="sr-only">Close</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700">{{ t('auth.phoneNumber') }}</label>
          <div class="mt-1">
            <input
              id="phone"
              v-model="phone"
              type="tel"
              pattern="[0-9]{11}"
              :placeholder="t('auth.enterPhone')"
              required
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ isLoading ? t('auth.loading') : t('auth.login') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 