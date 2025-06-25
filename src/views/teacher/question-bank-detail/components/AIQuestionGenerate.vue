<template>
  <div class="flex flex-col space-y-4">
    <div class="flex w-full space-x-2">
      <input
        v-model="prompt"
        type="text"
        placeholder="例如：帮我生成5道有关于数据库查询的题目 "
        class="input input-bordered w-full"
        :disabled="loading.button"
      />
      <button
        class="btn-liquid-glass wechat-green"
        :disabled="loading.button"
        @click="handleSubmit"
      >
        <span
          v-if="loading.button"
          class="loading loading-spinner loading-xs"
        />
        <span class="whitespace-nowrap">
          {{ loading.button ? '生成中...' : '生成题目' }}</span
        >
      </button>
    </div>

    <!-- Loader -->
    <div v-if="loading.button" class="animate__animated animate__fadeIn">
      <!-- Shimmer text loader -->
      <div class="text-center py-2">
        <span class="shimmer-text"
          >AI助手正在努力创作中... {{ currentCharacter }}</span
        >
      </div>

      <!-- Skeleton Loader -->
      <div class="space-y-2">
        <div
          v-for="i in 6"
          :key="i"
          class="flex skeleton items-center space-x-4 p-4 rounded-lg bg-base-200"
        >
          <div class="h-5 w-5 bg-gray-300 rounded"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-300 rounded w-3/4"></div>
            <div class="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div class="h-6 w-20 bg-gray-300 rounded-full"></div>
          <div class="h-6 w-16 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Questions Table -->
    <div
      v-if="questions.length > 0"
      class="mt-4 space-y-4 animate__animated animate__fadeIn"
    >
      <div
        class="overflow-x-auto bg-gradient-to-br from-[rgba(248,255,250,0.3)] to-[rgba(245,253,248,0.2)] backdrop-blur-md rounded-lg border border-[rgba(255,255,255,0.6)] shadow-sm"
      >
        <table class="table w-full">
          <thead>
            <tr class="bg-[rgba(250, 255, 252, 0.4), rgba(248, 253, 250, 0.3)]">
              <th class="w-12">
                <input
                  type="checkbox"
                  class="checkbox checkbox-neutral"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="font-semibold">题目标题</th>
              <th class="font-semibold">题目内容</th>
              <th class="w-24 font-semibold text-center">难度</th>
              <th class="w-24 font-semibold text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(question, index) in questions"
              :key="index"
              class="hover:bg-[rgba(245, 255, 250, 0.3), rgba(240, 253, 245, 0.2)] transition-colors duration-200"
            >
              <td>
                <input
                  v-model="selectedQuestions"
                  type="checkbox"
                  class="checkbox checkbox-neutral"
                  :value="index"
                />
              </td>
              <td class="max-w-xs truncate font-medium">
                {{ question.title }}
              </td>
              <td>
                <div
                  class="prose max-w-none line-clamp-2"
                  v-html="renderMarkdown(question.content)"
                ></div>
              </td>
              <td class="text-center">
                <div
                  class="badge-liquid-glass mx-auto"
                  :class="getDifficultyClass(question.difficulty)"
                >
                  {{ getDifficultyText(question.difficulty) }}
                </div>
              </td>
              <td class="text-center">
                <button
                  class="btn btn-ghost btn-xs"
                  @click="openPreviewModal(question)"
                >
                  预览
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-end items-center space-x-4">
        <span class="text-sm text-gray-600">
          已选择 {{ selectedQuestions.length }} / {{ questions.length }} 项
        </span>
        <button
          class="btn-liquid-glass wechat-green"
          :disabled="selectedQuestions.length === 0 || loading.add"
          @click="handleBatchAdd"
        >
          <span v-if="loading.add" class="loading loading-spinner loading-xs" />
          批量添加选中题目
        </button>
      </div>
    </div>

    <!-- Question Preview Modal -->
    <dialog class="modal" :open="showPreview">
      <div class="modal-box w-11/12 max-w-3xl">
        <form method="dialog">
          <button
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            @click="showPreview = false"
          >
            ✕
          </button>
        </form>
        <AIGeneratedQuestionPreview
          v-if="questionForPreview"
          :question="questionForPreview"
        />
      </div>
      <form method="dialog" class="modal-backdrop" @click="showPreview = false">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import AIStreamClient from '@/plugin/AIStreamClient'
