<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold text-center mb-8">کتاب‌ها</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="book in books"
        :key="book.id"
        class="rounded-lg shadow-sm p-6 text-center cursor-pointer transition-all duration-200 hover:shadow-lg"
        @click="$router.push(`/book/${book.id}`)"
      >
        <div class="relative">
          <img
            :src="book.image"
            :alt="book.title"
            class="w-full h-48 object-cover rounded-lg mb-4"
          />
          <div v-if="book.progress > 0" class="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
            {{ book.progress }}%
          </div>
        </div>
        <h3 class="text-xl font-semibold mb-2">{{ book.title }}</h3>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
          <div
            :style="{ width: `${book.progress}%` }"
            class="bg-blue-500 h-2.5 rounded-full"
          ></div>
        </div>
        <div class="mt-4 flex justify-center space-x-4">
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            @click.stop="goToPractice(book.id)"
          >
            حل تمرین
          </button>
          <button
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            @click.stop="goToExam(book.id)"
          >
            آزمون
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

interface Book {
  id: number
  title: string
  image: string
  progress: number
}

const books = ref<Book[]>([
  {
    id: 1,
    title: 'زبان فارسی',
    image: '/images/books/persian.jpg',
    progress: 25
  },
  {
    id: 2,
    title: 'ریاضی',
    image: '/images/books/math.jpg',
    progress: 0
  },
  {
    id: 3,
    title: 'علوم تجربی',
    image: '/images/books/science.jpg',
    progress: 45
  },
  {
    id: 4,
    title: 'تاریخ',
    image: '/images/books/history.jpg',
    progress: 15
  },
  {
    id: 5,
    title: 'جغرافیا',
    image: '/images/books/geography.jpg',
    progress: 30
  },
  {
    id: 6,
    title: 'قرآن',
    image: '/images/books/quran.jpg',
    progress: 0
  }
])

const goToPractice = (bookId: number) => {
  router.push(`/practice/${bookId}`)
}

const goToExam = (bookId: number) => {
  router.push(`/exam/${bookId}`)
}
</script>