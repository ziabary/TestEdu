<template>
  <div class="p-4">
    <!-- Sidebar -->
    <div class="md:hidden">
        <button @click="isSidebarOpen = !isSidebarOpen" class="text-gray-600">
          <font-awesome-icon icon="bars" class="w-6 h-6" />
        </button>
    </div>

    <aside :class="[isSidebarOpen ? 'block' : 'hidden', 'md:block', 'w-64', 'bg-white', 'dark:bg-gray-800', 'fixed', 'h-full', 'border-r', 'border-gray-200', 'dark:border-gray-700']">
      <div class="p-4">
        <h2 class="text-xl font-bold mb-4">پنل مدیریت</h2>
        <nav class="space-y-2">
          <router-link
            v-for="tab in tabs"
            :key="tab"
            :to="`/admin/${tab.toLowerCase()}`"
            :class="[
              'block px-4 py-2 rounded-lg',
              currentTab === tab ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
            @click="currentTab = tab"
          >
            {{ tab }}
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="ml-0 md:ml-64 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div v-if="currentTab === 'Users'" class="space-y-4">
          <h2 class="text-xl font-bold">کاربران</h2>
          <vue3-easy-data-table
            :headers="userHeaders"
            :items="users"
            :loading="loading"
            :searchable="true"
            :search-placeholder="'جستجو...'"
            :sort-by="sortBy"
            :sort-type="sortType"
            @sort="onSort"
          >
            <template #item-operation="{ item }">
              <div class="flex gap-2">
                <button
                  @click="updateBalance(item.usrID)"
                  class="text-blue-600 hover:text-blue-800"
                >
                  به‌روزرسانی موجودی
                </button>
                <button
                  @click="deleteUser(item.usrID)"
                  class="text-red-600 hover:text-red-800"
                >
                  حذف
                </button>
              </div>
            </template>
          </vue3-easy-data-table>
        </div>

        <div v-if="currentTab === 'Accounts'" class="space-y-4">
          <h2 class="text-xl font-bold">حساب‌ها</h2>
          <vue3-easy-data-table
            :headers="accountHeaders"
            :items="accounts"
            :loading="loading"
          />
        </div>

        <div v-if="currentTab === 'Chats'" class="space-y-4">
          <h2 class="text-xl font-bold">چت‌ها</h2>
          <vue3-easy-data-table
            :headers="chatHeaders"
            :items="chats"
            :loading="loading"
          />
        </div>

        <div v-if="currentTab === 'Stats'" class="space-y-4">
          <h2 class="text-xl font-bold">آمارها</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 class="text-lg font-semibold mb-2">آمار کاربران</h3>
              <chartjs-line
                :chart-data="userStats"
                :options="chartOptions"
              />
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 class="text-lg font-semibold mb-2">آمار فعالیت‌ها</h3>
              <chartjs-bar
                :chart-data="activityStats"
                :options="chartOptions"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from '@/stores/store'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, BarElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, BarElement)

const store = useStore()
const { t } = useI18n()
const router = useRouter()

const isSidebarOpen = ref(false)
const currentTab = ref('Users')
const loading = ref(true)

const tabs = ['Users', 'Accounts', 'Chats', 'Stats']

const userHeaders = [
  { text: 'نام', value: 'usrName' },
  { text: 'شماره تلفن', value: 'usrPhone' },
  { text: 'سطح', value: 'usrGrade' },
  { text: 'موجودی', value: 'usrQuestions' },
  { text: 'عملیات', value: 'operation' }
]

const accountHeaders = [
  { text: 'کاربر', value: 'usrName' },
  { text: 'موجودی', value: 'accBalance' },
  { text: 'تاریخ ایجاد', value: 'accCreatedDateTime' }
]

const chatHeaders = [
  { text: 'کاربر', value: 'usrName' },
  { text: 'موضوع', value: 'chtSubject' },
  { text: 'تاریخ', value: 'chtCreatedDateTime' }
]

const sortBy = ref('usrName')
const sortType = ref('asc')

const onSort = (column: string) => {
  if (sortBy.value === column) {
    sortType.value = sortType.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortType.value = 'asc'
  }
}

const updateBalance = async (userId: number) => {
  // TODO: Implement balance update logic
}

const deleteUser = async (userId: number) => {
  // TODO: Implement user deletion logic
}

const userStats = {
  labels: ['یک', 'دو', 'سه', 'چهار', 'پنج'],
  datasets: [
    {
      label: 'تعداد کاربران',
      data: [12, 19, 3, 5, 2],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }
  ]
}

const activityStats = {
  labels: ['تمرین', 'امتحان', 'چت'],
  datasets: [
    {
      label: 'تعداد فعالیت‌ها',
      data: [15, 10, 5],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)'
      ]
    }
  ]
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: ''
    }
  }
}

onMounted(async () => {
  // TODO: Fetch data from API
  loading.value = false
})
</script>
