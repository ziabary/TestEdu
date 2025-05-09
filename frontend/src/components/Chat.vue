<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm p-4">
      <h1 class="text-xl font-bold text-gray-900">{{ subject }} - {{ chapter }}</h1>
      <p class="text-sm text-gray-500">سوالات باقیمانده: {{ userQuestions }}</p>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-for="(message, index) in messages" :key="index" 
           :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']">
        <div :class="[
          'max-w-[80%] rounded-lg p-3',
          message.role === 'user' 
            ? 'bg-blue-500 text-white' 
            : 'bg-white shadow-sm'
        ]">
          <div v-html="renderMath(message.content)"></div>
        </div>
      </div>
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-white shadow-sm rounded-lg p-3">
          <div class="animate-pulse">در حال پاسخگویی...</div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="bg-white border-t p-4">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="سوال خود را بپرسید..."
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="isLoading || userQuestions <= 0"
        />
        <button
          type="submit"
          class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          :disabled="isLoading || !newMessage.trim() || userQuestions <= 0"
        >
          ارسال
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useMathJax } from 'mathjax-vue3'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const { renderMath } = useMathJax()

const subject = ref(route.params.subject as string || '')
const chapter = ref(route.params.chapter as string || '')
const messages = ref<Array<{ role: 'user' | 'assistant', content: string }>>([])
const newMessage = ref('')
const isLoading = ref(false)
const userQuestions = ref(0)
const ws = ref<WebSocket | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const connectWebSocket = () => {
  const token = localStorage.getItem('token')
  if (!token) return

  ws.value = new WebSocket(`ws://localhost:3000/ws?token=${token}`)

  ws.value.onmessage = (event) => {
    const data = event.data.toString()
    if (data.startsWith('M:')) {
      const content = data.slice(2)
      if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === 'assistant') {
        messages.value[messages.value.length - 1].content += content
      } else {
        messages.value.push({ role: 'assistant', content })
      }
      scrollToBottom()
    } else if (data.startsWith('E:')) {
      const error = data.slice(2)
      alert(error)
      isLoading.value = false
    } else if (data.startsWith('A:')) {
      isLoading.value = false
      scrollToBottom()
    }
  }

  ws.value.onclose = () => {
    setTimeout(connectWebSocket, 1000)
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || isLoading.value || userQuestions.value <= 0) return

  const message = newMessage.value
  newMessage.value = ''
  messages.value.push({ role: 'user', content: message })
  isLoading.value = true
  scrollToBottom()

  if (ws.value?.readyState === WebSocket.OPEN) {
    ws.value.send(JSON.stringify({
      question: message,
      subject: subject.value,
      chapter: chapter.value
    }))
  }
}

const loadUserInfo = async () => {
  try {
    const response = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await response.json()
    userQuestions.value = data.usrQuestions
  } catch (error) {
    console.error('Error loading user info:', error)
  }
}

onMounted(() => {
  connectWebSocket()
  loadUserInfo()
})

onUnmounted(() => {
  if (ws.value) {
    ws.value.close()
  }
})
</script>

<style>
.prose {
  max-width: none;
}
</style> 