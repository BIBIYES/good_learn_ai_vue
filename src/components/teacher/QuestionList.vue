<script setup>
defineProps({
  questions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'delete', 'components-change', 'size-change'])

// 格式化日期
const formatDate = dateString => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString()
  } catch (e) {
    console.log(e)
    return dateString
  }
}

// 获取难度标签样式
const getDifficultyStyle = difficulty => {
  switch (difficulty) {
    case '1':
    case 'EASY':
      return 'badge-success'
    case '2':
    case 'MEDIUM':
      return 'badge-warning'
    case '3':
    case 'HARD':
      return 'badge-error'
    default:
      return 'badge-info'
  }
}

// 难度中文映射
const difficultyMap = {
  1: '简单',
  2: '中等',
  3: '困难',
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
}

const handleEdit = question => {
  emit('edit', question)
}

const handleDelete = question => {
  emit('delete', question)
}
</script>

<template>
  <div>
    <!-- Loading State - Skeleton -->
    <div v-if="loading" class="w-full">
      <!-- Table header skeleton -->
      <div class="flex mb-4 p-3 bg-base-200/50 rounded-t-lg">
        <div class="w-12 skeleton h-6 mr-6" />
        <div class="w-32 skeleton h-6 mr-6" />
        <div class="flex-1 skeleton h-6 mr-6" />
        <div class="w-20 skeleton h-6 mr-6" />
        <div class="w-20 skeleton h-6 mr-6" />
        <div class="w-40 skeleton h-6 mr-6" />
        <div class="w-24 skeleton h-6" />
      </div>

      <!-- Table rows skeleton -->
      <div
        v-for="i in 5"
        :key="i"
        class="flex items-center p-4 border-b border-base-200"
      >
        <div class="w-12 skeleton h-6 mr-6" />
        <div class="w-32 skeleton h-6 mr-6" />
        <div class="flex-1">
          <div class="skeleton h-4 w-full mb-2" />
          <div class="skeleton h-4 w-3/4" />
        </div>
        <div class="w-20 skeleton h-8 rounded-full mr-6" />
        <div class="w-20 skeleton h-8 rounded-full mr-6" />
        <div class="w-40 skeleton h-6 mr-6" />
        <div class="w-24 flex gap-2">
          <div class="skeleton w-8 h-8 rounded-full" />
          <div class="skeleton w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!questions.length"
      class="flex flex-col items-center justify-center h-64"
    >
      <slot name="empty">
        <div class="text-center">
          <p class="text-base-content/70 text-lg">暂无题目数据</p>
        </div>
      </slot>
    </div>

    <!-- Questions Table -->
    <div v-else class="overflow-x-auto w-full">
      <div class="rounded-lg overflow-hidden animate__animated animate__fadeIn">
        <table class="table table-zebra w-full bg-base-100">
          <!-- Table head -->
          <thead class="bg-base-200/50">
            <tr>
              <th class="text-center w-16">ID</th>
              <th class="w-48">标题</th>
              <th>题目内容</th>
              <th class="text-center">难度</th>
              <th class="text-center">状态</th>
              <th class="text-center">创建时间</th>
              <th class="text-center w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            <!-- Table rows -->
            <tr
              v-for="question in questions"
              :key="question.questionId"
              class="hover border-b"
            >
              <td class="text-center font-mono text-sm text-base-content/70">
                {{ question.questionId }}
              </td>
              <td class="max-w-xs py-4">
                <div class="line-clamp-2 text-base-content">
                  {{ question.title }}
                </div>
              </td>
              <td class="max-w-md py-4">
                <div class="line-clamp-2 text-base-content/80">
                  <div>{{ question.content.replace(/<[^>]*>/g, ' ') }}</div>
                </div>
              </td>
              <td class="text-center">
                <div
                  class="badge badge-lg"
                  :class="getDifficultyStyle(question.difficulty)"
                >
                  {{
                    difficultyMap[question.difficulty] || question.difficulty
                  }}
                </div>
              </td>
              <td class="text-center">
                <div class="flex justify-center">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    :class="
                      question.status
                        ? 'bg-success/10 text-success'
                        : 'bg-base-300 text-base-content/50'
                    "
                  >
                    <span
                      class="w-2 h-2 rounded-full mr-1.5"
                      :class="
                        question.status ? 'bg-success' : 'bg-base-content/30'
                      "
                    />
                    {{ question.status ? '已启用' : '未启用' }}
                  </span>
                </div>
              </td>
              <td
                class="text-center whitespace-nowrap text-sm text-base-content/70"
              >
                {{ formatDate(question.createdAt) }}
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <button
                    class="btn btn-sm btn-circle bg-primary/10 border-none hover:bg-primary/10"
                    title="编辑题目"
                    @click="handleEdit(question)"
                  >
                    <Edit theme="outline" size="16" />
                  </button>
                  <button
                    class="btn btn-sm btn-circle bg-error/10 border-none hover:bg-error/10"
                    title="删除题目"
                    @click="handleDelete(question)"
                  >
                    <Delete theme="outline" class="text-error" size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
