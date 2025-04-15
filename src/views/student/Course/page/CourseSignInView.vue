<script setup>

import { useRoute } from 'vue-router'
import { getSign, sign } from '@/api/course'
import { formatDateObject } from '@/utils/dataFormat'
import message from '@/plugin/message'
import { CheckOne } from '@icon-park/vue-next'
import PinInput from '@/components/common/PinInput.vue'

const route = useRoute()
// 签到数据
const signInList = ref([])
const loading = ref(false)

// 签到弹窗相关
const isModalOpen = ref(false)
const currentAttendance = ref(null)
const pinCode = ref('')
const signingIn = ref(false)
const pinInputRef = ref(null)
const errorLoading = ref(false)

// 获取课程签到信息
const handleGetSign = async () => {    
  loading.value = true
  try {
    const res = await getSign(route.params.courseId)
    // 对获取的数据按照attendanceId降序排序
    signInList.value = res.data.sort((a, b) => b.attendanceId - a.attendanceId)
  } catch (err) {
    console.error('获取签到信息失败:', err)
  } finally {
    loading.value = false
  }
}

// 获取序号 (从1开始计数)
const getSerialNumber = (index) => {
  return signInList.value.length - index
}

// 打开签到弹窗的方法
const openSignModal = (attendance) => {
  // 查找对应的签到记录
  const attendanceItem = signInList.value.find(item => item.attendanceId === attendance)
  if (attendanceItem) {
    currentAttendance.value = attendanceItem
    pinCode.value = ''
    isModalOpen.value = true
  }
}

// 关闭弹窗
const closeModal = () => {
  isModalOpen.value = false
  currentAttendance.value = null
  pinCode.value = ''
  errorLoading.value = false // 重置错误状态
  // 重置PIN输入组件
  if (pinInputRef.value) {
    pinInputRef.value.clear()
  }
}

// 处理PIN码输入更新
const handlePinUpdate = (value) => {
  pinCode.value = value
  // 当用户开始输入时，重置错误状态
  errorLoading.value = false
}

// 处理PIN码输入完成
const handlePinComplete = (value) => {
  pinCode.value = value
  // 可以选择自动提交
  // submitSignIn()
}

// 提交签到
const submitSignIn = async () => {
  if (!currentAttendance.value) return
  
  signingIn.value = true
  try {
    const payload = {
      attendanceId: currentAttendance.value.attendanceId
    }
    
    // 如果是PIN码签到，需要添加pinCode
    if (currentAttendance.value.type === 'pin') {
      if (!pinCode.value || pinCode.value.length !== 4) {
        // 先设置为false再设置为true，触发动画重新播放
        errorLoading.value = false
        // 使用nextTick确保DOM更新后再触发动画
        nextTick(() => {
          errorLoading.value = true
        })
        message.error('请输入4位签到码')
        signingIn.value = false
        return
      }
      payload.pinCode = pinCode.value
    }
    
    const res = await sign(payload)
    if (res.code === 200) {
      message.success('签到成功')
      closeModal()
      // 刷新签到列表
      handleGetSign()
    } else {
      // 处理错误响应，特别是PIN码错误
      if (res.code === 500 && res.message === 'PIN码错误') {
        // 触发错误动画
        errorLoading.value = false
        nextTick(() => {
          errorLoading.value = true
        })
      }
      message.error(res.message || '签到失败')
    }
  } catch (err) {
    message.error(err.message || '签到失败')
  } finally {
    signingIn.value = false
  }
}

onMounted(() => {
  handleGetSign()
})
</script>

<template>
  <div class="app p-4 ">
    <h2 class="text-2xl font-bold mb-6">
      课程签到
    </h2>
    
    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="flex justify-center items-center h-40"
    >
      <span class="loading loading-spinner loading-lg text-primary" />
    </div>
    
    <!-- 空状态 -->
    <div
      v-else-if="signInList.length === 0"
      class="card"
    >
      <div class="card-body text-center">
        <h3 class="text-lg font-medium">
          暂无签到记录
        </h3>
        <p class="text-base-content/70">
          当前课程还没有发起过签到
        </p>
      </div>
    </div>
    
    <!-- 签到列表 -->
    <div
      v-else
      class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <div 
        v-for="(item, index) in signInList" 
        :key="item.attendanceId" 
        class="card bg-base-100 shadow-md"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <h3 class="card-title text-lg">
              签到 #{{ getSerialNumber(index) }}
              <div class="badge badge-outline">
                {{ item.type === 'button' ? '按钮签到' : 'pin码签到' }}
              </div>
            </h3>
            
            <!-- 状态指示器 -->
            <div class="flex items-center">
              <div
                v-if="item.status"
                class="flex items-center gap-2 text-success"
              >
                <div class="w-2 h-2 bg-success rounded-full" />
                <span class="text-sm">进行中</span>
              </div>
              <div
                v-else
                class="flex items-center gap-2 text-error"
              >
                <div class="w-2 h-2 bg-error rounded-full" />
                <span class="text-sm">已结束</span>
              </div>
            </div>
          </div>
          
          <div class="text-sm text-base-content/70 mt-2">
            <div class="flex flex-col gap-1">
              <p>创建时间: {{ formatDateObject(item.createdAt).dateTime }} {{ formatDateObject(item.createdAt).weekDay }}</p>
              <p v-if="item.pinCode">
                签到码: {{ item.pinCode }}
              </p>
            </div>
          </div>
          
          <div class="card-actions justify-end mt-4">
            <button 
              class="btn btn-success btn-sm text-white"
              :disabled="!item.status"
              @click="openSignModal(item.attendanceId)"
            >
              {{ item.status ? '签到' : '已结束' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 签到弹窗 -->
    <dialog :class="{'modal': true, 'modal-open': isModalOpen}">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">
          课程签到
        </h3>
        
        <div
          v-if="currentAttendance"
          class="py-4"
        >
          <!-- PIN码签到 -->
          <div
            v-if="currentAttendance.type === 'pin'"
            class="form-control w-full"
          >
            <label class="label">
              <span class="label-text">请输入4位签到码</span>
            </label>
            <PinInput
              ref="pinInputRef"
              :length="4"
              :auto-focus="true"
              :disabled="signingIn"
              class="animate__animated animate__faster"
              :class="{'animate__shakeX': errorLoading}"
              @update:model-value="handlePinUpdate"
              @complete="handlePinComplete"
            />
          </div>
          
          <!-- 按钮签到 -->
          <div
            v-else
            class="text-center py-4"
          >
            <p class="mb-4 flex items-center justify-center gap-2">
              <CheckOne
                theme="outline"
                size="20"
              />
              点击下方按钮完成签到
            </p>
          </div>
        </div>
        
        <div class="modal-action">
          <button
            class="btn btn-ghost"
            @click="closeModal"
          >
            取消
          </button>
          <button 
            class="btn btn-primary" 
            :disabled="signingIn"
            @click="submitSignIn"
          >
            <span
              v-if="signingIn"
              class="loading loading-spinner"
            />
            确认签到
          </button>
        </div>
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
        @click="closeModal"
      >
        <button>关闭</button>
      </form>
    </dialog>
  </div>
</template>
