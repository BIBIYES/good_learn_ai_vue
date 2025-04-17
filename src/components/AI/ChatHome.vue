<script setup>
import { v4 as uuidv4 } from 'uuid'
import {useAIStore} from '@/stores/ai'
import router from '@/router'
import { useUserStore } from '@/stores/user'

const ai = useAIStore()
const user = useUserStore()

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
  // 根据用户角色动态决定跳转路径
  const basePath = user.userInfo.role === 'teacher' ? '/t/ai/chat/' : '/s/ai/chat/'
  router.push({ path: `${basePath}${uuid}`, query: { msg: payload.msg } })
  console.log(payload)
  
}

// 快捷功能列表
const shortcutFeatures = [
  {
    icon: '💻',
    title: 'PPT轻松搞定，秘诀在这！',
    prompt: '帮我制作一份关于人工智能在教育中应用的PPT大纲'
  },
  {
    icon: '📊',
    title: '教案设计助手',
    prompt: '设计一节关于初中数学函数概念的教学计划'
  },
  {
    icon: '📝',
    title: '什么是Markdown? AI写作都在用',
    prompt: '请介绍一下Markdown语法及其在教育和写作中的应用'
  },
  {
    icon: '☀️',
    title: '《诗经》中的我命由我不由天',
    prompt: '分析《诗经》中表现自主意识和命运观的诗句'
  },
  {
    icon: '🖨️',
    title: '大模型MoE，当模型们的老板',
    prompt: '请详细解释什么是MoE(混合专家模型)及其在大语言模型中的应用'
  }
]

const handleShortcutClick = (prompt) => {
  ai.input = prompt
}
</script>

<template> 
  <div
    class="flex flex-col h-full w-full items-center justify-center bg-base-100 rounded-md space-y-2.5"
  >
    <!-- 聊天内容区域 -->
    <div class="overflow-y-auto p-4 ">
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

    <!-- 快捷功能区域 -->
    <div class="w-full px-4 py-6 border-base-200 flex flex-col space-y-10">
      <div class="max-w-4xl mx-auto">
        <!-- 顶部快捷功能 -->
        <div class="flex flex-wrap justify-center gap-2 mb-4">
          <button 
            v-for="(feature, index) in shortcutFeatures.slice(0, 2)" 
            :key="index"
            class="btn btn-outline border border-base-300 hover:bg-base-200 rounded-full px-6"
            @click="handleShortcutClick(feature.prompt)"
          >
            <span class="mr-2">{{ feature.icon }}</span>
            {{ feature.title }}
          </button>
        </div>
        
        <!-- 底部快捷功能 -->
        <div class="flex flex-wrap justify-center gap-2">
          <button 
            v-for="(feature, index) in shortcutFeatures.slice(2)" 
            :key="index"
            class="btn btn-outline border border-base-300 hover:bg-base-200 rounded-full px-6"
            @click="handleShortcutClick(feature.prompt)"
          >
            <span class="mr-2">{{ feature.icon }}</span>
            {{ feature.title }}
          </button>
        </div>
      </div>
      <!-- 底部输入框 -->
      <div class="p-4 w-full items-center justify-center">
        <ChatInput
          class="w-full animate__animated animate__fadeInUp"
          @send="handeleSendMessage()"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
