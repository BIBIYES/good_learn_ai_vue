<script setup>
import { ref } from 'vue'
import { deleteQuestion } from '@/api/questionApi.js'
import message from '@/plugin/message'

const props = defineProps({
  selectedQuestions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'success'])

// 加载状态
const loading = ref(false)

// 确认批量删除
const handleConfirm = async () => {
  if (!props.selectedQuestions || props.selectedQuestions.length === 0) {
    message.error('没有选择要删除的题目')
    return
  }

  loading.value = true
  try {
    // 使用Promise.all并发删除选中的题目
    const promises = props.selectedQuestions.map(async questionId => {
      try {
        const res = await deleteQuestion(questionId)
        return { success: res.code === 200, questionId }
      } catch (error) {
        return { success: false, questionId, error }
      }
    })

    const results = await Promise.all(promises)
    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount

    if (successCount > 0) {
      message.success(`成功删除${successCount}道题目`)
      if (failCount > 0) {
        message.warning(`${failCount}道题目删除失败`)
      }
      // 只发送success事件，不再发送close事件，避免重复关闭
      emit('success')
    } else {
      message.error('批量删除失败，请稍后重试')
    }
  } catch (error) {
    console.error('批量删除题目错误:', error)
    message.error('批量删除题目时发生错误')
  } finally {
    loading.value = false
  }
}

// 关闭模态框
const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="flex flex-col">
    <p class="py-4 text-gray-700">
      您确定要删除所选的
      <span class="font-bold text-error">{{ selectedQuestions.length }}</span>
      道题目吗？
      <br />
      <span class="text-sm text-gray-500">此操作不可撤销。</span>
    </p>
    <div class="flex justify-end gap-2 mt-4">
      <button class="btn-liquid-glass" @click="handleClose">取消</button>
      <button
        class="btn-liquid-glass error"
        :disabled="loading"
        @click="handleConfirm"
      >
        <span v-if="loading" class="loading loading-spinner loading-xs" />
        {{ loading ? '删除中...' : '确认删除' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
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

/* 错误风格按钮 */
.btn-liquid-glass.error {
  background: #ef4444;
  color: white;
  border: none;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

.btn-liquid-glass.error:hover {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-liquid-glass.error:active {
  background: #b91c1c;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}
</style>
