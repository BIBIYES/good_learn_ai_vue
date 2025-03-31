<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'

const router = useRouter()

// 表单数据
const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

// 错误信息
const errors = ref({})

// 是否在注册模式
const isRegisterMode = ref(false)

// 加载状态
const isLoading = ref(false)

// 表单验证
const validateField = (field, value) => {
  const validations = {
    username: value.trim().length >= 3,
    password: value.length >= 6,
    confirmPassword: value === formData.value.password,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  errors.value[field] = !validations[field]
  return validations[field]
}

// 切换登录/注册模式
const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value
  errors.value = {}
  formData.value = {
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  }

  // 添加切换动画
  gsap.from('.form-container', {
    y: 20,
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out'
  })
}

// 表单提交
const handleSubmit = async () => {
  isLoading.value = true

  // 验证所有字段
  const fieldsToValidate = isRegisterMode.value
    ? ['username', 'password', 'confirmPassword', 'email']
    : ['username', 'password']

  const isValid = fieldsToValidate.every(field =>
    validateField(field, formData.value[field])
  )

  if (!isValid) {
    isLoading.value = false
    return
  }

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 成功后跳转
    router.push('/student')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-base-200">
    <div class="form-container w-full max-w-md p-8 bg-base-100 rounded-lg shadow-lg">
      <!-- 标题 -->
      <h1 class="text-3xl font-bold text-center mb-8">
        <span class="outlined-text-black">X</span>CAMP
        {{ isRegisterMode ? '注册' : '登录' }}
      </h1>

      <!-- 表单 -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- 用户名 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">用户名</span>
          </label>
          <input
            type="text"
            v-model.trim="formData.username"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.username }"
            @blur="validateField('username', formData.username)"
            placeholder="请输入用户名"
            required
          />
          <span v-if="errors.username" class="text-error text-sm mt-1">
            用户名至少需要3个字符
          </span>
        </div>

        <!-- 密码 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">密码</span>
          </label>
          <input
            type="password"
            v-model="formData.password"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.password }"
            @blur="validateField('password', formData.password)"
            placeholder="请输入密码"
            required
          />
          <span v-if="errors.password" class="text-error text-sm mt-1">
            密码至少需要6个字符
          </span>
        </div>

        <!-- 注册模式下的额外字段 -->
        <template v-if="isRegisterMode">
          <!-- 确认密码 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">确认密码</span>
            </label>
            <input
              type="password"
              v-model="formData.confirmPassword"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.confirmPassword }"
              @blur="validateField('confirmPassword', formData.confirmPassword)"
              placeholder="请再次输入密码"
              required
            />
            <span v-if="errors.confirmPassword" class="text-error text-sm mt-1">
              两次输入的密码不一致
            </span>
          </div>

          <!-- 邮箱 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">邮箱</span>
            </label>
            <input
              type="email"
              v-model.trim="formData.email"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.email }"
              @blur="validateField('email', formData.email)"
              placeholder="请输入邮箱"
              required
            />
            <span v-if="errors.email" class="text-error text-sm mt-1">
              请输入有效的邮箱地址
            </span>
          </div>
        </template>

        <!-- 提交按钮 -->
        <button
          type="submit"
          class="btn btn-primary w-full mt-6"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading loading-spinner"></span>
          {{ isRegisterMode ? '注册' : '登录' }}
        </button>

        <!-- 切换登录/注册 -->
        <div class="text-center mt-4">
          <button
            type="button"
            class="btn btn-link"
            @click="toggleMode"
          >
            {{ isRegisterMode ? '已有账号？点击登录' : '没有账号？点击注册' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.outlined-text-black {
  color: rgb(255, 255, 255);
  -webkit-text-stroke: 2px rgb(0, 0, 0);
  text-stroke: 2px rgb(0, 0, 0);
}
</style>