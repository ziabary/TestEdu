<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElCollapse, ElCollapseItem, ElCard, ElTag } from 'element-plus'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

// Use auth store's dark mode state
const isDark = computed(() => auth.isDarkMode)

const gradeData = {
  categories: [
    {
      name: "دبستان دوره اول",
      collapsible: true,
      grades: [
        {
          id: 1,
          name: "پیش‌دبستانی",
          description: "شروع یک ماجراجویی یادگیری با بازی و خلاقیت!",
          motivation: "هر روز با کنجکاوی، یک قدم به دنیای بزرگ‌تر نزدیک‌تر می‌شی!",
          active: false,
          hidden:true
          
        },
        {
          id: 2,
          name: "کلاس اول",
          description: "گام اول به سوی کشف دنیای دانش و مهارت‌های جدید!",
          motivation: "با تلاشت، می‌تونی هر چیزی رو که می‌خوای یاد بگیری!",
          active: false
        },
        {
          id: 3,
          name: "کلاس دوم",
          description: "یادگیری بیشتر و بازی با ایده‌های تازه!",
          motivation: "هر سؤالی که داری، با شجاعت بپرس و کشف کن!",
          active: false
        },
        {
          id: 4,
          name: "کلاس سوم",
          description: "زمان کشف دنیای بزرگ‌تر با اعتماد به نفس!",
          motivation: "با هر تلاش کوچک، یه قهرمان بزرگ می‌شی!",
          active: false
        }
      ]
    },
    {
      name: "دبستان دوره دوم",
      collapsible: true,
      grades: [
        {
          id: 5,
          name: "کلاس چهارم",
          description: "کاوش در دانش با تفکر و خلاقیت بیشتر!",
          motivation: "هر روز یه فرصت جدیده که خودت رو بسازی!",
          active: false
        },
        {
          id: 6,
          name: "کلاس پنجم",
          description: "آمادگی برای چالش‌های بزرگ‌تر با پشتکار!",
          motivation: "با پشتکارت، می‌تونی به هر هدفی برسی!",
          active: false
        },
        {
          id: 7,
          name: "کلاس ششم",
          description: "لحظه‌ای برای درخشش و آماده‌سازی برای آینده!",
          motivation: "با اعتماد به خودت، آینده رو خودت بساز!",
          active: false
        }
      ]
    },
    {
      name: "متوسطه دوره اول",
      collapsible: true,
      grades: [
        {
          id: 8,
          name: "کلاس هفتم",
          description: "شروع یک سفر هیجان‌انگیز به دنیای علم و دانش!",
          motivation: "هر قدمت تو یادگیری، یه موفقیت بزرگه!",
          active: true
        },
        {
          id: 9,
          name: "کلاس هشتم",
          description: "زمان رشد مهارت‌ها و کشف استعدادهای جدید!",
          motivation: "با تلاشت، می‌تونی دنیا رو تغییر بدی!",
          active: false
        },
        {
          id: 10,
          name: "کلاس نهم",
          description: "آمادگی برای انتخاب مسیر آینده با جاه‌طلبی!",
          motivation: "با شجاعت، بهترین نسخه خودت رو بساز!",
          active: false
        }
      ]
    },
    {
      name: "متوسطه دوره دوم",
      collapsible: true,
      grades: [
        {
          id: 11,
          name: "کلاس دهم",
          description: "شروع مسیر تخصصی با رویاهایت!",
          motivation: "هر روز، یه قدم به رویاهات نزدیک‌تر می‌شی!",
          active: false
        },
        {
          id: 12,
          name: "کلاس یازدهم",
          description: "زمان تمرکز و ساخت پایه‌های موفقیت!",
          motivation: "با پشتکار، می‌تونی به قله‌ها برسی!",
          active: false
        },
        {
          id: 13,
          name: "کلاس دوازدهم",
          description: "لحظه طلایی برای تحقق آرزوهات!",
          motivation: "با تلاش آخر، آینده‌ات رو بدرخشن کن!",
          active: false
        }
      ]
    }
  ]
}

const handleGradeClick = (grade: any) => {
  if (!grade.active) return
  
  // Show login dialog if not authenticated
  if (!auth.isAuthenticated) {
    auth.showLoginDialog()
    return
  }
  
  router.push(`/book?grade=${grade.id}`)
}
</script>

