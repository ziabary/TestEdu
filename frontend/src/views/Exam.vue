<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">امتحان</h1>
      <div class="text-right">
        <select
          v-model="examType"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="chapter">فصلی</option>
          <option value="cumulative">جمع‌بندی</option>
        </select>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">سوالات</h2>
        <div class="text-right">
          <span class="text-blue-600">زمان باقی‌مانده:</span>
          <span class="text-2xl font-bold text-red-600">{{ formattedTime }}</span>
        </div>
      </div>

      <div v-for="(question, index) in questions" :key="index" class="mb-4">
        <h3 class="text-lg font-semibold mb-2">سوال {{ index + 1 }}</h3>
        <div class="prose dark:prose-invert">
          <mathjax :formula="question.question" />
        </div>
        <div class="mt-4">
          <input
            v-model="answers[index]"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            :placeholder="t('exam.answerPlaceholder')"
          />
        </div>
      </div>

      <div class="mt-4">
        <button
          @click="submitExam"
          :disabled="!canSubmit"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          ارسال
        </button>
      </div>
    </div>

    <!-- Answer Sheet (shown after submission) -->
    <div v-if="showAnswerSheet" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 class="text-xl font-bold mb-4">برگه پاسخ</h2>
      <div class="space-y-4">
        <div v-for="(answer, index) in answers" :key="index" class="flex justify-between items-center">
          <span>سوال {{ index + 1 }}</span>
          <button
            @click="openChatForQuestion(index)"
            class="text-blue-600 hover:text-blue-800"
          >
            چت با آوالای
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores/store'
import { useI18n } from 'vue-i18n'
import { MathJax } from 'mathjax-vue3'

const store = useStore()
const { t } = useI18n()

const examType = ref('chapter')
const questions = ref([])
const answers = ref([])
const showAnswerSheet = ref(false)
const timer = ref(15 * 60) // 15 minutes
const timerInterval = ref(null)

const formattedTime = computed(() => {
  const minutes = Math.floor(timer.value / 60)
  const seconds = timer.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const canSubmit = computed(() => {
  return answers.value.length === questions.value.length && answers.value.every(a => a.trim())
})

const startTimer = () => {
  timerInterval.value = setInterval(() => {
    timer.value--
    if (timer.value <= 0) {
      submitExam()
    }
  }, 1000)
}

const loadQuestions = async () => {
  try {
    const loadedQuestions = await store.loadExamQuestions(examType.value)
    questions.value = loadedQuestions
    answers.value = Array(loadedQuestions.length).fill('')
    startTimer()
  } catch (error) {
    console.error('Error loading exam questions:', error)
  }
}

const submitExam = async () => {
  try {
    await store.submitExam(answers.value)
    showAnswerSheet.value = true
    clearInterval(timerInterval.value)
  } catch (error) {
    console.error('Error submitting exam:', error)
  }
}

const openChatForQuestion = (questionIndex: number) => {
  // TODO: Open chat with context of this question
}

onMounted(() => {
  loadQuestions()
})

// Reset exam when route changes
onUnmounted(() => {
  clearInterval(timerInterval.value)
})
</script>
