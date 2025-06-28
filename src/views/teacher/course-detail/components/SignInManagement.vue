<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold">签到管理</h2>
      <button class="btn btn-primary" @click="showCreateSignInModal = true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        发布签到
      </button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="flex justify-center py-12">
      <DgLoadingText text="正在加载签到数据..." />
    </div>

    <!-- 签到列表 -->
    <div v-else-if="signInList.length === 0" class="text-center py-12">
      <div class="text-4xl mb-4">📝</div>
      <p class="text-base-content/70">暂无签到记录，点击上方按钮发布新签到</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(item, index) in signInList"
        :key="index"
        class="card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 animate__animated animate__fadeIn"
      >
        <div class="card-body">
          <div class="flex justify-between items-center">
            <h3 class="card-title">{{ item.title }}</h3>
            <GdTag :color="getStatusBadgeClass(item.status)">
              {{ getStatusText(item.status) }}
            </GdTag>
          </div>
          <p>开始时间: {{ formatDateTime(item.startTime) }}</p>
          <p>结束时间: {{ formatDateTime(item.endTime) }}</p>
          <div class="card-actions justify-end mt-2">
            <button
              class="btn btn-sm btn-outline"
              @click="viewSignInDetail(item)"
            >
              查看详情
            </button>
            <button
              class="btn btn-sm btn-primary"
              :disabled="item.status === 'ended'"
              @click="toggleSignInStatus(item)"
            >
              🔚 {{ item.status === 'active' ? '结束签到' : '开始签到' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建签到模态框 -->
    <dialog class="modal" :open="showCreateSignInModal">
      <div class="modal-box w-11/12 max-w-md">
        <h3 class="font-bold text-lg mb-4">发布新签到</h3>
        <CreateSignInForm
          :course-id="courseId"
          @close="showCreateSignInModal = false"
          @created="handleSignInCreated"
        />
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showCreateSignInModal = false">关闭</button>
      </form>
    </dialog>

    <!-- 确认停止签到模态框 -->
    <dialog class="modal" :open="showConfirmStopModal">
      <div class="modal-box w-11/12 max-w-md">
        <h3 class="font-bold text-lg mb-4">确认停止签到</h3>
        <p>您确定要停止当前签到吗？该操作不可撤销。</p>
        <p class="mt-2 text-sm text-base-content/70">
          停止签到后，学生将无法再进行签到。
        </p>
        <div class="modal-action mt-4 flex">
          <button class="btn btn-outline" @click="showConfirmStopModal = false">
            取消
          </button>
          <button
            class="btn btn-primary"
            :disabled="stopLoading"
            @click="confirmStopSignIn"
          >
            <span
              v-if="stopLoading"
              class="loading loading-spinner loading-sm mr-2"
            ></span>
            <span class="mr-1">✋</span>确认停止
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showConfirmStopModal = false">关闭</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import message from '@/plugin/message'
import CreateSignInForm from './CreateSignInForm.vue'
import { getSignInInfo, stopSignIn } from '@/api/courseApi.js'
import GdTag from '@/components/common/GdTag.vue'
import DgLoadingText from '@/components/common/GdLoadingText.vue'

const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true,
  },
})

// 状态
const showCreateSignInModal = ref(false)
const showConfirmStopModal = ref(false)
const signInList = ref([])
const loading = ref(false)
const stopLoading = ref(false)
const currentItem = ref(null) // 当前操作的签到项

// 获取签到列表数据
const fetchSignInList = async () => {
  loading.value = true
  try {
    const res = await getSignInInfo(props.courseId)
    if (res.code === 200 && res.data) {
      // 将API返回的数据格式转换为组件中使用的格式
      signInList.value = res.data.map(item => ({
        id: item.attendanceId,
        title: `${getTypeText(item.type)} 签到`,
        status: item.status ? 'active' : 'ended',
        startTime: item.createdAt,
        endTime: item.status
          ? new Date(new Date(item.createdAt).getTime() + 30 * 60 * 1000)
          : item.createdAt, // 假设签到持续30分钟
        type: item.type,
        createdBy: item.createdBy,
      }))
    }
  } catch (error) {
    console.error('获取签到列表失败:', error)
    message.error('获取签到列表失败')
  } finally {
    loading.value = false
  }
}

// 获取签到类型文本
const getTypeText = type => {
  switch (type) {
    case 'pin':
      return '验证码'
    case 'button':
      return '按钮'
    default:
      return '普通'
  }
}

// 查看签到详情
const viewSignInDetail = item => {
  console.log('查看签到详情', item)
  // 这里可以跳转到详情页或者打开详情模态框
}

// 切换签到状态
const toggleSignInStatus = item => {
  if (item.status === 'active') {
    // 如果是停止签到，显示确认对话框
    currentItem.value = item
    showConfirmStopModal.value = true
  } else if (item.status === 'pending') {
    // 如果是开始签到，直接开始（这部分逻辑可能需要调整）
    item.status = 'active'
    message.success('签到已开始')
  }
}

// 确认停止签到
const confirmStopSignIn = async () => {
  if (!currentItem.value) return

  stopLoading.value = true
  try {
    const res = await stopSignIn(currentItem.value.id)
    if (res.code === 200) {
      message.success('签到已成功结束')
      // 重新获取最新数据
      fetchSignInList()
    } else {
      message.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('停止签到失败:', error)
    message.error('停止签到失败')
  } finally {
    stopLoading.value = false
    showConfirmStopModal.value = false
    currentItem.value = null
  }
}

// 处理新建签到
const handleSignInCreated = newSignIn => {
  signInList.value.unshift(newSignIn)
  showCreateSignInModal.value = false
  message.success('签到创建成功')
  fetchSignInList() // 重新获取最新的签到列表
}

// 辅助函数
const getStatusBadgeClass = status => {
  switch (status) {
    case 'active':
      return 'success'
    case 'pending':
      return 'warning'
    case 'ended':
      return 'error'
    default:
      return 'info'
  }
}

const getStatusText = status => {
  switch (status) {
    case 'active':
      return '进行中'
    case 'pending':
      return '未开始'
    case 'ended':
      return '已结束'
    default:
      return '未知'
  }
}

const formatDateTime = date => {
  if (!date) return '未设置'
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchSignInList()
})
</script>
