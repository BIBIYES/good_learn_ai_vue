<script setup>
import { getChat, uploadBotChat } from '@/api/chat'
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import ChatInput from './ChatInput.vue'
import { userStore } from '@/stores/user'
import { aiStore } from '@/stores/ai'
import AIStreamClient from '@/plugin/AIStreamClient'
import { Down,Edit,DeleteFive } from '@icon-park/vue-next'
import { getAvatarPath } from '@/utils/avatarPath'
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

// 在请求结束后上传流消息
const handleUploadBotChat = async(data) => {
  await uploadBotChat(data)
  
  
} 

// 处理发送消息
const handleSendMessage = async (message) => {
  if (!message || message.trim() === '') return

  // 添加用户消息到聊天列表
  const userMessage = {
    
    role: 'user',
    content: message,
    createTime: new Date().toISOString(),
    sessionId
  }
  chatList.value.push(userMessage)

  // 清空输入框
  ai.input = ''

  // 设置AI加载状态
  ai.aiLoading = true

  // 添加AI消息占位
  const aiMessage = {
   
    role: 'system',
    content: '',
    createTime: new Date().toISOString(),
    sessionId
  }
  chatList.value.push(aiMessage)

  // 创建AI流式客户端
  const client = new AIStreamClient()

  const sendMessage = JSON.stringify({
    content: message,
    sessionId,
    sessionName: message,
    role: 'user'
  })
  // 发送消息并处理流式响应
  client.sendMessage(sendMessage, {
    onStart: () => {
      // 开始请求时的处理
      console.log('AI响应开始')
    },
    onData: (data) => {
      // 接收到数据时更新AI消息内容
      console.log(data)
      
      const content = data.result?.output?.text || ''
      
      // 获取最后一条消息（应该是AI消息）
      if (chatList.value.length > 0) {
        const lastMessage = chatList.value[chatList.value.length - 1]
        if (lastMessage.role === 'system') {
          lastMessage.content += content
        }
      }
    },
    onComplete: () => {
      // 请求完成时的处理
      ai.aiLoading = false
      console.log('AI响应完成')
      
      // 获取AI的回复消息（最后一条消息）
      if (chatList.value.length > 1) {
        const aiMessage = chatList.value[chatList.value.length - 1]
        if (aiMessage.role === 'system') {
          const botResponse = {
            content: aiMessage.content,
            sessionId,
            sessionName: aiMessage.content,
            role: 'system'
          }
          handleUploadBotChat(botResponse)
        }
      }
    },
    onError: (error) => {
      // 发生错误时的处理
      ai.aiLoading = false
      message.error('ai响应出现异常',error)
    }
  })
}

onMounted(() => {
  handleGetChat()
})
</script>

<template>
  <div class="app flex flex-col w-full h-full pb-9 pt-2  bg-base-100 rounded-md">
    <div class="dropdown ml-5">
      <div
        tabindex="0"
        role="button"
        class="btn m-1 bg-base-100"
      >
        <span>你好我是好助学</span>
        <Down
          theme="outline"
          size="20"
          fill="#333"
        />
      </div>
      <ul
        tabindex="0"
        class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
      >
        <li class="flex">
          <a> <Edit
            theme="outline"
            size="20"
            fill="#333"
          />修改名称</a>
        </li>
        <li>
          <a class="text-red-500"><DeleteFive
            theme="outline"
            size="20"
            fill="#fa1010"
          />删除</a>
        </li>
      </ul>
    </div>
    <div class="flex-1 overflow-y-auto pt-10 p-4 py-2 space-y-3 pl-30 pr-45 ">
      <div
        v-for="(item,index) in chatList"
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
                :src="item.role=== 'user' ? getAvatarPath() : 'https://s21.ax1x.com/2025/04/10/pE2GAaj.jpg'"
              >
            </div>
          </div>
          <div class="chat-header">
            {{ item.role === 'user' ? user.userInfo.username : '好助学' }}
            <time class="text-xs opacity-50 ml-1">{{
              formatTime(item.createTime)
            }}</time>
          </div>
          <div class="rounded-lg border-2 border-base-200 p-2 chat-box">
            <!-- {{ item.content }} -->
            <MarkdBox :content="item.content" />
            <LoadingState v-if="item.role === 'system' && ai.aiLoading && index === chatList.length - 1" />
          </div>
        </div>
      </div>
    </div>
    <div class="px-4 w-full">
      <ChatInput @send="handleSendMessage" />
    </div>
  </div>
</template>
<style scoped>
.chat-box {
  max-width: 80%;
}
</style>
