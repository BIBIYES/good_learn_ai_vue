<script setup>
import TitleBar from '@/components/common/TitleBar.vue'
import { School } from '@icon-park/vue-next'
import { ref } from 'vue'
import { addCourse } from '@/api/course'
import message from '@/plugin/message'
import CourseCard from '@/components/student/CourseCard.vue'
const courseId = ref('')

// 添加课程
const handleAddCouser = async () => {
  const res = await addCourse({
    courseId: courseId.value,
  })
  if (res.code == 200) {
    message.success(res.message)
  }
}
</script>
<template>
  <div class="app flex flex-col h-full p-4">
    <TitleBar>
      <template v-slot:title>
        <school theme="outline" size="38" />
        <span>我的课程</span>
      </template>
      <template v-slot:module>
        <div class="join">
          <div class="tooltip tooltip-bottom" data-tip="向老师索要课程编号">
            <input
              class="input input-bordered join-item w-full max-w-xs"
              placeholder="输入课程来加入课程"
              v-model="courseId"
            />
          </div>
          <button class="btn btn-primary join-item" @click="handleAddCouser()">
            加入课程
          </button>
        </div>
      </template>
    </TitleBar>
    <!-- 课程 -->
    <div class="overflow-y-auto">
      <CourseCard></CourseCard>
    </div>
  </div>
</template>
