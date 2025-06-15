<script setup>
import HistoryCard from './HistoryCard.vue'
import { useRouter } from 'vue-router'
import { useComponentsStore } from '@/stores/components'
import { useUserStore } from '@/stores/user'
const componentsStore = useComponentsStore()
const router = useRouter()
</script>

<template>
  <div class="app h-screen pl-1.5">
    <div
      class="sidebar-container h-[calc(100vh-4rem)] flex flex-col space-y-2 overflow-y-auto p"
    >
      <div
        class="sidebar-container h-screen flex flex-col pt-2 space-y-2 sticky top-0 z-10 bg-base-200"
      >
        <div class="flex justify-between items-center">
          <div class="btn w-8 h-8 p-0 rounded-2xl overflow-hidden">
            <img src="@\assets\icon\logo.jpg" alt="" class="w-full h-full" />
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
      <div>
        <HistoryCard />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
