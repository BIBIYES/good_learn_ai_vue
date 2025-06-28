<script setup>
import { ref, onMounted } from 'vue'
import { getexam } from '@/api/testApi.js'
import message from '@/plugin/message'
import CreateExamModal from './components/CreateExamModal.vue'
import EditExamModal from './components/EditExamModal.vue'
import DeleteExamModal from './components/DeleteExamModal.vue'

const exam = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const pageSize = ref(10) // 默认页面大小设为10
const loading = ref(true) // 加载状态用于骨架效果

// 当前选中的试卷，用于编辑和删除操作
const currentExam = ref({
  examId: '',
  examName: '',
  description: '',
})

const fetchExam = async (page = 1) => {
  loading.value = true // 开始加载
  try {
    const res = await getexam(page, pageSize.value)
    if (res.code === 200) {
      exam.value = res.data.records.map(record => ({
        examId: record.examId,
        examName: record.examName,
        description: record.description,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        status: record.status === 'DRAFT' ? '草稿' : '已发布',
        teacherId: record.teacherId,
      }))
      totalPages.value = res.data.pages
      currentPage.value = res.data.current
      totalItems.value = res.data.total
      loading.value = false // 数据加载完成，更新加载状态
    } else {
      message.error(res.message || '获取试卷列表失败')
    }
  } catch (error) {
    console.error('获取试卷列表错误:', error)
    message.error('获取试卷列表时发生错误')
  } finally {
    loading.value = false
  }
}

const handleEdit = exam => {
  // 设置当前选中的试卷
  currentExam.value = {
    examId: exam.examId,
    examName: exam.examName,
    description: exam.description || '',
  }

  // 打开编辑模态框
  const modalCheckbox = document.getElementById('edit_exam_modal')
  if (modalCheckbox) modalCheckbox.checked = true
}

const handleDelete = exam => {
  // 设置当前选中的试卷
  currentExam.value = {
    examId: exam.examId,
    examName: exam.examName,
    description: exam.description || '',
  }

  // 打开确认删除模态框
  const modalCheckbox = document.getElementById('delete_confirm_modal')
  if (modalCheckbox) modalCheckbox.checked = true
}

const changePage = page => {
  if (page >= 1 && page <= totalPages.value) {
    fetchExam(page)
  }
}

const formatDate = dateString => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (e) {
    console.log(e)
    return dateString
  }
}

// 操作成功后的回调函数
const handleSuccess = () => {
  fetchExam(currentPage.value)
}

// Element Plus 表格相关配置
const handleSizeChange = val => {
  pageSize.value = val
  fetchExam(1)
}

const handleCurrentChange = val => {
  changePage(val)
}

onMounted(() => {
  fetchExam(1)
})
</script>

<template>
  <div class="w-full h-full overflow-hidden">
    <TitleBar>
      <template #title>
        <LineMdClipboardCheckTwotone />
        <span>我的试卷</span>
      </template>
      <template #module>
        <label for="create_exam_modal" class="btn btn-primary btn-sm md:btn-md">
          <LineMdPlus />
          创建试卷
        </label>
      </template>
    </TitleBar>

    <!-- 主内容区域 -->
    <div
      class="flex-1 overflow-y-auto p-4 md:p-6 bg-base-100 rounded-box shadow-sm"
    >
      <!-- 空状态 -->
      <div
        v-if="!loading && !exam.length"
        class="flex flex-col items-center justify-center h-64"
      >
        <div class="text-center">
          <DocumentFolder
            theme="outline"
            size="48"
            class="text-base-content/30 mb-4"
          />
          <p class="text-base-content/70 text-lg">暂无试卷，快去创建一个吧！</p>
          <label for="create_exam_modal" class="btn btn-primary mt-4">
            <Add theme="outline" size="18" class="mr-1" />
            创建第一张试卷
          </label>
        </div>
      </div>

      <!-- 试卷表格 - 使用 Element Plus -->
      <div v-else>
        <el-table
          v-loading="loading"
          :data="exam"
          style="width: 100%"
          border
          stripe
        >
          <el-table-column prop="examId" label="试卷ID" width="100" />
          <el-table-column prop="examName" label="试卷名称" min-width="150" />
          <el-table-column prop="description" label="描述" min-width="180">
            <template #default="scope">
              {{ scope.row.description || '暂无描述' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.status === '草稿' ? 'primary' : 'success'"
                effect="light"
              >
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="160">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="160">
            <template #default="scope">
              {{ formatDate(scope.row.updatedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <div class="flex gap-2">
                <el-button
                  type="primary"
                  size="small"
                  circle
                  @click="handleEdit(scope.row)"
                >
                  <Edit theme="outline" size="16" />
                </el-button>
                <router-link
                  :to="{
                    name: '',
                    params: { examId: scope.row.examId },
                    query: { examName: scope.row.examName },
                  }"
                >
                  <el-button type="info" size="small" circle>
                    <LinkOne theme="outline" size="16" />
                  </el-button>
                </router-link>
                <el-button
                  type="danger"
                  size="small"
                  circle
                  @click="handleDelete(scope.row)"
                >
                  <Delete theme="outline" size="16" />
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 分页组件 - 使用Element Plus -->
    <div class="mt-auto border-t border-base-200 p-4 bg-base-100">
      <div class="flex justify-between items-center">
        <div class="text-sm text-base-content/70">
          总计: {{ totalItems }} 条记录
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="sizes, prev, pager, next, jumper, total"
          :total="totalItems"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 引入拆分出来的组件 -->
    <CreateExamModal :on-success="handleSuccess" />
    <EditExamModal
      :exam-id="currentExam.examId"
      :exam-name="currentExam.examName"
      :description="currentExam.description"
      :on-success="handleSuccess"
    />
    <DeleteExamModal
      :exam-id="currentExam.examId"
      :exam-name="currentExam.examName"
      :on-success="handleSuccess"
    />
  </div>
</template>

<style scoped></style>
