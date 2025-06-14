<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-control mb-3">
      <label class="label">
        <span class="label-text"
          >签到标题<span class="text-error">*</span></span
        >
      </label>
      <input
        v-model="formData.title"
        type="text"
        placeholder="例如：第三周课堂签到"
        class="input input-bordered w-full"
        required
      />
    </div>

    <div class="form-control mb-3">
      <label class="label">
        <span class="label-text"
          >签到类型<span class="text-error">*</span></span
        >
      </label>
      <select
        v-model="formData.type"
        class="select select-bordered w-full"
        required
      >
        <option value="normal">常规签到</option>
        <option value="location">位置签到</option>
        <option value="code">签到码</option>
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
      <div class="form-control">
        <label class="label">
          <span class="label-text"
            >开始时间<span class="text-error">*</span></span
          >
        </label>
        <input
          v-model="formData.startTime"
          type="datetime-local"
          class="input input-bordered w-full"
          required
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text"
            >结束时间<span class="text-error">*</span></span
          >
        </label>
        <input
          v-model="formData.endTime"
          type="datetime-local"
          class="input input-bordered w-full"
          required
        />
      </div>
    </div>

    <!-- 位置签到的额外选项 -->
    <div v-if="formData.type === 'location'" class="form-control mb-3">
      <label class="label">
        <span class="label-text"
          >有效签到范围（米）<span class="text-error">*</span></span
        >
      </label>
      <input
        v-model.number="formData.locationRadius"
        type="number"
        min="50"
        max="1000"
        step="50"
        placeholder="有效范围（米）"
        class="input input-bordered w-full"
        required
      />
    </div>

    <!-- 签到码的额外选项 -->
    <div v-if="formData.type === 'code'" class="form-control mb-3">
      <label class="label">
        <span class="label-text">签到码<span class="text-error">*</span></span>
        <span class="label-text-alt">
          <button
            type="button"
            class="btn btn-xs btn-ghost"
            @click="generateRandomCode"
          >
            随机生成
          </button>
        </span>
      </label>
      <input
        v-model="formData.signInCode"
        type="text"
        placeholder="例如：ABC123"
        class="input input-bordered w-full"
        required
      />
    </div>

    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text">签到说明</span>
      </label>
      <textarea
        v-model="formData.description"
        class="textarea textarea-bordered h-24"
        placeholder="可选，添加签到的详细说明或要求"
      ></textarea>
    </div>

    <div class="form-control mb-3">
      <label class="label cursor-pointer justify-start gap-2">
        <input
          v-model="formData.startNow"
          type="checkbox"
          class="checkbox checkbox-primary"
        />
        <span class="label-text">立即开始签到</span>
      </label>
    </div>

    <div class="flex justify-end gap-2 mt-6">
      <button type="button" class="btn btn-ghost" @click="$emit('close')">
        取消
      </button>
      <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
        <span
          v-if="isSubmitting"
          class="loading loading-spinner loading-sm"
        ></span>
        发布签到
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import message from '@/plugin/message'

defineProps({
  courseId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close', 'created'])

// 表单数据
const formData = reactive({
  title: '',
  type: 'normal',
  startTime: formatDateTimeForInput(new Date()),
  endTime: formatDateTimeForInput(new Date(Date.now() + 2 * 60 * 60 * 1000)), // 默认2小时后结束
  description: '',
  locationRadius: 200,
  signInCode: '',
  startNow: true,
})

const isSubmitting = ref(false)

// 生成随机签到码
const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  formData.signInCode = code
}

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  if (!formData.title) {
    message.error('请输入签到标题')
    return
  }

  if (!formData.startTime || !formData.endTime) {
    message.error('请设置开始和结束时间')
    return
  }

  if (new Date(formData.endTime) <= new Date(formData.startTime)) {
    message.error('结束时间必须晚于开始时间')
    return
  }

  if (
    formData.type === 'location' &&
    (!formData.locationRadius || formData.locationRadius < 50)
  ) {
    message.error('请设置有效的位置签到范围')
    return
  }

  if (formData.type === 'code' && !formData.signInCode) {
    message.error('请设置签到码')
    return
  }

  isSubmitting.value = true

  try {
    // 实际项目中这里应该调用API
    // const res = await createSignIn({
    //   courseId: props.courseId,
    //   ...formData
    // })

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 构建返回数据
    const newSignIn = {
      id: Date.now(), // 模拟ID
      title: formData.title,
      status: formData.startNow ? 'active' : 'pending',
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      description: formData.description,
      type: formData.type,
      participantCount: 0,
      totalCount: 50, // 假设班级总人数
    }

    // 根据类型添加特定字段
    if (formData.type === 'location') {
      newSignIn.locationRadius = formData.locationRadius
    } else if (formData.type === 'code') {
      newSignIn.signInCode = formData.signInCode
    }

    // 通知父组件
    emit('created', newSignIn)
  } catch (error) {
    message.error('创建签到失败')
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}

// 辅助函数 - 格式化日期时间为input[type=datetime-local]可用的格式
function formatDateTimeForInput(date) {
  if (!date) return ''

  const d = new Date(date)
  // 格式化为 YYYY-MM-DDTHH:MM
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
</script>
