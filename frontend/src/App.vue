<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useI18n } from 'vue-i18n'
import LoginModal from './components/LoginModal.vue'

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()
const showLoginModal = ref(false)

const navigation = [
  { name: t('nav.home'), href: '/' },
  { name: t('nav.subjects'), href: '/subjects' },
  { name: t('nav.chat'), href: '/chat' }
]

const login = async () => {
  // Implement login logic here
  // For now, just set authenticated to true
  auth.isAuthenticated = true
  router.push('/chat')
}

const logout = async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('token')
    auth.isAuthenticated = false
    auth.user = null
    router.push('/')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

const checkAuth = async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const response = await fetch('/api/auth/verify')
    if (response.ok) {
      auth.isAuthenticated = true
      const userResponse = await fetch('/api/user/profile')
      auth.user = await userResponse.json()
    } else {
      localStorage.removeItem('token')
    }
  } catch (error) {
    console.error('Error checking auth:', error)
    localStorage.removeItem('token')
  }
}

onMounted(() => {
  checkAuth()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <router-link to="/" class="flex items-center">
              <img class="h-8 w-auto" src="./assets/logo.svg" alt="Targoman Education" />
            </router-link>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8 sm:space-x-reverse">
              <router-link
                v-for="item in navigation"
                :key="item.name"
                :to="item.href"
                :class="[
                  $route.path === item.href
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                ]"
              >
                {{ item.name }}
              </router-link>
            </div>
          </div>
          <div class="flex items-center">
            <template v-if="auth.isAuthenticated">
              <router-link
                to="/profile"
                class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                {{ t('nav.profile') }}
              </router-link>
              <button
                @click="logout"
                class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                {{ t('nav.logout') }}
              </button>
            </template>
            <template v-else>
              <button
                @click="showLoginModal = true"
                class="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
              >
                {{ t('nav.login') }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view v-if="auth.isAuthenticated" />
      <div v-else class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ t('home.title') }}</h2>
        <p class="text-gray-600 mb-8">{{ t('home.subtitle') }}</p>
        <button
          @click="showLoginModal = true"
          class="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-600"
        >
          {{ t('nav.login') }}
        </button>
      </div>
    </main>

    <!-- Login Modal -->
    <LoginModal
      v-if="showLoginModal"
      @close="showLoginModal = false"
      @login="handleLogin"
    />
  </div>
</template>

<style>
@import './assets/main.css';
</style>
