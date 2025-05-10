<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElCollapse, ElCollapseItem, ElCard, ElTag } from 'element-plus'
import { gradeData } from '@/data/grades'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

// Use auth store's dark mode state
const isDark = computed(() => auth.isDarkMode)

const handleGradeClick = (grade: any) => {
  if (!grade.active) return
  router.push(`/books/${grade.id}`)
}
</script>

<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center mb-12">
        <h1 class="text-2xl font-bold bg-gradient-to-r font-black from-blue-600 to-orange-500 dark:from-indigo-500 dark:to-orange-300 bg-clip-text text-transparent">
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