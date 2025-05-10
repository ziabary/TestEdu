<template>
  <div class="w-64 h-full backdrop-blur-sm border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
    <div class="mb-4">
      <router-link :to="bookLink" class="text-lg font-semibold text-blue-600 dark:text-purple-300 mb-2 hover:underline block">
        {{ props.bookTitle }}
      </router-link>
    </div>
    
    <div class="space-y-2">
      <div v-for="(chapter, chapterId) in props.bookData.chapters" :key="chapter.name" class="space-y-1">
        <!-- Chapter Header -->
        <div 
          class="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
          @click="toggleChapter(chapterId)"
        >
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ chapterId+1 }}. {{ chapter.name }}
          </span>
          <svg 
            :class="{'transform rotate-90': expandedChapters[chapterId]}"
            class="w-4 h-4 transition-transform text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
        
        <!-- Subchapters -->
        <transition name="fade">
          <div v-show="expandedChapters[chapterId]" class="pl-4 space-y-1">
            <template v-if="chapter.subchapters">
              <router-link
                v-for="(subchapter, subchapterId) in chapter.subchapters"
                :key="subchapterId"
                :to="subchapterLink(chapterId, subchapterId)"
                class="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 text-xs text-gray-600 dark:text-gray-300"
              >
                {{ subchapterId+1 }}. {{ subchapter.name }}
              </router-link>
            </template>
          </div>
        </transition>
        <!-- فصل تمرین‌های کلی -->
        <div class="mt-2 flex justify-center">
          <router-link 
            class="w-full px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 rounded hover:bg-orange-200 dark:hover:bg-orange-800 text-xs font-semibold transition-colors text-center"
            :to="chapterOverallLink(chapterId)"
          >
            تمرین‌های کلی از این فصل
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { BookData } from '@/types/book'

const props = defineProps<{
  bookTitle: string,
   bookData:BookData}
   >()

const expandedChapters = ref<Record<string, boolean>>({})

const toggleChapter = (chapterId: number) => {
  expandedChapters.value[chapterId] = !expandedChapters.value[chapterId]
}

const route = useRoute()
const bookLink = computed(() => {
  const grade = route.params.grade
  const subject = route.params.subject
  if (grade && subject) return `/books/${grade}/${subject}`
  return '/books'
})

const subchapterLink = (chapterId: number, subchapterId: number) => {
  const grade = route.params.grade
  const subject = route.params.subject
  if (grade && subject) return `/exercises/${grade}/${subject}/${chapterId+1}.${subchapterId+1}`
  return '#'
}

const chapterOverallLink = (chapterId: number) => {
  const grade = route.params.grade
  const subject = route.params.subject
  if (grade && subject) return `/exercises/${grade}/${subject}/${chapterId+1}/overall`
  return '#'
}
</script> 