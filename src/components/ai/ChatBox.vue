<script setup>
// API和工具
import { getChat, uploadBotChat } from '@/api/chatApi.js'
import AiStreamClient from '@/plugin/aiStreamClient.js'
import { getAvatarPath } from '@/utils/avatarPath'
// Store
import { useUserStore } from '@/stores/userStores.js'
import { useAIStore } from '@/stores/aiStores.js'
// 组件
import ChatInput from './ChatInput.vue'
import MarkdBox from '@/components/common/MarkdBox.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useComponentsStore } from '@/stores/componentsStores.js'
const componentsStore = useComponentsStore()
// Store实例
const user = useUserStore()
const ai = useAIStore()

// 路由相关
const route = useRoute()
const router = useRouter()
let sessionId = route.params.id

// 响应式状态
const chatList = ref([])
const chatContainer = ref(null)
const sessionName = ref('')
const isFirstLoad = ref(false) // 添加标志位控制首次加载
const isLoading = ref(true) // 添加加载状态

// 检查路由中是否有消息
const checkRoute = () => {
  if (route.query.msg) {
    // 是第一次加载，则返回true
    isFirstLoad.value = true
    const msg = route.query.msg
    handleSendMessage(msg)
    router.replace({ path: route.path, query: {} })
  }
}

// 创建监听器
const unWatch = () => {
  watch(
    () => route.params.id,
    (newId, oldId) => {
      if (newId !== oldId) {
        // 更新当前sessionId
        sessionId = newId
        // 从pinia获取sessionName
        sessionName.value = ai.chatSessionHistory.find(
          item => item.sessionId === sessionId,
        )?.sessionName

        if (isFirstLoad.value) {
          // 是第一次加载，则返回true
          isFirstLoad.value = false
          console.log('首次不获取数据')
          return
        }
        // 清空聊天列表
        chatList.value = []
        // 显示加载状态
        isLoading.value = true
        // 重新获取消息
        handleGetChat()
      }
    },
    { immediate: true },
  )
}

// 生命周期钩子
onMounted(async () => {
  checkRoute()
  unWatch()
})

/**
 * 滚动到聊天窗口底部
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      // 使用scrollIntoView方法实现平滑滚动
      const lastElement = chatContainer.value.querySelector(
        '.chat-container > div:last-child',
      )
      if (lastElement) {
        lastElement.scrollIntoView({ behavior: 'smooth', block: 'end' })
      } else {
        // 如果没有找到最后一个元素，则使用传统方式但添加平滑效果
        chatContainer.value.scrollTo({
          top: chatContainer.value.scrollHeight,
          behavior: 'smooth',
        })
      }
    }
  })
}

/**
 * 获取历史聊天消息
 */
