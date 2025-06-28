<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { deleteExam } from '@/api/exam/examApi.js'
import message from '@/plugin/message'

const props = defineProps({
  examId: {
    type: [String, Number],
    required: true,
  },
  examName: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['success', 'cancel'])

// 内部维护loading状态
const isLoading = ref(false)

const handleConfirm = async () => {
  isLoading.value = true
  try {
    const res = await deleteExam(props.examId)
    if (res.code === 200) {
      message.success('删除成功')
      emit('success')
    } else {
      message.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除试卷错误:', error)
    message.error('删除试卷时发生错误')
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="py-4">
    您确定要删除试卷
    <span class="font-bold text-error">{{ props.examName }}</span>
    吗？此操作不可逆。

    <div class="flex justify-end gap-2 mt-4">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="danger"
        :loading="isLoading || props.loading"
        @click="handleConfirm"
      >
        确认删除
      </el-button>
    </div>
  </div>
</template>
