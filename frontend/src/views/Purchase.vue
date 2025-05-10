<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-6">خرید بسته سوال</h1>
    
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div
        v-for="pkg in packages"
        :key="pkg.id"
        class="rounded-lg shadow p-6"
      >
        <div class="text-center">
          <h3 class="text-xl font-bold mb-2">{{ pkg.name }}</h3>
          <p class="text-gray-600 mb-4">{{ pkg.questions }} سوال</p>
          <p class="text-2xl font-bold text-blue-600 mb-4">{{ pkg.price }} ریال</p>
          <button
            @click="purchasePackage(pkg.id)"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'در حال خرید...' : 'خرید' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="purchaseSuccess" class="mt-8 bg-green-100 dark:bg-green-900 p-4 rounded-lg">
      <p class="text-green-800 dark:text-green-200">خرید با موفقیت انجام شد!</p>
      <p class="mt-2 text-green-800 dark:text-green-200">موجودی شما به روز شد.</p>
      <button
        @click="goToAccount"
        class="mt-2 text-blue-600 hover:text-blue-800"
      >
        مشاهده حساب کاربری
      </button>
    </div>

    <div v-if="purchaseError" class="mt-8 bg-red-100 dark:bg-red-900 p-4 rounded-lg">
      <p class="text-red-800 dark:text-red-200">خطا در خرید: {{ purchaseError }}</p>
      <button
        @click="retryPurchase"
        class="mt-2 text-blue-600 hover:text-blue-800"
      >
        تلاش مجدد
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from '@/stores/store'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const loading = ref(false)
const purchaseSuccess = ref(false)
const purchaseError = ref('')

const packages = [
  {
    id: 1,
    name: 'بسته 10 سوال',
    questions: 10,
    price: 10000
  },
  {
    id: 2,
    name: 'بسته 50 سوال',
    questions: 50,
    price: 45000
  },
  {
    id: 3,
    name: 'بسته 100 سوال',
    questions: 100,
    price: 80000
  }
]

const purchasePackage = async (packageId: number) => {
  try {
    loading.value = true
    purchaseError.value = ''
    
    // TODO: Implement purchase logic
    const selectedPackage = packages.find(p => p.id === packageId)
    if (!selectedPackage) return

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    purchaseSuccess.value = true
    store.updateUserQuestions(selectedPackage.questions)
  } catch (error) {
    purchaseError.value = 'خطا در خرید. لطفاً دوباره تلاش کنید.'
  } finally {
    loading.value = false
  }
}

const goToAccount = () => {
  router.push('/account')
}

const retryPurchase = () => {
  purchaseError.value = ''
}

onMounted(() => {
  // Reset purchase state
  purchaseSuccess.value = false
  purchaseError.value = ''
})
</script>
