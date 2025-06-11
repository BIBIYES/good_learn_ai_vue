<script setup>
import { ref, reactive, watch } from 'vue'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
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
        class="input input-bordered"
        placeholder="请输入题目标题"
      />
    </div>

    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text"
          >题目内容<span class="text-error">*</span></span
        >
      </label>
      <RichTextEditor
        v-model="formData.content"
        :height="250"
        placeholder="请输入题目内容"
      />
    </div>

    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text"
          >题目答案<span class="text-error">*</span></span
        >
      </label>
      <textarea
        v-model="formData.answer"
        class="textarea textarea-bordered h-24"
        placeholder="请输入题目答案"
      />
    </div>

    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text"
          >难度等级<span class="text-error">*</span></span
        >
      </label>
      <div class="rating rating-lg">
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
            'text-green-500': uiDifficulty === '1',
            'text-yellow-500': uiDifficulty === '2',
            'text-red-500': uiDifficulty === '3',
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
      <button class="btn btn-ghost" @click="handleCancel">取消</button>
      <button class="btn btn-primary" :disabled="loading" @click="handleSubmit">
        <span v-if="loading" class="loading loading-spinner loading-xs" />
        {{ isEdit ? '保存修改' : '确认添加' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.rating .mask-star-2 {
  cursor: pointer;
}
</style>
