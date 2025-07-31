<script setup>
import { ref, watch } from 'vue'
import MarkdownEditor from '@/components/common/MarkdownEditor.vue'
import { createQuestion } from '@/api/questionApi.js'
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

// 新题目数据
const newQuestion = ref({
  bankId: props.bankId,
  content: '',
  difficulty: '1', // 默认简单难度
  title: '', // 新增题目标题字段
  status: true,
})

// 监听bankId变化，更新题目的bankId
watch(
  () => props.bankId,
  newVal => {
    if (newVal) {
      newQuestion.value.bankId = newVal
    }
  },
  { immediate: true },
)

// 难度中文映射
const difficultyMap = {
  1: '简单',
  2: '中等',
  3: '困难',
}

// 提交表单
const handleSubmit = async () => {
  if (!newQuestion.value.title) {
    message.error('题目标题不能为空')
    return
  }

  if (!newQuestion.value.content) {
    message.error('题目内容不能为空')
    return
  }

  loading.value = true
  try {
    const res = await createQuestion({
      bankId: props.bankId,
      content: newQuestion.value.content,
      difficulty: newQuestion.value.difficulty,
      title: newQuestion.value.title,
    })

    if (res.code === 200) {
      message.success('添加题目成功')
      emit('success')
      handleClose()
    } else {
      message.error(res.message || '添加题目失败')
    }
  } catch (error) {
    console.error('添加题目错误:', error)
    message.error('添加题目时发生错误')
  } finally {
    loading.value = false
  }
}

// 关闭并重置表单
const handleClose = () => {
  // 使用DaisyUI的模态框关闭方法
  document.getElementById('create-question-modal').close()

  // 重置表单
  newQuestion.value = {
    bankId: props.bankId,
    content: '',
    difficulty: '1',
    status: true,
    title: '',
  }
}
</script>

<template>
  <div>
    <h3 class="font-bold text-xl mb-4">添加题目</h3>

    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text font-medium"
          >题目标题<span class="text-error">*</span></span
        >
      </label>
      <input
        v-model="newQuestion.title"
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
        v-model="newQuestion.content"
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
            v-model="newQuestion.difficulty"
            type="radio"
            name="create-rating"
            class="mask mask-star-2 bg-green-500"
            value="1"
          />
          <input
            v-model="newQuestion.difficulty"
            type="radio"
            name="create-rating"
            class="mask mask-star-2 bg-yellow-500"
            value="2"
          />
          <input
            v-model="newQuestion.difficulty"
            type="radio"
            name="create-rating"
            class="mask mask-star-2 bg-red-500"
            value="3"
          />
        </div>
        <span
          :class="{
            'text-green-500 font-medium': newQuestion.difficulty === '1',
            'text-yellow-500 font-medium': newQuestion.difficulty === '2',
            'text-red-500 font-medium': newQuestion.difficulty === '3',
          }"
        >
          {{ difficultyMap[newQuestion.difficulty] }}
        </span>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-6">
      <button
        class="btn-liquid-glass bg-gray-50 hover:bg-gray-100 text-gray-700"
        @click="handleClose"
      >
        取消
      </button>
      <button
        class="btn-liquid-glass wechat-green"
        :disabled="loading"
        @click="handleSubmit"
      >
        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        {{ loading ? '添加中...' : '确认添加' }}
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
