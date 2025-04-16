<script setup>
import HistoryCard from './HistoryCard.vue'
import { useRouter } from 'vue-router'
import { useComponentsStore } from '@/stores/components'
const componentsStore = useComponentsStore()
const router = useRouter()
</script>

<template>
  <div
    class="app h-screen pl-1.5 overflow-y-auto "
  >
    <div class="sidebar-container h-screen flex flex-col pt-2 space-y-2">
      <div class="flex justify-between items-center">
        <div class="btn w-8 h-8 p-0 rounded-2xl overflow-hidden">
          <img
            src="@\assets\icon\logo.jpg"
            alt=""
            class="w-full h-full"
          >
        </div>
        <div
          class="cursor-pointer"
          @click="componentsStore.toggleAiSideBar()"
        >
          <CollapseIcon />
        </div>
      </div>
      <div
        class="btn w-full mb-7 bg-base-100"
        @click="router.push({ name: 'ai-parent' })"
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
