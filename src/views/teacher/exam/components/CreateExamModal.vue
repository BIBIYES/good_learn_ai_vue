<script setup>
import { ref } from 'vue'
import { addexam } from '@/api/testApi.js'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  onSuccess: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update:visible'])

const createLoading = ref(false)

const newExam = ref({
  examName: '', // 试卷名称
  description: '', // 考试描述
  status: 'DRAFT', // 考试状态，默认为草稿
  examTime: '', // 考试时间
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleCreateExam = async () => {
  if (!newExam.value.examName) {
    ElMessage.error('请输入试卷名称')
    return
  }
  createLoading.value = true
  try {
    const res = await addexam({
      examName: newExam.value.examName,
      description: newExam.value.description,
      status: newExam.value.status,
      examTime: newExam.value.examTime,
    })
    if (res.code === 200) {
      ElMessage.success('创建成功')
      handleClose() // 关闭模态框
      newExam.value = {
        examName: '',
        description: '',
        status: 'DRAFT',
        examTime: '',
      }
      // 调用父组件的成功回调
      props.onSuccess()
    } else {
      ElMessage.error(res.message || '创建失败')
    }
  } catch (error) {
    console.error('创建试卷错误:', error)
    ElMessage.error('创建试卷时发生错误')
  } finally {
    createLoading.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="props.visible"
    title="创建新试卷"
    width="500px"
    align-center
    @update:model-value="emit('update:visible', $event)"
    @close="handleClose"
  >
    <div class="form-control mb-2">
      <el-form label-position="top">
        <el-form-item label="试卷名称" required>
          <el-input
            v-model="newExam.examName"
            placeholder="请输入试卷名称,如：数据库基础第一单元测试"
          />
        </el-form-item>
        <el-form-item label="试卷描述">
          <el-input
            v-model="newExam.description"
            type="textarea"
            :rows="4"
            placeholder="输入试卷的简要描述"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="createLoading"
          @click="handleCreateExam"
        >
          确认创建
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
