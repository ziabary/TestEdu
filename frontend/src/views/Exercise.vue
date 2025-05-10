<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="page-title">
        {{ exercise?.question }}
      </h2>
      <button 
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        @click="goBack"
      >
        بازگشت به لیست
      </button>
    </div>
    
    <div class="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg p-6 mb-6">
      <div class="prose dark:prose-invert max-w-none">
        <div class="flex justify-end mb-4">
          <button 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="showAnswer = !showAnswer"
          >
            {{ showAnswer ? 'مخفی کردن پاسخ' : 'نمایش پاسخ' }}
          </button>
        </div>
        
        <div v-if="showAnswer" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="font-medium mb-2">پاسخ:</p>
          <p class="mb-4">{{ exercise?.answer }}</p>
          
          <button 
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            @click="showDetail = !showDetail"
          >
            {{ showDetail ? 'مخفی کردن توضیحات' : 'نمایش توضیحات' }}
          </button>
          
          <div v-if="showDetail" class="mt-4">
            <p>{{ exercise?.detail }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Chat Box -->
    <div class="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg p-6">
      <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        گفتگو درباره این سوال
      </h3>
      
      <div class="h-96 overflow-y-auto mb-4 space-y-4">
        <div v-for="(message, index) in messages" :key="index"
          :class="[
            'p-4 rounded-lg max-w-[80%]',
            message.isUser 
              ? 'bg-blue-600 text-white ml-auto' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          ]"
        >
          {{ message.text }}
        </div>
      </div>
      
      <div class="flex gap-2">
        <input 
          v-model="newMessage"
          type="text"
          placeholder="سوال خود را بپرسید..."
          class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="sendMessage"
        />
        <button 
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="sendMessage"
        >
          ارسال
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import math7 from '@/data/math7'

const route = useRoute()
const router = useRouter()

const exercise = ref(null)
const showAnswer = ref(false)
const showDetail = ref(false)
const messages = ref([])
const newMessage = ref('')

onMounted(() => {
  // TODO: Load exercise data based on route params
  // For now, using sample data
  exercise.value = {
    question: "مراحل حل یک مسئله را بنویسید.",
    answer: "درک، برنامه‌ریزی، اجرا، بررسی",
    detail: "خب، بذار مراحل حل مسئله رو باهم مرور کنیم:\n- **درک**: اول باید بفهمی مسئله چی می‌خواد. مثلاً اگه ازت بپرسن چند تا سیب داری، باید ببینی تعداد سیب‌ها رو داری یا نه.\n- **برنامه‌ریزی**: اینجا فکر می‌کنی چطور می‌تونی جواب رو پیدا کنی. مثلاً اگه تعداد سیب‌ها رو نداری، شاید بتونی از تعداد جعبه‌ها و تعداد سیب تو هر جعبه بفهمی.\n- **اجرا**: حالا محاسبه رو انجام می‌دی. مثلاً اگه ۲ جعبه داری و هر جعبه ۵ تا سیب داره، می‌شه \(2 \times 5 = 10\).\n- **بررسی**: در آخر چک می‌کنی که جواب منطقی باشه. مثلاً ۱۰ تا سیب با داده‌ها جور درمیاد؟ آره!\nاین مراحل تو همه مسائل به کار می‌ره، حتی تو خرید کردن یا برنامه‌ریزی برای یه سفر."
  }
})

const goBack = () => {
  router.back()
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  messages.value.push({
    text: newMessage.value,
    isUser: true
  })
  
  // TODO: Send message to backend and get response
  // For now, using sample response
  setTimeout(() => {
    messages.value.push({
      text: "من یک دستیار هوشمند هستم و می‌توانم به سوالات شما درباره این تمرین پاسخ دهم. لطفاً سوال خود را بپرسید.",
      isUser: false
    })
  }, 1000)
  
  newMessage.value = ''
}
</script> 