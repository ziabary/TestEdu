<template>
  <div class="flex h-full">
    <!-- Sidebar -->
    <div class="sticky top-0 h-screen">
      <BookSidebar 
        :book-title="bookTitle"
        :book-data="bookData"
        @select="handleSubchapterSelect"
      />
    </div>
    
    <!-- Main Content -->
    <div class="flex-1 p-6 overflow-y-auto mb-[10em]">
      <!-- Book Introduction -->
      <div v-if="!selectedChapter" class="max-w-6xl mx-auto">
        <div class="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 py-4">
          <h2 class="page-title mb-6">
            <template v-if="isAuthenticated">
              {{ userName }} عزیز، به {{ bookTitle }} خوش آمدید
            </template>
            <template v-else>
              به {{ bookTitle }} خوش آمدید
            </template>
          </h2>
          
          <div class="prose dark:prose-invert max-w-none">
            <p class="text-lg text-gray-700 dark:text-gray-300 p-6" style="white-space:pre-line;">
              {{ bookSummary }}
            </p>
          </div>
          
          <!-- Chapter Boxes -->
          <div class="mt-8 space-y-6">
            <div v-for="(chapter, chapterId) in bookData.chapters" :key="chapterId" class="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg p-6">
              <h3 class="text-xl font-semibold text-blue-600 dark:text-purple-300 mb-4">
                {{ chapterId +1}}. {{ chapter.name }}
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="(subchapter, subchapterId) in chapter.subchapters" :key="subchapterId"
                  class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                >
                  <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    {{ subchapterId +1}}. {{ subchapter.name }}
                  </h4>
                  <p class="text-gray-600 dark:text-gray-400 mb-4">
                    {{ subchapter.summary }}
                  </p>
                  <button 
                    class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    @click="handleSubchapterSelect(chapterId, subchapterId)"
                  >
                    شروع تمرین
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Selected Chapter Content -->
      <div v-else class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <router-link :to="bookExercisesLink" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            بازگشت به {{ bookTitle }}
          </router-link>
        </div>
        <div class="flex items-center justify-between mb-6">
          <h2 class="page-title">
            {{ exercisesTitle }}
          </h2>
        </div>
        <!-- دسته‌بندی تمرین‌ها -->
        <div class="space-y-8">
          <!-- تمرین‌های کتاب -->
          <div v-if="currentExercises.fromBook && currentExercises.fromBook.length">
            <h3 class="text-lg font-bold mb-4 text-blue-700 dark:text-blue-300">تمرین‌های کتاب</h3>
            <div class="space-y-4">
              <div v-for="(exercise, index) in currentExercises.fromBook" :key="'fromBook-' + index"
                class="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg p-6 text-gray-800 dark:text-gray-100"
              >
                <div class="prose dark:prose-invert max-w-none">
                  <h4 class="text-base font-medium mb-2">سوال {{ index + 1 }}</h4>
                  <div v-html="renderMarkdown(exercise.question)" class="mb-4"></div>
                  <div class="flex justify-end">
                    <button 
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      @click="showAnswer(index, 'fromBook')"
                    >
                      {{ showAnswers['fromBook']?.[index] ? 'مخفی کردن پاسخ' : 'نمایش پاسخ' }}
                    </button>
                  </div>
                  <div v-if="showAnswers['fromBook']?.[index]" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p class="font-medium mb-2">پاسخ:</p>
                    <div v-html="renderMarkdown(exercise.answer)" class="mb-4"></div>
                    <button 
                      class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      @click="showDetail(index, 'fromBook')"
                    >
                      {{ showDetails['fromBook']?.[index] ? 'مخفی کردن توضیحات' : 'نمایش توضیحات' }}
                    </button>
                    <div v-if="showDetails['fromBook']?.[index]" class="mt-4 prose dark:prose-invert">
                      <div v-html="renderMarkdown(exercise.detail)"></div>
                      <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/60 rounded-lg text-blue-900 dark:text-blue-100" v-if="showDetails['fromBook']?.[index]">
                        <strong>اگر هنوز متوجه نشدی ازم سوال بپرس که بیشتر توضیح بدم</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- تمرین‌های سفارشی -->
          <div v-if="currentExercises.custom && currentExercises.custom.length">
            <h3 class="text-lg font-bold mb-4 text-green-700 dark:text-green-300">تمرین‌های سفارشی</h3>
            <div class="space-y-4">
              <div v-for="(exercise, index) in currentExercises.custom" :key="'custom-' + index"
                class="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg p-6 text-gray-800 dark:text-gray-100"
              >
                <div class="prose dark:prose-invert max-w-none">
                  <h4 class="text-base font-medium mb-2">سوال {{ index + 1 }}</h4>
                  <div v-html="renderMarkdown(exercise.question)" class="mb-4"></div>
                  <div class="flex justify-end">
                    <button 
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      @click="showAnswer(index, 'custom')"
                    >
                      {{ showAnswers['custom']?.[index] ? 'مخفی کردن پاسخ' : 'نمایش پاسخ' }}
                    </button>
                  </div>
                  <div v-if="showAnswers['custom']?.[index]" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p class="font-medium mb-2">پاسخ:</p>
                    <div v-html="renderMarkdown(exercise.answer)" class="mb-4"></div>
                    <button 
                      class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      @click="showDetail(index, 'custom')"
                    >
                      {{ showDetails['custom']?.[index] ? 'مخفی کردن توضیحات' : 'نمایش توضیحات' }}
                    </button>
                    <div v-if="showDetails['custom']?.[index]" class="mt-4 prose dark:prose-invert">
                      <div v-html="renderMarkdown(exercise.detail)"></div>
                      <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/60 rounded-lg text-blue-900 dark:text-blue-100" v-if="showDetails['custom']?.[index]">
                        <strong>اگر هنوز متوجه نشدی ازم سوال بپرس که بیشتر توضیح بدم</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- تمرین‌های چالشی -->
          <div v-if="currentExercises.challenging && currentExercises.challenging.length">
            <h3 class="text-lg font-bold mb-4 text-red-700 dark:text-red-300">تمرین‌های چالشی</h3>
            <div class="space-y-4">
              <div v-for="(exercise, index) in currentExercises.challenging" :key="'challenging-' + index"
                class="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg p-6 text-gray-800 dark:text-gray-100"
              >
                <div class="prose dark:prose-invert max-w-none">
                  <h4 class="text-base font-medium mb-2">سوال {{ index + 1 }}</h4>
                  <div v-html="renderMarkdown(exercise.question)" class="mb-4"></div>
                  <div class="flex justify-end">
                    <button 
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      @click="showAnswer(index, 'challenging')"
                    >
                      {{ showAnswers['challenging']?.[index] ? 'مخفی کردن پاسخ' : 'نمایش پاسخ' }}
                    </button>
                  </div>
                  <div v-if="showAnswers['challenging']?.[index]" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p class="font-medium mb-2">پاسخ:</p>
                    <div v-html="renderMarkdown(exercise.answer)" class="mb-4"></div>
                    <button 
                      class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      @click="showDetail(index, 'challenging')"
                    >
                      {{ showDetails['challenging']?.[index] ? 'مخفی کردن توضیحات' : 'نمایش توضیحات' }}
                    </button>
                    <div v-if="showDetails['challenging']?.[index]" class="mt-4 prose dark:prose-invert">
                      <div v-html="renderMarkdown(exercise.detail)"></div>
                      <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/60 rounded-lg text-blue-900 dark:text-blue-100" v-if="showDetails['challenging']?.[index]">
                        <strong>اگر هنوز متوجه نشدی ازم سوال بپرس که بیشتر توضیح بدم</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- دکمه تمرین‌های بیشتر در پایین -->
        <div class="flex justify-center mt-8">
          <button 
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
            @click="showMoreExercises = true"
          >
            تمرین‌های بیشتر
          </button>
        </div>
      </div>
    </div>
    
    <!-- More Exercises Modal -->
    <div v-if="showMoreExercises" class="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          انتخاب سطح دشواری
        </h3>
        
        <div class="space-y-4">
          <button 
            v-for="level in ['آسان', 'معمولی', 'سخت']" 
            :key="level"
            class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="generateMoreExercises(level)"
          >
            {{ level }}
          </button>
        </div>
        
        <button 
          class="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          @click="showMoreExercises = false"
        >
          انصراف
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BookSidebar from '@/components/BookSidebar.vue'
import math7 from '@/data/math7'
import type { Chapter, Subchapter, Exercise } from '@/types/book'
import MarkdownIt from 'markdown-it'
import mathjax3 from 'markdown-it-mathjax3'
import { books } from '@/data/books'

