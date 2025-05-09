<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import LoginModal from './LoginModal.vue'

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
  <div class="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
    <div class="container mx-auto px-4 py-3">
      <button
        @click="handleChatClick"
        class="w-full btn-primary flex items-center justify-center gap-2 animate-pulse"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
        </svg>
        سؤالم داری؟ بپرس!
        <span v-if="auth.isAuthenticated" class="text-sm opacity-75">
          ({{ auth.remainingQuestions }} سؤال باقی‌مانده)
        </span>
      </button>
    </div>
  </div>

  <LoginModal v-if="showLoginModal" @close="showLoginModal = false" />
  
  <div v-if="showChat" class="fixed inset-0 bg-black/50 flex items-end justify-center">
    <div class="bg-white rounded-t-lg w-full max-w-2xl h-[80vh] flex flex-col">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium">چت با گروک</h3>
        <button @click="showChat = false" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="flex-grow p-4 overflow-y-auto">
        <div v-if="chatHistory.length === 0" class="text-center text-gray-500 py-8">
          هنوز هیچ سؤالی نپرسیدی!
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="chat in chatHistory"
            :key="chat.id"
            class="flex flex-col space-y-2"
          >
            <div class="flex justify-end">
              <div class="bg-primary text-white rounded-lg p-3 max-w-[80%]">
                {{ chat.question }}
              </div>
            </div>
            <div class="flex justify-start">
              <div class="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                {{ chat.response }}
              </div>
            </div>
          </div>
          
          <div v-if="hasMore" class="text-center">
            <button
              @click="loadMore"
              class="text-primary hover:text-primary/80"
            >
              بارگذاری بیشتر
            </button>
          </div>
        </div>
      </div>
      
      <div class="p-4 border-t border-gray-200">
        <form @submit.prevent="handleSubmit" class="flex gap-2">
          <input
            v-model="question"
            type="text"
            class="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="سؤال خود را بنویسید..."
            :disabled="isLoading"
          />
          <button
            type="submit"
            class="btn-primary"
            :disabled="isLoading"
          >
            <svg
              v-if="!isLoading"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
            </svg>
            <svg
              v-else
              class="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
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