<script setup>


import { Attention, Github } from '@icon-park/vue-next'
import { useUserStore } from '@/stores/user'
const user = useUserStore()
// 跳转github
const goGithub = () => {
  window.open('https://github.com/BIBIYES') // 你的github地址
}
</script>

<template>
  <div class="app flex h-screen overflow-hidden">
    <!-- 侧边栏 -->
    <div
      class="sidebar p-4 flex-col justify-between items-center hidden sm:flex transition-all duration-300 w-75"
    >
      <nav class="flex flex-col items-center space-y-4">
        <div class="my-logo">
          <MyLogo />
        </div>
        <div v-if="user.userInfo.role == 'student'">
          <StudentSideBarMenu />
        </div>
        <div v-else-if="user.userInfo.role == 'teacher'">
          <TeacherSideBarMenu />
        </div>
      </nav>
      <!-- 底部 -->
      <footer
        class="flex flex-col items-center space-y-4 animate__animated animate__fadeInUpBig"
      >
        <button
          class="btn btn-md w-30"
          @click="goGithub()"
        >
          <Github
            theme="outline"
            size="18"
          />Github
        </button>
        <router-link to="/about">
          <button class="btn btn-md w-30">
            <attention
              theme="outline"
              size="18"
            />关于我们
          </button>
        </router-link>
      </footer>
    </div>
    <!-- 拖动 -->
    <!-- <div class="divider lg:divider-horizontal"></div> -->
    <!-- 主内容区域 -->
    <div class="flex-1 bg-base-100 rounded-r-md">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
