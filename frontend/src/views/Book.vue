<template>
  <div class="p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Book Content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="p-4">
          <div class="flex items-center gap-4 mb-4">
            <img :src="book.image" alt="Book Cover" class="h-32 w-24 object-cover" />
            <div>
              <h2 class="text-xl font-bold">{{ book.title }}</h2>
              <p class="text-gray-500">فصل {{ currentChapter }} از {{ totalChapters }}</p>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div
              :style="{ width: `${progress}%` }"
              class="bg-blue-600 h-2.5 rounded-full"
            ></div>
          </div>

          <!-- Content -->
          <div class="space-y-4">
            <div v-for="(item, index) in content" :key="index" class="p-4 border rounded-lg">
              <h3 class="font-semibold mb-2">{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Practice and Exam Buttons -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="space-y-4">
          <button
            @click="goToPractice"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            حل تمرین
          </button>
          <button
            @click="goToExam"
            class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            آزمون
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const bookId = parseInt(route.params.bookId as string)

const book = ref({
  id: 1,
  title: 'زبان فارسی',
  image: '/images/books/persian.jpg',
  chapters: 10,
  currentChapter: 1,
  progress: 0
})

const currentChapter = computed(() => book.value.currentChapter)
const totalChapters = computed(() => book.value.chapters)
const progress = computed(() => (currentChapter.value / totalChapters.value) * 100)

const content = ref([
  {
    title: 'مقدمه',
    text: 'این بخش مقدمه کتاب است که در آن به مفاهیم اولیه می‌پردازیم.'
  },
  {
    title: 'فصل اول',
    text: 'این بخش شامل محتوای فصل اول است که شامل مفاهیم اولیه می‌شود.'
  }
])

const goToPractice = () => {
  router.push(`/practice/${bookId}`)
}

const goToExam = () => {
  router.push(`/exam/${bookId}`)
}
</script>