const handleGetChat = async () => {
  try {
    const res = await getChat(sessionId)
    chatList.value = res.data
    scrollToBottom()
  } catch (error) {
    console.error('获取消息失败:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * 格式化时间为小时:分钟格式
 * @param {string} timeStr - ISO格式的时间字符串
 * @returns {string} 格式化后的时间字符串
 */
const formatTime = timeStr => {
  const date = new Date(timeStr)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 在请求结束后上传AI回复消息
 * @param {Object} data - 包含AI回复内容的数据对象
 */
const handleUploadBotChat = async data => {
  await uploadBotChat(data)
}

/**
 * 处理用户发送消息并获取AI回复
 * @param {string} message - 用户输入的消息内容
 */
const handleSendMessage = async message => {
  // 如果已经有正在进行的请求，则终止它
  if (ai.aiLoading) {
    AiStreamClient.abort()
    ai.aiLoading = false
    console.log('终止流')

    // 更新最后一条AI消息，添加终止提示
    if (chatList.value.length > 0) {
      const lastMessage = chatList.value[chatList.value.length - 1]
      if (lastMessage.role === 'system') {
        lastMessage.content += '\n\n*请求已被用户终止*'
      }
      const botResponse = {
        content: lastMessage.content,
        sessionId,
        sessionName: lastMessage.content,
        role: 'system',
      }
      handleUploadBotChat(botResponse)
    }
    return
  }

  // 验证消息内容
  if (!message || message.trim() === '') return
  if (!chatList.value) {
    chatList.value = []
  }

  // 添加用户消息到聊天列表
  const userMessage = {
    role: 'user',
    content: message,
    createTime: new Date().toISOString(),
    sessionId,
  }
  if (Array.isArray(chatList.value)) {
    chatList.value.push(userMessage)
  }

  // 清空输入框
  ai.input = ''

  // 添加AI消息占位
  const aiMessage = {
    role: 'system',
    content: '',
    createTime: new Date().toISOString(),
    sessionId,
  }

  chatList.value.push(aiMessage)
  scrollToBottom()

  const sendData = {
    content: message,
    sessionId,
    sessionName: message,
    role: 'user',
  }

  // 发送消息并处理流式响应
  AiStreamClient.send(JSON.stringify(sendData), {
    // 开始请求时的处理
    onStart: () => {
      console.log('AI响应开始')
      ai.aiLoading = true
    },

    // 接收到数据时更新AI消息内容
    onData: data => {
      console.log(data)
      const content = data.result?.output?.text || ''

      // 更新最后一条AI消息内容
      if (chatList.value.length > 0) {
        const lastMessage = chatList.value[chatList.value.length - 1]
        if (lastMessage.role === 'system') {
          lastMessage.content += content
        }
      }
    },

    // 请求完成时的处理
    onComplete: () => {
      ai.aiLoading = false
      console.log('AI响应完成')

      // 获取并上传AI的回复消息
      if (chatList.value.length > 1) {
        const aiMessage = chatList.value[chatList.value.length - 1]
        if (aiMessage.role === 'system') {
          const botResponse = {
            content: aiMessage.content,
            sessionId,
            sessionName: aiMessage.content,
            role: 'system',
          }
          handleUploadBotChat(botResponse)
        }
      }
    },

    // 发生错误时的处理
    onError: error => {
      ai.aiLoading = false
      message.error('ai响应出现异常', error)
    },
  })
}
</script>

<template>
  <div class="flex flex-col h-full w-full bg-base-100 rounded-md pb-10 pt-2">
    <div class="px-5 self-start flex items-center space-x-3">
      <ExpandIcon
        :class="{
          hidden: !componentsStore.aiSideBarStatus,
        }"
        @click="componentsStore.toggleAiSideBar()"
      />
      <div class="dropdown self-start">
        <div tabindex="0" role="button" class="btn m-1 bg-base-100">
          <span>{{ sessionName }}</span>
          <Down theme="outline" size="20" fill="#333" />
        </div>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-sm"
        >
          <li class="flex">
            <a> <Edit theme="outline" size="20" fill="#333" />修改名称</a>
          </li>
          <li>
            <a class="text-red-500"
              ><DeleteFive theme="outline" size="20" fill="#fa1010" />删除</a
            >
          </li>
        </ul>
      </div>
    </div>

    <!-- 聊天内容区域 -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 w-full">
      <!-- 真实内容渲染 -->
      <div
        v-if="!isLoading"
        class="chat-container animate__animated animate__fadeIn space-y-3 flex flex-col max-w-4xl mx-auto px-4 sm:px-6 md:px-8"
      >
        <div
          v-for="(item, index) in chatList"
          :key="item.historyId"
          class="flex flex-col w-full"
        >
          <div
            :class="item.role === 'user' ? 'chat chat-end' : 'chat chat-start'"
            class="w-full"
          >
            <div class="chat-image avatar">
              <div class="w-10 rounded-full p-1">
                <img
                  alt="avatar"
                  :src="
                    item.role === 'user'
                      ? getAvatarPath()
                      : 'https://s21.ax1x.com/2025/04/10/pE2GAaj.jpg'
                  "
                />
              </div>
            </div>
            <div class="chat-header">
              {{ item.role === 'user' ? user.userInfo.username : '好助学' }}
              <time class="text-xs opacity-50 ml-1">{{
                formatTime(item.createTime)
              }}</time>
            </div>
            <div class="rounded-lg border-2 border-base-200 p-2 chat-box">
              <div v-if="item.role === 'user'">
                {{ item.content }}
              </div>
              <MarkdBox v-else :content="item.content" />
              <LoadingState
                v-if="
                  item.role === 'system' &&
                  ai.aiLoading &&
                  index === chatList.length - 1
                "
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 加载骨架屏 -->
      <div
        v-if="isLoading"
        class="chat-container space-y-3 flex flex-col max-w-4xl mx-auto px-4 sm:px-6 md:px-8"
      >
        <!-- 用户消息骨架屏 -->
        <div class="flex flex-col w-full animate-pulse">
          <div class="chat chat-end w-full">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full bg-base-300"></div>
            </div>
            <div class="chat-header">
              <div class="h-4 w-24 bg-base-300 rounded"></div>
            </div>
            <div class="rounded-lg border-2 border-base-200 p-2 chat-box">
              <div class="h-4 w-40 bg-base-300 rounded mb-2"></div>
              <div class="h-4 w-28 bg-base-300 rounded"></div>
            </div>
          </div>
        </div>

        <!-- AI消息骨架屏 -->
        <div class="flex flex-col w-full animate-pulse">
          <div class="chat chat-start w-full">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full bg-base-300"></div>
            </div>
            <div class="chat-header">
              <div class="h-4 w-24 bg-base-300 rounded"></div>
            </div>
            <div class="rounded-lg border-2 border-base-200 p-2 chat-box">
              <div class="h-4 w-64 bg-base-300 rounded mb-2"></div>
              <div class="h-4 w-48 bg-base-300 rounded mb-2"></div>
              <div class="h-4 w-32 bg-base-300 rounded"></div>
            </div>
          </div>
        </div>

        <!-- 再添加一组对话骨架屏 -->
        <div class="flex flex-col w-full animate-pulse">
          <div class="chat chat-end w-full">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full bg-base-300"></div>
            </div>
            <div class="chat-header">
              <div class="h-4 w-24 bg-base-300 rounded"></div>
            </div>
            <div class="rounded-lg border-2 border-base-200 p-2 chat-box">
              <div class="h-4 w-36 bg-base-300 rounded"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col w-full animate-pulse">
          <div class="chat chat-start w-full">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full bg-base-300"></div>
            </div>
            <div class="chat-header">
              <div class="h-4 w-24 bg-base-300 rounded"></div>
            </div>
            <div class="rounded-lg border-2 border-base-200 p-2 chat-box">
              <div class="h-4 w-56 bg-base-300 rounded mb-2"></div>
              <div class="h-4 w-40 bg-base-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部输入框 -->
    <div class="w-full px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
      <ChatInput class="w-full" @send="handleSendMessage" />
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  width: 100%;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
