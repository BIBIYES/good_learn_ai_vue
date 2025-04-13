<script setup>
import TitleBar from '@/components/common/TitleBar.vue'
import StudentStatsCharts from '@/components/charts/StudentStatsCharts.vue'
import { Home, Book, Time, CheckOne, Trophy } from '@icon-park/vue-next'
import { userStore } from '@/stores/user'
import { onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger)

const user = userStore()

// 模拟数据 - 实际项目中应该从API获取
const studentStats = ref({
  courseProgress: 75, // 课程完成百分比
  recentExamScore: 92, // 最近考试成绩
  studyHours: 24, // 本周学习时长
  pendingAssignments: 3 // 待完成作业数量
})

// 图表数据
const weeklyStudyHours = ref([3, 4, 5, 2, 6, 4, 3]) // 一周学习时间分布
const courseCompletionData = ref([
  { value: studentStats.value.courseProgress, name: '已完成' },
  { value: 100 - studentStats.value.courseProgress, name: '未完成' }
])
const subjectScores = ref([
  { name: 'Mysql', score: 85 },
  { name: 'JavaScript', score: 92 },
  { name: 'Python', score: 78 },
  { name: '网页制作', score: 88 },
  { name: 'linux基础实践', score: 76 }
])

const animation = () => {
  gsap.fromTo(
    '.lightning',
    {
      // 起始状态
      opacity: 0, // 透明度从 0 开始
      textShadow: '5px 5px 5px #D86E28', // 起始无阴影
      scale: 1 // 起始缩放比例为 1
    },
    {
      // 结束状态
      opacity: 1, // 透明度动画结束时为 1
      textShadow: '5px 5px 10px #FBC02D', // 结束时的阴影效果
      scale: 1.2, // 结束时放大到 1.2 倍
      duration: 0.8, // 动画持续时间
      yoyo: true, // 动画来回切换
      repeat: -1, // 无限循环
      ease: 'power1.inOut' // 缓动效果
    }
  )
}

onMounted(() => {
  animation()
})
</script>

<template>
  <div class="app p-3 w-full h-screen overflow-y-auto overflow-x-hidden">
    <div class="nav-bar flex justify-between h-20 items-center">
      <TitleBar>
        <template #title>
          <Home theme="outline" size="38" />
          <span>欢迎您 {{ user.userInfo.username }} 同学</span>
        </template>
      </TitleBar>
    </div>

    <!-- 欢迎卡片 -->
    <div
      class="welcome-card bg-base-100 shadow-lg rounded-xl p-6 mt-4 border-l-4 border-primary"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold mb-2">今日学习概览</h2>
          <p class="text-gray-600">继续保持学习热情，每天进步一点点！</p>
        </div>
        <div class="hidden md:block">
          <div class="text-5xl font-bold text-white">
            <span class="lightning">⚡</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div
      class="stats-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
    >
      <!-- 课程完成进度 -->
      <div
        class="stat bg-base-100 shadow rounded-lg hover:shadow-md transition-all"
      >
        <div class="stat-figure text-primary">
          <Book theme="outline" size="32" />
        </div>
        <div class="stat-title">课程完成进度</div>
        <div class="stat-value text-primary">
          {{ studentStats.courseProgress }}%
        </div>
        <div class="stat-desc">继续努力，即将完成！</div>
        <progress
          class="progress progress-primary w-full mt-2"
          :value="studentStats.courseProgress"
          max="100"
        />
      </div>

      <!-- 最近考试成绩 -->
      <div
        class="stat bg-base-100 shadow rounded-lg overflow-hidden hover:shadow-md transition-all"
      >
        <div class="stat-figure text-secondary">
          <Trophy theme="outline" size="32" />
        </div>
        <div class="stat-title">最近考试成绩</div>
        <div class="stat-value text-secondary">
          {{ studentStats.recentExamScore }}
        </div>
        <div class="stat-desc">优秀！比上次提高了5分</div>
      </div>

      <!-- 本周学习时长 -->
      <div
        class="stat bg-base-100 shadow rounded-lg hover:shadow-md transition-all"
      >
        <div class="stat-figure text-accent">
          <Time theme="outline" size="32" />
        </div>
        <div class="stat-title">本周学习时长</div>
        <div class="stat-value text-accent">{{ studentStats.studyHours }}h</div>
        <div class="stat-desc">比上周增加了3小时</div>
      </div>

      <!-- 待完成作业 -->
      <div
        class="stat bg-base-100 shadow rounded-lg hover:shadow-md transition-all"
      >
        <div class="stat-figure text-info">
          <CheckOne theme="outline" size="32" />
        </div>
        <div class="stat-title">待完成作业</div>
        <div class="stat-value text-info">
          {{ studentStats.pendingAssignments }}
        </div>
        <div class="stat-desc">请尽快完成剩余作业</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <StudentStatsCharts
      :weekly-study-hours="weeklyStudyHours"
      :course-completion-data="courseCompletionData"
      :subject-scores="subjectScores"
    />

    <!-- 学习建议卡片 -->
    <div
      class="recommendation-card bg-base-100 shadow rounded-lg p-6 mt-6 border border-base-200"
    >
      <h3 class="text-xl font-bold mb-4">学习建议</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-start space-x-3">
          <div class="bg-primary/10 p-2 rounded-full">
            <CheckOne theme="outline" size="24" class="text-primary" />
          </div>
          <div>
            <h4 class="font-semibold">完成剩余作业</h4>
            <p class="text-sm text-gray-600">
              您还有{{
                studentStats.pendingAssignments
              }}项作业待完成，建议优先处理。
            </p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <div class="bg-secondary/10 p-2 rounded-full">
            <Book theme="outline" size="24" class="text-secondary" />
          </div>
          <div>
            <h4 class="font-semibold">加强Python</h4>
            <p class="text-sm text-gray-600">
              根据您的成绩分布，建议增加Python学习时间。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
