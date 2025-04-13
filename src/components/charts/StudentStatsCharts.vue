<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { Time, Book, Trophy } from '@icon-park/vue-next'

// 接收父组件传递的数据
const props = defineProps({
  weeklyStudyHours: {
    type: Array,
    default: () => [2, 3, 4, 5, 3, 2, 5] // 默认一周七天的学习时间
  },
  courseCompletionData: {
    type: Array,
    default: () => [
      { value: 75, name: '已完成' },
      { value: 25, name: '未完成' }
    ]
  },
  subjectScores: {
    type: Array,
    default: () => [
      { name: 'Mysql', score: 85 },
      { name: 'JavaScript', score: 92 },
      { name: 'Python', score: 78 },
      { name: '网页制作', score: 88 },
      { name: 'linux基础实践', score: 76 }
    ]
  }
})

// 图表实例引用
const weeklyChartRef = ref(null)
const courseChartRef = ref(null)
const subjectChartRef = ref(null)

// 初始化周学习时间图表
const initWeeklyChart = () => {
  const chartDom = weeklyChartRef.value
  if (!chartDom) return null

  const myChart = echarts.init(chartDom)
  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value',
      name: '小时'
    },
    series: [
      {
        data: props.weeklyStudyHours,
        type: 'bar',
        itemStyle: {
          color: '#6366f1'
        },
        emphasis: {
          itemStyle: {
            color: '#4f46e5'
          }
        }
      }
    ],
    grid: {
      top: 50,
      bottom: 30,
      left: 40,
      right: 20
    }
  }
  myChart.setOption(option)

  return myChart
}

// 初始化课程完成率图表
const initCourseChart = () => {
  const chartDom = courseChartRef.value
  if (!chartDom) return null

  const myChart = echarts.init(chartDom)
  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '课程进度',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: props.courseCompletionData,
        color: ['#6366f1', '#e5e7eb']
      }
    ]
  }
  myChart.setOption(option)

  return myChart
}

// 初始化学科成绩雷达图
const initSubjectChart = () => {
  const chartDom = subjectChartRef.value
  if (!chartDom) return null

  const myChart = echarts.init(chartDom)

  // 准备雷达图数据
  const indicators = props.subjectScores.map((item) => ({
    name: item.name,
    max: 100
  }))

  const data = props.subjectScores.map((item) => item.score)

  const option = {
    title: {
      show: false
    },
    tooltip: {},
    radar: {
      indicator: indicators,
      radius: '60%'
    },
    series: [
      {
        name: '学科成绩',
        type: 'radar',
        data: [
          {
            value: data,
            name: '成绩',
            areaStyle: {
              color: 'rgba(99, 102, 241, 0.3)'
            },
            lineStyle: {
              color: '#6366f1'
            },
            itemStyle: {
              color: '#6366f1'
            }
          }
        ]
      }
    ]
  }

  myChart.setOption(option)

  return myChart
}

// 图表实例存储
const chartInstances = ref([])

// 初始化所有图表
const initAllCharts = () => {
  // 清除之前的图表实例
  chartInstances.value.forEach((chart) => {
    if (chart && !chart.isDisposed()) {
      chart.dispose()
    }
  })
  chartInstances.value = []

  // 初始化各个图表
  const weeklyChart = initWeeklyChart()
  const courseChart = initCourseChart()
  const subjectChart = initSubjectChart()

  // 存储图表实例以便后续清理
  if (weeklyChart) chartInstances.value.push(weeklyChart)
  if (courseChart) chartInstances.value.push(courseChart)
  if (subjectChart) chartInstances.value.push(subjectChart)
}

// 组件挂载后初始化图表
onMounted(() => {
  // 使用较长的延迟确保DOM已经完全渲染并可见
  setTimeout(() => {
    // 检查DOM元素是否可见且有宽高
    const checkAndInitCharts = () => {
      const weeklyDom = weeklyChartRef.value
      const courseDom = courseChartRef.value
      const subjectDom = subjectChartRef.value

      if (
        weeklyDom &&
        courseDom &&
        subjectDom &&
        weeklyDom.clientWidth > 0 &&
        weeklyDom.clientHeight > 0 &&
        courseDom.clientWidth > 0 &&
        courseDom.clientHeight > 0 &&
        subjectDom.clientWidth > 0 &&
        subjectDom.clientHeight > 0
      ) {
        // DOM元素已可见且有宽高，初始化图表
        initAllCharts()

        // 添加resize事件监听
        window.addEventListener('resize', initAllCharts)
      } else {
        // DOM元素尚未完全可见，继续等待
        setTimeout(checkAndInitCharts, 100)
      }
    }

    checkAndInitCharts()
  }, 500)
})

// 组件卸载前清理
onBeforeUnmount(() => {
  // 清除事件监听
  window.removeEventListener('resize', initAllCharts)

  // 销毁图表实例
  chartInstances.value.forEach((chart) => {
    if (chart && !chart.isDisposed()) {
      chart.dispose()
    }
  })
  chartInstances.value = []
})
</script>

<template>
  <div class="charts-container grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
    <div
      class="chart-card bg-base-100 shadow rounded-lg p-4 hover:shadow-md transition-all"
    >
      <div class="flex items-center justify-center mb-2">
        <Time
          theme="outline"
          size="20"
          class="text-primary mr-2"
        />
        <h3 class="text-base font-medium">
          本周学习时间分布
        </h3>
      </div>
      <div
        ref="weeklyChartRef"
        class="chart-container h-64"
      />
    </div>

    <div
      class="chart-card bg-base-100 shadow rounded-lg p-4 hover:shadow-md transition-all"
    >
      <div class="flex items-center justify-center mb-2">
        <Book
          theme="outline"
          size="20"
          class="text-secondary mr-2"
        />
        <h3 class="text-base font-medium">
          课程完成率
        </h3>
      </div>
      <div
        ref="courseChartRef"
        class="chart-container h-64"
      />
    </div>

    <div
      class="chart-card bg-base-100 shadow rounded-lg p-4 hover:shadow-md transition-all"
    >
      <div class="flex items-center justify-center mb-2">
        <Trophy
          theme="outline"
          size="20"
          class="text-accent mr-2"
        />
        <h3 class="text-base font-medium">
          学科成绩分布
        </h3>
      </div>
      <div
        ref="subjectChartRef"
        class="chart-container h-64"
      />
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.chart-container {
  width: 100%;
}

.chart-card:hover .text-primary,
.chart-card:hover .text-secondary,
.chart-card:hover .text-accent {
  transform: scale(1.2);
}

.text-primary,
.text-secondary,
.text-accent {
  transition: transform 0.3s ease;
}
</style>
