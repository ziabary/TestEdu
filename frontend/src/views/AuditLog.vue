<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-6">لاگ عملیات</h1>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div class="flex justify-between items-center mb-4">
        <div class="flex gap-4">
          <select
            v-model="filter.type"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">همه انواع</option>
            <option value="insert">ایجاد</option>
            <option value="update">به‌روزرسانی</option>
            <option value="delete">حذف</option>
            <option value="login">ورود</option>
            <option value="logout">خروج</option>
          </select>
          <input
            v-model="filter.date"
            type="date"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
            placeholder="تاریخ..."
          />
        </div>
        <button
          @click="exportLogs"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          صادر کردن
        </button>
      </div>

      <vue3-easy-data-table
        :headers="headers"
        :items="logs"
        :loading="loading"
        :searchable="true"
        :search-placeholder="'جستجو...'"
        :sort-by="sortBy"
        :sort-type="sortType"
        @sort="onSort"
      >
        <template #item-action="{ item }">
          <div class="flex gap-2">
            <button
              @click="viewLog(item)"
              class="text-blue-600 hover:text-blue-800"
            >
              مشاهده
            </button>
          </div>
        </template>
      </vue3-easy-data-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from '@/stores/store'

const store = useStore()
const loading = ref(false)
const logs = ref<any[]>([])

const filter = ref({
  type: '',
  date: ''
})

const headers = [
  { text: 'نوع عملیات', value: 'type' },
  { text: 'زمان', value: 'time' },
  { text: 'کاربر', value: 'user' },
  { text: 'عملیات', value: 'action' },
  { text: 'جزئیات', value: 'details' },
  { text: 'عملیات', value: 'action' }
]

const sortBy = ref('time')
const sortType = ref('desc')

const fetchLogs = async () => {
  try {
    loading.value = true
    logs.value = await store.getAuditLogs(filter.value)
  } catch (error) {
    console.error('Error fetching logs:', error)
  } finally {
    loading.value = false
  }
}

const onSort = (column: string, type: string) => {
  sortBy.value = column
  sortType.value = type
  fetchLogs()
}

const viewLog = (log: any) => {
  // Implement log viewing modal
}

const exportLogs = async () => {
  try {
    await store.exportAuditLogs(filter.value)
  } catch (error) {
    console.error('Error exporting logs:', error)
  }
}

onMounted(fetchLogs)
</script>
