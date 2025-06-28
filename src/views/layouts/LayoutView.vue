<script setup>
// 导入用户状态管理
import { useUserStore } from '@/stores/userStores.js'
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
  <div class="good-container">
    <!-- 侧边导航栏 -->
    <div class="sidebar">
      <nav class="sidebar-nav">
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
      <footer class="sidebar-footer">
        <!-- 主题切换按钮 -->
        <button class="theme-btn btn" @click="toggleTheme">
          <LineMdMoonTwotoneAltLoop v-if="isDarkMode" />
          <LineMdSunnyOutlineLoop v-else />
          {{ isDarkMode ? '亮色模式' : '暗色模式' }}
        </button>

        <button class="github-btn btn" @click="navigateToGithub()">
          <LineMdGithubTwotone />Github
        </button>
        <router-link to="/about">
          <button class="about-btn btn"><LineMdPersonTwotone />关于我们</button>
        </router-link>
      </footer>
    </div>
    <!-- 主内容区域 -->
    <div class="good-main-container">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.good-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
.good-main-container {
  width: 100%;
  height: 100vh;
  overflow-x: auto;
}
.sidebar {
  padding: 1rem;
  height: 100%;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .sidebar-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    button {
      min-width: 50%;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
