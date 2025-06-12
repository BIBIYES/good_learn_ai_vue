<script setup>
import { School } from '@icon-park/vue-next'
import { addCourse, getCourse } from '@/api/course'
import message from '@/plugin/message'
import { useStudentStore } from '@/stores/student'
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
      courseId: courseId.value,
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
  <div class="flex flex-col h-full p-4">
    <!-- Header with title and create button -->
    <TitleBar>
      <template #title>
        <school theme="outline" size="38" />
        <span>我的课程</span>
      </template>
      <template #module>
        <div class="join">
          <div class="tooltip tooltip-bottom" data-tip="向老师索要课程编号">
            <input
              v-model="courseId"
              class="input input-bordered join-item w-full max-w-xs"
              placeholder="输入课程来加入课程"
            />
          </div>
          <button class="btn btn-primary join-item" @click="handleAddCouser()">
            <span
              v-show="addCourseLoading"
              class="loading loading-spinner loading-md"
            />
            加入课程
          </button>
        </div>
      </template>
    </TitleBar>

    <!-- Main content area -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      <!-- Loading State - Simple Spinner -->
      <div v-if="loading" class="w-full h-64 flex justify-center items-center">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="courses.length === 0"
        class="flex flex-col items-center justify-center h-64"
      >
        <div class="text-center">
          <School theme="outline" size="48" class="text-base-content/30 mb-4" />
          <p class="text-base-content/70 text-lg">暂无课程，快去加入一个吧！</p>
        </div>
      </div>

      <!-- Course Grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <div
          v-for="item in courses"
          :key="item.courseId"
          class="course-card relative group bg-base-100 rounded-2xl p-6 flex flex-col gap-3 border border-base-200 animate__animated animate__fadeIn cursor-pointer"
          @click="
            $router.push({
              name: 'student-course-detail',
              params: { courseId: String(item.courseId) },
            })
          "
        >
          <div class="flex items-center gap-3 mb-2">
            <div
              class="bg-primary text-primary-content w-12 h-12 rounded-lg flex justify-center items-center text-2xl font-bold"
            >
              {{ item.className.charAt(0) }}
            </div>
            <div class="flex-1">
              <span
                class="text-lg font-bold text-base-content flex items-center gap-2"
              >
                {{ item.className }}
                <span
                  class="ml-2 px-2 py-0.5 rounded text-xs font-medium"
                  :class="
                    item.courseStatus
                      ? 'bg-success/10 text-success'
                      : 'bg-base-200 text-base-content/50'
                  "
                >
                  {{ item.courseStatus ? '启用' : '停用' }}
                </span>
              </span>
              <span class="text-sm text-base-content/70">{{
                item.teacherName || '教师'
              }}</span>
            </div>
          </div>

          <div
            class="text-base-content/60 flex items-center text-sm flex-1 min-h-[40px] border-l-4 border-primary/20 pl-3 bg-base-200/30 rounded"
          >
            <div>{{ item.description || '暂无介绍' }}</div>
          </div>

          <div
            class="flex items-center justify-between mt-4 text-xs text-base-content/40 border-t pt-3"
          >
            <span>课程ID: {{ item.courseId }}</span>
            <span
              >加入时间:
              {{ item.joinTime ? item.joinTime.split('T')[0] : '—' }}</span
            >
            <div class="flex items-center space-x-2">
              <div class="inline-grid *:[grid-area:1/1]">
                <div
                  :class="
                    item.courseStatus
                      ? 'status status-success animate-ping'
                      : 'status status-error animate-ping'
                  "
                />
                <div
                  :class="
                    item.courseStatus
                      ? 'status status-success'
                      : 'status status-error'
                  "
                />
              </div>
              <p class="text-xs">
                {{ item.courseStatus ? '正常开放' : '已关闭' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-card {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
