<template>
  <div
    class="course-card-container"
    @click="
      router.push({
        name: 'student-course-detail-detail',
        params: { courseId: String(courseInfo.courseId) },
      })
    "
  >
    <div
      class="hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden border border-base-200 cursor-pointer"
    >
      <!-- 顶部彩色条 -->
      <div class="h-2 bg-gradient-to-r from-primary to-secondary" />

      <div class="p-5">
        <!-- 头部区域：标题和学分 -->
        <div class="flex justify-between items-center mb-4">
          <!-- 左侧标题 -->
          <div class="flex items-center gap-3">
            <!-- 课程首字母图标 -->
            <div
              class="bg-primary/10 w-12 h-12 rounded-lg flex justify-center items-center text-primary text-2xl font-bold"
            >
              {{ firstChar }}
            </div>

            <h3
              class="text-lg font-bold text-base-content truncate max-w-[180px]"
            >
              {{ title }}
            </h3>
          </div>

          <!-- 右侧学分 -->
          <div
            class="flex items-center gap-1 bg-base-100 px-3 py-1.5 rounded-full shadow-sm border border-base-200"
          >
            <Trophy theme="outline" size="16" class="text-primary" />
            <span class="font-medium text-primary">{{ credits }}</span>
            <span class="text-xs text-base-content/70">学分</span>
          </div>
        </div>

        <!-- 教师信息和成员数量 -->
        <div class="flex items-center justify-between mb-3">
          <!-- 教师信息 -->
          <div class="flex items-center gap-2">
            <div class="avatar">
              <div
                class="w-8 h-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1"
              >
                <img
                  :src="teacherAvatar || '/api/placeholder/24/24'"
                  alt="Teacher"
                />
              </div>
            </div>
            <div>
              <span class="text-sm font-medium block">{{ teacherName }}</span>
              <span class="text-xs text-base-content/60">讲师</span>
            </div>
          </div>

          <!-- 成员数量 -->
          <div class="badge badge-primary badge-outline gap-1 px-3 py-3">
            <Peoples theme="outline" size="14" />
            <span>{{ memberCount }}</span>
            <span class="text-xs">学员</span>
          </div>
        </div>

        <!-- 底部状态栏 -->
        <div
          class="flex justify-between items-center pt-3 border-t border-base-200"
        >
          <!-- 课程状态 -->
          <div class="flex items-center gap-2">
            <!-- 开启的状态 -->
            <div v-if="status === 1" class="flex items-center space-x-3">
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

          <!-- 加入时间 -->
          <span class="text-xs text-base-content/60"
            >加入时间: {{ formatDate(joinTime) }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const props = defineProps({
  courseInfo: {
    type: Object,
    required: true,
  },
})

const firstChar = computed(() => props.courseInfo.className.charAt(0))
const title = computed(() => props.courseInfo.className)
const teacherName = computed(() => props.courseInfo.teacherName)
const teacherAvatar = computed(() => {
  if (props.courseInfo.teacherAvatar) {
    return props.courseInfo.teacherAvatar
  } else if (
    props.courseInfo.teacherEmail &&
    props.courseInfo.teacherEmail.includes('@qq.com')
  ) {
    const qqNumber = props.courseInfo.teacherEmail.split('@')[0]
    return `http://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=100`
  }
  return null
})
const memberCount = computed(() => props.courseInfo.memberCount)
const credits = computed(() => props.courseInfo.credits)
const joinTime = computed(() => props.courseInfo.joinTime)
const status = computed(() => (props.courseInfo.courseStatus ? 1 : 0))

const formatDate = dateString => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  } catch (e) {
    console.log(e)
    return dateString
  }
}
</script>

<style scoped></style>
