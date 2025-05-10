<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'

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

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Close modal when close event is emitted
watch(() => auth.showLoginModal, (value) => {
  if (!value) {
    emit('close')
  }
})

const close = () => {
  emit('close')
}

const handleProfileSubmit = async () => {
  if (!name.value) return
  
  isLoading.value = true
  try {
    await auth.updateProfile({
      name: name.value,
      email: email.value || undefined
    })
    auth.closeLoginDialog() // Close the dialog after successful submission
  } catch (error) {
    console.error('Profile update error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <ElDialog
    :visible="true"
    :before-close="close"
    :title="t('auth.loginTitle')"
    width="50%"
    class="max-w-md"
  >
    <ElForm @submit.prevent="handleSubmit">
      <ElFormItem :label="t('auth.phoneNumber')">
        <ElInput
          v-model="phone"
          type="tel"
          pattern="[0-9]{11}"
          :placeholder="t('auth.enterPhone')"
          required
        />
      </ElFormItem>

      <div class="flex justify-end">
        <ElButton
          type="primary"
          :disabled="isLoading"
          native-type="submit"
        >
          {{ isLoading ? t('auth.loading') : t('auth.login') }}
        </ElButton>
      </div>
    </ElForm>
  </ElDialog>
</template>