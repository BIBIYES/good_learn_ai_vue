<script setup>
import { ref } from 'vue'
import { getQuestionBankAll } from '@/api/exam/examApi'
import { ElMessage } from 'element-plus'
import { getQuestionBankById } from '@/api/questionApi'
/**
 * @description 加载管理
 */

let loadingState = ref({
  courseList: false,
  questionList: false,
})
/**
 * @description 题库
 */
const courseList = ref([])

/**
 * @description 题目列表
 */
const questionList = ref([])

/**
 * @description 当前选中的题库
 */
let currentCourse = ref(null)

/**
 * @description 获取所有题库
 */
const handleGetCourse = async () => {
  loadingState.value.courseList = true
  const res = await getQuestionBankAll()
  if (res.code === 200) {
    courseList.value = res.data
  } else {
    ElMessage.error(res.message)
  }
  loadingState.value.courseList = false
}

/**
 * @description 分页获取题目
 */
const handleGetQuestion = async () => {
  loadingState.value.questionList = true
  const res = await getQuestionBankById(10, 1, currentCourse.value.id)
  if (res.code === 200) {
    questionList.value = res.data.records
  } else {
    ElMessage.error(res.message)
  }
  loadingState.value.questionList = false
}

/**
 * 当切换题库时，获取题目
 */
watch(currentCourse, () => {
  handleGetQuestion()
})

onMounted(() => {
  handleGetCourse()
})
</script>
<template>
  <div class="container">
    <div class="question-bank-select">
      <ul class="menu bg-base-200 h-full w-full">
        <li>
          <h2 class="menu-title">选择题库</h2>
          <ul v-if="!loadingState.courseList">
            <li v-for="item in courseList" :key="item.id">
              <a
                :class="{ 'menu-active': currentCourse === item }"
                @click="currentCourse = item"
                >{{ item.bankName }}</a
              >
            </li>
          </ul>
          <ul v-else>
            <li>
              <a><LineMdLoadingTwotoneLoop /></a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="question-select">
      <div class="flex-1 flex flex-col space-y-3 h-full">
        <el-table
          ref="multipleTableRef"
          v-loading="loadingState.questionList"
          :data="questionList"
          row-key="id"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            :selectable="selectable"
            width="55"
          />
          <el-table-column property="title" label="标题" width="120" />
          <el-table-column
            property="content"
            label="内容"
            show-overflow-tooltip
          />
          <el-table-column property="answer" label="参考答案">
            <template #default="scope">
              <el-tag v-if="scope.row.answer === null" type="info">
                暂无参考答案
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column property="difficulty" label="难度" />
          <el-table-column property="createdAt" label="创建时间" />
          <el-table-column property="updatedAt" label="更新时间" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="handleEdit(scope.row)"
              >
                <LineMdWatchLoop />
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  height: calc(100vh - 200px);
  .question-bank-select {
    min-width: 200px;
    overflow: hidden;

    background-color: #f0f0f0;
    border-radius: $border-radius-md 0 0 $border-radius-md;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .question-select {
    flex: 1;
    overflow: auto;
    border-radius: 0 $border-radius-md $border-radius-md 0;
  }
}
</style>
