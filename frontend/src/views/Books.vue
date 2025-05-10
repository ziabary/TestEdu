<template>
  <div class="p-4">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="page-title">
          <template v-if="isAuthenticated">
            {{ userName }} عزیز کدوم کتاب رو شروع کنیم؟
          </template>
          <template v-else>
            کلاس {{ gradeLabel }}ی عزیز با کدوم کتاب شروع کنیم؟
          </template>
        </h2>
      </div>
      <div class="flex justify-center">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <div v-for="book in visibleBooks" :key="book.id" :class="[
            'rounded-lg shadow p-6 flex flex-col items-center transition-all duration-200 border-2 border-yellow-300 dark:border-purple-400 bg-white/90 dark:bg-gray-700/80 backdrop-blur-sm shadow-md shadow-orange-200 dark:shadow-purple-900/30',
            book.disabled ? 'opacity-50 pointer-events-none' : 'hover:shadow-lg hover:scale-105'
          ]">
            <img :src="getBookImage(book)" :alt="book.title" class="w-28 h-40 object-cover rounded mb-4" />
            <h3 class="text-lg font-semibold mb-2 text-center text-blue-600 dark:text-purple-300">{{ book.title }}</h3>
            <div class="flex flex-col w-full gap-2 mt-auto">
              <template v-if="!book.disabled">
                <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
                  @click="goToPractice(book)">
                  تمرین
                </button>
                <button class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
                  @click="goToExam(book)">
                  امتحان
                </button>
              </template>
              <template v-else>
                <button
                  class="w-full px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed flex items-center justify-center"
                  disabled
                  style="height: 96px; min-height: 48px;"
                >
                  به‌زودی
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { books, BookItem } from '@/data/books'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const gradeId = String(route.params.grade || '7')

const gradeLabel = computed(() => books[gradeId]?.gradeLabel || gradeId)
const visibleBooks = computed(() =>
  (books[gradeId]?.books || []).filter((b: BookItem) => !b.hidden)
)

const isAuthenticated = computed(() => auth.isAuthenticated)
const userName = computed(() => auth.user?.usrName || '')

const getBookImage = (book: BookItem) => `/imgs/books/${gradeId}/${book.id}.jpg`

const goToPractice = (book: BookItem) => {
  router.push(`/exercises/${gradeId}/${book.id}`)
}
const goToExam = (book: BookItem) => {
  router.push(`/exam/${gradeId}/${book.id}`)
}
</script>

<style scoped>
.flex {
  flex-wrap: wrap;
}
</style>