const md = new MarkdownIt().use(mathjax3)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.usrName)

// Book data
const bookTitle = computed(() => {
  const grade = route.params.grade as string
  const subject = route.params.subject as string
  const group = books[grade]
  if (!group) return ''
  const found = group.books.find(b => b.id === subject)
  if (found) {
    return `${found.title} ${group.gradeLabel}`
  }
  return ''
})

const bookSummary = computed(() => {
  const intro = isAuthenticated.value
    ? math7.desc.firstLine.authenticated
    : math7.desc.firstLine.anonymous
  return `${intro}\n${math7.desc.nextLines}`
})
const bookData = computed(() => math7)

// Selected chapter state
const selectedChapter = ref<Chapter | null>(null)
const selectedSubchapter = ref<Subchapter | null>(null)
const showAnswers = ref<{ [key: string]: boolean[] }>({ fromBook: [], custom: [], challenging: [] })
const showDetails = ref<{ [key: string]: boolean[] }>({ fromBook: [], custom: [], challenging: [] })
const showMoreExercises = ref(false)

const bookExercisesLink = computed(() => {
  const grade = route.params.grade
  const subject = route.params.subject
  if (grade && subject) return `/exercises/${grade}/${subject}`
  return '/books'
})

// عنوان تمرین‌ها (برای زیربخش یا فصل)
const exercisesTitle = computed(() => {
  if (showingChapterExercises.value && selectedChapter.value) {
    return `${selectedChapter.value.name} - تمرین‌های کلی فصل`
  }
  if (selectedChapter.value && selectedSubchapter.value) {
    return `${selectedChapter.value.name} - ${selectedSubchapter.value.name}`
  }
  return ''
})

