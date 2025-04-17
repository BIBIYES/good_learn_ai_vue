<script setup>
// 导入图标组件
import { Attention, Github } from '@icon-park/vue-next'
// 导入用户状态管理
import { useUserStore } from '@/stores/user'

// 初始化用户状态
const userStore = useUserStore()

// 跳转到开发者GitHub主页
const navigateToGithub = () => {
  window.open('https://github.com/BIBIYES')
}

</script>

<template>
  <div class="app flex h-screen overflow-hidden">
    <!-- 侧边导航栏 -->
    <div class="sidebar p-4 flex-col justify-between items-center hidden sm:flex transition-all duration-300 w-75">
      <nav class="flex flex-col items-center space-y-4">
        <!-- 网站Logo -->
        <div class="my-logo">
          <MyLogo />
        </div>
        <!-- 根据用户角色显示对应的菜单 -->
        <div v-if="userStore.userInfo.role == 'student'">
          <StudentSideBarMenu />
        </div>
        <div v-else-if="userStore.userInfo.role == 'teacher'">
          <TeacherSideBarMenu />
        </div>
      </nav>
      <!-- 页面底部导航链接 -->
      <footer class="flex flex-col items-center space-y-4 animate__animated animate__fadeInUpBig">
        <button
          class="btn btn-md w-30"
          @click="navigateToGithub()"
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
    <!-- 主内容区域 -->
    <div class="flex-1 bg-base-100 rounded-r-md">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
