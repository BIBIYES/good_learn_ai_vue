<script setup>
import { ref, watch } from 'vue'
import { updateexam } from '@/api/test'
import message from '@/plugin/message'

const props = defineProps({
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

const updateLoading = ref(false)
const editExamName = ref('')
const editdescription = ref('')

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
    message.warning('请输入试卷名称')
    return
  }
  updateLoading.value = true
  try {
    const res = await updateexam({
      examId: props.examId,
      examName: editExamName.value,
      description: editdescription.value,
    })
    if (res.code === 200) {
      message.success('更新成功')
      // 关闭模态框
      const modalCheckbox = document.getElementById('edit_exam_modal')
      if (modalCheckbox) modalCheckbox.checked = false
      // 调用父组件的成功回调
      props.onSuccess()
    } else {
      message.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新试卷错误:', error)
    message.error('更新试卷时发生错误')
  } finally {
    updateLoading.value = false
  }
}
</script>

<template>
  <input id="edit_exam_modal" type="checkbox" class="modal-toggle" />
  <div class="modal" role="dialog">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">编辑试卷</h3>
      <div class="form-control mb-2">
        <label class="label">
          <span class="label-text"
            >试卷名称<span class="text-error">*</span></span
          >
        </label>
        <input
          v-model="editExamName"
          type="text"
          placeholder="例如：计算机网络期末考试"
          class="input input-bordered w-full"
        />
      </div>
      <div class="form-control mb-4 flex flex-col">
        <label class="label">
          <span class="label-text">试卷描述</span>
        </label>
        <textarea
          v-model="editdescription"
          class="textarea textarea-bordered h-24"
          placeholder="输入试卷的简要描述"
        />
      </div>
      <div class="modal-action">
        <label for="edit_exam_modal" class="btn btn-ghost">取消</label>
        <button class="btn btn-primary" @click="handleUpdate">
          <span
            v-show="updateLoading"
            class="loading loading-spinner loading-md"
          />
          确认更新
        </button>
      </div>
    </div>
    <label class="modal-backdrop" for="edit_exam_modal">Close</label>
  </div>
</template>
