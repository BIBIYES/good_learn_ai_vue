<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { addexam, updateexam } from '@/api/exam/examApi.js'
import { ElMessage } from 'element-plus'

const props = defineProps({
  examData: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['success', 'cancel'])
const isEditMode = computed(() => !!props.examData)

const formRef = ref(null)
const examForm = reactive({
  examId: '',
  examName: '',
  description: '',
})

onMounted(() => {
  if (isEditMode.value) {
    examForm.examId = props.examData.examId
    examForm.examName = props.examData.examName
    examForm.description = props.examData.description
  }
})

const loading = ref(false)
const rules = reactive({
  examName: [{ required: true, message: '请输入试卷名称', trigger: 'blur' }],
})

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async valid => {
    if (valid) {
      loading.value = true
      try {
        let res
        if (isEditMode.value) {
          res = await updateexam({
            examId: examForm.examId,
            examName: examForm.examName,
            description: examForm.description,
          })
        } else {
          res = await addexam({
            examName: examForm.examName,
            description: examForm.description,
          })
        }

        if (res.code === 200) {
          ElMessage.success(isEditMode.value ? '更新成功' : '创建成功')
          loading.value = false
          emit('success')
        } else {
          ElMessage.error(res.message || '操作失败')
        }
      } catch (e) {
        ElMessage.error('操作时发生错误' + e)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
<template>
  <el-form ref="formRef" :model="examForm" :rules="rules" label-width="80px">
    <el-form-item label="试卷名称" prop="examName">
      <input
        v-model="examForm.examName"
        type="text"
        placeholder="请输入试卷名称"
        class="input input-bordered w-full"
      />
    </el-form-item>
    <el-form-item label="描述" prop="description">
      <textarea
        v-model="examForm.description"
        class="textarea textarea-bordered w-full"
        placeholder="请输入试卷描述"
      ></textarea>
    </el-form-item>
    <el-form-item>
      <div class="flex justify-end w-full">
        <el-button :disabled="loading" @click="emit('cancel')">
          <LineMdCloseCircle />取消
        </el-button>
        <el-button :disabled="loading" type="primary" @click="submitForm">
          <LineMdFileDocumentPlus v-if="!loading && !isEditMode" />
          <LineMdEdit v-if="!loading && isEditMode" />
          <LineMdLoadingLoop v-else-if="loading" />
          <span>{{ isEditMode ? '更新' : '创建' }}</span>
        </el-button>
      </div>
    </el-form-item>
  </el-form>
</template>
<style lang="scss" scoped></style>
