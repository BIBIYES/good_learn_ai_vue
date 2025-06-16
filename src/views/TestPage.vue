<template>
  <div>
    <StudentList :course-id="courseId" />
  </div>
</template>

<script setup>
import StudentList from '@/components/common/StudentList.vue'

const courseId = 1000000
</script>
