<script setup>
import { Home, BookOne, Peoples, Edit } from '@icon-park/vue-next'
import { useUserStore } from '@/stores/user'
import TeacherStatsCharts from '@/components/teacher/TeacherStatsCharts.vue' // 导入图表组件

const userStore = useUserStore()

// 模拟教师数据
const teacherStats = ref({
  courseCount: 5, // 所教课程数量
  studentCount: 120, // 学生总数
  avgExamScore: 85, // 近期考试平均分
  pendingAssignments: 15 // 待批改作业数
})

// 模拟图表数据
const courseDistribution = ref([
  { value: 30, name: 'Web开发' },
  { value: 25, name: '数据结构' },
  { value: 20, name: '算法分析' },
  { value: 25, name: '操作系统' },
  { value: 20, name: '计算机网络' }
])
const studentActivity = ref([80, 92, 90, 94, 110, 105, 98]) // 近7日活跃学生数
const assignmentStatus = ref([15, 85, 5]) // [待批改, 已批改, 已截止未提交]

</script>

<template>
  <div class="app p-4 w-full h-screen overflow-y-auto overflow-x-hidden">
    <div class="nav-bar flex justify-between h-20 items-center mb-4">
      <TitleBar>
        <template #title>
          <Home
            theme="outline"
            size="38"
          />
          <span>教师首页</span>
          <p class="ml-4 text-lg">
            你好，{{ userStore.userInfo.username }} 老师，欢迎回来！
          </p>
        </template>
      </TitleBar>
    </div>

    <!-- 数据统计卡片 -->
    <div
      class="stats-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
    >
      <!-- 所教课程数量 -->
      <div
        class="stat bg-base-100 shadow rounded-lg hover:shadow-md transition-all p-4"
      >
        <div class="stat-figure text-primary">
          <BookOne
            theme="outline"
            size="32"
          />
        </div>
        <div class="stat-title">
          所教课程
        </div>
        <div class="stat-value text-primary">
          {{ teacherStats.courseCount }}
        </div>
        <div class="stat-desc">
          当前学期
        </div>
      </div>

      <!-- 学生总数 -->
      <div
        class="stat bg-base-100 shadow rounded-lg hover:shadow-md transition-all p-4"
      >
        <div class="stat-figure text-secondary">
          <Peoples
            theme="outline"
            size="32"
          />
        </div>
        <div class="stat-title">
          学生总数
        </div>
        <div class="stat-value text-secondary">
          {{ teacherStats.studentCount }}
        </div>
        <div class="stat-desc">
          所有班级
        </div>
      </div>

      <!-- 近期考试平均分 -->
      <div
        class="stat bg-base-100 shadow rounded-lg hover:shadow-md transition-all p-4"
      >
        <div class="stat-figure text-accent">
          <ExamineFile
            theme="outline"
            size="32"
          />
        </div>
        <div class="stat-title">
          平均成绩
        </div>
        <div class="stat-value text-accent">
          {{ teacherStats.avgExamScore }}
        </div>
        <div class="stat-desc">
          最近一次测验
        </div>
      </div>

      <!-- 待批改作业 -->
      <div
        class="stat bg-base-100 shadow rounded-lg hover:shadow-md transition-all p-4"
      >
        <div class="stat-figure text-info">
          <Edit
            theme="outline"
            size="32"
          />
        </div>
        <div class="stat-title">
          待批改作业
        </div>
        <div class="stat-value text-info">
          {{ teacherStats.pendingAssignments }}
        </div>
        <div class="stat-desc">
          请尽快处理
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <TeacherStatsCharts
      :course-distribution="courseDistribution"
      :student-activity="studentActivity"
      :assignment-status="assignmentStatus"
    />

    <!-- 可以在这里添加更多教师相关的功能入口或信息卡片 -->
  </div>
</template>

<style scoped>
/* 如果需要，可以在这里添加特定于教师首页的样式 */
.app {
  /* background-color: #f9fafb; /* Optional: Set a light background */
}
</style>