import { ref, computed } from 'vue'
import { marked } from 'marked'
import { batchQuestions } from '@/api/question'
import message from '@/plugin/message'
import AIGeneratedQuestionPreview from './AIGeneratedQuestionPreview.vue'

const props = defineProps({
  bankId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['success', 'generation-start', 'generation-end'])

const prompt = ref('')
const loading = ref({
  button: false,
  add: false,
})
const questionJsonString = ref('')
const questions = ref([])
const selectedQuestions = ref([])
const currentCharacter = ref('')

// 预览功能
const showPreview = ref(false)
const questionForPreview = ref(null)

const openPreviewModal = question => {
  questionForPreview.value = question
  showPreview.value = true
}

const renderMarkdown = content => {
  return marked(content || '')
}

const getDifficultyText = difficulty => {
  switch (difficulty) {
    case '1':
    case 1:
    case 'easy':
      return '简单'
    case '2':
    case 2:
    case 'medium':
      return '中等'
    case '3':
    case 3:
    case 'hard':
      return '困难'
    default:
      return '未知'
  }
}

const getDifficultyClass = difficulty => {
  switch (difficulty) {
    case '1':
    case 1:
    case 'easy':
      return 'badge-success'
    case '2':
    case 2:
    case 'medium':
      return 'badge-warning'
    case '3':
    case 3:
    case 'hard':
      return 'badge-error'
    default:
      return 'badge-info'
  }
}

const isAllSelected = computed(
  () =>
    questions.value.length > 0 &&
    selectedQuestions.value.length === questions.value.length,
)

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedQuestions.value = []
  } else {
    selectedQuestions.value = questions.value.map((_, index) => index)
  }
}

const handleBatchAdd = async () => {
  if (selectedQuestions.value.length === 0) {
    message.warning('请至少选择一个问题')
    return
  }
  loading.value.add = true

  const questionsToAdd = selectedQuestions.value.map(index => ({
    ...questions.value[index],
    bankId: props.bankId,
  }))

  try {
    const res = await batchQuestions(questionsToAdd)
    if (res.code === 200) {
      message.success('批量添加成功!')
      questions.value = []
      selectedQuestions.value = []
      emit('success')
    } else {
      message.error(res.message || '批量添加失败')
    }
  } catch (error) {
    console.error('批量添加题目失败:', error)
    message.error('批量添加题目时发生错误')
  } finally {
    loading.value.add = false
  }
}

const handleSubmit = () => {
  loading.value.button = true
  emit('generation-start')
  questionJsonString.value = '' // 重置接收到的数据
  questions.value = [] // 重置解析后的问题
  selectedQuestions.value = [] // 重置选中

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
      emit('generation-end')
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
      emit('generation-end')
      console.log('ai响应出现异常', error)
    },
  })
}
</script>

<style scoped lang="scss">
@import './AIGenerateStyles.scss';

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.table {
  background: transparent;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 0.75rem;
  overflow: hidden;
}

.table thead tr {
  background: linear-gradient(
    145deg,
    rgba(250, 255, 252, 0.4),
    rgba(248, 253, 250, 0.3)
  );
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
}

.table thead th {
  padding: 1rem;
  font-weight: 600;
  text-align: left;
  color: rgba(0, 0, 0, 0.7);
}

.table tbody tr:nth-child(even) {
  background: linear-gradient(
    145deg,
    rgba(250, 255, 252, 0.25),
    rgba(248, 253, 250, 0.15)
  );
  backdrop-filter: blur(5px);
}

.table tbody tr:nth-child(odd) {
  background: linear-gradient(
    145deg,
    rgba(248, 253, 250, 0.15),
    rgba(245, 250, 248, 0.1)
  );
  backdrop-filter: blur(5px);
}

.table tbody tr:hover {
  background: linear-gradient(
    145deg,
    rgba(245, 255, 250, 0.3),
    rgba(240, 253, 245, 0.2)
  );
}

.table tbody td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.table tbody tr:last-child td {
  border-bottom: none;
}
</style>