<template>
  <div class="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-300"
       :style="{ backgroundImage: isDark ? `url('/imgs/bg/dark.jpg')` : `url('/imgs/bg/light.jpg')` }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center mb-12">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
          با یه معلم باحال و مهربون، همیشه آماده یادگیری باش!<br/> کلاس چندمی هستی؟
        </h1>
      </div>

      <!-- Desktop View -->
      <div class="hidden lg:block">
        <div class="grid grid-cols-4 gap-4">
          <div v-for="category in gradeData.categories" :key="category.name" 
               class="border-2 border-yellow-300 dark:border-purple-400 rounded-lg p-4 bg-white/90 dark:bg-gray-700/80 backdrop-blur-sm shadow-md shadow-orange-200 dark:shadow-purple-900/30">
            <h3 class="text-xl font-semibold mb-4 text-blue-600 dark:text-purple-300">{{ category.name }}</h3>
            <div class="flex flex-col gap-4">
              <el-card
                v-for="grade in category.grades.filter(g => !g.hidden)"
                :key="grade.id"
                :class="[
                  'cursor-pointer transition-all duration-300',
                  grade.active 
                    ? 'hover:!bg-gradient-to-r hover:!from-blue-300 hover:!to-pink-300 dark:hover:!from-indigo-500 dark:hover:!to-purple-400 hover:scale-105 hover:shadow-lg hover:shadow-orange-200 dark:hover:shadow-purple-900/30' 
                    : 'opacity-60 hover:!bg-gray-100 dark:hover:!bg-gray-800'
                ]"
                @click="handleGradeClick(grade)"
                class="!bg-transparent dark:!bg-gray-800/50"
              >
                <template #header>
                  <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-blue-600 dark:text-purple-300">{{ grade.name }}</h3>
                    <el-tag v-if="!grade.active" type="success" size="small" class="shadow-[0_0_8px_rgba(144,238,144,0.5)]">به‌زودی</el-tag>
                  </div>
                </template>
                <div class="space-y-4">
                  <p class="text-orange-500 dark:text-yellow-100">{{ grade.description }}</p>
                  <p class="text-sm text-blue-600 dark:text-purple-300 italic">{{ grade.motivation }}</p>
                </div>
              </el-card>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile View -->
      <div class="lg:hidden">
        <el-collapse class="w-full">
          <el-collapse-item
            v-for="category in gradeData.categories"
            :key="category.name"
            :title="category.name"
          >
            <div class="flex flex-col gap-4">
              <el-card
                v-for="grade in category.grades.filter(g => !g.hidden)"
                :key="grade.id"
                :class="[
                  'cursor-pointer transition-all duration-300',
                  grade.active 
                    ? 'hover:!bg-gradient-to-r hover:!from-blue-300 hover:!to-pink-300 dark:hover:!from-indigo-500 dark:hover:!to-purple-400 hover:scale-105 hover:shadow-lg hover:shadow-orange-200 dark:hover:shadow-purple-900/30' 
                    : 'opacity-60 hover:!bg-gray-100 dark:hover:!bg-gray-800'
                ]"
                @click="handleGradeClick(grade)"
                class="!bg-transparent dark:!bg-gray-800/50"
              >
                <template #header>
                  <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-blue-600 dark:text-purple-300">{{ grade.name }}</h3>
                    <el-tag v-if="!grade.active" type="success" size="small" class="shadow-[0_0_8px_rgba(144,238,144,0.5)]">به‌زودی</el-tag>
                  </div>
                </template>
                <div class="space-y-4">
                  <p class="text-orange-500 dark:text-yellow-100">{{ grade.description }}</p>
                  <p class="text-sm text-blue-600 dark:text-purple-300 italic">{{ grade.motivation }}</p>
                </div>
              </el-card>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<style scoped>
.el-collapse-item__header {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1E88E5;
  background-color: transparent !important;
}

.el-card {
  border: 1px solid #E5E7EB;
  transition: all 0.3s ease;
  background-color: transparent !important;
}

.el-card:hover {
  transform: translateY(-2px);
}

.el-tag {
  font-size: 0.75rem;
}

:deep(.el-collapse-item__header) {
  background-color: transparent !important;
  border-bottom: 1px solid #E5E7EB;
}

:deep(.el-collapse-item__wrap) {
  background-color: transparent !important;
  border-bottom: 1px solid #E5E7EB;
}

:deep(.el-card__header) {
  border-bottom: 1px solid #E5E7EB;
  padding: 1rem;
}

:deep(.el-card__body) {
  padding: 1rem;
}

:deep(.dark .el-card__header) {
  border-bottom-color: #374151;
}

:deep(.dark .el-collapse-item__header),
:deep(.dark .el-collapse-item__wrap) {
  border-bottom-color: #374151;
}

:deep(.el-card) {
  height: 200px;
}

:deep(.el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4B5563;
}
</style>