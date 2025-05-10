<template>
  <div class="flex flex-col md:flex-row">
    <!-- Sidebar for chat sessions/history -->
    <el-aside width="300px" class="bg-white border-r shadow-sm p-4 hidden md:block">
      <h2 class="text-lg font-bold mb-4">{{ $t('chat.sessions') }}</h2>
      <el-menu>
        <el-menu-item
          v-for="session in sessions"
          :key="session.sesID"
          :class="{ 'is-active': session.sesID === currentSessionId }"
            @click="selectSession(session.sesID)"
          >
          <template #title>
            <span class="font-semibold">{{ session.sesTitle || $t('chat.untitled') }}</span>
            <span class="block text-xs text-gray-500">{{ formatDate(session.sesCreatedDateTime) }}</span>
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- Main chat area -->
    <el-main class="flex-1 flex flex-col">
      <el-header class="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold">{{ $t('chat.title') }}</h1>
          <div v-if="subject || chapter" class="text-sm text-gray-500 mt-1">
            <span v-if="subject">{{ $t('chat.subject') }}: {{ subject }}</span>
            <span v-if="chapter"> | {{ $t('chat.chapter') }}: {{ chapter }}</span>
          </div>
        </div>
        <el-button @click="refreshSessions">
          {{ $t('chat.refresh') }}
        </el-button>
      </el-header>
      <el-main class="flex-1 overflow-y-auto p-2 md:p-6">
        <Chat :session-id="currentSessionId" :subject="subject" :chapter="chapter" />
      </el-main>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Chat from '@/components/Chat.vue'
import axios from 'axios'
import { useMessage } from '@/composables/useMessage'

const route = useRoute()
const router = useRouter()
const subject = ref(route.params.subject as string || '')
const chapter = ref(route.params.chapter as string || '')
const currentSessionId = ref<number | null>(null)
const sessions = ref<any[]>([])

const { showMessage } = useMessage()

const loadSessions = async () => {
  try {
    const response = await axios.get('/api/chat/sessions')
    sessions.value = response.data
  } catch (error) {
    showMessage({
      success: false,
      code: 'SYS_001',
      message: 'Failed to load chat sessions',
      translation: 'خطا در بارگذاری گفتگوها'
    })
  }
}

const selectSession = (sessionId: number) => {
  currentSessionId.value = sessionId
}

const refreshSessions = () => {
  loadSessions()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fa-IR')
}

watch(() => route.params, (newParams) => {
  subject.value = newParams.subject as string || ''
  chapter.value = newParams.chapter as string || ''
})

onMounted(() => {
  loadSessions()
})
</script>

<style scoped>
main {
  min-height: 100vh;
}
</style> 