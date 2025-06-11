<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
} from 'echarts/components'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  BarChart,
  LineChart,
  PieChart,
  CanvasRenderer,
  UniversalTransition,
])

const props = defineProps({
  courseDistribution: {
    type: Array,
    default: () => [],
  },
  studentActivity: {
    type: Array,
    default: () => [],
  },
  assignmentStatus: {
    type: Array,
    default: () => [],
  },
})

const courseChartRef = ref(null)
const activityChartRef = ref(null)
const assignmentChartRef = ref(null)

let courseChartInstance = null
let activityChartInstance = null
let assignmentChartInstance = null

const initCharts = () => {
  // Course Distribution Chart (Pie)
  if (courseChartRef.value && !courseChartInstance) {
    courseChartInstance = echarts.init(courseChartRef.value)
  }
  if (courseChartInstance) {
    const courseOption = {
      title: {
        text: '课程分布',
        left: 'center',
        textStyle: {
          color: '#ffffff', // 设置标题文字颜色为白色
        },
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: '#ffffff', // 设置图例文字颜色为白色
        },
      },
      series: [
        {
          name: '学生数量',
          type: 'pie',
          radius: '50%',
          data: props.courseDistribution,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    }
    courseChartInstance.setOption(courseOption)
  }

  // Student Activity Chart (Line)
  if (activityChartRef.value && !activityChartInstance) {
    activityChartInstance = echarts.init(activityChartRef.value)
  }
  if (activityChartInstance) {
    const activityOption = {
      title: {
        text: '学生活跃度 (近7日)',
        textStyle: {
          color: '#ffffff', // 设置标题文字颜色为白色
        },
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLabel: {
          color: '#ffffff', // 设置 x 轴标签文字颜色为白色
        },
      },
      yAxis: {
        type: 'value',
        name: '活跃人数',
        axisLabel: {
          color: '#ffffff', // 设置 y 轴标签文字颜色为白色
        },
        nameTextStyle: {
          color: '#ffffff', // 设置 y 轴名称文字颜色为白色
        },
      },
      series: [
        {
          name: '活跃人数',
          type: 'line',
          data: props.studentActivity,
          smooth: true,
        },
      ],
    }
    activityChartInstance.setOption(activityOption)
  }

  // Assignment Status Chart (Bar)
  if (assignmentChartRef.value && !assignmentChartInstance) {
    assignmentChartInstance = echarts.init(assignmentChartRef.value)
  }
  if (assignmentChartInstance) {
    const assignmentOption = {
      title: {
        text: '作业批改状态',
        textStyle: {
          color: '#ffffff', // 设置标题文字颜色为白色
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: ['待批改', '已批改', '已截止未提交'],
        axisLabel: {
          color: '#ffffff', // 设置 x 轴标签文字颜色为白色
        },
      },
      yAxis: {
        type: 'value',
        name: '数量',
        axisLabel: {
          color: '#ffffff', // 设置 y 轴标签文字颜色为白色
        },
        nameTextStyle: {
          color: '#ffffff', // 设置 y 轴名称文字颜色为白色
        },
      },
      series: [
        {
          name: '作业数量',
          type: 'bar',
          data: props.assignmentStatus,
        },
      ],
    }
    assignmentChartInstance.setOption(assignmentOption)
  }
}

const resizeCharts = () => {
  courseChartInstance?.resize()
  activityChartInstance?.resize()
  assignmentChartInstance?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', resizeCharts)
})

watch(
  () => [
    props.courseDistribution,
    props.studentActivity,
    props.assignmentStatus,
  ],
  () => {
    initCharts() // Re-initialize charts when data changes
  },
  { deep: true },
)

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  courseChartInstance?.dispose()
  activityChartInstance?.dispose()
  assignmentChartInstance?.dispose()
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
    <!-- Course Distribution Chart -->
    <div class="chart-container bg-base-100 shadow rounded-lg p-4">
      <div ref="courseChartRef" style="width: 100%; height: 300px" />
    </div>

    <!-- Student Activity Chart -->
    <div class="chart-container bg-base-100 shadow rounded-lg p-4">
      <div ref="activityChartRef" style="width: 100%; height: 300px" />
    </div>

    <!-- Assignment Status Chart -->
    <div class="chart-container bg-base-100 shadow rounded-lg p-4">
      <div ref="assignmentChartRef" style="width: 100%; height: 300px" />
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  /* Add any specific styling for chart containers if needed */
}
</style>
