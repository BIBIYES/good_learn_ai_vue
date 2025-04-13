<script setup>
import HistoryCard from './HistoryCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="app h-screen">
    <div class="sidebar-container h-screen flex flex-col pt-2">
      <div
        class="btn w-full mb-7"
        @click="router.push({ name: 'ai-home' })"
      >
        创建会话
        <kbd class="kbd">ctrl</kbd>
        +
        <kbd class="kbd">K</kbd>
      </div>
      <!--  历史会话组件 -->
      <HistoryCard />
    </div>
  </div>
</template>

<style scoped></style>
