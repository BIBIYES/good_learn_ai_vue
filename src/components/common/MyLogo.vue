<script setup>
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { getAvatarPath } from '@/utils/avatarPath'
const user = useUserStore()
const logout = () => {
  user.logout()
  router.push('/login')
}

</script>

<template>
  <div class="app">
    <div class="navbar bg-base-100 rounded-2xl">
      <div
        class="flex"
        @click="sidebarStore.toggleSidebar()"
      >
        <a class="btn btn-ghost text-3xl"><span class="outlined-text-black">AI</span>好助学</a>
      </div>
      <!-- 头像下拉菜单 -->
      <div class="dropdown">
        <div tabindex="0">
          <!-- 头像元素 -->
          <div class="avatar avatar-online">
            <div class="w-15 rounded-full">
              <img :src="getAvatarPath()">
            </div>
          </div>
        </div>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-base-100 rounded-box z-50 w-35 p-2 shadow-sm"
        >
          <li>
            <a><svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
              个人信息</a>
          </li>
          <li>
            <a
              class="text-red-500"
              @click="logout()"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
              />
            </svg>
              退出登录</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
