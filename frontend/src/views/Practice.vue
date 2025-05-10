<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">تمرین</h1>
      <button
        @click="loadNewQuestion"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        سؤال جدید
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
      <h2 class="text-xl font-bold mb-4">{{ currentChapter }}</h2>
      <div v-if="currentQuestion" class="prose dark:prose-invert">
        <mathjax :formula="currentQuestion.question" />
        <div v-if="showAnswer" class="mt-4">
          <h3 class="text-lg font-semibold mb-2">پاسخ:</h3>
          <mathjax :formula="currentQuestion.answer" />
          <div v-if="currentQuestion.explanation" class="mt-4">
            <h3 class="text-lg font-semibold mb-2">توضیح:</h3>
            <mathjax :formula="currentQuestion.explanation" />
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        لطفاً سؤال جدیدی درخواست کنید
      </div>
    </div>

    <!-- Progress Stats -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 class="text-xl font-bold mb-4">آمار تمرین</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="stat in practiceStats" :key="stat.title" class="p-4">
          <h3 class="text-lg font-semibold mb-2">{{ stat.title }}</h3>
          <p class="text-2xl font-bold text-blue-600">{{ stat.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from '@/stores/store'
import { useI18n } from 'vue-i18n'
import { MathJax } from 'mathjax-vue3'

const store = useStore()
const { t } = useI18n()

const currentQuestion = ref(null)
const showAnswer = ref(false)
const currentChapter = ref('اعداد صحیح')

const practiceStats = computed(() => [{
  title: 'تعداد تمرین‌ها',
  value: store.userProgress.practiceCount || 0
}, {
  title: 'درصد موفقیت',
  value: `${store.userProgress.practiceSuccessRate || 0}%`
}])

const loadNewQuestion = async () => {
  try {
    const question = await store.loadPracticeQuestion(currentChapter.value)
    currentQuestion.value = question
    showAnswer.value = false
  } catch (error) {
    console.error('Error loading question:', error)
  }
}

// Load initial question
loadNewQuestion()
</script>
