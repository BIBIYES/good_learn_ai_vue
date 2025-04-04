<script setup>
import TitleBar from '@/components/common/TitleBar.vue'
import { School } from '@icon-park/vue-next'
import { onMounted, ref } from 'vue'
import { addCourse, getCourse } from '@/api/course'
import message from '@/plugin/message'
import CourseCard from '@/components/student/CourseCard.vue'
const courseId = ref('')

// 页面加载的loading

const loading = ref(true)

// 添加课程
const handleAddCouser = async () => {
  const res = await addCourse({
    courseId: courseId.value,
  })
  if (res.code == 200) {
    message.success(res.message)
  }
}

// 获取课程
const courses = ref([])

const handleGetCourse = async () => {
  const res = await getCourse()
  if (res.code == 200) {
    console.log(res.data)
    courses.value = res.data
    loading.value = false
  }
}
onMounted(() => {
  handleGetCourse()
})
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
    <div
      class="w-full h-screen flex justify-center items-center animate__animated animate__fadeIn"
      v-if="loading"
    >
      <span class="loading loading-spinner loading-xl"></span>
    </div>
    <!-- 课程 -->
    <div
      class="overflow-y-auto space-y-5 animate__animated animate__fadeIn"
      v-else
    >
      <CourseCard
        v-for="(item, index) in courses"
        v-bind:key="index"
        :courseInfo="item"
      ></CourseCard>
    </div>
  </div>
</template>
