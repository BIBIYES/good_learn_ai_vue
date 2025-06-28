<script setup>
import { ref, watch } from 'vue'
import { updateexam } from '@/api/testApi.js'
import { ElMessage } from 'element-plus'

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
  description: {
    type: String,
    default: '',
  },
  onSuccess: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update:visible'])

const updateLoading = ref(false)
const editExamName = ref('')
const editdescription = ref('')

const handleClose = () => {
  emit('update:visible', false)
}

// 监听props变化，更新表单数据
watch(
  () => props.examId,
  newVal => {
    if (newVal) {
      editExamName.value = props.examName
      editdescription.value = props.description
    }
  },
  { immediate: true },
)

const handleUpdate = async () => {
  if (!editExamName.value) {
    ElMessage.warning('请输入试卷名称')
    return
  }
  updateLoading.value = true
  try {
    const res = await updateexam({
      examId: props.examId,
      examName: editExamName.value,
      description: editdescription.value,
    })
    console.log(res)

    if (res.code === 200) {
      ElMessage.success('更新成功')
      // 关闭模态框
      handleClose()
      // 调用父组件的成功回调
      props.onSuccess()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新试卷错误:', error)
    ElMessage.error('更新试卷时发生错误')
  } finally {
    updateLoading.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="props.visible"
    title="编辑试卷"
    width="500px"
    align-center
    @update:model-value="emit('update:visible', $event)"
    @close="handleClose"
  >
    <el-form label-position="top">
      <el-form-item label="试卷名称" required>
        <el-input
          v-model="editExamName"
          placeholder="例如：计算机网络期末考试"
        />
      </el-form-item>
      <el-form-item label="试卷描述">
        <el-input
          v-model="editdescription"
          type="textarea"
          :rows="4"
          placeholder="输入试卷的简要描述"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="updateLoading"
          @click="handleUpdate"
        >
          确认更新
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
