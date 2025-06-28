<template>
  <form @submit.prevent="handleSubmit">
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
        <option value="pin">验证码签到</option>
        <option value="button">按钮签到</option>
      </select>
    </div>

    <!-- 签到码选项 -->
    <div v-if="formData.type === 'pin'" class="form-control mb-3">
      <label class="label">
        <span class="label-text">验证码<span class="text-error">*</span></span>
        <span class="label-text-alt">
          <button
            type="button"
            class="btn btn-link btn-xs btn-ghost"
            @click="generateRandomCode"
          >
            随机生成
          </button>
        </span>
      </label>
      <input
        v-model="formData.pinCode"
        type="text"
        placeholder="例如：1234"
        class="input input-bordered w-full"
        required
        maxlength="4"
        pattern="[0-9]*"
        inputmode="numeric"
      />
      <label class="label">
        <span class="label-text-alt text-base-content/50 text-sm"
          >请输入4位数字验证码</span
        >
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
import { initiateSignIn } from '@/api/courseApi.js'

const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['close', 'created'])

// 表单数据
const formData = reactive({
  type: 'pin',
  pinCode: '',
})

const isSubmitting = ref(false)

// 生成随机签到验证码
const generateRandomCode = () => {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * 10)
  }
  formData.pinCode = code
}

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  if (
    formData.type === 'pin' &&
    (!formData.pinCode || formData.pinCode.length !== 4)
  ) {
    message.error('请输入4位数字验证码')
    return
  }

  isSubmitting.value = true

  try {
    // 调用API创建签到
    const payload = {
      courseId: props.courseId,
      type: formData.type,
    }

    // 如果是验证码签到，添加验证码
    if (formData.type === 'pin') {
      payload.pinCode = formData.pinCode
    }

    const res = await initiateSignIn(payload)

    if (res.code === 200) {
      message.success('签到创建成功')
      emit('created', {
        ...res.data,
        title: `${formData.type === 'pin' ? '验证码' : '按钮'}签到`,
        status: 'active',
      })
      emit('close')
    } else {
      message.error(res.message || '创建签到失败')
    }
  } catch (error) {
    message.error('创建签到失败')
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
