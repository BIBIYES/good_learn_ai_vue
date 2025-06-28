<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/studentStores.js'

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
const navigateTo = path => {
  router.push(`/s/my-course/${route.params.courseId}/${path}`)
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 前往学分排行榜
const navigateToRanking = () => {
  router.push('/s/credit-ranking')
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

onMounted(() => {
  getCourseInfo()
})
</script>
<template>
  <div class="app flex flex-col gap-4 animate__animated animate__fadeInRight">
    <!-- 课程信息卡片 -->
    <div
      v-if="courseInfo"
      class="bg-base-100 overflow-hidden h-screen overflow-y-auto border border-base-200 rounded-xl"
    >
      <!-- 顶部彩色条 -->
      <div class="h-2 bg-gradient-to-r from-primary to-secondary" />
      <!-- 返回按钮和排行榜按钮区域 -->
      <div class="flex justify-between items-center p-3">
        <!-- 返回按钮 -->
        <button class="btn btn-sm btn-ghost gap-1" @click="goBack">
          <LineMdChevronLeftSquareTwotone />
          返回
        </button>
        <!-- 学分排行榜按钮 -->
        <button
          class="btn btn-sm btn-outline btn-primary gap-1"
          @click="navigateToRanking"
        >
          <IcBaselineRadioButtonChecked />
          学分排行榜
        </button>
      </div>
      <div class="p-5">
        <!-- 头部区域：标题和学分 -->
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
              <path
                d="M12 1v4M4 8l2.5 2.5M1 16h4M16 4l2.5 2.5M8 20l2.5-2.5M20 16h-4M16 20l-2.5-2.5M8 4L5.5 6.5M12 12l4.5 4.5M12 12l-4.5 4.5M12 12l4.5-4.5M12 12l-4.5-4.5"
              />
            </svg>
            <span class="font-medium text-primary">{{
              courseInfo.credits
            }}</span>
            <span class="text-xs text-base-content/70">学分</span>
          </div>
        </div>

        <!-- 教师信息 -->
        <div class="flex items-center mb-4">
          <div class="avatar mr-2">
            <div
              class="w-8 h-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1"
            >
              <img :src="getTeacherAvatar()" alt="Teacher" />
            </div>
          </div>
          <div>
            <span class="text-sm font-medium block">{{
              courseInfo.teacherName
            }}</span>
            <span class="text-xs text-base-content/60">讲师</span>
          </div>
        </div>

        <!-- 课程状态 -->
        <div class="flex items-center pb-3 mb-3 border-b border-base-200">
          <!-- 开启的状态 -->
          <div
            v-if="courseInfo.courseStatus"
            class="flex items-center space-x-3"
          >
            <div class="inline-grid *:[grid-area:1/1]">
              <div class="status status-success animate-ping" />
              <div class="status status-success" />
            </div>
            <p class="text-xs text-base-content/60">该课程正常开放</p>
          </div>
          <!-- 关闭的状态 -->
          <div v-else class="flex items-center space-x-3">
            <div class="inline-grid *:[grid-area:1/1]">
              <div class="status status-error animate-ping" />
              <div class="status status-error" />
            </div>
            <p class="text-xs text-base-content/60">该课程已被关闭</p>
          </div>
        </div>
      </div>

      <!-- 切换控件 -->
      <div class="px-4 mb-2">
        <ul class="menu bg-base-200 lg:menu-horizontal rounded-box w-full">
          <li class="flex-1">
            <a
              class="flex justify-center items-center gap-2"
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
          <li class="flex-1">
            <a
              class="flex justify-center items-center gap-2"
              :class="{ active: route.name === 'work' }"
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
        </ul>
      </div>

      <!-- 子路由视图 -->
      <div class="bg-base-100 p-4 rounded-box mx-4 mb-4 border border-base-200">
        <RouterView />
      </div>
    </div>
  </div>
</template>
