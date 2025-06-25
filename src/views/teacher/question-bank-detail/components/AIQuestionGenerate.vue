<script setup>
import AIStreamClient from '@/plugin/AIStreamClient'
import { ref, computed } from 'vue'
import { marked } from 'marked'
import { batchQuestions } from '@/api/question'
import message from '@/plugin/message'
import AIGeneratedQuestionPreview from './AIGeneratedQuestionPreview.vue'
import gsap from 'gsap'
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
  gsap.to('.ai-question-generator', {
    width: '80vw',
    height: '80vh',
    duration: 1,
    ease: 'power4.Out',
  })
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
<template>
  <div class="ai-question-generator">
    <div class="prompt-input-group">
      <input
        v-model="prompt"
        type="text"
        placeholder="例如：帮我生成5道有关于数据库查询的题目 "
        class="input input-bordered prompt-input"
        :disabled="loading.button"
      />
      <button
        class="btn-liquid-glass wechat-green generate-button"
        :disabled="loading.button"
        @click="handleSubmit"
      >
        <span
          v-if="loading.button"
          class="loading loading-spinner loading-xs"
        />
        <span> {{ loading.button ? '生成中...' : '生成题目' }}</span>
      </button>
    </div>

    <!-- Loader -->
    <div v-if="loading.button" class="loading-section">
      <!-- Shimmer text loader -->
      <div class="shimmer-container">
        <span class="shimmer-text"
          >AI助手正在努力创作中... {{ currentCharacter }}</span
        >
      </div>

      <!-- Skeleton Loader -->
      <div class="skeleton-loader">
        <div v-for="i in 5" :key="i" class="skeleton-item skeleton">
          <div class="skeleton-checkbox"></div>
          <div class="skeleton-content">
            <div class="skeleton-line-1"></div>
            <div class="skeleton-line-2"></div>
          </div>
          <div class="skeleton-badge"></div>
          <div class="skeleton-button"></div>
        </div>
      </div>
    </div>

    <!-- Questions Table -->
    <div v-if="questions.length > 0" class="results-section">
      <div class="questions-table-container">
        <table class="table w-full">
          <thead>
            <tr class="table-header-row">
              <th class="checkbox-cell">
                <input
                  type="checkbox"
                  class="checkbox checkbox-neutral"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="title-cell">题目标题</th>
              <th class="content-cell">题目内容</th>
              <th class="difficulty-cell">难度</th>
              <th class="actions-cell">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(question, index) in questions"
              :key="index"
              class="table-body-row"
            >
              <td>
                <input
                  v-model="selectedQuestions"
                  type="checkbox"
                  class="checkbox checkbox-neutral"
                  :value="index"
                />
              </td>
              <td class="title-cell-content">
                {{ question.title }}
              </td>
              <td>
                <div
                  class="content-cell-content prose"
                  v-html="renderMarkdown(question.content)"
                ></div>
              </td>
              <td class="difficulty-cell-content">
                <div
                  class="badge-liquid-glass"
                  :class="getDifficultyClass(question.difficulty)"
                >
                  {{ getDifficultyText(question.difficulty) }}
                </div>
              </td>
              <td class="actions-cell-content">
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

      <div class="batch-actions-container">
        <span class="selection-counter">
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
      <div class="modal-box preview-modal-box">
        <form method="dialog">
          <button
            class="btn btn-sm btn-circle btn-ghost close-button"
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
<style scoped lang="scss">
@import '@/styles/AIGenerateStyles.scss';

// 组件根元素，服务于AIQuestionGenerate主容器
.ai-question-generator {
  width: 30vw;
  height: 4rem;
  padding: 5px;
  overflow-y: auto;
}

// 顶部输入框和生成按钮区域，服务于prompt-input-group
.prompt-input-group {
  display: flex;
  width: 100%;
  gap: 0.5rem;

  .prompt-input {
    flex: 1;
  }

  .generate-button span {
    white-space: nowrap;
  }
}

// 加载状态容器，服务于loading-section
.loading-section {
  animation: fadeIn 0.5s;
}

// "AI生成中" 的闪烁文本，服务于shimmer-container
.shimmer-container {
  text-align: center;
  padding: 0.5rem 0;
}

// 加载骨架屏，服务于skeleton-loader
.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .skeleton-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: #f3f4f6; // base-200
  }

  .skeleton-checkbox {
    height: 1.25rem;
    width: 1.25rem;
    background-color: #d1d5db;
    border-radius: 0.25rem;
  }

  .skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .skeleton-line-1 {
    height: 1rem;
    background-color: #d1d5db;
    border-radius: 0.25rem;
    width: 75%;
  }

  .skeleton-line-2 {
    height: 1rem;
    background-color: #d1d5db;
    border-radius: 0.25rem;
    width: 50%;
  }

  .skeleton-badge {
    height: 1.5rem;
    width: 5rem;
    background-color: #d1d5db;
    border-radius: 9999px;
  }

  .skeleton-button {
    height: 1.5rem;
    width: 4rem;
    background-color: #d1d5db;
    border-radius: 0.25rem;
  }
}

// 生成结果区域，服务于results-section
.results-section {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: fadeIn 0.5s;
}

// 问题表格容器，服务于questions-table-container
.questions-table-container {
  overflow-x: auto;
  background-image: linear-gradient(
    to bottom right,
    rgba(248, 255, 250, 0.3),
    rgba(245, 253, 248, 0.2)
  );
  backdrop-filter: blur(16px);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

// 表格头部行，服务于table-header-row
.table-header-row {
  background: rgba(250, 255, 252, 0.4), rgba(248, 253, 250, 0.3);
}

// 表格内容行，服务于table-body-row
.table-body-row {
  transition: background-color 0.2s;
  &:hover {
    background: rgba(245, 255, 250, 0.3), rgba(240, 253, 245, 0.2);
  }
}

// 表格单元格 - 复选框，服务于checkbox-cell
.checkbox-cell {
  width: 3rem;
}

// 表格单元格 - 标题和内容，服务于title-cell、content-cell
.title-cell,
.content-cell {
  th {
    font-weight: 600;
  }
}

// 表格单元格 - 难度和操作，服务于difficulty-cell、actions-cell
.difficulty-cell,
.actions-cell {
  width: 6rem;
  text-align: center;
  th {
    font-weight: 600;
    text-align: center;
  }
}

// 表格内容 - 标题，服务于title-cell-content
.title-cell-content {
  max-width: 16rem; /* max-w-xs is actually 20rem, but this seems more reasonable */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

// 表格内容 - 内容，服务于content-cell-content
.content-cell-content {
  max-width: 30rem;
  height: 50px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 表格内容 - 难度和操作，服务于difficulty-cell-content、actions-cell-content
.difficulty-cell-content,
.actions-cell-content {
  text-align: center;
  .badge-liquid-glass {
    margin-left: auto;
    margin-right: auto;
  }
}

// 批量操作区域，服务于batch-actions-container
.batch-actions-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

// 选中计数器，服务于selection-counter
.selection-counter {
  font-size: 0.875rem;
  color: #4b5563;
}

// 预览模态框，服务于preview-modal-box
.preview-modal-box {
  width: 91.666667%;
  max-width: 56rem; // max-w-3xl is 48rem, using 56rem for w-11/12
}

// 模态框关闭按钮，服务于close-button
.close-button {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
}

// 表格基础样式，服务于.table
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
