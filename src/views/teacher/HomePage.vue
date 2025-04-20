<script setup>
import { Home, BookOne, Peoples, Edit, Time,  } from '@icon-park/vue-next'
import { useUserStore } from '@/stores/user'
import TeacherStatsCharts from '@/components/teacher/TeacherStatsCharts.vue' // 导入图表组件
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger)

const userStore = useUserStore()

// 模拟教师数据
const teacherStats = ref({
  courseCount: 5, // 所教课程数量
  studentCount: 120, // 学生总数
  avgExamScore: 85, // 近期考试平均分
  pendingAssignments: 15, // 待批改作业数
  weeklyTeachingHours: 24, // 本周教学时长
  lastWeekTeachingHours: 20 // 上周教学时长
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

// 班级成绩分布数据
const classScoreDistribution = ref([
  { score: '90-100', count: 15 },
  { score: '80-89', count: 25 },
  { score: '70-79', count: 20 },
  { score: '60-69', count: 10 },
  { score: '0-59', count: 5 }
])

// 添加动画效果
const animation = () => {
  gsap.fromTo(
    '.stat',
    {
      opacity: 0,
      y: 20
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out'
    }
  )
}

onMounted(() => {
  animation()
})
</script>

<template>
  <div class="app p-4 w-full h-screen overflow-y-auto overflow-x-hidden">
    <div class="nav-bar flex justify-between h-20 items-center">
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

    <!-- 欢迎卡片 -->
    <div class="welcome-card bg-base-100 shadow-lg rounded-xl p-6 mt-4 border-l-4 border-primary">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold mb-2">
            今日教学概览
          </h2>
          <p class="text-gray-600">
            继续为学生提供优质的教学体验！
          </p>
        </div>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div
      class="stats-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
    >
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
      :class-score-distribution="classScoreDistribution"
    />

    <!-- 教学建议卡片 -->
    <div class="recommendation-card bg-base-100 shadow rounded-lg p-6 mt-6 border border-base-200">
      <h3 class="text-xl font-bold mb-4">
        教学建议
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-start space-x-3">
          <div class="bg-primary/10 p-2 rounded-full">
            <Time
              theme="outline"
              size="24"
              class="text-primary"
            />
          </div>
          <div>
            <h4 class="font-semibold">
              教学时长分析
            </h4>
            <p class="text-sm text-gray-600">
              本周授课{{ teacherStats.weeklyTeachingHours }}小时，比上周增加了{{ teacherStats.weeklyTeachingHours - teacherStats.lastWeekTeachingHours }}小时
            </p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <div class="bg-secondary/10 p-2 rounded-full">
            <ExamineFile
              theme="outline"
              size="24"
              class="text-secondary"
            />
          </div>
          <div>
            <h4 class="font-semibold">
              成绩分布建议
            </h4>
            <p class="text-sm text-gray-600">
              建议关注成绩在70分以下的同学，可能需要额外辅导。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
