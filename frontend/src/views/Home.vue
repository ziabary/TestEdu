<script setup lang="ts">
const grades = [
  { id: 7, name: 'کلاس هفتم', active: true },
  { id: 8, name: 'کلاس هشتم', active: false },
  { id: 9, name: 'کلاس نهم', active: false }
]
</script>

<template>
  <div class="space-y-12">
    <!-- Slogan -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-primary mb-4">یادگیری باحال، آینده روشن!</h2>
    </div>

    <!-- Grade Selection -->
    <div class="max-w-4xl mx-auto">
      <h3 class="text-2xl font-bold mb-6 text-center">انتخاب پایه تحصیلی</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="grade in grades"
          :key="grade.id"
          class="bg-white rounded-lg shadow-sm p-6 text-center cursor-pointer transition-all duration-200"
          :class="grade.active ? 'ring-2 ring-primary' : 'opacity-50'"
        >
          <div class="w-16 h-16 mx-auto mb-4">
            <img
              :src="`/images/grade${grade.id}-icon.svg`"
              :alt="grade.name"
              class="w-full h-full"
            />
          </div>
          <h4 class="text-lg font-medium">{{ grade.name }}</h4>
          <p v-if="!grade.active" class="text-sm text-gray-500 mt-2">به‌زودی</p>
        </div>
      </div>
    </div>
  </div>
</template> 