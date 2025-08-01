<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { getExamQuestion, deleteExamQuestion } from '@/api/exam/examApi.js'
import message from '@/plugin/message'
import { difficultyMap, getDifficultyType } from '@/constants/difficulty'
import { formatDateTime } from '@/utils/dataFormat.js'
import QuestionSelect from '@/components/teacher/QuestionSelect.vue'

const route = useRoute()
const examId = route.params.examId
const questions = ref([])

const pagination = reactive({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  pageSize: 10,
})

const loadings = reactive({
  table: false,
})

const dialogStats = reactive({
  selectQuestionDialog: {
    visible: false,
  },
})

// 获取试卷题目列表
const fetchQuestions = async (page = 1) => {
  loadings.table = true
  try {
    const res = await getExamQuestion({
      current: page,
      pageSize: pagination.pageSize,
      examId: examId,
    })

    if (res.code === 200) {
      questions.value = res.data.records || []
      pagination.totalPages = res.data.pages || 1
      pagination.totalItems = res.data.total || 0
      pagination.currentPage = res.data.current || 1
    } else {
      message.error(res.message || '获取试卷题目失败')
    }
  } catch (error) {
    console.error('获取试卷题目错误:', error)
    message.error('获取试卷题目时发生错误')
  } finally {
    loadings.table = false
  }
}

// 删除试卷题目
const handleDeleteQuestion = async questionId => {
  try {
    const res = await deleteExamQuestion(questionId)
    if (res.code === 200) {
      message.success('删除题目成功')
      if (questions.value.length === 1 && pagination.currentPage > 1) {
        fetchQuestions(pagination.currentPage - 1)
      } else {
        fetchQuestions(pagination.currentPage)
      }
    } else {
      message.error(res.message || '删除题目失败')
    }
  } catch (error) {
    console.error('删除题目错误:', error)
    message.error('删除题目时发生错误')
  }
}

// 处理分页改变
const handleCurrentChange = page => {
  if (page >= 1 && page <= pagination.totalPages) {
    fetchQuestions(page)
  }
}

// 处理页面大小改变
const handleSizeChange = size => {
  pagination.pageSize = size
  fetchQuestions(1)
}

onMounted(() => {
  fetchQuestions(1)
})
</script>

<template>
  <el-dialog
    v-model="dialogStats.selectQuestionDialog.visible"
    title="题目选择器"
    width="80%"
    destroy-on-close
    align-center
  >
    <QuestionSelect />
  </el-dialog>
  <div class="w-full p-4 flex flex-col space-y-3 justify-between h-full">
    <div class="flex-1 flex flex-col space-y-3 h-full">
      <TitleBar>
        <template #title>
          <LineMdClipboardCheckTwotone />
          <span>试卷详情</span>
        </template>
        <template #module>
          <router-link :to="{ name: 'teacher-exam' }">
            <el-button size="default">
              <LineMdArrowLeft />
              返回试卷列表
            </el-button>
          </router-link>
          <el-button
            type="primary"
            size="default"
            @click="dialogStats.selectQuestionDialog.visible = true"
          >
            <LineMdEdit />
            编辑试卷
          </el-button>
        </template>
      </TitleBar>

      <el-table
        v-loading="loadings.table"
        element-loading-text="正在获取试卷题目"
        :data="questions"
        stripe
        class="w-full h-full flex-1"
      >
        <el-table-column
          prop="questionTitle"
          label="题目标题"
          min-width="150"
        />
        <el-table-column label="题目内容" min-width="300">
          <template #default="{ row }">
            <div v-html="row.questionContent"></div>
          </template>
        </el-table-column>
        <el-table-column label="难度" width="100">
          <template #default="{ row }">
            <el-tag :type="getDifficultyType(row.difficulty)" effect="light">
              {{ difficultyMap[row.difficulty] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <el-button type="primary" size="small" circle title="编辑题目">
                <LineMdEdit />
              </el-button>
              <el-button type="info" size="small" circle title="查看详情">
                <IcOutlineRemoveRedEye />
              </el-button>
              <el-button
                type="danger"
                size="small"
                circle
                title="删除题目"
                @click="handleDeleteQuestion(row.eqId)"
              >
                <LineMdDocumentDelete />
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="flex justify-end">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[5, 10, 20, 50]"
        layout="sizes, prev, pager, next, jumper, total"
        :total="pagination.totalItems"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
