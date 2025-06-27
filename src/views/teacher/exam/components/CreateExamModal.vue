<script setup>
import { ref } from 'vue'
import { addexam } from '@/api/test'
import message from '@/plugin/message'

const props = defineProps({
  onSuccess: {
    type: Function,
    required: true,
  },
})

const createLoading = ref(false)

const newExam = ref({
  examName: '', // 试卷名称
  description: '', // 考试描述
  status: 'DRAFT', // 考试状态，默认为草稿
  examTime: '', // 考试时间
})

const handleCreateExam = async () => {
  if (!newExam.value.examName) {
    message.error('请输入试卷名称')
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
      message.success('创建成功')
      const modalCheckbox = document.getElementById('create_exam_modal')
      if (modalCheckbox) modalCheckbox.checked = false // 关闭模态框
      newExam.value = {
        examName: '',
        description: '',
        status: 'DRAFT',
        examTime: '',
      }
      // 调用父组件的成功回调
      props.onSuccess()
    } else {
      message.error(res.message || '创建失败')
    }
  } catch (error) {
    console.error('创建试卷错误:', error)
    message.error('创建试卷时发生错误')
  } finally {
    createLoading.value = false
  }
}
</script>

<template>
  <input id="create_exam_modal" type="checkbox" class="modal-toggle" />
  <div class="modal" role="dialog">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">创建新试卷</h3>
      <div class="form-control mb-2">
        <label class="label">
          <span class="label-text"
            >试卷名称<span class="text-error">*</span></span
          >
        </label>
        <input
          v-model="newExam.examName"
          type="text"
          placeholder="请输入试卷名称,如：数据库基础第一单元测试"
          class="input input-bordered w-full"
        />
      </div>
      <div class="form-control mb-4 flex flex-col">
        <label class="label">
          <span class="label-text">试卷描述</span>
        </label>
        <textarea
          v-model="newExam.description"
          class="textarea textarea-bordered h-24"
          placeholder="输入试卷的简要描述"
        />
      </div>
      <div class="modal-action">
        <label for="create_exam_modal" class="btn btn-ghost">取消</label>
        <button class="btn btn-primary" @click="handleCreateExam">
          <span
            v-show="createLoading"
            class="loading loading-spinner loading-md"
          />
          确认创建
        </button>
      </div>
    </div>
    <label class="modal-backdrop" for="create_exam_modal">Close</label>
  </div>
</template>
