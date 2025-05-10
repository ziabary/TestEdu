<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import LoginModal from './LoginModal.vue'
import { ElCard, ElButton, ElInput, ElLoading } from 'element-plus'

const auth = useAuthStore()
const showLoginModal = ref(false)
const showChat = ref(false)
const question = ref('')
const isLoading = ref(false)
const chatHistory = ref<any[]>([])
const currentPage = ref(1)
const hasMore = ref(true)

const loadChatHistory = async () => {
  try {
    const chats = await auth.getChatHistory(currentPage.value)
    if (chats.length < 10) {
      hasMore.value = false
    }
    chatHistory.value = [...chatHistory.value, ...chats]
  } catch (error) {
    console.error('Failed to load chat history:', error)
  }
}

const handleChatClick = () => {
  if (!auth.isAuthenticated) {
    showLoginModal.value = true
    return
  }
  
  if (auth.remainingQuestions <= 0) {
    // TODO: Show payment modal
    return
  }
  
  showChat.value = true
  loadChatHistory()
}

const handleSubmit = async () => {
  if (!question.value.trim()) return
  
  isLoading.value = true
  try {
    await auth.sendChat(question.value)
    question.value = ''
    await loadChatHistory()
  } catch (error: any) {
    if (error.message === 'No questions remaining') {
      // TODO: Show payment modal
    }
  } finally {
    isLoading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value) return
  currentPage.value++
  loadChatHistory()
}

onMounted(() => {
  if (auth.isAuthenticated) {
    loadChatHistory()
  }
})
</script>

<template>
  <div v-if="$route.path !== '/exam'" class="fixed bottom-4 right-4 w-80 sm:w-96">
    <ElCard class="h-full">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <font-awesome-icon icon="message" class="h-6 w-6 text-blue-600 animate-pulse" />
            <span class="text-blue-600">سوالم داری؟ بپرس!</span>
            <span v-if="auth.isAuthenticated" class="text-sm text-gray-500">
              ({{ auth.remainingQuestions }} سؤال باقی‌مانده)
            </span>
          </div>
          <ElButton
            @click="handleChatClick"
            circle
            :disabled="!auth.isAuthenticated || auth.remainingQuestions <= 0"
            :icon="auth.isAuthenticated ? 'message' : 'lock'"
          />
        </div>
      </template>

      <div class="flex-1 overflow-y-auto p-4">
        <div v-for="(message, index) in chatHistory" :key="index" class="mb-4">
          <div :class="[
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          ]">
            <div class="max-w-[80%] rounded-lg p-3" :class="{
              'bg-blue-500 text-white': message.role === 'user',
              'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white': message.role === 'assistant'
            }">
              {{ message.content }}
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 p-4">
        <form @submit.prevent="handleSubmit" class="flex gap-2">
          <ElInput
            v-model="question"
            type="text"
            placeholder="سوال خود را بنویسید..."
            :disabled="isLoading"
            class="flex-1"
          />
          <ElButton
            type="primary"
            :disabled="isLoading || !question.trim()"
            native-type="submit"
            :loading="isLoading"
          >
            ارسال
          </ElButton>
        </form>
      </div>

      <div v-if="hasMore" class="p-4 text-center">
        <ElButton
          @click="loadMore"
          :loading="isLoading"
          :disabled="isLoading"
          circle
          :icon="isLoading ? 'spinner' : 'arrow-right'"
        />
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 