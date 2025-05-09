<template>
  <div class="flex flex-col md:flex-row min-h-screen bg-gray-50">
    <!-- Sidebar for chat sessions/history -->
    <aside class="w-full md:w-1/4 bg-white border-r shadow-sm p-4 hidden md:block">
      <h2 class="text-lg font-bold mb-4">{{ $t('chat.sessions') }}</h2>
      <ul>
        <li v-for="session in sessions" :key="session.sesID" class="mb-2">
          <button
            class="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
            :class="{ 'bg-blue-100': session.sesID === currentSessionId }"
            @click="selectSession(session.sesID)"
          >
            <span class="font-semibold">{{ session.sesTitle || $t('chat.untitled') }}</span>
            <span class="block text-xs text-gray-500">{{ formatDate(session.sesCreatedDateTime) }}</span>
          </button>
        </li>
      </ul>
    </aside>

    <!-- Main chat area -->
    <main class="flex-1 flex flex-col">
      <header class="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold">{{ $t('chat.title') }}</h1>
          <div v-if="subject || chapter" class="text-sm text-gray-500 mt-1">
            <span v-if="subject">{{ $t('chat.subject') }}: {{ subject }}</span>
            <span v-if="chapter"> | {{ $t('chat.chapter') }}: {{ chapter }}</span>
          </div>
        </div>
        <button class="btn btn-secondary" @click="refreshSessions">
          {{ $t('chat.refresh') }}
        </button>
      </header>
      <section class="flex-1 overflow-y-auto p-2 md:p-6">
        <Chat :session-id="currentSessionId" :subject="subject" :chapter="chapter" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Chat from '@/components/Chat.vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const subject = ref(route.params.subject as string || '')
const chapter = ref(route.params.chapter as string || '')
const sessions = ref<any[]>([])
const currentSessionId = ref<string>('')

const fetchSessions = async () => {
  try {
    const res = await axios.get('/api/sessions')
    sessions.value = res.data
    if (!currentSessionId.value && sessions.value.length > 0) {
      currentSessionId.value = sessions.value[0].sesID
    }
  } catch (e) {
    // handle error
  }
}

const selectSession = (id: string) => {
  currentSessionId.value = id
}

const refreshSessions = () => {
  fetchSessions()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('fa-IR')
}

onMounted(() => {
  fetchSessions()
})

watch(() => route.params, (params) => {
  subject.value = params.subject as string || ''
  chapter.value = params.chapter as string || ''
})
</script>

<style scoped>
main {
  min-height: 100vh;
}
</style> 