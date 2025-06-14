<template>
  <div class="w-auto inline-flex">
    <div class="avatar-group" :class="spacingClass">
      <div
        v-for="student in displayStudents"
        :key="student.userId"
        :title="student.username"
        class="avatar"
      >
        <div :class="`w-${size}`">
          <img :src="getStudentAvatar(student)" alt="学生头像" />
        </div>
      </div>
      <!-- 如果学生数量超过4个，显示剩余人数 -->
      <div v-if="remainingCount > 0" class="avatar avatar-placeholder">
        <div :class="`bg-neutral text-neutral-content w-${size}`">
          <span class="text-xs">+{{ remainingCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const MAX_DISPLAY = 4 // 最多显示4个头像

const props = defineProps({
  courseStudentList: {
    type: Array,
    default: () => [],
  },
  size: {
    type: [String, Number],
    default: '8', // 默认尺寸 w-8
  },
  spacing: {
    type: [String, Number],
    default: '5', // 默认间距 -space-x-5
  },
})

// 计算头像间距的类名
const spacingClass = computed(() => {
  return `-space-x-${props.spacing}`
})

// 计算要显示的学生
const displayStudents = computed(() => {
  return props.courseStudentList.slice(0, MAX_DISPLAY)
})

// 计算剩余的学生数量
const remainingCount = computed(() => {
  return Math.max(0, props.courseStudentList.length - MAX_DISPLAY)
})

// 获取学生头像
const getStudentAvatar = student => {
  if (student.avatar) {
    return student.avatar
  } else if (student.email && student.email.includes('@qq.com')) {
    const qqNumber = student.email.split('@')[0]
    return `http://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=100`
  } else {
    // 默认头像
    return 'https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg'
  }
}
</script>

<style lang="scss" scoped></style>
