<template>
  <div class="flex flex-col space-y-3">
    <div class="flex w-full space-x-2">
      <input
        v-model="prompt"
        type="text"
        placeholder="例如：帮我生成5道有关于数据库查询的题目 "
        class="input"
      />
      <button
        class="btn-liquid-glass error"
        :disabled="loading.button"
        @click="handleSubmit"
      >
        <span
          v-if="loading.button"
          class="loading loading-spinner loading-xs"
        />
        <span class="whitespace-nowrap overflow-hidden">
          {{ loading.button ? '处理中...' : '生成题目' }}</span
        >
      </button>
    </div>
    <div v-if="loading.button" class="animate__animated animate__flash">
      <span class="shimmer-text"
        >正在处理好助学的响应：{{ currentCharacter }}</span
      >
    </div>
    <div v-if="questions.length > 0" class="mt-4">
      <div
        v-for="(question, index) in questions"
        :key="index"
        class="card p-4 mb-4 bg-base-100 shadow-md"
      >
        <h3 class="font-bold text-lg">{{ question.title }}</h3>
        <div class="divider my-1"></div>
        <div class="prose" v-html="renderMarkdown(question.content)"></div>
        <div class="mt-2">
          <span class="badge" :class="getDifficultyClass(question.difficulty)">
            难度: {{ getDifficultyText(question.difficulty) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AIStreamClient from '@/plugin/AIStreamClient'
import { ref } from 'vue'
import { marked } from 'marked'

defineProps({
  bankId: {
    type: String,
    default: '',
  },
})

const prompt = ref('')

const loading = ref({
  button: false,
})

const questionJsonString = ref('')
const questions = ref([])

const currentCharacter = ref('')

const renderMarkdown = content => {
  return marked(content || '')
}

const getDifficultyText = difficulty => {
  switch (difficulty) {
    case 1:
      return '简单'
    case 2:
      return '中等'
    case 3:
      return '困难'
    default:
      return '未知'
  }
}

const getDifficultyClass = difficulty => {
  switch (difficulty) {
    case 1:
      return 'badge-success'
    case 2:
      return 'badge-warning'
    case 3:
      return 'badge-error'
    default:
      return 'badge-info'
  }
}

const handleSubmit = () => {
  loading.value.button = true
  questionJsonString.value = '' // 重置接收到的数据
  questions.value = [] // 重置解析后的问题

  // 发送消息并处理流式响应
  const ai = AIStreamClient.init({
    baseUrl: '/api/v1/question/ai-create-stream',
  })
  ai.send(JSON.stringify({ question: prompt.value }), {
    // 开始请求时的处理
    onStart: () => {
      console.log('AI响应开始')
      loading.value.button = true
    },

    // 接收到数据时更新AI消息内容
    onData: data => {
      const content = data.result?.output?.text || ''
      questionJsonString.value += content
      currentCharacter.value = content
    },

    // 请求完成时的处理
    onComplete: () => {
      loading.value.button = false
      // 结束之后解析json
      try {
        // 清理可能导致JSON解析错误的字符
        let cleanedJson = questionJsonString.value.trim()

        // 确保字符串是有效的JSON数组格式
        if (!cleanedJson.startsWith('[')) {
          cleanedJson = '[' + cleanedJson
        }

        if (!cleanedJson.endsWith(']')) {
          cleanedJson = cleanedJson + ']'
        }

        // 尝试解析JSON
        const parsedQuestions = JSON.parse(cleanedJson)
        questions.value = Array.isArray(parsedQuestions) ? parsedQuestions : []
        console.log('解析成功', questions.value)
      } catch (e) {
        console.log('题目json解析失败', e)
        console.log('原始数据:', questionJsonString.value)

        // 尝试使用正则表达式提取JSON对象
        try {
          const objectRegex = /\{[\s\S]*?\}/g
          const matches = questionJsonString.value.match(objectRegex)
          if (matches && matches.length > 0) {
            questions.value = matches
              .map(match => {
                try {
                  return JSON.parse(match)
                } catch {
                  return null
                }
              })
              .filter(Boolean)

            console.log('通过正则提取解析成功', questions.value)
          }
        } catch (regexError) {
          console.log('正则提取失败', regexError)
        }
      }

      console.log('AI响应完成')
    },

    // 发生错误时的处理
    onError: error => {
      loading.value.button = false
      console.log('ai响应出现异常', error)
    },
  })
}
</script>

<style scoped lang="scss">
.shimmer-text {
  position: relative;
  display: inline-block;
  color: rgba(0, 0, 0, 0.2);
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.2) 25%,
    rgba(0, 0, 0, 0.8) 50%,
    rgba(0, 0, 0, 0.2) 75%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 2s infinite linear;
  font-weight: 500;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
/* 液态玻璃按钮基础样式 */
.btn-liquid-glass {
  padding: 0.1rem 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  background: linear-gradient(
    145deg,
    rgba(248, 255, 252, 0.7),
    rgba(245, 253, 248, 0.6)
  );
  color: rgb(40, 130, 90);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(248, 255, 252, 0.5);
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.05),
    inset 0 1px 1px rgba(255, 255, 255, 0.6);
}

.btn-liquid-glass:hover {
  background: linear-gradient(
    145deg,
    rgba(250, 255, 253, 0.8),
    rgba(248, 253, 250, 0.7)
  );
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.btn-liquid-glass:active {
  background: linear-gradient(
    145deg,
    rgba(245, 253, 248, 0.7),
    rgba(242, 250, 245, 0.6)
  );
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.04),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  transform: translateY(0);
}

.btn-liquid-glass:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.03),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

/* 科技风格按钮 */
.btn-liquid-glass.error {
  background: linear-gradient(145deg, #0ea5e9, #0284c7);
  color: white;
  border: 1px solid rgba(56, 189, 248, 0.3);
  box-shadow:
    0 2px 10px rgba(14, 165, 233, 0.3),
    inset 0 1px 1px rgba(186, 230, 253, 0.4);
}

.btn-liquid-glass.error:hover {
  background: linear-gradient(145deg, #0ea5e9, #0369a1);
  box-shadow:
    0 4px 15px rgba(14, 165, 233, 0.5),
    inset 0 1px 1px rgba(186, 230, 253, 0.6);
}

.btn-liquid-glass.error:active {
  background: linear-gradient(145deg, #0284c7, #0369a1);
  box-shadow:
    0 2px 6px rgba(14, 165, 233, 0.3),
    inset 0 1px 1px rgba(186, 230, 253, 0.2);
}
</style>
