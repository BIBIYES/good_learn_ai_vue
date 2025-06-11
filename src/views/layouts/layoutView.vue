<script setup>
// 导入图标组件
import { Attention, Github, Moon, Sun } from '@icon-park/vue-next'
// 导入用户状态管理
import { useUserStore } from '@/stores/user'
import { ref, onMounted } from 'vue'

// 初始化用户状态
const userStore = useUserStore()

// 主题状态
const isDarkMode = ref(false)

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.setAttribute(
    'data-theme',
    isDarkMode.value ? 'dark' : 'emerald',
  )
  // 保存主题选择到本地存储
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'emerald')
}

// 跳转到开发者GitHub主页
const navigateToGithub = () => {
  window.open('https://github.com/BIBIYES')
}

// 初始化主题
onMounted(() => {
  // 从localStorage获取保存的主题
  const savedTheme = localStorage.getItem('theme')
  // 如果有保存的主题，使用保存的主题；否则使用系统主题
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
    document.documentElement.setAttribute('data-theme', savedTheme)
  } else {
    // 检查系统是否为暗色模式
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches
    isDarkMode.value = prefersDark
    document.documentElement.setAttribute(
      'data-theme',
      prefersDark ? 'dark' : 'emerald',
    )
  }
})
</script>

<template>
  <div class="app flex h-screen overflow-hidden">
    <!-- 侧边导航栏 -->
    <div
      class="sidebar p-4 flex-col justify-between items-center hidden sm:flex transition-all duration-300 w-75"
    >
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
      <footer
        class="flex flex-col items-center space-y-4 animate__animated animate__fadeInUpBig"
      >
        <!-- 主题切换按钮 -->
        <button class="btn btn-md w-30" @click="toggleTheme">
          <Sun v-if="isDarkMode" theme="outline" size="18" />
          <Moon v-else theme="outline" size="18" />
          {{ isDarkMode ? '亮色模式' : '暗色模式' }}
        </button>

        <button class="btn btn-md w-30" @click="navigateToGithub()">
          <Github theme="outline" size="18" />Github
        </button>
        <router-link to="/about">
          <button class="btn btn-md w-30">
            <attention theme="outline" size="18" />关于我们
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
