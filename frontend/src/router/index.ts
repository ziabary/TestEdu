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
      path: '/book',
      name: 'book',
      component: () => import('@/views/Book.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/practice',
      name: 'practice',
      component: () => import('@/views/Practice.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/exam',
      name: 'exam',
      component: () => import('@/views/Exam.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/progress',
      name: 'progress',
      component: () => import('@/views/Progress.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('@/views/Account.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/purchase',
      name: 'purchase',
      component: () => import('@/views/Purchase.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/Admin.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem('token')

  // Check authentication
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

    // Check admin access
    if (to.meta.requiresAdmin && authStore.user?.usrGrade !== 0) {
      next({ name: 'home' })
      return
    }
  }

  next()
})

export default router 