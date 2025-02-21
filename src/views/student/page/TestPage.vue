<script setup>
import FastGPT from '@/utils/FastGPT';
import { ref } from 'vue';

// API密钥
const API_KEY = 'fastgpt-pTgTvZRsHGLFNGQDZeLyH1y8NKc0ApQNunyOqjKxcqqC7XuRUdDXoAuNjJ77' // 请替换为您的实际API密钥

// 实例化
const fastgpt = new FastGPT(API_KEY)

// 用于存储对话内容
const response = ref('');
const isLoading = ref(false);

const send = async () => {
  await fastgpt.chat('电影《铃芽之旅》的导演是谁？', 1, (event, data) => {
    const meassag = JSON.parse(data);
    console.log(meassag.choices[0].finish_reason);

    switch (event) {
      case 'flowNodeStatus':
        console.log(meassag);
        break;

      case 'answer':
        console.log(meassag);
        break;

      case 'flowResponses':
        console.log(meassag);
        break;

      default:
        console.warn(meassag);
    }

  });
}

// 打印回调函数的数字
const printNumber = (num) => {
  console.log(num);
}
const send2 = async () => {

  await fastgpt.reNumber(printNumber);
}

</script>
<template>
  <div class="container p-4">
    <div class="btn btn-primary mb-4" @click="send()">发送请求</div>
    <div class="btn btn-primary mb-4" @click="send2()">测试回调函数</div>

    <!-- 加载状态显示 -->
    <div v-if="isLoading" class="mb-4">
      正在加载响应...
    </div>

    <!-- 响应内容显示区域 -->
    <div v-if="response" class="p-4 border rounded bg-gray-100">
      <pre class="whitespace-pre-wrap">{{ response }}</pre>
    </div>
  </div>
</template>
<style>
.container {
  max-width: 800px;
  margin: 0 auto;
}
</style>
