<script setup>
import { ref } from 'vue'
import { getVerificationCodes, forGetPassword } from '@/api/userApi.js'
import message from '@/plugin/message'
import { useRouter } from 'vue-router'

const router = useRouter()
const forgotPasswordForm = ref({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: '',
})

const isCodeSent = ref(false)
const countdown = ref(0)
const isLoading = ref(false)
const btnLoading = ref(false)

const sendVerificationCode = async () => {
  if (countdown.value > 0 || !forgotPasswordForm.value.email) {
    if (!forgotPasswordForm.value.email) {
      message.error('请输入邮箱')
    }
    return
  }

  isLoading.value = true
  try {
    const res = await getVerificationCodes({
      email: forgotPasswordForm.value.email,
      purpose: '忘记密码',
    })

    if (res.code == 200) {
      message.success('验证码发送成功，如果没有请检查垃圾箱')
      isCodeSent.value = true
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }
  } catch (error) {
    console.error('验证码发送失败:', error)
    message.error('验证码发送失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const handleResetPassword = async () => {
  // 验证码检查
  btnLoading.value = true
  if (!forgotPasswordForm.value.code) {
    message.error('请输入验证码')
    return
  }

  // 密码一致性验证
  if (
    forgotPasswordForm.value.newPassword !==
    forgotPasswordForm.value.confirmPassword
  ) {
    message.error('两次输入的密码不一致')
    return
  }

  // 密码复杂度验证
  if (forgotPasswordForm.value.newPassword.length < 6) {
    message.error('密码必须包含至少6个字符')
    return
  }

  try {
    const res = await forGetPassword({
      email: forgotPasswordForm.value.email,
      code: forgotPasswordForm.value.code,
      newPassword: forgotPasswordForm.value.newPassword,
    })

    if (res.code == 200) {
      message.success('密码重置成功')
      btnLoading.value = false
      router.push('/login')
    }
    btnLoading.value = false
  } catch (error) {
    console.error('密码重置失败:', error)
    message.error('密码重置失败，请稍后重试')
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleResetPassword">
    <h2 class="text-2xl font-bold text-center mb-6">重置密码</h2>

    <!-- 邮箱输入 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">邮箱</span>
      </label>
      <label class="input input-bordered validator flex items-center gap-2">
        <svg
          class="h-5 w-5 opacity-70"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <input
          v-model="forgotPasswordForm.email"
          type="email"
          placeholder="your@email.com"
          class="grow"
          required
        />
      </label>
    </div>

    <!-- 验证码 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">验证码</span>
      </label>
      <div class="flex gap-2">
        <label
          class="input input-bordered validator flex items-center gap-2 flex-1"
        >
          <svg
            class="h-5 w-5 opacity-70"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <path d="M9 9h6v6H9z" />
          </svg>
          <input
            v-model="forgotPasswordForm.code"
            type="text"
            placeholder="请输入验证码"
            class="grow"
            required
          />
        </label>
        <button
          class="btn btn-outline"
          type="button"
          :disabled="countdown > 0"
          @click="sendVerificationCode"
        >
          <span v-if="isLoading" class="loading loading-spinner" />
          <span v-if="countdown <= 0 && !isLoading">获取验证码</span>
          <span v-else-if="countdown > 0">{{ countdown }}秒后重试</span>
        </button>
      </div>
    </div>

    <!-- 新密码输入 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">新密码</span>
      </label>
      <label class="input input-bordered validator flex items-center gap-2">
        <svg
          class="h-5 w-5 opacity-70"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="2"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
            />
            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
          </g>
        </svg>
        <input
          v-model="forgotPasswordForm.newPassword"
          type="password"
          placeholder="至少6位字符"
          class="grow"
          required
          minlength="6"
          title="密码必须包含至少6个字符"
        />
      </label>
    </div>

    <!-- 确认密码 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">确认密码</span>
      </label>
      <label class="input input-bordered validator flex items-center gap-2">
        <svg
          class="h-5 w-5 opacity-70"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <input
          v-model="forgotPasswordForm.confirmPassword"
          type="password"
          placeholder="再次输入密码"
          class="grow"
          required
          minlength="6"
        />
      </label>
    </div>

    <!-- 重置密码按钮 -->
    <button
      type="submit"
      class="btn btn-primary w-full mt-8 text-lg font-semibold shadow-md hover:shadow-lg transition-all"
    >
      <span v-if="btnLoading" class="loading loading-spinner"></span>
      <span>重置密码</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 ml-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </button>

    <!-- 返回登录 -->
    <div class="text-center mt-4">
      <a class="link link-hover text-primary" @click="router.push('/login')"
        >返回登录</a
      >
    </div>
  </form>
</template>
