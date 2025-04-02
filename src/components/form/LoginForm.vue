<script setup>
import { ref } from 'vue'
import { login } from '@/api/user'
import { userStore } from '@/stores/user'
import message from '@/plugin/message'
import router from '@/router'
const user = userStore()
const loginInfo = ref({
  email: '',
  password: '',
})
const handleLogin = async () => {
  const res = await login(loginInfo.value)
  if (res.code == 200) {
    console.log('登录成功')
    message.success(res.message)
    user.setUserInfo(res.data)

    if (res.data.role == 'student') {
      console.log('学生登录')

      router.push('/s/home')
    }
  }
  console.log(res)
}
</script>
<template>
  <form @submit.prevent="handleLogin" class="space-y-6">
    <h2 class="text-2xl font-bold text-center mb-6">登录到好助学</h2>

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
          type="email"
          placeholder="your@email.com"
          class="grow"
          v-model="loginInfo.email"
          required
        />
      </label>
    </div>

    <!-- 密码输入 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">密码</span>
        <a href="#" class="label-text-alt link link-hover text-primary"
          >忘记密码?</a
        >
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
            ></path>
            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
          </g>
        </svg>
        <input
          type="password"
          placeholder="********"
          class="grow"
          v-model="loginInfo.password"
          required
          minlength="6"
        />
      </label>
    </div>

    <!-- 登录按钮 -->
    <button
      type="submit"
      class="btn btn-primary w-full mt-8 text-lg font-semibold shadow-md hover:shadow-lg transition-all"
    >
      <span>登录</span>
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
  </form>
</template>
