<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'

const auth = useAuthStore()
const showRegisterModal = ref(false)

const form = ref({
  name: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const rules = ref({
  name: [
    { required: true, message: 'لطفا نام را وارد کنید', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'لطفا شماره تلفن را وارد کنید', trigger: 'blur' },
    { pattern: /^\+98\d{10}$/, message: 'فرمت شماره تلفن صحیح نیست', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'لطفا ایمیل را وارد کنید', trigger: 'blur' },
    { type: 'email', message: 'ایمیل معتبر نیست', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'لطفا رمز عبور را وارد کنید', trigger: 'blur' },
    { min: 6, message: 'رمز عبور باید حداقل 6 کاراکتر باشد', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'لطفا رمز عبور را تأیید کنید', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.value.password) {
          callback(new Error('رمز عبور و تأیید رمز عبور باید یکسان باشند'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

const register = async () => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.value.name,
        phone: form.value.phone,
        email: form.value.email,
        password: form.value.password
      })
    })

    if (response.ok) {
      await auth.loadUserProfile()
      showRegisterModal.value = false
    } else {
      const error = await response.json()
      throw new Error(error.message || 'خطایی رخ داده است')
    }
  } catch (error) {
    console.error('Registration error:', error)
    alert('خطایی در ثبت نام رخ داده است')
  }
}
</script>

<template>
  <el-dialog
    v-model="showRegisterModal"
    title="ثبت نام"
    width="50%"
    :before-close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      label-width="120px"
      class="max-w-md mx-auto"
    >
      <el-form-item label="نام" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      
      <el-form-item label="شماره تلفن" prop="phone">
        <el-input v-model="form.phone" placeholder="+989123456789" />
      </el-form-item>
      
      <el-form-item label="ایمیل" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>
      
      <el-form-item label="رمز عبور" prop="password">
        <el-input v-model="form.password" type="password" />
      </el-form-item>
      
      <el-form-item label="تأیید رمز عبور" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showRegisterModal = false">لغو</el-button>
        <el-button type="primary" @click="register">ثبت نام</el-button>
      </span>
    </template>
  </el-dialog>
</template>
