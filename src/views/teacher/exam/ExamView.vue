<script setup>
import { ref, onMounted } from 'vue'
import { getexam } from '@/api/testApi.js'
import message from '@/plugin/message'
import CreateExamModal from './components/CreateExamModal.vue'
import EditExamModal from './components/EditExamModal.vue'
import DeleteExamModal from './components/DeleteExamModal.vue'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElButton,
  ElSelect,
  ElOption,
  ElInput,
  ElTag,
  ElEmpty,
  ElTooltip,
} from 'element-plus'
import {
  Edit,
  Delete,
  Link,
  Plus,
  DocumentClipboard,
} from '@element-plus/icons-vue'

const exam = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const pageSize = ref(10) // 默认页面大小设为10
const loading = ref(true) // 加载状态用于骨架效果
const jumpToPage = ref('') // 跳转页码输入值

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

// 处理页码跳转
const handleJumpToPage = () => {
  const page = parseInt(jumpToPage.value)
  if (page && page >= 1 && page <= totalPages.value) {
    changePage(page)
    jumpToPage.value = '' // 跳转后清空输入框
  } else {
    message.warning('请输入有效的页码')
  }
}

const handlePageSizeChange = size => {
  pageSize.value = size
  fetchExam(1) // 更改页面大小后，返回第一页
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

onMounted(() => {
  fetchExam(1)
})

// 处理分页改变
const handleCurrentChange = val => {
  changePage(val)
}

// 处理每页条数改变
const handleSizeChange = val => {
  handlePageSizeChange(val)
}
</script>

<template>
  <div class="g-exam-container">
    <div class="g-title-bar">
      <div class="g-title">
        <el-icon><DocumentClipboard /></el-icon>
        <span>我的试卷</span>
      </div>
      <div class="g-actions">
        <label for="create_exam_modal" class="g-create-btn">
          <el-icon><Plus /></el-icon>
          创建试卷
        </label>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="g-main-content">
      <!-- 空状态 -->
      <el-empty
        v-if="!loading && !exam.length"
        description="暂无试卷，快去创建一个吧！"
      >
        <label for="create_exam_modal" class="g-create-first">
          <el-icon><Plus /></el-icon>
          创建第一张试卷
        </label>
      </el-empty>

      <!-- 试卷表格 -->
      <div v-else class="g-table-container">
        <el-table
          v-loading="loading"
          :data="exam"
          border
          style="width: 100%"
          :row-class-name="'g-table-row'"
        >
          <el-table-column prop="examId" label="试卷ID" width="100" />
          <el-table-column prop="examName" label="试卷名称" />
          <el-table-column
            prop="description"
            label="描述"
            show-overflow-tooltip
          >
            <template #default="scope">
              {{ scope.row.description || '暂无描述' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === '草稿' ? 'info' : 'success'">
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
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <div class="g-table-actions">
                <el-tooltip content="编辑" placement="top">
                  <el-button
                    type="primary"
                    circle
                    plain
                    size="small"
                    @click="handleEdit(scope.row)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip content="查看详情" placement="top">
                  <router-link
                    :to="{
                      name: '',
                      params: { examId: scope.row.examId },
                      query: { examName: scope.row.examName },
                    }"
                  >
                    <el-button type="info" circle plain size="small">
                      <el-icon><Link /></el-icon>
                    </el-button>
                  </router-link>
                </el-tooltip>

                <el-tooltip content="删除" placement="top">
                  <el-button
                    type="danger"
                    circle
                    plain
                    size="small"
                    @click="handleDelete(scope.row)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 分页区域 -->
    <div class="g-pagination-container">
      <div class="g-pagination-info">
        <div class="g-page-size-selector">
          <span class="g-label">每页显示:</span>
          <el-select
            v-model="pageSize"
            size="small"
            :disabled="loading"
            @change="handlePageSizeChange"
          >
            <el-option label="5条" :value="5" />
            <el-option label="10条" :value="10" />
            <el-option label="20条" :value="20" />
            <el-option label="50条" :value="50" />
          </el-select>
        </div>
        <div class="g-total-info">
          总计: {{ loading ? '-' : totalItems }} 条
        </div>
        <div class="g-page-info">
          第 {{ currentPage }}/{{ totalPages || 1 }} 页
        </div>
      </div>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20, 50]"
        layout="sizes, prev, pager, next, jumper"
        :total="totalItems"
        background
        class="g-pagination"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />

      <!-- 移动端跳转输入框 -->
      <div class="g-mobile-jumper">
        <span class="g-label">跳转到:</span>
        <el-input
          v-model="jumpToPage"
          type="number"
          :min="1"
          :max="totalPages"
          size="small"
          :disabled="loading"
        />
        <el-button
          type="primary"
          size="small"
          :disabled="
            loading || !jumpToPage || jumpToPage < 1 || jumpToPage > totalPages
          "
          @click="handleJumpToPage"
        >
          跳转
        </el-button>
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

<style lang="scss" scoped>
.g-exam-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.g-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .g-title {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 500;

    span {
      margin-left: 8px;
    }
  }

  .g-actions {
    .g-create-btn {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      padding: 8px 16px;
      background-color: var(--el-color-primary);
      color: white;
      border-radius: 4px;
      font-size: 14px;

      &:hover {
        background-color: var(--el-color-primary-light-3);
      }
    }
  }
}

.g-main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.g-create-first {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
  background-color: var(--el-color-primary);
  color: white;
  border-radius: 4px;
  font-size: 14px;

  &:hover {
    background-color: var(--el-color-primary-light-3);
  }

  .g-icon-margin {
    margin-right: 4px;
  }
}

.g-table-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.g-pagination-container {
  margin-top: auto;
  border-top: 1px solid #ebeef5;
  padding: 16px;
  background-color: #fff;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;

  .g-pagination-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    @media (min-width: 768px) {
      margin-bottom: 0;
    }

    .g-page-size-selector {
      display: flex;
      align-items: center;

      .g-label {
        font-size: 14px;
        margin-right: 8px;
      }
    }

    .g-total-info {
      padding: 4px 8px;
      background-color: #f4f4f5;
      border-radius: 4px;
      font-size: 13px;
    }

    .g-page-info {
      font-size: 14px;
      color: #606266;

      @media (max-width: 767px) {
        display: none;
      }
    }
  }

  .g-pagination {
    margin-left: auto;
  }

  .g-mobile-jumper {
    display: flex;
    align-items: center;
    margin-top: 16px;
    width: 100%;
    justify-content: center;

    .g-label {
      font-size: 14px;
      margin-right: 8px;
    }

    .el-input {
      width: 70px;
      margin-right: 8px;
    }

    @media (min-width: 768px) {
      display: none;
    }
  }
}

@media (max-width: 767px) {
  .g-pagination {
    width: 100%;
    justify-content: center;
  }
}
</style>
