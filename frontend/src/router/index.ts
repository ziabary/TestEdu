import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/subjects',
      name: 'subjects',
      component: () => import('@/views/Subjects.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chat/:subject?/:chapter?',
      name: 'chat',
      component: () => import('@/views/Chat.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth) {
    if (!token) {
      next({ name: 'home' })
      return
    }

    if (!authStore.isAuthenticated) {
      try {
        await authStore.loadUserProfile()
      } catch (error) {
        next({ name: 'home' })
        return
      }
    }
  }

  next()
})

export default router 