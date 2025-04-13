<script setup>
import ChatInput from './ChatInput.vue'
</script>

<template>
  <div class="flex flex-col h-full w-full items-center justify-center">
    <!-- 聊天内容区域 -->
    <div class="overflow-y-auto p-4">
      <div class="chat-container h-full">
        <!-- 这里可以放置聊天消息内容 -->
        <div class="flex justify-center items-center h-full">
          <div class="text-center text-gray-500">
            <h2 class="text-5xl font-bold mb-2">好助学</h2>
            <p class="text-sm">输入任何问题，开始对话</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部输入框 -->
    <div class="p-4 flex w-full items-center justify-center">
      <ChatInput class="w-full animate__animated animate__fadeInUp" />
    </div>
  </div>
</template>

<style scoped></style>
