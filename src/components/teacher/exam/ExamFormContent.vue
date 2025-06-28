<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { createExam, updateExam } from '@/api/exam/examApi.js'
import message from '@/plugin/message'

const props = defineProps({
  formData: {
    type: Object,
    required: true,
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

const emit = defineEmits(['update:formData', 'success', 'cancel'])

// 内部维护loading状态
const isLoading = ref(false)

const handleSubmit = async () => {
  if (!props.formData.examName) {
    message.error('请输入试卷名称')
    return
  }

  isLoading.value = true

  try {
    const res = props.isEdit
      ? await updateExam(props.formData)
      : await createExam(props.formData)

    if (res.code === 200) {
      message.success(props.isEdit ? '更新成功' : '创建成功')
      emit('success')
    } else {
      message.error(res.message || (props.isEdit ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    console.error(props.isEdit ? '更新试卷错误:' : '创建试卷错误:', error)
    message.error(props.isEdit ? '更新试卷时发生错误' : '创建试卷时发生错误')
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="form-control mb-2">
    <el-form label-position="top">
      <el-form-item label="试卷名称" required>
        <el-input
          :model-value="props.formData.examName"
          placeholder="请输入试卷名称,如：数据库基础第一单元测试"
          @update:model-value="
            val => emit('update:formData', { ...props.formData, examName: val })
          "
        />
      </el-form-item>
      <el-form-item label="试卷描述">
        <el-input
          :model-value="props.formData.description"
          type="textarea"
          :rows="4"
          placeholder="输入试卷的简要描述"
          @update:model-value="
            val =>
              emit('update:formData', { ...props.formData, description: val })
          "
        />
      </el-form-item>
    </el-form>
    <div class="flex justify-end gap-2 mt-4">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        :loading="isLoading || props.loading"
        @click="handleSubmit"
      >
        {{ props.isEdit ? '确认更新' : '确认创建' }}
      </el-button>
    </div>
  </div>
</template>
