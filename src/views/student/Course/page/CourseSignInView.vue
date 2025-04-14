<script setup>
import { getSign } from '@/api/course'
import { formatDateObject } from '@/utils/dataFormat'
const route = useRoute()
// 签到数据
const signInList = ref([])
const loading = ref(true)
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
const openSignModal = (attendanceId) => {
  // 这里可以添加打开弹窗的逻辑
  console.log('打开签到弹窗，签到ID:', attendanceId)
}

onMounted(() => {
  handleGetSign()
})
</script>

<template>
  <div class="app p-4">
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
      class="card bg-base-200 shadow-xl"
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
        class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <h3 class="card-title text-lg">
              签到 #{{ getSerialNumber(index) }}
              <div class="badge badge-outline">
                {{ item.type === 'button' ? '按钮签到' : '二维码签到' }}
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
              @click="openSignModal(item.attendanceId)"
            >
              签到
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
