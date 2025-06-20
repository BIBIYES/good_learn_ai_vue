<script setup>
import { ref, reactive, watch } from 'vue'
import MarkdownEditor from '@/components/common/MarkdownEditor.vue'
import message from '@/plugin/message'

const props = defineProps({
  questionData: {
    type: Object,
    default: () => ({
      bankId: '',
      title: '',
      content: '',
      answer: '',
      difficulty: 'EASY',
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const formData = reactive({
  bankId: props.questionData.bankId || '',
  title: props.questionData.title || '',
  content: props.questionData.content || '',
  answer: props.questionData.answer || '',
  difficulty: props.questionData.difficulty || 'EASY',
})

// 映射后端使用的难度值到UI显示值
const difficultyMap = {
  EASY: '1',
  MEDIUM: '2',
  HARD: '3',
  1: 'EASY',
  2: 'MEDIUM',
  3: 'HARD',
}

// UI显示的难度值
const uiDifficulty = ref(difficultyMap[formData.difficulty] || '1')

// 监听UI难度变化，更新formData
watch(uiDifficulty, newValue => {
  formData.difficulty = difficultyMap[newValue] || 'EASY'
})

// 监听props变化，更新表单数据
watch(
  () => props.questionData,
  newData => {
    if (newData) {
      formData.bankId = newData.bankId || formData.bankId
      formData.title = newData.title || ''
      formData.content = newData.content || ''
      formData.answer = newData.answer || ''
      formData.difficulty = newData.difficulty || 'EASY'
      uiDifficulty.value = difficultyMap[formData.difficulty] || '1'
    }
  },
  { deep: true },
)

const handleSubmit = () => {
  // 表单验证
  if (!formData.title.trim()) {
    message.error('请输入题目标题')
    return
  }

  if (!formData.content.trim()) {
    message.error('请输入题目内容')
    return
  }

  if (!formData.answer.trim()) {
    message.error('请输入题目答案')
    return
  }

  emit('submit', { ...formData })
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="question-form">
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text"
          >题目标题<span class="text-error">*</span></span
        >
      </label>
      <input
        v-model="formData.title"
        type="text"
        class="input input-bordered glass-input-border"
        placeholder="请输入题目标题"
      />
    </div>

    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text"
          >题目内容<span class="text-error">*</span></span
        >
      </label>
      <MarkdownEditor
        v-model="formData.content"
        :height="250"
        placeholder="请输入题目内容（支持Markdown格式）"
      />
      <div class="text-xs text-gray-500 mt-1">
        使用Markdown格式编辑内容，支持标题、列表、粗体、斜体、代码块等
      </div>
    </div>

    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text"
          >题目答案<span class="text-error">*</span></span
        >
      </label>
      <textarea
        v-model="formData.answer"
        class="textarea textarea-bordered glass-input-border h-24"
        placeholder="请输入题目答案"
      />
    </div>

    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text"
          >难度等级<span class="text-error">*</span></span
        >
      </label>
      <div class="rating rating-lg custom-rating">
        <input
          v-model="uiDifficulty"
          type="radio"
          name="difficulty-rating"
          class="mask mask-star-2 bg-green-500"
          value="1"
        />
        <input
          v-model="uiDifficulty"
          type="radio"
          name="difficulty-rating"
          class="mask mask-star-2 bg-yellow-500"
          value="2"
        />
        <input
          v-model="uiDifficulty"
          type="radio"
          name="difficulty-rating"
          class="mask mask-star-2 bg-red-500"
          value="3"
        />
      </div>
      <div class="text-sm mt-2">
        <span
          :class="{
            'text-green-500 font-medium': uiDifficulty === '1',
            'text-yellow-500 font-medium': uiDifficulty === '2',
            'text-red-500 font-medium': uiDifficulty === '3',
          }"
        >
          {{
            uiDifficulty === '1'
              ? '简单'
              : uiDifficulty === '2'
                ? '中等'
                : '困难'
          }}
        </span>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-6">
      <button
        class="btn-liquid-glass bg-gray-50 hover:bg-gray-100 text-gray-700"
        @click="handleCancel"
      >
        取消
      </button>
      <button
        class="btn-liquid-glass wechat-green"
        :disabled="loading"
        @click="handleSubmit"
      >
        <span v-if="loading" class="loading loading-spinner loading-sm" />
        {{ isEdit ? '保存修改' : '确认添加' }}
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

.text-error {
  color: #ef4444;
}

/* 玻璃风格输入框 */
.glass-input-border {
  border: 1px solid rgba(220, 240, 230, 0.5);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
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
</style>
