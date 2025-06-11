<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { getAvatarPath } from '@/utils/avatarPath'
import { changePassword } from '@/api/user'
import message from '@/plugin/message'

const user = useUserStore()
const userProfile = ref({
  userId: user.userInfo.userId,
  username: user.userInfo.username,
  email: user.userInfo.email,
  school: user.userInfo.school || '未设置',
  role: user.userInfo.role === 'student' ? '学生' : '教师',
  avatar: getAvatarPath(),
})

// 密码修改表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 表单验证错误
const errors = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 表单提交状态
const isSubmitting = ref(false)

// 密码可见性控制
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 验证表单
const validateForm = () => {
  let isValid = true
  errors.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  }

  if (!passwordForm.value.oldPassword) {
    errors.value.oldPassword = '请输入当前密码'
    isValid = false
  }

  if (!passwordForm.value.newPassword) {
    errors.value.newPassword = '请输入新密码'
    isValid = false
  } else if (passwordForm.value.newPassword.length < 6) {
    errors.value.newPassword = '新密码长度不能少于6位'
    isValid = false
  }

  if (!passwordForm.value.confirmPassword) {
    errors.value.confirmPassword = '请确认新密码'
    isValid = false
  } else if (
    passwordForm.value.newPassword !== passwordForm.value.confirmPassword
  ) {
    errors.value.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }

  return isValid
}

// 提交修改密码
const submitChangePassword = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const res = await changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    })

    if (res.code === 200) {
      message.success('密码修改成功')
      // 清空表单
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
    }
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <!-- 添加返回按钮，固定在左上角 -->
  <div class="fixed top-4 left-4 z-10">
    <button class="btn btn-outline btn-sm" @click="$router.back()">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-5 h-5 mr-1"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
      返回
    </button>
  </div>

  <div class="container mx-auto p-4 max-w-4xl">
    <div class="bg-base-100 rounded-2xl shadow-md p-6 mb-6">
      <h2 class="text-2xl font-bold mb-6">个人信息</h2>

      <div class="flex flex-col md:flex-row gap-6">
        <!-- 头像部分 -->
        <div class="flex flex-col items-center">
          <div class="avatar mb-4">
            <div class="w-32 h-32 rounded-full">
              <img :src="userProfile.avatar" alt="用户头像" />
            </div>
          </div>
          <button class="btn btn-outline btn-sm">更换头像</button>
        </div>

        <!-- 个人信息部分 -->
        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">用户名</span>
            </label>
            <input
              type="text"
              :value="userProfile.username"
              class="input input-bordered"
              disabled
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">用户ID</span>
            </label>
            <input
              type="text"
              :value="userProfile.userId"
              class="input input-bordered"
              disabled
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">邮箱</span>
            </label>
            <input
              type="email"
              :value="userProfile.email"
              class="input input-bordered"
              disabled
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">角色</span>
            </label>
            <input
              type="text"
              :value="userProfile.role"
              class="input input-bordered"
              disabled
            />
          </div>
          <div class="form-control md:col-span-2">
            <label class="label">
              <span class="label-text font-medium">学校</span>
            </label>
            <input
              type="text"
              :value="userProfile.school"
              class="input input-bordered w-full"
              disabled
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码部分 -->
    <div class="bg-base-100 rounded-2xl shadow-md p-6">
      <h2 class="text-2xl font-bold mb-6">修改密码</h2>

      <form class="space-y-4 max-w-md" @submit.prevent="submitChangePassword">
        <!-- 当前密码 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">当前密码</span>
          </label>
          <div class="relative">
            <input
              v-model="passwordForm.oldPassword"
              :type="showOldPassword ? 'text' : 'password'"
              class="input input-bordered w-full pr-10"
              :class="{ 'input-error': errors.oldPassword }"
              placeholder="请输入当前密码"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
              @click="showOldPassword = !showOldPassword"
            >
              <svg
                v-if="showOldPassword"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>
          </div>
          <label v-if="errors.oldPassword" class="label">
            <span class="label-text-alt text-error">{{
              errors.oldPassword
            }}</span>
          </label>
        </div>

        <!-- 新密码 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">新密码</span>
          </label>
          <div class="relative">
            <input
              v-model="passwordForm.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              class="input input-bordered w-full pr-10"
              :class="{ 'input-error': errors.newPassword }"
              placeholder="请输入新密码"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
              @click="showNewPassword = !showNewPassword"
            >
              <svg
                v-if="showNewPassword"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>
          </div>
          <label v-if="errors.newPassword" class="label">
            <span class="label-text-alt text-error">{{
              errors.newPassword
            }}</span>
          </label>
        </div>

        <!-- 确认新密码 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">确认新密码</span>
          </label>
          <div class="relative">
            <input
              v-model="passwordForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="input input-bordered w-full pr-10"
              :class="{ 'input-error': errors.confirmPassword }"
              placeholder="请再次输入新密码"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <svg
                v-if="showConfirmPassword"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>
          </div>
          <label v-if="errors.confirmPassword" class="label">
            <span class="label-text-alt text-error">{{
              errors.confirmPassword
            }}</span>
          </label>
        </div>

        <!-- 提交按钮 -->
        <div class="form-control mt-6">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="loading loading-spinner loading-xs mr-2"
            ></span>
            {{ isSubmitting ? '提交中...' : '修改密码' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
