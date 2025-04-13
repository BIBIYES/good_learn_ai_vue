<script setup>
import { getChat } from '@/api/chat'
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import ChatInput from './ChatInput.vue'
import { userStore } from '@/stores/user'
import { aiStore } from '@/stores/ai'
import AIStreamClient from '@/plugin/AIStreamClient'
const user = userStore()
const ai = aiStore()

const route = useRoute()
const sessionId = route.params.id

const chatList = ref([])

// 获取历史消息
const handleGetChat = async () => {
  const res = await getChat(sessionId)
  chatList.value = res.data
}

const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 处理发送消息
const handleSendMessage = async (message) => {
  if (!message || message.trim() === '') return

  // 添加用户消息到聊天列表
  const userMessage = {
    historyId: Date.now().toString(),
    role: 'user',
    content: message,
    createTime: new Date().toISOString(),
    sessionId,
  }
  chatList.value.push(userMessage)

  // 清空输入框
  ai.input = ''

  // 设置AI加载状态
  ai.aiLoading = true

  // 添加AI消息占位
  const aiMessageId = Date.now().toString() + '1'
  const aiMessage = {
    historyId: aiMessageId,
    role: 'system',
    content: '',
    createTime: new Date().toISOString(),
    sessionName: sessionId,
  }
  chatList.value.push(aiMessage)

  // 创建AI流式客户端
  const client = new AIStreamClient()

  const sendMessage = {
    msg: message,
    sessionId: sessionId,
    sessionName: message,
    role: 'user',
  }
  // 发送消息并处理流式响应
  client.sendMessage(sendMessage, {
    onStart: () => {
      // 开始请求时的处理
      console.log('AI响应开始')
    },
    onData: (data) => {
      // 接收到数据时更新AI消息内容
      console.log(data)

      const aiMessageIndex = chatList.value.findIndex(
        (item) => item.historyId === aiMessageId,
      )
      if (aiMessageIndex !== -1) {
        chatList.value[aiMessageIndex].content = client.content.value
      }
    },
    onComplete: () => {
      // 请求完成时的处理
      ai.aiLoading = false
      console.log('AI响应完成')
    },
    onError: (error) => {
      // 发生错误时的处理
      ai.aiLoading = false
      console.error('AI响应错误:', error)
    },
  })
}

onMounted(() => {
  handleGetChat()
})
</script>

<template>
  <div class="app flex flex-col w-full h-screen pb-9">
    <div class="flex-1 overflow-y-auto pt-10 p-4 py-2 space-y-3 pl-50 pr-50">
      <div
        v-for="item in chatList"
        :key="item.historyId"
        class="flex flex-col"
      >
        <div
          :class="item.role === 'user' ? 'chat chat-end' : 'chat chat-start'"
        >
          <div class="chat-image avatar">
            <div class="w-10 rounded-full p-1">
              <img
                alt="avatar"
                src="@/assets/img/avatar.jpg"
              >
            </div>
          </div>
          <div class="chat-header">
            {{ item.role === "user" ? user.userInfo.username : "好助学" }}
            <time class="text-xs opacity-50 ml-1">{{
              formatTime(item.createTime)
            }}</time>
          </div>
          <div class="chat-bubble">
            {{ item.content }}
          </div>
        </div>
      </div>
    </div>
    <div>
      <ChatInput @send="handleSendMessage" />
    </div>
  </div>
</template>
