<script setup>
import { v4 as uuidv4 } from 'uuid'
import {useAIStore} from '@/stores/ai'
import router from '@/router'
const ai = useAIStore()

const handeleSendMessage = () => {
  const uuid = uuidv4()
  // 创建消息载荷
  const payload = {
    msg: ai.input,
    sessionId: uuid,
    sessionName: ai.input,
    createTime: new Date().toISOString(),
    role: 'user'
  }
  if (!ai.chatSessionHistory) {
    ai.chatSessionHistory = []
  }
  ai.chatSessionHistory.unshift(payload)
  router.push({ path: `/s/ai/chat/${uuid}`, query: { msg: payload.msg } })
  console.log(payload)
  
}
</script>

<template> 
  <div
    class="flex flex-col h-full w-full items-center justify-center bg-base-100 rounded-md"
  >
    <!-- 聊天内容区域 -->
    <div class="overflow-y-auto p-4">
      <div class="chat-container h-full">
        <!-- 这里可以放置聊天消息内容 -->
        <div class="flex justify-center items-center h-full">
          <div class="text-center text-gray-800">
            <h2 class="text-5xl font-bold mb-2">
              GOODLEARNAI
            </h2>
            <p class="text-sm flex justify-center items-center">
              <span>好助学由&nbsp;&nbsp;</span>
              <img
                class="w-20"
                src="@\assets\icon\deepseek_logo.png"
              >
              <span>&nbsp;&nbsp;提供引擎支持</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部输入框 -->
    <div class="p-4 flex w-full items-center justify-center">
      <ChatInput
        class="w-full animate__animated animate__fadeInUp"
        @send="handeleSendMessage()"
      />
    </div>
  </div>
</template>

<style scoped></style>
