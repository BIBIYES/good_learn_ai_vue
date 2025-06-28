<script setup>
import { ref, watch } from 'vue'
import { deleteexam } from '@/api/testApi.js'
import message from '@/plugin/message'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  examId: {
    type: [Number, String],
    default: '',
  },
  examName: {
    type: String,
    default: '',
  },
  onSuccess: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update:visible'])

const deleteLoading = ref(false)
const deleteConfirmExamName = ref('')

const handleClose = () => {
  emit('update:visible', false)
}

// 监听props变化，更新确认信息
watch(
  () => props.examName,
  newVal => {
    deleteConfirmExamName.value = newVal
  },
  { immediate: true },
)

const confirmDelete = async () => {
  deleteLoading.value = true
  try {
    const res = await deleteexam(props.examId)
    if (res.code === 200) {
      message.success('删除成功')
      // 关闭模态框
      handleClose()
      // 调用父组件的成功回调
      props.onSuccess()
    } else {
      message.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除试卷错误:', error)
    message.error('删除试卷时发生错误')
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="props.visible"
    title="确认删除"
    width="400px"
    align-center
    @update:model-value="emit('update:visible', $event)"
    @close="handleClose"
  >
    <div class="py-4">
      您确定要删除试卷
      <span class="font-bold text-error">{{ deleteConfirmExamName }}</span>
      吗？此操作不可逆。
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="danger"
          :loading="deleteLoading"
          @click="confirmDelete"
        >
          确认删除
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
