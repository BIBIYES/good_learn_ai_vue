<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
})

const renderedContent = computed(() => {
  return marked(props.question.content || '')
})

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
</script>

<template>
  <div class="p-4 space-y-4">
    <h3 class="font-bold text-2xl text-gray-800">
      {{ question.title || '无标题' }}
    </h3>

    <div class="flex items-center gap-4">
      <span class="font-medium text-gray-500">难度:</span>
      <span class="badge" :class="getDifficultyClass(question.difficulty)">
        {{ getDifficultyText(question.difficulty) }}
      </span>
    </div>

    <div class="divider">题目内容</div>

    <div
      class="prose max-w-none bg-gray-50 p-4 rounded-lg"
      v-html="renderedContent"
    ></div>
  </div>
</template>

<style scoped>
.prose {
  /* You can add custom prose styles here if needed */
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
}
</style>
