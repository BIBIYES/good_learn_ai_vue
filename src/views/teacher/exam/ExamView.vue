<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { getexam, deleteexam } from '@/api/exam/examApi.js'
import { ElMessage } from 'element-plus'
import { formatDateTime } from '@/utils/dataFormat.js'
import CreateExam from './components/CreateExam.vue'

// 试卷列表数据
const examList = ref([])

// 当前选中的试卷
const currentExam = ref(null)

const modalTitle = computed(() =>
  currentExam.value ? '编辑试卷' : '创建新试卷',
)

// 处理编辑试卷
const handleEdit = exam => {
  currentExam.value = exam
  modals.create.visible = true
}

// 表单数据
const form = reactive({
  currentPage: 1, // 当前页码
  totalPages: 1, // 总页数
  totalItems: 0, // 总条目数
  pageSize: 10, // 每页显示条数
  loading: true, // 加载状态
})

const modals = reactive({
  create: {
    visible: false,
  },
})

/**
 * 打开创建试卷模态框
 */
const openCreateModal = () => {
  currentExam.value = null
  modals.create.visible = true
}

/**
 * 表单提交成功后的处理
 */
const handleFormSuccess = () => {
  modals.create.visible = false
  fetchExam(form.currentPage)
}

/**
 * 关闭创建试卷模态框
 */
const closeCreateModal = () => {
  modals.create.visible = false
}

/**
 * @description 异步获取试卷列表。
 * @param {number} [page=1] - 要获取的页码，默认为第一页。
 */
const fetchExam = async (page = 1) => {
  form.loading = true // 开始加载，显示加载动画
  try {
    const res = await getexam(page, form.pageSize)
    if (res.code === 200) {
      examList.value = res.data.records
      form.totalPages = res.data.pages
      form.currentPage = res.data.current
      form.totalItems = res.data.total
    } else {
      ElMessage.error(res.message || '获取试卷列表失败')
    }
  } catch (error) {
    ElMessage.error('获取试卷列表时发生错误' + error)
  } finally {
    form.loading = false // 结束加载，隐藏加载动画
  }
}

/**
 * @description 切换到指定页码。
 * @param {number} page - 目标页码。
 */
const changePage = page => {
  if (page >= 1 && page <= form.totalPages) {
    fetchExam(page)
  }
}

/**
 * @description 处理每页显示条数变化事件。
 * @param {number} val - 新的每页显示条数。
 */
const handleSizeChange = val => {
  form.pageSize = val
  fetchExam(1) // 返回第一页
}

/**
 * @description 处理当前页码变化事件。
 * @param {number} val - 新的当前页码。
 */
const handleCurrentChange = val => {
  changePage(val)
}

/**
 * @description 处理删除试卷的逻辑
 * @param {object} exam - 要删除的试卷对象
 */
const handleDelete = async exam => {
  try {
    const res = await deleteexam(exam.examId)
    if (res.code === 200) {
      ElMessage.success('删除成功！')
      // If the last item on the page is deleted, go to the previous page
      if (examList.value.length === 1 && form.currentPage > 1) {
        fetchExam(form.currentPage - 1)
      } else {
        fetchExam(form.currentPage)
      }
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    ElMessage.error('删除试卷时发生错误' + error)
  }
}

// 组件挂载后，立即获取第一页的试卷数据。
onMounted(() => {
  fetchExam(1)
})
</script>

<template>
  <div class="w-full p-4 flex flex-col space-y-3 justify-between h-full">
    <!-- 创建试卷模态框 -->
    <el-dialog
      v-model="modals.create.visible"
      :title="modalTitle"
      width="500px"
      align-center
      destroy-on-close
    >
      <CreateExam
        :exam-data="currentExam"
        @success="handleFormSuccess"
        @cancel="closeCreateModal"
      />
    </el-dialog>

    <div class="flex-1 flex flex-col space-y-3 h-full">
      <TitleBar>
        <template #title>
          <LineMdClipboardCheckTwotone />
          <span>我的试卷</span>
        </template>
        <template #module>
          <el-button type="primary" size="default" @click="openCreateModal">
            <LineMdPlus />
            创建试卷
          </el-button>
        </template>
      </TitleBar>

      <el-table
        v-loading="form.loading"
        element-loading-text="正在获取试卷列表"
        :data="examList"
        stripe
        class="w-full h-full flex-1"
      >
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
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.updatedAt) }}
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
              <el-popconfirm
                title="确定要删除这张试卷吗？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="220"
                @confirm="handleDelete(scope.row)"
              >
                <template #reference>
                  <el-button type="danger" size="small" circle>
                    <LineMdDocumentDelete />
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="flex justify-end">
      <el-pagination
        v-model:current-page="form.currentPage"
        v-model:page-size="form.pageSize"
        :page-sizes="[5, 10, 20, 50]"
        layout="sizes, prev, pager, next, jumper, total"
        :total="form.totalItems"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style scoped></style>
