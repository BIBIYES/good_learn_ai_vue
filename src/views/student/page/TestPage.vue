<script setup>
import AIStreamClient from '@/plugin/AIStreamClient'
const sendMessage = () => {
  const client = new AIStreamClient()
  client.sendMessage(JSON.stringify({
    msg:'你好我叫骆子豪你叫什么呢？',
    sessionId:'8ed7df36-3df8-4c61-ad85-f70c9c43beb2',
    sessionName:'你好',
    role:'user'
}), {
    onStart: () => {
      console.log('AI响应开始')
    },
    onData: (data) => {
      console.log(data)
    },
    onComplete: () => {
      console.log('AI响应完成')
    }
  }
  )
} 

</script>
<template>
  <div class="app">
    <button
      class="btn btn-primary"
      @click="sendMessage"
    >
      发送请求
    </button>
  </div>
</template>
