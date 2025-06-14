<template>
  <div class="flex flex-col h-full p-4">
    <!-- 页面标题和课程信息 -->
    <TitleBar>
      <template #title>
        <div class="flex items-center gap-2">
          <div
            class="bg-primary text-primary-content w-10 h-10 rounded-lg flex justify-center items-center text-xl font-bold"
          >
            {{ courseInfo.className ? courseInfo.className.charAt(0) : 'C' }}
          </div>
          <span>{{ courseInfo.className || '课程详情' }}</span>
        </div>
      </template>
      <template #module>
        <div class="flex items-center gap-2">
          <span class="text-sm text-base-content/70"
            >课程ID: {{ courseId }}</span
          >
          <div class="tabs tabs-boxed bg-base-200">
            <a
              class="tab"
              :class="{ 'tab-active': activeTab === 'sign-in' }"
              @click="activeTab = 'sign-in'"
            >
              签到管理
            </a>
            <a
              class="tab"
              :class="{ 'tab-active': activeTab === 'homework' }"
              @click="activeTab = 'homework'"
            >
              作业管理
            </a>
          </div>
        </div>
      </template>
    </TitleBar>

    <!-- 主内容区域 -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      <!-- 加载状态 -->
      <div
        v-if="loading"
        class="w-full h-full flex justify-center items-center"
      >
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <!-- 签到管理 -->
      <div v-else-if="activeTab === 'sign-in'" class="w-full">
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

        <!-- 签到列表 -->
        <div v-if="signInList.length === 0" class="text-center py-12">
          <div class="text-4xl mb-4">📝</div>
          <p class="text-base-content/70">
            暂无签到记录，点击上方按钮发布新签到
          </p>
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div
            v-for="(item, index) in signInList"
            :key="index"
            class="card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <div class="card-body">
              <div class="flex justify-between items-center">
                <h3 class="card-title">{{ item.title }}</h3>
                <div class="badge" :class="getStatusBadgeClass(item.status)">
                  {{ getStatusText(item.status) }}
                </div>
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
                  {{ item.status === 'active' ? '结束签到' : '开始签到' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 作业管理 -->
      <div v-else-if="activeTab === 'homework'" class="w-full">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">作业管理</h2>
          <button class="btn btn-primary" disabled>
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
            发布作业
          </button>
        </div>

        <!-- 占位内容 -->
        <div class="text-center py-12">
          <div class="text-4xl mb-4">📚</div>
          <p class="text-base-content/70">作业管理功能正在开发中...</p>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getCourseDetail } from '@/api/course'
import message from '@/plugin/message'
import CreateSignInForm from './components/CreateSignInForm.vue'

const route = useRoute()
const courseId = computed(() => route.params.courseId)

// 页面状态
const loading = ref(true)
const activeTab = ref('sign-in') // 默认显示签到管理
const showCreateSignInModal = ref(false)

// 课程信息
const courseInfo = ref({})
const signInList = ref([])

// 获取课程详情
const fetchCourseDetail = async () => {
  loading.value = true
  try {
    const res = await getCourseDetail(courseId.value)
    if (res.code === 200) {
      courseInfo.value = res.data
    }
  } catch (error) {
    message.error('获取课程信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 模拟数据 - 实际项目中应该从API获取
const fetchSignInList = async () => {
  // 这里应该调用实际的API
  // 目前使用模拟数据
  signInList.value = [
    {
      id: 1,
      title: '第一周课堂签到',
      status: 'ended', // active, pending, ended
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      participantCount: 42,
      totalCount: 50,
    },
    {
      id: 2,
      title: '第二周课堂签到',
      status: 'active',
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      participantCount: 35,
      totalCount: 50,
    },
  ]
}

// 查看签到详情
const viewSignInDetail = item => {
  console.log('查看签到详情', item)
  // 这里可以跳转到详情页或者打开详情模态框
}

// 切换签到状态
const toggleSignInStatus = item => {
  console.log('切换签到状态', item)
  // 实际项目中应该调用API
  if (item.status === 'active') {
    item.status = 'ended'
    message.success('签到已结束')
  } else if (item.status === 'pending') {
    item.status = 'active'
    message.success('签到已开始')
  }
}

// 处理新建签到
const handleSignInCreated = newSignIn => {
  signInList.value.unshift(newSignIn)
  showCreateSignInModal.value = false
  message.success('签到创建成功')
}

// 辅助函数
const getStatusBadgeClass = status => {
  switch (status) {
    case 'active':
      return 'badge-success'
    case 'pending':
      return 'badge-warning'
    case 'ended':
      return 'badge-ghost'
    default:
      return 'badge-info'
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
  fetchCourseDetail()
  fetchSignInList()
})
</script>

<style>
/* 使用普通CSS替代@apply指令 */
.tabs-boxed .tab-active {
  background-color: hsl(var(--p));
  color: hsl(var(--pc));
}
</style>
