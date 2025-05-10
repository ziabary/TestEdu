<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">حساب کاربری</h1>

    <!-- Balance -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
      <h2 class="text-xl font-bold mb-4">موجودی</h2>
      <div class="text-center">
        <p class="text-4xl font-bold text-blue-600">{{ formatCurrency(balance) }}</p>
        <p class="text-gray-500">تعداد سؤال باقی‌مانده: {{ remainingQuestions }}</p>
      </div>
    </div>

    <!-- Transaction History -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
      <h2 class="text-xl font-bold mb-4">تاریخچه تراکنش‌ها</h2>
      <div class="space-y-4">
        <div
          v-for="invoice in invoices"
          :key="invoice.id"
          class="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
        >
          <div class="flex justify-between items-center">
            <div>
              <p class="font-semibold">{{ invoice.title }}</p>
              <p class="text-sm text-gray-500">{{ jalaliDate(invoice.date) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span :class="[invoice.type === 'purchase' ? 'text-blue-600' : 'text-red-600']">
                {{ formatCurrency(invoice.amount) }}
              </span>
              <span class="text-gray-500">/{{ invoice.questions }} سؤال</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Purchase History -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 class="text-xl font-bold mb-4">تاریخچه خریدها</h2>
      <div class="space-y-4">
        <div
          v-for="purchase in purchases"
          :key="purchase.id"
          class="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
        >
          <div class="flex justify-between items-center">
            <div>
              <p class="font-semibold">{{ purchase.packageName }}</p>
              <p class="text-sm text-gray-500">{{ jalaliDate(purchase.date) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-blue-600">{{ formatCurrency(purchase.amount) }}</span>
              <span class="text-gray-500">/{{ purchase.questions }} سؤال</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from '@/stores/store'
import { jalaliDate } from '@/utils/date'

const store = useStore()

const balance = computed(() => store.user?.accBalance || 0)
const remainingQuestions = computed(() => store.user?.usrQuestions || 0)

const invoices = computed(() => [
  {
    id: 1,
    title: 'خرید بسته 50 سؤال',
    date: new Date(),
    amount: 45000,
    questions: 50,
    type: 'purchase'
  },
  {
    id: 2,
    title: 'استفاده از سؤال',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    amount: -10000,
    questions: -10,
    type: 'usage'
  }
])

const purchases = computed(() => [
  {
    id: 1,
    packageName: 'بسته 50 سؤال',
    date: new Date(),
    amount: 45000,
    questions: 50
  },
  {
    id: 2,
    packageName: 'بسته 10 سؤال',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    amount: 10000,
    questions: 10
  }
])

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fa-IR', {
    style: 'currency',
    currency: 'IRR'
  }).format(amount)
}
</script>
