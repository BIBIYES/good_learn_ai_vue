<script setup>
import router from '@/router'
import { useUserStore } from '@/stores/userStores.js'
import { useComponentsStore } from '@/stores/componentsStores.js'
import { getAvatarPath } from '@/utils/avatarPath'

const user = useUserStore()
const componentsStore = useComponentsStore()

const logout = () => {
  user.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app">
    <div class="navbar bg-base-100 rounded-2xl">
      <div class="flex" @click="componentsStore.toggleAiSideBar()">
        <a class="btn btn-ghost text-3xl"
          ><span class="outlined-text-black">AI</span>好助学</a
        >
      </div>
      <!-- 头像下拉菜单 -->
      <div class="dropdown">
        <div tabindex="0">
          <!-- 头像元素 -->
          <div class="avatar avatar-online">
            <div class="w-15 rounded-full">
              <img :src="getAvatarPath()" />
            </div>
          </div>
        </div>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-base-100 rounded-box z-50 w-35 p-2 shadow-sm"
        >
          <li>
            <router-link to="/profile"><LineMdPerson /> 个人信息</router-link>
          </li>
          <li>
            <a class="text-red-500" @click="logout()"
              ><LineMdLogin /> 退出登录</a
            >
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
