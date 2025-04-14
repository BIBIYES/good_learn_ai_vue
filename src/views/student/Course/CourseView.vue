<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/student'

const route = useRoute()
const router = useRouter()
const studentStore = useStudentStore()

// 获取当前课程信息
const courseInfo = ref(null)

const getCourseInfo = () => {
  courseInfo.value = studentStore.getStudentCourse(route.params.courseId)
  console.log(courseInfo.value)
}

// 导航到子路由
const navigateTo = (path) => {
  router.push(`/s/my-course/${route.params.courseId}/${path}`)
}

// 获取教师头像
const getTeacherAvatar = () => {
  if (courseInfo.value?.teacherAvatar) {
    return courseInfo.value.teacherAvatar
  } else if (
    courseInfo.value?.teacherEmail &&
    courseInfo.value.teacherEmail.includes('@qq.com')
  ) {
    const qqNumber = courseInfo.value.teacherEmail.split('@')[0]
    return `http://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=100`
  }
  return '/api/placeholder/24/24'
}

// 格式化日期
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  } catch (e) {
    console.log(e)
    return dateString
  }
}

onMounted(() => {
  getCourseInfo()
})

</script>
<template>
  <div class="app flex flex-col gap-4 p-4">
    <!-- 课程信息卡片 -->
    <div
      v-if="courseInfo"
      class="card bg-base-100 overflow-hidden border border-base-200 hover:shadow-lg transition-all duration-300 rounded-xl"
    >
      <!-- 顶部彩色条 -->
      <div class="h-2 bg-gradient-to-r from-primary to-secondary" />
      
      <div class="p-5">
        <!-- 头部区域：标题和状态 -->
        <div class="flex justify-between items-center mb-4">
          <!-- 左侧标题 -->
          <div class="flex items-center gap-3">
            <!-- 课程首字母图标 -->
            <div
              class="bg-primary/10 w-12 h-12 rounded-lg flex justify-center items-center text-primary text-2xl font-bold"
            >
              {{ courseInfo.className.charAt(0) }}
            </div>

            <h2 class="text-xl font-bold text-base-content">
              {{ courseInfo.className }}
            </h2>
          </div>

          <!-- 右侧学分 -->
          <div
            class="flex items-center gap-1 bg-base-100 px-3 py-1.5 rounded-full shadow-sm border border-base-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 1v4M4 8l2.5 2.5M1 16h4M16 4l2.5 2.5M8 20l2.5-2.5M20 16h-4M16 20l-2.5-2.5M8 4L5.5 6.5M12 12l4.5 4.5M12 12l-4.5 4.5M12 12l4.5-4.5M12 12l-4.5-4.5" />
            </svg>
            <span class="font-medium text-primary">{{ courseInfo.credits }}</span>
            <span class="text-xs text-base-content/70">学分</span>
          </div>
        </div>

        <!-- 课程描述 -->
        <p
          v-if="courseInfo.description"
          class="text-base-content/70 mb-4 line-clamp-2"
        >
          {{ courseInfo.description }}
        </p>
        
        <!-- 教师信息和成员数量 -->
        <div class="flex items-center justify-between mb-3">
          <!-- 教师信息 -->
          <div class="flex items-center gap-2">
            <div class="avatar">
              <div class="w-8 h-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                <img
                  :src="getTeacherAvatar()"
                  alt="Teacher"
                >
              </div>
            </div>
            <div>
              <span class="text-sm font-medium block">{{ courseInfo.teacherName }}</span>
              <span class="text-xs text-base-content/60">讲师</span>
            </div>
          </div>

          <!-- 成员数量 -->
          <div class="badge badge-primary badge-outline gap-1 px-3 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle
                cx="9"
                cy="7"
                r="4"
              />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{{ courseInfo.memberCount }}</span>
            <span class="text-xs">学员</span>
          </div>
        </div>
        
        <!-- 底部状态栏 -->
        <div class="flex justify-between items-center pt-3 border-t border-base-200">
          <!-- 课程状态 -->
          <div class="flex items-center gap-2">
            <!-- 开启的状态 -->
            <div
              v-if="courseInfo.courseStatus"
              class="flex items-center space-x-3"
            >
              <div class="inline-grid *:[grid-area:1/1]">
                <div class="status status-success animate-ping" />
                <div class="status status-success" />
              </div>
              <p class="text-xs text-base-content/60">
                该课程正常开放
              </p>
            </div>
            <!-- 关闭的状态 -->
            <div
              v-else
              class="flex items-center space-x-3"
            >
              <div class="inline-grid *:[grid-area:1/1]">
                <div class="status status-error animate-ping" />
                <div class="status status-error" />
              </div>
              <p class="text-xs text-base-content/60">
                该课程已被关闭
              </p>
            </div>
          </div>

          <!-- 加入时间 -->
          <span class="text-xs text-base-content/60">加入时间: {{ formatDate(courseInfo.joinTime) }}</span>
        </div>
      </div>
      <!-- 切换控件 -->
      <div>
        <ul class="menu bg-base-200 lg:menu-horizontal rounded-box">
          <li>
            <a
              class="flex items-center gap-2"
              :class="{ 'menu-active': route.name === 'sign-in' }"
              @click="navigateTo('sign-in')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              签到
            </a>
          </li>
          <li>
            <a
              class="flex items-center gap-2"
              @click="navigateTo('work')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              作业
            </a>
          </li>
        <!-- 可以根据需要添加更多子路由 -->
        </ul>
      </div>

      <!-- 子路由视图 -->
      <div class="bg-base-100 p-4 rounded-box shadow-sm">
        <RouterView />
      </div>
    </div>
  </div>
</template>