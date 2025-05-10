<template>
  <div class="py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ t('auth.profile.title') }}</h1>

        <!-- Profile Information -->
        <el-card class="mb-8">
          <template #header>
            <h2 class="text-lg font-medium text-gray-900">{{ t('auth.profile.title') }}</h2>
          </template>
          <el-form @submit.prevent="updateProfile" class="space-y-4">
            <el-form-item :label="t('auth.profile.name')">
              <el-input
                v-model="profile.name"
                type="text"
                :placeholder="t('auth.profile.enterName')"
              />
            </el-form-item>

            <el-form-item :label="t('auth.profile.email')">
              <el-input
                v-model="profile.email"
                type="email"
                :placeholder="t('auth.profile.enterEmail')"
              />
            </el-form-item>

            <el-form-item :label="t('auth.phoneNumber')">
              <el-input
                v-model="profile.phone"
                type="tel"
                disabled
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" native-type="submit">
                {{ t('auth.profile.save') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Activity History -->
        <el-card>
          <template #header>
            <h2 class="text-lg font-medium text-gray-900">{{ t('auth.profile.activityHistory') }}</h2>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in activities"
              :key="activity.id"
              :timestamp="formatDate(activity.timestamp)"
              placement="top"
            >
              {{ activity.description }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>
    </div>

    <!-- Purchase Modal -->
    <el-dialog
      v-model="showPurchaseModal"
      :title="t('auth.profile.purchase')"
      width="30%"
    >
      <el-radio-group v-model="selectedPackage">
        <el-radio
          v-for="pkg in packages"
          :key="pkg.id"
          :label="pkg.id"
          class="block mb-4"
        >
              {{ pkg.questions }} {{ t('auth.profile.questions') }} - {{ pkg.price }} Toman
        </el-radio>
      </el-radio-group>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPurchaseModal = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="purchaseQuestions">
            {{ t('auth.profile.purchase') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import moment from 'moment-jalaali'
import { useMessage } from '@/composables/useMessage'

const authStore = useAuthStore()
const { t } = useI18n()
const { showMessage } = useMessage()

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
    showMessage({
      success: false,
      code: 'SYS_001',
      message: 'Failed to load user profile',
      translation: 'خطا در بارگذاری پروفایل'
    })
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
    showMessage({
      success: false,
      code: 'SYS_001',
      message: 'Failed to load activities',
      translation: 'خطا در بارگذاری تاریخچه فعالیت'
    })
  }
}

const updateProfile = async () => {
  try {
    const success = await authStore.updateProfile({
      usrName: profile.value.name,
      usrEmail: profile.value.email,
      usrGrade: profile.value.grade
    })
    showMessage({
      success: true,
      code: 'USER_003',
      message: 'Profile updated successfully',
      translation: 'پروفایل با موفقیت بروزرسانی شد'
    })
  } catch (error) {
    showMessage({
      success: false,
      code: 'SYS_001',
      message: 'Failed to update profile',
      translation: 'خطا در بروزرسانی پروفایل'
    })
  }
}

const purchaseQuestions = async () => {
  if (!selectedPackage.value) {
    showMessage({
      success: false,
      code: 'USER_004',
      message: 'Please select a package',
      translation: 'لطفاً یک پکیج انتخاب کنید'
    })
    return
  }

  try {
    const pkg = packages.find(p => p.id === selectedPackage.value)
    if (!pkg) return
    const success = await authStore.buyQuestions(pkg.questions)
    if (success) {
      showPurchaseModal.value = false
      await loadProfile()
      showMessage({
        success: true,
        code: 'USER_005',
        message: 'Package purchased successfully',
        translation: 'پکیج با موفقیت خریداری شد'
      })
    }
  } catch (error) {
    showMessage({
      success: false,
      code: 'SYS_001',
      message: 'Failed to purchase package',
      translation: 'خطا در خرید پکیج'
    })
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