<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-control mb-4">
      <label class="label">
        <div class="flex items-center gap-2">
          <span class="text-xl">📚</span>
          <span class="label-text font-medium"
            >课程名称<span class="text-error">*</span></span
          >
        </div>
      </label>
      <input
        v-model="formData.className"
        type="text"
        class="input input-bordered w-full"
        required
      />
    </div>

    <div class="form-control mb-4">
      <label class="label">
        <div class="flex items-center gap-2">
          <span class="text-xl">📄</span>
          <span class="label-text font-medium">课程介绍</span>
        </div>
      </label>
      <textarea
        v-model="formData.description"
        class="textarea textarea-bordered h-24 w-full"
        placeholder="请输入课程介绍"
      ></textarea>
    </div>

    <div class="form-control mb-4">
      <label class="label">
        <div class="flex items-center gap-2">
          <span class="text-xl">🚦</span>
          <span class="label-text font-medium">课程状态</span>
        </div>
      </label>
      <select v-model="formData.status" class="select select-bordered w-full">
        <option :value="true">启用</option>
        <option :value="false">停用</option>
      </select>
    </div>

    <div class="form-control mb-4">
      <label class="label">
        <div class="flex items-center gap-2">
          <span class="text-xl">👤</span>
          <span class="label-text font-medium">班长ID</span>
        </div>
      </label>
      <div class="flex gap-2">
        <input
          :value="selectedMonitorName"
          type="text"
          class="input input-bordered flex-grow"
          placeholder="请选择班长"
          readonly
        />
        <button
          type="button"
          class="btn btn-outline"
          @click="$emit('select-monitor')"
        >
          选择班长
        </button>
      </div>
      <div v-if="selectedMonitorName" class="mt-2 text-sm text-info">
        已选择: {{ selectedMonitorName }}
      </div>
    </div>

    <div class="modal-action mt-6 flex justify-end">
      <button type="button" class="btn btn-ghost" @click="$emit('cancel')">
        取消
      </button>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        保存修改
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  courseData: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  selectedMonitorName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit', 'cancel', 'select-monitor'])

const formData = ref({
  courseId: '',
  className: '',
  description: '',
  monitorId: '',
  status: true,
  coursePassword: '',
})

// 监听courseData变化，更新表单数据
watch(
  () => props.courseData,
  newValue => {
    if (newValue) {
      formData.value = { ...newValue }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', formData.value)
}
</script>
