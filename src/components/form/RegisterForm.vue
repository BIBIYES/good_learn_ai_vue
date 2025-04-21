<script setup>
import { getSchools } from '@/api/schools'
import { getVerificationCodes, register } from '@/api/user'
import message from '@/plugin/message'

const router = useRouter()
const registerForm = ref({
  username: '',
  email: '',
  schoolId: '',
  schoolNumber: '',
  password: '',
  confirmPassword: '',
  code: '',
  role: 'student'
})

const handleRegister = async () => {
  // 验证码检查
  if (!registerForm.value.code) {
    message.error('请输入验证码')
    return
  }

  // 密码一致性验证
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }

  // 密码复杂度验证
  if (registerForm.value.password.length < 8) {
    message.error('密码必须包含至少8个字符')
    return
  }

  try {
    console.log('注册信息:', registerForm.value)
    // TODO: 这里应该调用注册API
    const res = await register(registerForm.value)
    if (res.code == 200) {
      message.success(res.message)
      router.push('/login')
    }
  } catch (error) {
    console.error('注册失败:', error)
    message.error('注册失败，请稍后重试')
  }
}

const schools = ref({})
const isCodeSent = ref(false)
const countdown = ref(0)
const isLoading = ref(false)

const sendVerificationCode = async () => {
  if (countdown.value > 0 || !registerForm.value.email) return
  isLoading.value = true
  const res = await getVerificationCodes({
    email: registerForm.value.email,
    purpose: '注册'
  })
  isLoading.value = false
  console.log('验证码发送结果:', res)
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
}

// 加载学校
const handleGetSchools = async () => {
  const form = {
    email: registerForm.value.email
  }
  const res = await getSchools(form)
  schools.value = res.data
  console.log(res)
}

onMounted(() => {
  handleGetSchools()
})
</script>
<template>
  <form
    class="space-y-6"
    @submit.prevent="handleRegister"
  >
    <h2 class="text-2xl font-bold text-center mb-6">
      创建账号
    </h2>

    <!-- 姓名输入 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">姓名</span>
      </label>
      <label
        class="input input-bordered validator flex items-center gap-2 hover:border-primary"
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
          <path
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <input
          v-model="registerForm.username"
          type="text"
          placeholder="请输入真实姓名"
          class="grow"
          required
        >
      </label>
    </div>

    <!-- 邮箱输入 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">邮箱</span>
      </label>
      <label
        class="input input-bordered validator flex items-center gap-2 hover:border-primary"
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
          <path
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <input
          v-model="registerForm.email"
          type="email"
          placeholder="your@email.com"
          class="grow"
          required
        >
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
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              ry="2"
            />
            <path d="M9 9h6v6H9z" />
          </svg>
          <input
            v-model="registerForm.code"
            type="text"
            placeholder="请输入验证码"
            class="grow"
            required
          >
        </label>
        <button
          class="btn btn-outline"
          type="button"
          :disabled="countdown > 0"
          @click="sendVerificationCode"
        >
          <span
            v-if="isLoading"
            class="loading loading-spinner"
          />
          <span v-if="countdown <= 0 && !isLoading">获取验证码</span>
          <span v-else-if="countdown > 0">{{ countdown }}秒后重试</span>
        </button>
      </div>
    </div>

    <!-- 学校选择 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">学校</span>
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <select
          v-model="registerForm.schoolId"
          class="grow bg-transparent outline-none"
          required
        >
          <option
            disabled
            value=""
          >请选择学校</option>
          <option
            v-for="(item, index) in schools"
            :key="index"
            :value="item.schoolId"
          >
            {{ item.schoolName }}
          </option>
        </select>
      </label>
    </div>
    <!-- 学号输入 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">学号</span>
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
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path
            d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
          />
        </svg>
        <input
          v-model="registerForm.schoolNumber"
          type="text"
          placeholder="请输入学号"
          class="grow"
          required
          pattern="\d+"
          title="请输入有效的学号"
        >
      </label>
    </div>

    <!-- 密码输入 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">密码</span>
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
            <circle
              cx="16.5"
              cy="7.5"
              r=".5"
              fill="currentColor"
            />
          </g>
        </svg>
        <input
          v-model="registerForm.password"
          type="password"
          placeholder="至少8位字符"
          class="grow"
          required
          minlength="6"
          title="密码必须包含至少6个字符"
        >
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
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="再次输入密码"
          class="grow"
          required
          minlength="6"
        >
      </label>
    </div>

    <!-- 注册按钮 -->
    <button
      type="submit"
      class="btn btn-primary w-full mt-8 text-lg font-semibold shadow-md hover:shadow-lg transition-all"
    >
      <span>创建账号</span>
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

<style scoped>
select {
  border: none;
}
</style>
