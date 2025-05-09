import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    nav: {
      home: 'Home',
      subjects: 'Subjects',
      chat: 'Chat',
      profile: 'Profile',
      login: 'Login',
      logout: 'Logout'
    },
    auth: {
      login: 'Login',
      loginTitle: 'Login to System',
      phoneNumber: 'Phone Number',
      enterPhone: 'Enter your phone number',
      loading: 'Loading...',
      profile: {
        title: 'Profile',
        name: 'Name',
        email: 'Email',
        grade: 'Grade',
        questions: 'Questions',
        save: 'Save Changes',
        purchase: 'Buy Questions',
        recentActivity: 'Recent Activity'
      }
    },
    subjects: {
      title: 'Subjects',
      progress: 'Progress'
    },
    chat: {
      title: 'Chat',
      remainingQuestions: 'Remaining Questions',
      askQuestion: 'Ask your question...',
      send: 'Send',
      loading: 'Answering...'
    },
    home: {
      title: 'Welcome to Targoman Education',
      subtitle: 'Learn Math and Physics interactively with AI',
      getStarted: 'Get Started',
      features: {
        interactive: {
          title: 'Interactive Learning',
          description: 'Learn through interactive conversations with AI'
        },
        smart: {
          title: 'Smart Guidance',
          description: 'Get personalized guidance based on your learning style'
        },
        available: {
          title: '24/7 Available',
          description: 'Learn anytime, anywhere with our AI tutor'
        }
      }
    },
    errors: {
      invalidPhone: 'Please enter a valid phone number',
      loginFailed: 'Login failed',
      updateFailed: 'Update failed',
      purchaseFailed: 'Purchase failed'
    }
  },
  fa: {
    nav: {
      home: 'خانه',
      subjects: 'درس‌ها',
      chat: 'گفتگو',
      profile: 'پروفایل',
      login: 'ورود',
      logout: 'خروج'
    },
    auth: {
      login: 'ورود',
      loginTitle: 'ورود به سیستم',
      phoneNumber: 'شماره موبایل',
      enterPhone: 'شماره موبایل خود را وارد کنید',
      loading: 'در حال بارگذاری...',
      profile: {
        title: 'پروفایل',
        name: 'نام',
        email: 'ایمیل',
        grade: 'پایه تحصیلی',
        questions: 'سوالات',
        save: 'ذخیره تغییرات',
        purchase: 'خرید سوال',
        recentActivity: 'فعالیت‌های اخیر'
      }
    },
    subjects: {
      title: 'درس‌ها',
      progress: 'پیشرفت'
    },
    chat: {
      title: 'گفتگو',
      remainingQuestions: 'سوالات باقیمانده',
      askQuestion: 'سوال خود را بپرسید...',
      send: 'ارسال',
      loading: 'در حال پاسخگویی...'
    },
    home: {
      title: 'به آموزش تارگومان خوش آمدید',
      subtitle: 'یادگیری ریاضی و فیزیک به صورت تعاملی با هوش مصنوعی',
      getStarted: 'شروع کنید',
      features: {
        interactive: {
          title: 'یادگیری تعاملی',
          description: 'یادگیری از طریق گفتگوهای تعاملی با هوش مصنوعی'
        },
        smart: {
          title: 'راهنمایی هوشمند',
          description: 'دریافت راهنمایی شخصی‌سازی شده بر اساس سبک یادگیری شما'
        },
        available: {
          title: 'دسترسی ۲۴/۷',
          description: 'یادگیری در هر زمان و مکان با معلم هوشمند ما'
        }
      }
    },
    errors: {
      invalidPhone: 'لطفاً شماره موبایل را به درستی وارد کنید',
      loginFailed: 'ورود ناموفق بود',
      updateFailed: 'بروزرسانی ناموفق بود',
      purchaseFailed: 'خرید ناموفق بود'
    }
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'fa',
  fallbackLocale: 'en',
  messages
}) 