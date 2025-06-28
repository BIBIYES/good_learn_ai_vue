<script setup>
import { ref, watch } from 'vue'
import MarkdownEditor from '@/components/common/MarkdownEditor.vue'
import { updateQuestion } from '@/api/questionApi.js'
import message from '@/plugin/message'

const props = defineProps({
  questionData: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['success'])

// 加载状态
const loading = ref(false)

// 编辑题目数据
const editQuestion = ref({})

// 监听questionData变化
watch(
  () => props.questionData,
  newVal => {
    if (newVal) {
      editQuestion.value = { ...newVal }
    }
  },
  { immediate: true, deep: true },
)

// 难度中文映射
const difficultyMap = {
  1: '简单',
  2: '中等',
  3: '困难',
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

// 提交表单
const handleSubmit = async () => {
  if (!editQuestion.value.title) {
    message.error('题目标题不能为空')
    return
  }

  if (!editQuestion.value.content) {
    message.error('题目内容不能为空')
    return
  }

  loading.value = true
  try {
    const res = await updateQuestion({
      questionId: editQuestion.value.questionId,
      bankId: editQuestion.value.bankId,
      content: editQuestion.value.content,
      difficulty: editQuestion.value.difficulty,
      title: editQuestion.value.title,
      status: editQuestion.value.status,
    })

    if (res.code === 200) {
      message.success('修改题目成功')
      emit('success')
      handleClose()
    } else {
      message.error(res.message || '修改题目失败')
    }
  } catch (error) {
    console.error('修改题目错误:', error)
    message.error('修改题目时发生错误')
  } finally {
    loading.value = false
  }
}

// 关闭模态框
const handleClose = () => {
  document.getElementById('edit-question-modal').close()
}
</script>

<template>
  <div>
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text font-medium"
          >题目标题<span class="text-error">*</span></span
        >
      </label>
      <input
        v-model="editQuestion.title"
        class="input input-bordered glass-input-border"
        placeholder="请输入题目标题"
      />
    </div>

    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text font-medium"
          >题目内容<span class="text-error">*</span></span
        >
      </label>
      <MarkdownEditor
        v-model="editQuestion.content"
        :height="300"
        :placeholder="'请输入题目内容（支持Markdown格式）'"
      />
      <div class="text-xs text-gray-500 mt-1">
        使用Markdown格式编辑内容，支持标题、列表、粗体、斜体、代码块等
      </div>
    </div>

    <div class="form-control mb-6">
      <label class="label">
        <span class="label-text font-medium"
          >难度等级<span class="text-error">*</span></span
        >
      </label>
      <div class="flex items-center space-x-4">
        <div class="rating rating-lg custom-rating">
          <input
            v-model="editQuestion.difficulty"
            type="radio"
            name="edit-rating"
            class="mask mask-star-2 bg-green-500"
            value="1"
          />
          <input
            v-model="editQuestion.difficulty"
            type="radio"
            name="edit-rating"
            class="mask mask-star-2 bg-yellow-500"
            value="2"
          />
          <input
            v-model="editQuestion.difficulty"
            type="radio"
            name="edit-rating"
            class="mask mask-star-2 bg-red-500"
            value="3"
          />
        </div>
        <span
          :class="{
            'text-green-500 font-medium': editQuestion.difficulty === '1',
            'text-yellow-500 font-medium': editQuestion.difficulty === '2',
            'text-red-500 font-medium': editQuestion.difficulty === '3',
          }"
        >
          {{ difficultyMap[editQuestion.difficulty] }}
        </span>
      </div>
    </div>

    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text">状态</span>
      </label>
      <div class="flex items-center space-x-2">
        <input
          v-model="editQuestion.status"
          type="checkbox"
          class="toggle toggle-success custom-toggle"
        />
        <span class="text-sm">{{ editQuestion.status ? '启用' : '禁用' }}</span>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-6">
      <button
        class="btn-liquid-glass wechat-green"
        :disabled="loading"
        @click="handleSubmit"
      >
        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        {{ loading ? '保存中...' : '保存修改' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 自定义星级评分样式 */
.custom-rating .mask-star-2 {
  cursor: pointer;
  width: 2rem;
  height: 2rem;
}

.mask-star-2.bg-green-500 {
  background-color: #22c55e;
}

.mask-star-2.bg-yellow-500 {
  background-color: #eab308;
}

.mask-star-2.bg-red-500 {
  background-color: #ef4444;
}

/* 文本错误颜色 */
.text-error {
  color: #ef4444;
}

/* 自定义开关样式 */
.custom-toggle {
  height: 1.5rem;
  width: 3rem;
  background-color: rgba(200, 200, 200, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.custom-toggle:checked {
  background-color: #22c55e;
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.1),
    0 0 0 2px rgba(34, 197, 94, 0.2);
}

.custom-toggle:focus {
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

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

/* 玻璃风格输入框 */
.glass-input-border {
  border: 1px solid rgba(220, 240, 230, 0.5);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
}
</style>
