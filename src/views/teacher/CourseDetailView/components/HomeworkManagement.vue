<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold">作业管理</h2>
      <button class="btn btn-primary" disabled>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        发布作业
      </button>
    </div>

    <!-- 占位内容 -->
    <div class="text-center py-12">
      <div class="text-4xl mb-4">📚</div>
      <p class="text-base-content/70">作业管理功能正在开发中...</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  courseId: {
    type: [String, Number],
    required: true,
  },
})
</script>
