<script setup>
import FastGPT from '@/utils/FastGPT';
import { ref } from 'vue';
import MarkBox from '@/components/common/MarkdBox.vue';

const API_KEY = 'fastgpt-dNjA6ZmF2HakcGkkfZNxd8rfdFHCYOooM3eB8decdl4uQUwkascles0yrs6'

const fastgpt = new FastGPT(API_KEY)

const streamStatus = ref("");
const response = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const clearError = () => {
  errorMessage.value = '';
}

const send = async () => {
  try {
    clearError();
    isLoading.value = true;
    response.value = ''; // 清空之前的响应

    await fastgpt.chat('随便写一个复杂一点的查询语句', 3, (event, data) => {
      try {
        const message = JSON.parse(data);

        switch (event) {
          case 'flowNodeStatus':
            streamStatus.value = message.name;
            break;

          case 'answer':
            if (message.choices[0].delta.content != null) {
              response.value += message.choices[0].delta.content;
            }
            if (message.choices[0].finish_reason === 'stop') {
              isLoading.value = false;
            }
            break;

          case 'flowResponses':
            console.log('Flow Response:', message);
            break;

          default:
            console.warn('未处理的事件类型:', event, message);
        }
      } catch (parseError) {
        console.error('数据解析错误:', parseError);
      }
    });
  } catch (error) {
    console.error('请求出错:', error);
    errorMessage.value = `请求失败: ${error.message}`;
    isLoading.value = false;
  }
}

const printNumber = (num) => {
  console.log(num);
}

const send2 = async () => {
  try {
    clearError();
    await fastgpt.reNumber(printNumber);
  } catch (error) {
    console.error('回调函数测试失败:', error);
    errorMessage.value = `回调函数测试失败: ${error.message}`;
  }
}
</script>

<template>
  <div class="container p-4">
    <div class="btn-container mb-4">
      <button class="btn btn-primary" @click="send()" :disabled="isLoading">
        {{ isLoading ? '请求中...' : '发送请求' }}
      </button>
      <button class="btn btn-secondary ml-2" @click="send2()" :disabled="isLoading">
        测试回调函数
      </button>
    </div>

    <div class="status-container mb-4">
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="streamStatus" class="stream-status">
        当前状态: {{ streamStatus }}
      </div>
      <div v-if="isLoading" class="loading-indicator">
        <span class="loading loading-ring loading-xs"></span>
        正在加载响应...
      </div>
    </div>

    <div class="response-container">
      <MarkBox :content="response" :theme="'light'" class="markdown-response" />
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-container {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
  border: none;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
  border: none;
}

.status-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-message {
  padding: 0.5rem;
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 0.875rem;
}

.stream-status {
  padding: 0.5rem;
  background-color: #f3f4f6;
  border-radius: 4px;
  font-size: 0.875rem;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.response-container {
  margin-top: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.markdown-response {
  min-height: 100px;
}
</style>
