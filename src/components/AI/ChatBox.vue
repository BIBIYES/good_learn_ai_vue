<script setup>
import { getChat } from '@/api/chat'
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import ChatInput from './ChatInput.vue'
import { userStore } from '@/stores/user'
const user = userStore()

const route = useRoute()
const sessionId = route.params.id

const chatList = ref([])

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

onMounted(() => {
  handleGetChat()
})
</script>

<template>
  <div class="app flex flex-col w-full h-screen pb-9">
    <div class="flex-1 overflow-y-auto pt-10 p-4 py-2 space-y-3 pl-50 pr-50">
      <div v-for="item in chatList" :key="item.historyId" class="flex flex-col">
        <div
          :class="item.role === 'user' ? 'chat chat-end' : 'chat chat-start'"
        >
          <div class="chat-image avatar">
            <div class="w-10 rounded-full p-1">
              <img alt="avatar" src="@/assets/img/avatar.jpg" />
            </div>
          </div>
          <div class="chat-header">
            {{ item.role === 'user' ? user.userInfo.username : '好助学' }}
            <time class="text-xs opacity-50 ml-1">{{
              formatTime(item.createTime)
            }}</time>
          </div>
          <div class="chat-bubble">{{ item.content }}</div>
        </div>
      </div>
    </div>
    <div>
      <ChatInput />
    </div>
  </div>
</template>
