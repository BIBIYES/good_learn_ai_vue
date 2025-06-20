<script setup>
import { ref } from 'vue'
import { FileQuestion } from '@icon-park/vue-next'
import {
  generateQuestionTemplate,
  parseExcelToQuestions,
  isExcelFile,
} from '@/utils/excelUtils'
import { batchQuestions } from '@/api/question'
import message from '@/plugin/message'

const props = defineProps({
  bankId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['success'])

// 加载状态
const loading = ref(false)
const parsing = ref(false) // 解析状态
const previewQuestions = ref([]) // 预览数据

// 批量添加文件
const batchAddFile = ref(null)

// 下载模板
const handleDownloadTemplate = () => {
  generateQuestionTemplate()
}

/**
 * 处理文件选择
 * @description 验证选择的文件是否为Excel格式
 * @param {Event} e - 文件选择事件对象
 */
const handleFileChange = async e => {
  const file = e.target.files[0] // 从文件选择框中获取文件
  if (isExcelFile(file)) {
    batchAddFile.value = file
    message.success('Excel文件已选择，正在解析预览...')

    // 解析文件以预览
    await parseFileForPreview(file)
  } else {
    message.error('请上传正确的 Excel 文件 (.xlsx)')
    batchAddFile.value = null
    previewQuestions.value = []
  }
}

// 解析文件用于预览
const parseFileForPreview = async file => {
  parsing.value = true
  try {
    // 使用工具函数解析Excel文件
    const questions = await parseExcelToQuestions(file, props.bankId)

    if (questions && questions.length > 0) {
      previewQuestions.value = questions
      message.success(
        `解析成功，共${questions.length}道题目，请检查预览内容后导入`,
      )
    } else {
      message.warning('未解析到有效题目，请检查Excel文件格式是否正确')
      previewQuestions.value = []
    }
  } catch (error) {
    console.error('解析Excel文件错误:', error)
    message.error(error.message || '解析Excel文件时发生错误')
    previewQuestions.value = []
  } finally {
    parsing.value = false
  }
}

// 获取难度中文名称
const getDifficultyText = difficulty => {
  const difficultyMap = {
    1: '简单',
    2: '中等',
    3: '困难',
    easy: '简单',
    medium: '中等',
    hard: '困难',
  }
  return difficultyMap[difficulty] || difficulty
}

// 提交表单
const handleSubmit = async () => {
  if (previewQuestions.value.length === 0) {
    message.error('没有可导入的题目，请重新选择文件')
    return
  }

  loading.value = true
  try {
    // 直接使用已解析的题目数据
    const questions = previewQuestions.value
    console.log('准备导入题目数据:', questions)

    // 调用批量创建API
    const res = await batchQuestions(questions)

    if (res.code === 200) {
      message.success(`批量创建成功，共导入${questions.length}道题目`)
      emit('success')
      handleClose()
    } else {
      message.error(res.message || '批量添加题目失败')
    }
  } catch (error) {
    console.error('批量添加题目错误:', error)
    message.error(error.message || '批量添加题目时发生错误')
  } finally {
    loading.value = false
  }
}

// 关闭模态框
const handleClose = () => {
  batchAddFile.value = null
  previewQuestions.value = []
  // 使用DaisyUI的模态框关闭方法
  document.getElementById('batch-add-question-modal').close()
}

// 重置文件选择
const resetFileSelection = () => {
  batchAddFile.value = null
  previewQuestions.value = []
  // 重置文件输入
  const fileInput = document.getElementById('excelFile')
  if (fileInput) {
    fileInput.value = ''
  }
}

// 预览区域高度限制，使表格可以滚动
const maxTableHeight = '300px'
</script>

<template>
  <div>
    <h3 class="font-bold text-lg mb-4 flex items-center">
      <FileQuestion theme="outline" size="22" class="mr-2" />
      批量添加题目
    </h3>
    <p class="text-sm text-gray-600 mb-4">
      请先下载模板，按照格式填写后上传Excel文件。系统将自动解析导入题目。
    </p>
    <div class="mb-4">
      <button
        class="btn-liquid-glass btn-sm flex items-center gap-1"
        @click="handleDownloadTemplate"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        下载Excel模板
      </button>
    </div>
    <div class="form-control">
      <label
        for="excelFile"
        class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 mb-4 transition duration-300"
      >
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-8 h-8 mb-3 text-gray-500"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
          <p class="mb-2 text-sm text-gray-500">
            <span class="font-semibold">点击选择文件</span>或拖放到此处
          </p>
          <p class="text-xs text-gray-500">只支持 .xlsx 格式的Excel文件</p>
        </div>
        <p v-if="batchAddFile" class="text-sm text-green-600 font-medium mt-2">
          已选择: {{ batchAddFile.name }}
        </p>
      </label>
      <input
        id="excelFile"
        type="file"
        accept=".xlsx"
        class="hidden"
        @change="handleFileChange"
      />
    </div>

    <!-- 显示解析中状态 -->
    <div v-if="parsing" class="my-4 flex justify-center">
      <span class="loading loading-spinner loading-md text-primary"></span>
      <span class="ml-2">正在解析Excel数据，请稍候...</span>
    </div>

    <!-- 预览表格区域 -->
    <div v-if="previewQuestions.length > 0" class="my-4">
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold text-gray-700">
          题目预览 (共 {{ previewQuestions.length }} 条)
        </h4>
        <button
          class="btn-liquid-glass btn-xs text-xs"
          @click="resetFileSelection"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          重新选择
        </button>
      </div>

      <div
        class="preview-table-container"
        :style="{ maxHeight: maxTableHeight }"
      >
        <table class="table table-compact w-full">
          <thead>
            <tr>
              <th class="w-12">#</th>
              <th class="w-1/4">标题</th>
              <th>内容预览</th>
              <th class="w-16">难度</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(question, index) in previewQuestions"
              :key="index"
              class="hover"
            >
              <td>{{ index + 1 }}</td>
              <td class="whitespace-normal">
                {{ question.title || '无标题' }}
              </td>
              <td class="whitespace-normal">
                <div class="truncate-content">{{ question.content }}</div>
              </td>
              <td>
                <div
                  class="badge text-xs whitespace-nowrap"
                  :class="{
                    'bg-green-100 text-green-800':
                      question.difficulty === '1' ||
                      question.difficulty === 'easy',
                    'bg-yellow-100 text-yellow-800':
                      question.difficulty === '2' ||
                      question.difficulty === 'medium',
                    'bg-red-100 text-red-800':
                      question.difficulty === '3' ||
                      question.difficulty === 'hard',
                  }"
                >
                  {{ getDifficultyText(question.difficulty) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <button
        class="btn-liquid-glass bg-gray-50 hover:bg-gray-100 text-gray-700"
        @click="handleClose"
      >
        取消
      </button>
      <button
        class="btn-liquid-glass wechat-green"
        :disabled="previewQuestions.length === 0 || loading"
        @click="handleSubmit"
      >
        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        {{ loading ? '正在导入...' : '确认导入' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 液态玻璃按钮基础样式 */
.btn-liquid-glass {
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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

.btn-liquid-glass.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.5rem;
}

.btn-liquid-glass.btn-xs {
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  border-radius: 0.375rem;
}

.btn-liquid-glass:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.03),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

/* 微信风格绿色按钮 */
.btn-liquid-glass.wechat-green {
  background: #07c160;
  color: white;
  border: none;
  box-shadow: 0 2px 6px rgba(7, 193, 96, 0.3);
}

.btn-liquid-glass.wechat-green:hover {
  background: #06ad56;
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.4);
}

.btn-liquid-glass.wechat-green:active {
  background: #069e4f;
  box-shadow: 0 2px 4px rgba(7, 193, 96, 0.3);
}

.text-green-600 {
  color: #22c55e;
}

.preview-table-container {
  overflow-y: auto;
  overflow-x: auto;
  border: 1px solid rgba(220, 240, 230, 0.5);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
}

.table {
  background: transparent;
  width: 100%;
}

.table thead {
  position: sticky;
  top: 0;
  background: rgba(248, 255, 252, 0.9);
  z-index: 10;
}

.table thead th {
  padding: 0.75rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  border-bottom: 1px solid rgba(220, 240, 230, 0.7);
}

.table tbody tr {
  border-bottom: 1px solid rgba(220, 240, 230, 0.3);
}

.table tbody tr:last-child {
  border-bottom: none;
}

.table tbody td {
  padding: 0.75rem;
  vertical-align: middle;
}

.truncate-content {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.whitespace-normal {
  white-space: normal;
}

/* 模态框动画 */
@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

.animate-modal-pop > div:last-child {
  animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  margin: auto;
  position: relative;
  z-index: 1003;
}

.modal-container > div:last-child {
  max-height: 80vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 200, 130, 0.3) transparent;
  margin: auto;
}

/* Badge 样式 */
.badge {
  padding: 0.25em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.75em;
  font-weight: 600;
  display: inline-block;
  text-align: center;
}
</style>
