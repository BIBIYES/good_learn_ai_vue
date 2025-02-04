<script setup>
import AuthorButton from '@/components/button/AuthorButton.vue'
import GithubButton from '@/components/button/GithubButton.vue'
import HelpButton from '@/components/button/HelpButton.vue'
import SiderBarMenu from '@/components/common/SiderBarMenu .vue'
import { RouterView } from 'vue-router'

// 跳转github
const goGithub = () => {
  window.open('https://github.com/BIBIYES') // 你的github地址
}
</script>

<template>
  <!-- 侧边栏 -->
  <div class="app flex h-screen overflow-hidden">
    <!-- logo -->
    <div class="sidebar p-4 flex flex-col justify-between items-center">
      <nav class="flex flex-col items-center space-y-4">
        <div class="my-logo">
          <MyLogo></MyLogo>
        </div>
        <div>
          <SiderBarMenu></SiderBarMenu>
        </div>
      </nav>
      <!-- 底部 -->
      <footer
        class="flex flex-col items-center space-y-4 animate__animated animate__fadeInUpBig"
      >
        <GithubButton @click="goGithub()"></GithubButton>
        <HelpButton></HelpButton>
        <router-link to="/abot">
          <AuthorButton></AuthorButton>
        </router-link>
      </footer>
    </div>

    <!-- 主内容区域 -->
    <div class="flex-1 bg-gray-100">
      <Transition>
        <RouterView></RouterView>
      </Transition>
    </div>
  </div>
</template>

<style></style>
