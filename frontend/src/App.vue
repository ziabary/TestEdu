<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useI18n } from 'vue-i18n'
import Cookies from 'js-cookie'
import ChatBar from './components/ChatBar.vue'
import { ElSwitch, ElButton } from 'element-plus'
import { Moon, Sunny } from '@element-plus/icons-vue'
import LoginDialog from '@/components/LoginDialog.vue'

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()
const isDropdownOpen = ref(false)

const user = computed(() => auth.user)

const login = () => {
  console.log('Login button clicked')
  auth.showLoginDialog()
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

const isDarkMode = computed({
  get: () => auth.isDarkMode,
  set: () => auth.toggleDarkMode()
})

onMounted(() => {
  auth.loadDarkMode()
  auth.loadUserProfile()
  
  // Initialize dark mode
  const savedDarkMode = Cookies.get('darkMode')
  if (savedDarkMode !== undefined) {
    auth.isDarkMode = savedDarkMode === 'true'
  } else {
    auth.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  // Update document class based on initial state
  document.documentElement.classList.toggle('dark', auth.isDarkMode)
  
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target && !target.closest('.dropdown')) {
      isDropdownOpen.value = false
    }
  })
})
</script>

<template>
  <div :class="{ 'dark': auth.isDarkMode }">
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <router-link to="/" class="flex items-center">
                <div class="flex items-center">
                  <img 
                    src="/imgs/darsyar-color.svg" 
                    alt="درس‌یار" 
                    class="h-8 dark:hidden"
                  />
                  <img 
                    src="/imgs/darsyar-white.svg" 
                    alt="درس‌یار" 
                    class="h-8 hidden dark:block"
                  />
                </div>
              </router-link>
            </div>

            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <ElSwitch
                  v-model="isDarkMode"
                  class="ml-4"
                  style="--el-border-radius: 15px; --el-switch-width: 64px; --el-switch-height: 32px"
                >
                  <template #active-action>
                    <el-icon><Moon /></el-icon>
                  </template>
                  <template #inactive-action>
                    <el-icon><Sunny /></el-icon>
                  </template>
                </ElSwitch>
              </div>

              <div v-if="!auth.isAuthenticated" class="flex items-center">
                <el-button
                  type="primary"
                  @click="login"
                >
                  ورود/ثبت‌نام
                </el-button>
              </div>

              <div v-else class="ml-3 relative">
                <div>
                  <button
                    @click="isDropdownOpen = !isDropdownOpen"
                    class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <img
                      class="h-8 w-8 rounded-full"
                      :src="user?.usrAvatar || '/images/default-avatar.png'"
                      alt=""
                    />
                  </button>
                </div>

                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div
                    v-show="isDropdownOpen"
                    class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <router-link
                      to="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      پروفایل
                    </router-link>
                    <button
                      @click="logout"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      خروج
                    </button>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1">
        <router-view />
      </main>

      <!-- Footer -->
      <footer class="bg-gray-800 text-white py-4 fixed bottom-0 w-full">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center">
            <p class="text-sm"> &copy; ۱۴۰۴ کلیه حقوق برای <a href="https://tip.co.ir" class="text-blue-500 hover:text-blue-600">پردازش هوشمند ترگمان</a> محفوظ است.</p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white mx-2">تماس با ما</a>
              <a href="#" class="text-gray-400 hover:text-white mx-2">درباره ما</a>
              <a href="#" class="text-gray-400 hover:text-white mx-2">شرایط استفاده</a>
            </div>
          </div>
        </div>
      </footer>

      <!-- Chat Bar -->
      <ChatBar v-if="auth.isAuthenticated" />

      <LoginDialog />
    </div>
  </div>
</template>

<style>
@import url('/fonts/IranSansX/fontiran.css');

:root {
  --font-persian: 'IRANSansX', sans-serif;
  --tw-bg-opacity: 1;
  --tw-text-opacity: 1;
}

body {
  font-family: var(--font-persian);
  background-color: #f9fafb;
  color: #1f2937;
}

.dark {
  background-color: #111827;
  color: #f9fafb;
}

/* Base styles */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  color: white;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out;
}

.btn-primary {
  background-color: #3b82f6;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #4b5563;
}

.btn-secondary:hover {
  background-color: #374151;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

/* Dark mode styles */
.dark .btn-primary {
  background-color: #60a5fa;
}

.dark .btn-primary:hover {
  background-color: #3b82f6;
}

.dark .btn-secondary {
  background-color: #94a3b8;
}

.dark .btn-secondary:hover {
  background-color: #4b5563;
}

.dark .card {
  background-color: #111827;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

/* RTL support */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}
</style>
