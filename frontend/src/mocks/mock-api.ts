import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// Store original fetch before overriding
(window as any).originalFetch = window.fetch

// Mock data
const mockUserData = {
  id: 1,
  name: 'دانش‌آموز',
  grade: 7,
  questionsLeft: 10,
  progress: {
    math: 50,
    physics: 30
  }
}

const mockSubjects = [
  {
    id: 1,
    name: 'ریاضی',
    chapters: [
      { id: 1, name: 'فصل 1 - اعداد صحیح' },
      { id: 2, name: 'فصل 2 - نسبت و تناسب' },
      { id: 3, name: 'فصل 3 - هندسه' }
    ]
  },
  {
    id: 2,
    name: 'فیزیک',
    chapters: [
      { id: 1, name: 'فصل 1 - حرکت' },
      { id: 2, name: 'فصل 2 - نیرو' },
      { id: 3, name: 'فصل 3 - کار و انرژی' }
    ]
  }
]

const mockQuestions = [
  {
    id: 1,
    subject: 'ریاضی',
    chapter: 'فصل 1 - اعداد صحیح',
    question: 'جمع دو عدد صحیح مثبت چه می‌شود؟',
    options: [
      'مثبت',
      'منفی',
      'صفر',
      'غیر قابل تعیین'
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    subject: 'فیزیک',
    chapter: 'فصل 1 - حرکت',
    question: 'حرکت یک جسم در خط راست چیست؟',
    options: [
      'حرکت خطی',
      'حرکت دایره‌ای',
      'حرکت پارابولیک',
      'حرکت نوسانی'
    ],
    correctAnswer: 0
  }
]

const mockChatHistory = [
  {
    id: 1,
    question: 'چه چیزی نیرو است؟',
    answer: 'نیرو عاملی است که باعث تغییر حالت حرکت جسم می‌شود.',
    subject: 'فیزیک',
    chapter: 'فصل 2 - نیرو',
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    question: 'چه چیزی اعداد صحیح هستند؟',
    answer: 'اعداد صحیح شامل اعداد مثبت، منفی و صفر هستند.',
    subject: 'ریاضی',
    chapter: 'فصل 1 - اعداد صحیح',
    timestamp: new Date().toISOString()
  }
]

// Mock API service
const useMockApi = defineStore('mockApi', () => {
  const isMockEnabled = ref(true)

  const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const mockResponse = async <T>(data: T, delay = 500) => {
    await mockDelay(delay)
    return data
  }

  const api = {
    auth: {
      verify: async () => mockResponse({ verified: true }),
      logout: async () => mockResponse({ success: true })
    },

    user: {
      profile: async () => mockResponse(mockUserData),
      update: async (data: Partial<typeof mockUserData>) => mockResponse({ ...mockUserData, ...data }),
      progress: async () => mockResponse(mockUserData.progress)
    },

    subjects: {
      list: async () => mockResponse(mockSubjects)
    },

    practice: {
      get: async (chapter: string) => mockResponse(mockQuestions.filter(q => q.chapter === chapter))
    },

    exam: {
      get: async (type: string) => mockResponse(mockQuestions),
      submit: async (data: { answers: number[] }) => mockResponse({ score: 85, feedback: 'خوب ادامه دهید!' })
    },

    chat: {
      history: async (page: number = 1) => mockResponse({
        items: mockChatHistory,
        total: mockChatHistory.length,
        page,
        pageSize: 10
      }),
      send: async (data: { question: string; subject: string; chapter: string }) => mockResponse({
        id: mockChatHistory.length + 1,
        ...data,
        timestamp: new Date().toISOString()
      })
    },

    payment: {
      buy: async (packageId: string) => mockResponse({
        success: true,
        questionsLeft: mockUserData.questionsLeft + 10
      })
    }
  }

  // Function to handle fetch mocking
  const toggleFetchMocking = (enabled: boolean) => {
    if (enabled) {
      // Override global fetch when mocks are enabled
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString()
        const body = init?.body ? JSON.parse(init.body as string) : null

        // Simulate network delay
        await mockDelay(500)

        try {
          switch (url) {
            case '/api/auth/verify':
              return new Response(JSON.stringify(await api.auth.verify()))
            case '/api/auth/logout':
              return new Response(JSON.stringify(await api.auth.logout()))
            case '/api/user/profile':
              return new Response(JSON.stringify(await api.user.profile()))
            case '/api/user/progress':
              return new Response(JSON.stringify(await api.user.progress()))
            case '/api/subjects/list':
              return new Response(JSON.stringify(await api.subjects.list()))
            case '/api/practice/get':
              return new Response(JSON.stringify(await api.practice.get(body)))
            case '/api/exam/get':
              return new Response(JSON.stringify(await api.exam.get(body)))
            case '/api/exam/submit':
              return new Response(JSON.stringify(await api.exam.submit(body)))
            case '/api/chat/history':
              return new Response(JSON.stringify(await api.chat.history(body)))
            case '/api/chat/send':
              return new Response(JSON.stringify(await api.chat.send(body)))
            case '/api/payment/buy':
              return new Response(JSON.stringify(await api.payment.buy(body)))
            default:
              throw new Error('API endpoint not found')
          }
        } catch (error) {
          return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      }
    } else {
      // Restore original fetch when mocks are disabled
      window.fetch = (window as any).originalFetch
    }
  }

  // Watch for changes to isMockEnabled
  watch(isMockEnabled, (newValue: boolean) => {
    toggleFetchMocking(newValue)
  })

  return {
    isMockEnabled,
    api
  }
})

// Export the store as default and named export
export default useMockApi
export { useMockApi }
