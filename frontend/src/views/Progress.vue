<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">پیشرفت</h1>

    <!-- Progress Stats -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
      <h2 class="text-xl font-bold mb-4">آمار کلی</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="stat in progressStats" :key="stat.title" class="p-4">
          <h3 class="text-lg font-semibold mb-2">{{ stat.title }}</h3>
          <p class="text-2xl font-bold text-blue-600">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Progress Timeline -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
      <h2 class="text-xl font-bold mb-4">تاریخچه فعالیت‌ها</h2>
      <div class="space-y-4">
        <div v-for="activity in activities" :key="activity.id" class="flex items-center gap-4">
          <div class="flex-1">
            <h3 class="font-semibold">{{ activity.title }}</h3>
            <p class="text-sm text-gray-500">{{ jalaliDate(activity.date) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-blue-600">{{ activity.score }}</span>
            <span class="text-gray-500">/{{ activity.maxScore }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Book Progress -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 class="text-xl font-bold mb-4">پیشرفت در کتاب‌ها</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="book in books" :key="book.id" class="p-4">
          <h3 class="font-semibold mb-2">{{ book.title }}</h3>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              :style="{ width: `${book.progress}%` }"
              class="bg-blue-600 h-2.5 rounded-full"
            ></div>
          </div>
          <p class="text-sm text-gray-500 mt-2">{{ book.progress }}% تکمیل شده</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from '@/stores/store'
import { useI18n } from 'vue-i18n'
import { jalaliDate } from '@/utils/date'

const store = useStore()
const { t } = useI18n()

const progressStats = computed(() => [{
  title: 'تعداد تمرین‌ها',
  value: store.userProgress.practiceCount || 0
}, {
  title: 'تعداد امتحان‌ها',
  value: store.userProgress.examCount || 0
}, {
  title: 'درصد موفقیت',
  value: `${store.userProgress.successRate || 0}%`
}, {
  title: 'زمان مطالعه',
  value: `${Math.floor((store.userProgress.studyTime || 0) / 60)} ساعت`
}])

const activities = computed(() => [
  {
    id: 1,
    title: 'تمرین فصل اعداد صحیح',
    date: new Date(),
    score: 8,
    maxScore: 10
  },
  {
    id: 2,
    title: 'امتحان فصل اعداد صحیح',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    score: 7,
    maxScore: 10
  }
])

const books = computed(() => [{
  id: 1,
  title: 'ریاضی وزارتی',
  progress: store.userProgress.mathMinistry || 0
}, {
  id: 2,
  title: 'ریاضی تکمیلی',
  progress: store.userProgress.mathSupplementary || 0
}, {
  id: 3,
  title: 'فیزیک',
  progress: store.userProgress.physics || 0
}])
</script>
