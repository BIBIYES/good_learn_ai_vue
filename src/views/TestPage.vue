<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">课程学生列表</h1>
    <GdStack :course-student-list="courseStudentList" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import GdStack from '@/components/common/GdStack.vue'
import { getCourseList } from '@/api/course'

const courseId = 1000000
const courseStudentList = ref([])

const handleGetCourseList = async () => {
  try {
    const res = await getCourseList(courseId)
    if (res.code === 200 && res.data) {
      courseStudentList.value = res.data
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
  }
}

onMounted(() => {
  handleGetCourseList()
})
</script>

<style lang="scss" scoped></style>
