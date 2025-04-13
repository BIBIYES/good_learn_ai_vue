<script setup>
import ChatInput from './ChatInput.vue'
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <!-- 聊天内容区域 -->
    <div class="overflow-y-auto p-4 flex-1">
      <div class="chat-container h-full">
        <!-- 这里可以放置聊天消息内容 -->
        <div class="flex justify-center items-center h-full">
          <div class="text-center text-gray-500">
            <h2 class="text-2xl font-bold mb-2">有什么可以帮忙的?</h2>
            <p class="text-sm">输入任何问题，开始对话</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部输入框 -->
    <div class="p-4 flex w-full items-center justify-center">
      <ChatInput class="w-full" />
    </div>
  </div>
</template>

<style scoped></style>
