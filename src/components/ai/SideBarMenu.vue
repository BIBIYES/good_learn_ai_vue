<script setup>
import HistoryCard from './HistoryCard.vue'
import { useRouter } from 'vue-router'
import { useComponentsStore } from '@/stores/componentsStores.js'
import { useUserStore } from '@/stores/userStores.js'
const componentsStore = useComponentsStore()
const router = useRouter()
</script>

<template>
  <div class="flex flex-col h-full sidebar-container">
    <div class="flex flex-col space-y-2 p-2">
      <!-- 顶部控件 -->
      <div class="flex justify-between items-center">
        <div class="btn w-8 h-8 p-0 rounded-2xl">
          <img src="@\assets\icon\logo.jpg" alt="" class="w-full h-full" />
        </div>
        <div
          class="cursor-pointer hover:bg-base-200 p-1 rounded-md transition-colors duration-200"
          @click="componentsStore.toggleAiSideBar()"
        >
          <CollapseIcon />
        </div>
      </div>
      <!-- 按钮 -->
      <div
        class="btn w-full mb-7 bg-base-100 hover:bg-base-200 transition-colors duration-200"
        @click="
          router.push({
            name:
              useUserStore().userInfo.role === 'teacher'
                ? 'teacher-ai-parent'
                : 'student-ai-parent',
          })
        "
      >
        创建会话
        <kbd class="kbd">ctrl</kbd>
        +
        <kbd class="kbd">K</kbd>
      </div>
    </div>
    <!--  历史会话组件 -->
    <div class="flex-1 overflow-y-auto min-h-0 pb-4">
      <HistoryCard />
    </div>
  </div>
</template>

<style scoped>
.sidebar-container {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease,
    width 0.3s ease;
}

.btn:active {
  transform: scale(0.97);
  transition: transform 0.1s;
}
</style>
