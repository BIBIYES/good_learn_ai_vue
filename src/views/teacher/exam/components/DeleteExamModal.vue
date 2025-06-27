<script setup>
import { ref, watch } from 'vue'
import { deleteexam } from '@/api/test'
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
  onSuccess: {
    type: Function,
    required: true,
  },
})

const deleteLoading = ref(false)
const deleteConfirmExamName = ref('')

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
      const modalCheckbox = document.getElementById('delete_confirm_modal')
      if (modalCheckbox) modalCheckbox.checked = false
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
  <input id="delete_confirm_modal" type="checkbox" class="modal-toggle" />
  <div class="modal" role="dialog">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">确认删除</h3>
      <p class="py-4">
        您确定要删除试卷
        <span class="font-bold text-error">{{ deleteConfirmExamName }}</span>
        吗？此操作不可逆。
      </p>
      <div class="modal-action">
        <label for="delete_confirm_modal" class="btn btn-ghost">取消</label>
        <button class="btn btn-error" @click="confirmDelete">
          <span
            v-show="deleteLoading"
            class="loading loading-spinner loading-md"
          />
          确认删除
        </button>
      </div>
    </div>
    <label class="modal-backdrop" for="delete_confirm_modal">Close</label>
  </div>
</template>
