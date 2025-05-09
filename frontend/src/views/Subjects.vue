<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ t('subjects.title') }}</h1>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="subject in subjects" :key="subject.name" class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900">{{ subject.name }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ subject.description }}</p>

            <div class="mt-6 space-y-4">
              <div v-for="chapter in subject.chapters" :key="chapter.name" class="relative">
                <div class="flex items-center justify-between">
                  <router-link
                    :to="`/chat/${subject.name}/${chapter.name}`"
                    class="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    {{ chapter.name }}
                  </router-link>
                  <span class="text-sm text-gray-500">{{ chapter.progress }}%</span>
                </div>
                <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full"
                    :style="{ width: `${chapter.progress}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const { t } = useI18n()

interface Chapter {
  name: string
  progress: number
}

interface Subject {
  name: string
  description: string
  chapters: Chapter[]
}

const subjects = ref<Subject[]>([])

const loadSubjects = async () => {
  try {
    const response = await fetch('/api/subjects', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      subjects.value = await response.json()
    }
  } catch (error) {
    console.error('Error loading subjects:', error)
  }
}

onMounted(() => {
  loadSubjects()
})
</script> 