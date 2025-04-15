<script setup>
import { School } from '@icon-park/vue-next'
import { addCourse, getCourse } from '@/api/course'
import message from '@/plugin/message'
import  { useStudentStore } from '@/stores/student' 
const studentStore = useStudentStore()
const courseId = ref('')

// 页面加载的loading

const loading = ref(true)
const addCourseLoading = ref(false)

// 添加课程
const handleAddCouser = async () => {
  addCourseLoading.value = true
  try {
    const res = await addCourse({
      courseId: courseId.value
    })

    if (res.code == 200) {
      message.success(res.message)
      handleGetCourse()
      addCourseLoading.value = false
    }
  } catch (err) {
    message.error(err.message)
    addCourseLoading.value = false
  } finally {
    addCourseLoading.value = false
  }
}

// 获取课程
const courses = ref([])

const handleGetCourse = async () => {
  loading.value = true
  try {
    const res = await getCourse()
    if (res.code == 200) {
      courses.value = res.data.reverse()
      // 将课程数据设置到stroes中
      studentStore.setStudentCourse(res.data)
      loading.value = false
    }
  } catch (err) {
    console.log(err)
  } finally {
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
      <template #title>
        <school
          theme="outline"
          size="38"
        />
        <span>我的课程</span>
      </template>
      <template #module>
        <div class="join">
          <div
            class="tooltip tooltip-bottom"
            data-tip="向老师索要课程编号"
          >
            <input
              v-model="courseId"
              class="input input-bordered join-item w-full max-w-xs"
              placeholder="输入课程来加入课程"
            >
          </div>
          <button
            class="btn btn-primary join-item"
            @click="handleAddCouser()"
          >
            <span
              v-show="addCourseLoading"
              class="loading loading-spinner loading-md"
            />
            加入课程
          </button>
        </div>
      </template>
    </TitleBar>
    <div
      v-if="loading"
      class="w-full h-screen flex justify-center items-center animate__animated animate__fadeIn"
    >
      <span class="loading loading-spinner loading-xl" />
    </div>
    <!-- 课程 -->
    <div
      v-else
      class="overflow-y-auto space-y-5"
    >
      <CourseCard
        v-for="(item, index) in courses"
        :key="index"
        class="animate__animated animate__fadeIn"
        :course-info="item"
      />
    </div>
  </div>
</template>
