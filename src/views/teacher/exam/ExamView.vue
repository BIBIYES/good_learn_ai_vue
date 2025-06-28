<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getexam } from '@/api/testApi.js'
import message from '@/plugin/message'
import ExamFormContent from '@/components/teacher/exam/ExamFormContent.vue'
import ExamDeleteContent from '@/components/teacher/exam/ExamDeleteContent.vue'

const exam = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const pageSize = ref(10) // 默认页面大小设为10
const loading = ref(true) // 加载状态用于骨架效果

// 使用reactive统一管理模态框状态
const modalState = reactive({
  create: {
    visible: false,
  },
  edit: {
    visible: false,
  },
  delete: {
    visible: false,
  },
})

// 表单数据
const createFormData = reactive({
  examName: '',
  description: '',
  status: 'DRAFT',
  examTime: '',
})

const editFormData = reactive({
  examId: '',
  examName: '',
  description: '',
})

const deleteFormData = reactive({
  examId: '',
  examName: '',
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
  editFormData.examId = exam.examId
  editFormData.examName = exam.examName
  editFormData.description = exam.description || ''

  // 打开编辑模态框
  modalState.edit.visible = true
}

const handleDelete = exam => {
  // 设置当前选中的试卷
  deleteFormData.examId = exam.examId
  deleteFormData.examName = exam.examName

  // 打开确认删除模态框
  modalState.delete.visible = true
}

const resetCreateForm = () => {
  createFormData.examName = ''
  createFormData.description = ''
  createFormData.status = 'DRAFT'
  createFormData.examTime = ''
}

// 操作成功的回调函数
const handleSuccess = () => {
  // 刷新列表
  fetchExam(currentPage.value)

  // 关闭所有模态框
  modalState.create.visible = false
  modalState.edit.visible = false
  modalState.delete.visible = false
}

const handleCreateCancel = () => {
  modalState.create.visible = false
  resetCreateForm()
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
  <div class="w-full p-4 flex flex-col space-y-3 justify-between h-full">
    <!-- 创建试卷模态框 -->
    <el-dialog
      v-model="modalState.create.visible"
      title="创建新试卷"
      width="500px"
      align-center
      destroy-on-close
    >
      <ExamFormContent
        v-model:form-data="createFormData"
        :is-edit="false"
        @success="handleSuccess"
        @cancel="handleCreateCancel"
      />
    </el-dialog>

    <!-- 编辑试卷模态框 -->
    <el-dialog
      v-model="modalState.edit.visible"
      title="编辑试卷"
      width="500px"
      destroy-on-close
      align-center
    >
      <ExamFormContent
        v-model:form-data="editFormData"
        :is-edit="true"
        @success="handleSuccess"
        @cancel="modalState.edit.visible = false"
      />
    </el-dialog>

    <!-- 删除试卷模态框 -->
    <el-dialog
      v-model="modalState.delete.visible"
      title="确认删除"
      width="400px"
      align-center
      destroy-on-close
    >
      <ExamDeleteContent
        :exam-id="deleteFormData.examId"
        :exam-name="deleteFormData.examName"
        @success="handleSuccess"
        @cancel="modalState.delete.visible = false"
      />
    </el-dialog>

    <div class="flex-1 flex flex-col space-y-3 h-full">
      <TitleBar>
        <template #title>
          <LineMdClipboardCheckTwotone />
          <span>我的试卷</span>
        </template>
        <template #module>
          <el-button
            type="primary"
            size="default"
            @click="modalState.create.visible = true"
          >
            <LineMdPlus />
            创建试卷
          </el-button>
        </template>
      </TitleBar>

      <el-table
        v-loading="loading"
        element-loading-text="正在获取试卷列表"
        :data="exam"
        stripe
        class="w-full h-full flex-1"
      >
        <el-table-column prop="examId" label="试卷ID" width="100" />
        <el-table-column prop="examName" label="试卷名称" />
        <el-table-column prop="description" label="描述">
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
                <LineMdEdit />
              </el-button>
              <router-link
                :to="{
                  name: 'teacher-exam-detail',
                  params: { examId: scope.row.examId },
                }"
              >
                <el-button type="info" size="small" circle>
                  <IcOutlineRemoveRedEye class="" />
                </el-button>
              </router-link>
              <el-button
                type="danger"
                size="small"
                circle
                @click="handleDelete(scope.row)"
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
</template>

<style scoped></style>
