<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ t('auth.profile.title') }}</h1>

        <!-- Profile Information -->
        <div class="bg-white shadow rounded-lg p-6 mb-8">
          <h2 class="text-lg font-medium text-gray-900 mb-4">{{ t('auth.profile.title') }}</h2>
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">{{ t('auth.profile.name') }}</label>
              <input
                id="name"
                v-model="profile.name"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">{{ t('auth.profile.email') }}</label>
              <input
                id="email"
                v-model="profile.email"
                type="email"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">{{ t('auth.phoneNumber') }}</label>
              <input
                id="phone"
                v-model="profile.phone"
                type="tel"
                disabled
                class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              />
            </div>

            <div>
              <label for="grade" class="block text-sm font-medium text-gray-700">{{ t('auth.profile.grade') }}</label>
              <select
                id="grade"
                v-model="profile.grade"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="7">7th Grade</option>
                <option value="8">8th Grade</option>
                <option value="9">9th Grade</option>
              </select>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {{ t('auth.profile.save') }}
              </button>
            </div>
          </form>
        </div>

        <!-- Question Balance -->
        <div class="bg-white shadow rounded-lg p-6 mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-lg font-medium text-gray-900">{{ t('auth.profile.questions') }}</h2>
              <p class="mt-1 text-sm text-gray-500">{{ profile.questions }} {{ t('auth.profile.questions') }}</p>
            </div>
            <button
              @click="showPurchaseModal = true"
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {{ t('auth.profile.purchase') }}
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">{{ t('auth.profile.recentActivity') }}</h2>
          <div class="space-y-4">
            <div v-for="activity in activities" :key="activity.id" class="flex items-start">
              <div class="flex-shrink-0">
                <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="mr-3">
                <p class="text-sm font-medium text-gray-900">{{ activity.description }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(activity.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Purchase Modal -->
    <div v-if="showPurchaseModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">{{ t('auth.profile.purchase') }}</h3>
          <button
            @click="showPurchaseModal = false"
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div v-for="pkg in packages" :key="pkg.id" class="flex items-center">
            <input
              :id="pkg.id"
              v-model="selectedPackage"
              :value="pkg.id"
              type="radio"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <label :for="pkg.id" class="mr-3 block text-sm font-medium text-gray-700">
              {{ pkg.questions }} {{ t('auth.profile.questions') }} - {{ pkg.price }} Toman
            </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="purchaseQuestions"
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {{ t('auth.profile.purchase') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import moment from 'moment-jalaali'

const authStore = useAuthStore()
const { t } = useI18n()

interface Activity {
  id: number
  description: string
  timestamp: string
}

interface Package {
  id: number
  questions: number
  price: number
}

interface Profile {
  name: string
  email: string
  phone: string
  grade: number
  questions: number
}

const profile = ref<Profile>({
  name: '',
  email: '',
  phone: '',
  grade: 7,
  questions: 0
})
const activities = ref<Activity[]>([])
const showPurchaseModal = ref(false)
const selectedPackage = ref<number | null>(null)

const packages: Package[] = [
  { id: 1, questions: 10, price: 50000 },
  { id: 2, questions: 50, price: 200000 },
  { id: 3, questions: 100, price: 350000 }
]

const loadProfile = async () => {
  try {
    const response = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      profile.value = {
        name: data.usrName || '',
        email: data.usrEmail || '',
        phone: data.usrPhone,
        grade: data.usrGrade,
        questions: data.usrQuestions
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}

const loadActivities = async () => {
  try {
    const response = await fetch('/api/user/activities', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      activities.value = await response.json()
    }
  } catch (error) {
    console.error('Error loading activities:', error)
  }
}

const updateProfile = async () => {
  try {
    const success = await authStore.updateProfile({
      usrName: profile.value.name,
      usrEmail: profile.value.email,
      usrGrade: profile.value.grade
    })
    if (success) {
      alert('Profile updated successfully')
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    alert(t('errors.updateFailed'))
  }
}

const purchaseQuestions = async () => {
  if (!selectedPackage.value) {
    alert('Please select a package')
    return
  }

  try {
    const pkg = packages.find(p => p.id === selectedPackage.value)
    if (!pkg) return
    const success = await authStore.buyQuestions(pkg.questions)
    if (success) {
      showPurchaseModal.value = false
      await loadProfile()
      alert('Purchase successful')
    }
  } catch (error) {
    console.error('Error purchasing questions:', error)
    alert(t('errors.purchaseFailed'))
  }
}

const formatDate = (date: string) => {
  return moment(date).format('jYYYY/jMM/jDD HH:mm')
}

onMounted(() => {
  loadProfile()
  loadActivities()
})
</script> 