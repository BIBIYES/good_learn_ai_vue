<script setup>
import SiderBarMenu from '@/components/common/SiderBarMenu .vue'
import { RouterView } from 'vue-router'
import {Attention, Github} from '@icon-park/vue-next'
// 跳转github
const goGithub = () => {
  window.open('https://github.com/BIBIYES') // 你的github地址
}
</script>

<template>
  <div class="app flex h-screen overflow-hidden">
    <!-- 侧边栏 -->
    <div class="sidebar p-4  flex-col justify-between items-center hidden sm:flex">
      <nav class="flex flex-col items-center space-y-4">
        <div class="my-logo">
          <MyLogo />
        </div>
        <div>
          <SiderBarMenu />
        </div>
      </nav>
      <!-- 底部 -->
      <footer class="flex flex-col items-center space-y-4 animate__animated animate__fadeInUpBig">


        <button class="btn btn-md w-30" @click="goGithub()"><Github theme="outline" size="18" />Github</button>
        <router-link to="/abot">
            <button class="btn btn-md w-30"><attention theme="outline" size="18" />关于我们</button>
        </router-link>
      </footer>
    </div>

    <!-- 主内容区域 -->
    <div class="flex-1 bg-gray-100">
        <RouterView />
    </div>
  </div>
</template>


<style scoped>
</style>
