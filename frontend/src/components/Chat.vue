<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header -->
    <el-header class="bg-white shadow-sm p-4">
      <h1 class="text-xl font-bold text-gray-900">{{ subject }} - {{ chapter }}</h1>
      <p class="text-sm text-gray-500">سوالات باقیمانده: {{ userQuestions }}</p>
    </el-header>

    <!-- Messages -->
    <el-main ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-for="(message, index) in messages" :key="index" 
           :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']">
        <el-card
          :class="[
            'max-w-[80%]',
          message.role === 'user' 
            ? 'bg-blue-500 text-white' 
              : 'bg-white'
          ]"
          shadow="never"
        >
          <div v-html="renderMath(message.content)"></div>
        </el-card>
      </div>
      <div v-if="isLoading" class="flex justify-start">
        <el-card shadow="never" class="bg-white">
          <div class="animate-pulse">در حال پاسخگویی...</div>
        </el-card>
      </div>
    </el-main>

    <!-- Input -->
    <el-footer class="bg-white border-t p-4">
      <el-form @submit.prevent="sendMessage" class="flex gap-2">
        <el-input
          v-model="newMessage"
          type="text"
          :placeholder="t('chat.enterQuestion')"
          :disabled="isLoading || userQuestions <= 0"
          class="flex-1"
        />
        <el-button
          type="primary"
          :disabled="isLoading || !newMessage.trim() || userQuestions <= 0"
          :loading="isLoading"
          native-type="submit"
        >
          {{ t('chat.send') }}
        </el-button>
      </el-form>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import katex from 'katex'

const props = defineProps<{
  sessionId: number | null
  subject?: string
  chapter?: string
}>()

const { t } = useI18n()
const route = useRoute()
const messagesContainer = ref<HTMLElement | null>(null)
const messages = ref<any[]>([])
const newMessage = ref('')
const isLoading = ref(false)
const userQuestions = ref(0)

const renderMath = (content: string) => {
  try {
    return content.replace(/\$\$(.*?)\$\$/g, (_, tex) => {
      return katex.renderToString(tex, { displayMode: true })
    }).replace(/\$(.*?)\$/g, (_, tex) => {
      return katex.renderToString(tex, { displayMode: false })
    })
  } catch (error) {
    console.error('Error rendering math:', error)
    return content
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || isLoading.value || userQuestions.value <= 0) return

  const message = newMessage.value
  newMessage.value = ''
  messages.value.push({ role: 'user', content: message })
  await scrollToBottom()

  isLoading.value = true
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        message,
        sessionId: props.sessionId,
        subject: props.subject,
        chapter: props.chapter
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send message')
    }

    const data = await response.json()
    messages.value.push({ role: 'assistant', content: data.response })
    userQuestions.value = data.remainingQuestions
    await scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    ElMessage.error(t('errors.sendFailed'))
  } finally {
    isLoading.value = false
  }
}

const loadMessages = async () => {
  if (!props.sessionId) return

  try {
    const response = await fetch(`/api/chat/sessions/${props.sessionId}/messages`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to load messages')
    }

    const data = await response.json()
    messages.value = data.messages
    userQuestions.value = data.remainingQuestions
    await scrollToBottom()
  } catch (error) {
    console.error('Error loading messages:', error)
    ElMessage.error(t('errors.loadFailed'))
  }
}

onMounted(() => {
  loadMessages()
})

onUnmounted(() => {
  messages.value = []
})
</script>

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
</style> 