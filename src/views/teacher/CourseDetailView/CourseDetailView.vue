<template>
  <div class="flex flex-col h-full p-4">
    <!-- 页面标题 -->
    <TitleBar>
      <template #title>
        <div class="flex items-center gap-2">
          <div
            class="btn bg-primary text-primary-content w-10 h-10 rounded-lg flex justify-center items-center text-xl font-bold cursor-pointer hover:bg-primary-focus"
            @click="router.go(-1)"
          >
            {{ courseInfo.className ? courseInfo.className.charAt(0) : 'C' }}
          </div>
          <span>{{ courseInfo.className || '课程详情' }}</span>
        </div>
      </template>
      <template #module>
        <div class="flex items-center gap-2">
          <!-- 移除此处的课程ID显示 -->
        </div>
      </template>
    </TitleBar>
    <!-- 主内容区域 -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- 加载状态 -->
      <div
        v-if="loading"
        class="w-full h-full flex flex-col justify-center items-center"
      >
        <DgLoadingText text="正在获取课程信息...."></DgLoadingText>
      </div>

      <div v-else class="flex flex-col gap-6 animate__animated animate__fadeIn">
        <!-- 顶部卡片带视频背景 -->
        <div class="relative rounded-2xl overflow-hidden">
          <!-- 视频背景 -->
          <video
            class="absolute top-0 left-0 w-full h-full object-cover"
            autoplay
            loop
            muted
            playsinline
          >
            <source
              src="../../../assets/videos/banner-bg.mp4"
              type="video/mp4"
            />
          </video>

          <!-- 遮罩层 -->
          <div
            class="absolute top-0 left-0 w-full h-full bg-base-100/80 backdrop-blur-xl"
          ></div>

          <!-- 卡片内容 -->
          <div class="card-body relative z-10 p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-base-content">🪪 课程ID:</span>
                  <span class="text-base-content">{{ courseId }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-base-content"
                    >📝 课程描述:</span
                  >
                  <span class="text-base-content">{{
                    courseInfo.description || '暂无描述'
                  }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-base-content"
                    >🚦 课程状态:</span
                  >
                  <GdTag :color="courseInfo.status ? 'primary' : 'error'">
                    {{ courseInfo.status ? '已启用' : '已停用' }}
                  </GdTag>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-base-content"
                    >🔑 课程密码:</span
                  >
                  <div class="flex items-center gap-2">
                    <span class="text-base-content">{{
                      showPassword
                        ? courseInfo.coursePassword || '无'
                        : '••••••'
                    }}</span>
                    <button
                      class="btn btn-xs btn-ghost btn-circle"
                      @click="showPassword = !showPassword"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          :d="
                            showPassword
                              ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                              : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                          "
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-base-content"
                    >📅 创建时间:</span
                  >
                  <span class="text-base-content">{{
                    formatDateTime(courseInfo.createdAt)
                  }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-base-content"
                    >🔄 最后更新:</span
                  >
                  <span class="text-base-content">{{
                    formatDateTime(courseInfo.updatedAt)
                  }}</span>
                </div>

                <div class="flex items-center gap-2">
                  <span class="font-medium text-base-content">👤 班长ID:</span>
                  <span class="text-base-content">{{
                    courseInfo.monitorId || '未设置'
                  }}</span>
                  <button
                    class="btn btn-xs btn-circle btn-ghost"
                    title="设置班长"
                    disabled
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-base-content"
                    >👥 学生人数:</span
                  >
                  <span class="text-base-content"
                    >{{ courseInfo.totalStudents || 0 }} 人</span
                  >
                  <LoadingState v-if="avatarLoading" />
                  <div>
                    <GdStack
                      :course-student-list="courseStudentList"
                      size="5"
                      spacing="3"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div role="tablist" class="tabs tabs-box">
          <a
            role="tab"
            class="tab"
            :class="{ 'tab-active': activeTab === 'sign-in' }"
            @click="activeTab = 'sign-in'"
          >
            签到管理
          </a>
          <a
            role="tab"
            class="tab"
            :class="{ 'tab-active': activeTab === 'homework' }"
            @click="activeTab = 'homework'"
          >
            作业管理
          </a>
        </div>

        <!-- 动态组件区域 -->
        <transition name="fade" mode="out-in">
          <component
            :is="currentTabComponent"
            :key="activeTab"
            :course-id="courseId"
          />
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCourseDetail, getCourseList } from '@/api/course'
import message from '@/plugin/message'
import GdTag from '@/components/common/GdTag.vue'
import SignInManagement from './components/SignInManagement.vue'
import HomeworkManagement from './components/HomeworkManagement.vue'
import GdStack from '@/components/common/GdStack.vue'
import DgLoadingText from '@/components/common/GdLoadingText.vue'
import LoadingState from '@/components/common/LoadingState.vue'

const avatarLoading = ref(true)
const route = useRoute()
const router = useRouter()
const courseId = computed(() => route.params.courseId)

// 页面状态
const loading = ref(true)
const activeTab = ref('sign-in') // 默认显示签到管理
const showPassword = ref(false) // 密码显示控制

// 课程信息
const courseInfo = ref({})
const courseStudentList = ref([]) // 课程学生列表

// 当前组件
const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'sign-in':
      return SignInManagement
    case 'homework':
      return HomeworkManagement
    default:
      return SignInManagement
  }
})

// 获取课程详情
const fetchCourseDetail = async () => {
  loading.value = true
  try {
    const res = await getCourseDetail({ courseId: courseId.value })
    if (res.code === 200 && res.data && res.data.length > 0) {
      courseInfo.value = res.data[0] // 获取数组中的第一个课程
    }
  } catch (error) {
    message.error('获取课程信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 获取学生列表
const fetchStudentList = async () => {
  try {
    const res = await getCourseList(courseId.value)
    if (res.code === 200 && res.data) {
      courseStudentList.value = res.data
      avatarLoading.value = false
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
  }
}

// 日期时间格式化
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
  fetchStudentList()
})
</script>

<style>
/* 使用普通CSS替代@apply指令 */
.tabs-boxed .tab-active {
  background-color: hsl(var(--p));
  color: hsl(var(--pc));
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