// حالت نمایش تمرین‌های کلی فصل
const showingChapterExercises = ref(false)
function normalizeExercises(obj: any) {
  return {
    fromBook: Array.isArray(obj?.fromBook) ? obj.fromBook : [],
    custom: Array.isArray(obj?.custom) ? obj.custom : [],
    challenging: Array.isArray(obj?.challenging) ? obj.challenging : [],
  }
}
const currentExercises = computed(() => {
  if (showingChapterExercises.value && selectedChapter.value) {
    return normalizeExercises(selectedChapter.value.exercises)
  }
  return normalizeExercises(selectedSubchapter.value)
})

const handleSubchapterSelect = (chapterId: number, subchapterId: number) => {
  const grade = route.params.grade
  const subject = route.params.subject
  if (grade && subject) {
    router.push(`/exercises/${grade}/${subject}/${chapterId+1}.${subchapterId+1}`)
  }
}

const handleChapterExercises = (chapterId: number) => {
  const grade = route.params.grade
  const subject = route.params.subject
  if (grade && subject) {
    router.push(`/exercises/${grade}/${subject}/${chapterId+1}/overall`)
  }
}

const showAnswer = (index: number, section: string) => {
  showAnswers.value[section][index] = !showAnswers.value[section][index]
  if (!showAnswers.value[section][index]) {
    showDetails.value[section][index] = false
  }
}

const showDetail = (index: number, section: string) => {
  showDetails.value[section][index] = !showDetails.value[section][index]
}

const generateMoreExercises = (level: string) => {
  // TODO: Implement exercise generation based on level
  showMoreExercises.value = false
}

// Render markdown with MathJax
const renderMarkdown = (text: string) => {
  return md.render(text)
}

onMounted(() => {
  // Initialize MathJax
  if (window.MathJax) {
    window.MathJax.typesetPromise()
  }
})

// Watch for changes in markdown content
const updateMathJax = () => {
  if (window.MathJax) {
    window.MathJax.typesetPromise()
  }
}

declare global {
  interface Window {
    MathJax?: any;
  }
}

watchEffect(() => {
  const grade = route.params.grade as string
  const subject = route.params.subject as string
  let chapterId:string|number= route.params.chapterId as string
  let subchapterId:string| number = route.params.subchapterId as string
  const overall = route.params.overall

  // اگر chapterId شامل نقطه بود، یعنی خودش subchapterId است
  if (chapterId && !overall && chapterId.includes('.')) {
    subchapterId = Number(chapterId.substring(chapterId.indexOf('.')+1)) 
    chapterId = Number(chapterId.substring(0,chapterId.indexOf('.')))
  }

  // پیدا کردن فصل و زیرفصل با توجه به آرایه بودن chapters و subchapters
  const chapter = bookData.value.chapters[chapterId as number - 1]
  let subchapter = null
  if (chapter && subchapterId) {
    subchapter = chapter.subchapters[subchapterId as number - 1]
  }

  if (chapterId && overall && chapter) {
    // حالت تمرین‌های کلی فصل
    selectedChapter.value = chapter
    selectedSubchapter.value = null
    showingChapterExercises.value = true
  } else if (chapter && subchapter) {
    // حالت تمرین زیرفصل
    selectedChapter.value = chapter
    selectedSubchapter.value = subchapter
    showingChapterExercises.value = false
  } else {
    // حالت پیش‌فرض
    selectedChapter.value = null
    selectedSubchapter.value = null
    showingChapterExercises.value = false
  }
})
</script>

<style>
/* Add MathJax styles */
.MathJax {
  font-size: 1.1em !important;
}
</style> 