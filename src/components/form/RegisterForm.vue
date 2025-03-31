<template>
  <form @submit.prevent="handleRegister" class="space-y-6">
    <h2 class="text-2xl font-bold text-center mb-6">创建账号</h2>

    <!-- 姓名输入 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">姓名</span>
      </label>
      <label
        class="input input-bordered validator flex items-center gap-2 hover:border-primary focus-within:border-primary transition-all"
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
          type="text"
          placeholder="请输入真实姓名"
          class="grow"
          v-model="name"
          required
        />
      </label>
    </div>

    <!-- 邮箱输入 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">邮箱</span>
      </label>
      <label
        class="input input-bordered validator flex items-center gap-2 hover:border-primary focus-within:border-primary transition-all"
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
          type="email"
          placeholder="your@email.com"
          class="grow"
          v-model="email"
          required
        />
      </label>
    </div>

    <!-- 学校选择 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">学校</span>
      </label>
      <label
        class="input input-bordered validator flex items-center gap-2 hover:border-primary focus-within:border-primary transition-all"
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <select
          class="grow bg-transparent outline-none"
          v-model="school"
          required
        >
          <option disabled value="">请选择学校</option>
          <option>清华大学</option>
          <option>北京大学</option>
          <option>复旦大学</option>
          <option>上海交通大学</option>
          <option>浙江大学</option>
          <option>其他</option>
        </select>
      </label>
    </div>

    <!-- 密码输入 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">密码</span>
      </label>
      <label
        class="input input-bordered validator flex items-center gap-2 hover:border-primary focus-within:border-primary transition-all"
      >
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
          placeholder="至少8位字符"
          class="grow"
          v-model="password"
          required
          minlength="8"
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
          title="密码必须包含至少8个字符，包括数字、小写字母和大写字母"
        />
      </label>
    </div>

    <!-- 确认密码 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">确认密码</span>
      </label>
      <label
        class="input input-bordered validator flex items-center gap-2 hover:border-primary focus-within:border-primary transition-all"
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <input
          type="password"
          placeholder="再次输入密码"
          class="grow"
          v-model="confirmPassword"
          required
          minlength="8"
        />
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

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const email = ref('')
const school = ref('')
const password = ref('')
const confirmPassword = ref('')

const handleRegister = () => {
  // 密码一致性验证
  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致')
    return
  }

  console.log('注册信息:', {
    name: name.value,
    email: email.value,
    school: school.value,
    password: password.value,
  })

  // 注册成功后跳转
  router.push('/login')
}
</script>
<style scoped>
select {
  border: none;
}
</style>
