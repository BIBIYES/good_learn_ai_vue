<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  getQuestionBankById,
  createQuestion,
  deleteQuestion,
  updateQuestion,
  batchQuestions,
  aiCreateQuestion,
} from '@/api/question'
import message from '@/plugin/message'
import * as XLSX from 'xlsx'
import {
  FileQuestion,
  Add,
  ArrowLeft,
  Edit,
  Delete,
  Lightning,
} from '@icon-park/vue-next'

const route = useRoute()
const bankId = ref(route.params.bankId)
const bankName = ref(route.query.bankName || '题库详情')

const questions = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = ref(5)
const total = ref(0)
const filterDifficulty = ref('')
const filterTitle = ref('')

// 创建题目模态框
const showCreateModal = ref(false)
const createLoading = ref(false)
const newQuestion = ref({
  bankId: bankId.value,
  content: '',
  difficulty: '1', // 默认简单难度
  title: '', // 新增题目标题字段
  status: true,
})

// 编辑题目模态框
const showEditModal = ref(false)
const editLoading = ref(false)
const editQuestion = ref({
  questionId: '',
  bankId: bankId.value,
  content: '',
  difficulty: '1',
  status: true,
})

// 删除确认模态框
const showDeleteModal = ref(false)
const deleteLoading = ref(false)
const questionToDelete = ref(null)

// 批量添加题目模态框
const showBatchAddModal = ref(false)
const batchAddLoading = ref(false)
const batchAddFile = ref(null)

// 获取题目列表
const fetchQuestions = async (page = 1) => {
  loading.value = true
  try {
    // 打印请求参数
    console.log('Fetching questions with params:', {
      size: pageSize.value,
      current: page,
      bankId: bankId.value,
      difficulty: filterDifficulty.value,
      title: filterTitle.value,
    })

    // 处理默认值
    const actualDifficulty = filterDifficulty.value || ''
    const actualTitle = filterTitle.value || ''

    const res = await getQuestionBankById(
      pageSize.value,
      page,
      bankId.value,
      actualDifficulty,
      actualTitle,
    )

    console.log('API Response:', res)

    if (res.code === 200) {
      console.log('API Response Data:', res.data)

      if (res.data && Array.isArray(res.data.records)) {
        questions.value = res.data.records
        currentPage.value = res.data.current || 1
        totalPages.value = res.data.pages || 1
        total.value = res.data.total || 0

        if (questions.value.length === 0) {
          message.info('当前题库没有题目或没有匹配的题目')
        }
      } else {
        console.error('Invalid response data structure')
        message.error('获取题目列表失败，数据结构异常')
      }
    } else {
      message.error(res.message || '获取题目列表失败')
    }
  } catch (error) {
    console.error('获取题目列表错误:', error)
    message.error('获取题目列表时发生错误')
  } finally {
    loading.value = false
  }
}

// 切换分页
const changePage = page => {
  if (page >= 1 && page <= totalPages.value) {
    fetchQuestions(page)
  }
}

// 格式化日期
const formatDate = dateString => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString()
  } catch (e) {
    console.log(e)
    return dateString
  }
}

// 获取难度标签样式
const getDifficultyStyle = difficulty => {
  switch (difficulty) {
    case '1':
    case 'easy':
      return 'badge-success'
    case '2':
    case 'medium':
      return 'badge-warning'
    case '3':
    case 'hard':
      return 'badge-error'
    default:
      return 'badge-info'
  }
}

// 难度中文映射
const difficultyMap = {
  1: '简单',
  2: '中等',
  3: '困难',
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

// 添加题目
const handleCreateQuestion = async () => {
  if (!newQuestion.value.content) {
    message.error('题目内容不能为空')
    return
  }

  createLoading.value = true
  try {
    const res = await createQuestion({
      bankId: bankId.value,
      content: newQuestion.value.content,
      difficulty: newQuestion.value.difficulty,
      title: newQuestion.value.title,
    })

    if (res.code === 200) {
      message.success('添加题目成功')
      showCreateModal.value = false
      newQuestion.value = {
        bankId: bankId.value,
        content: '',
        difficulty: '1',
        status: true,
      }
      fetchQuestions(currentPage.value)
    } else {
      message.error(res.message || '添加题目失败')
    }
  } catch (error) {
    console.error('添加题目错误:', error)
    message.error('添加题目时发生错误')
  } finally {
    createLoading.value = false
  }
}

// 打开编辑模态框
const openEditModal = question => {
  editQuestion.value = {
    questionId: question.questionId,
    bankId: question.bankId,
    content: question.content,
    difficulty:
      question.difficulty === 'easy'
        ? '1'
        : question.difficulty === 'medium'
          ? '2'
          : question.difficulty === 'hard'
            ? '3'
            : question.difficulty,
    status: question.status,
  }
  showEditModal.value = true
}

// 编辑题目
const handleEditQuestion = async () => {
  if (!editQuestion.value.content) {
    message.error('题目内容不能为空')
    return
  }

  editLoading.value = true
  try {
    const res = await updateQuestion({
      questionId: editQuestion.value.questionId,
      bankId: editQuestion.value.bankId,
      content: editQuestion.value.content,
      difficulty: editQuestion.value.difficulty,
      status: editQuestion.value.status,
      title: editQuestion.value.title,
    })

    if (res.code === 200) {
      message.success('编辑题目成功')
      showEditModal.value = false
      fetchQuestions(currentPage.value)
    } else {
      message.error(res.message || '编辑题目失败')
    }
  } catch (error) {
    console.error('编辑题目错误:', error)
    message.error('编辑题目时发生错误')
  } finally {
    editLoading.value = false
  }
}

const selectedQuestions = ref([])

// 全选/取消全选
const toggleSelectAll = event => {
  if (event.target.checked) {
    selectedQuestions.value = questions.value.map(q => q.questionId)
  } else {
    selectedQuestions.value = []
  }
}

// 判断是否全选
const isAllSelected = computed(() => {
  return (
    selectedQuestions.value.length > 0 &&
    selectedQuestions.value.length === questions.value.length
  )
})

// 批量删除题目
const handleBatchDeleteQuestions = async () => {
  if (selectedQuestions.value.length === 0) {
    message.error('请至少选择一个题目进行删除')
    return
  }

  deleteLoading.value = true
  try {
    const res = await Promise.all(
      selectedQuestions.value.map(questionId => deleteQuestion(questionId)),
    )

    if (res.every(r => r.code === 200)) {
      message.success('批量删除题目成功')
      selectedQuestions.value = []
      fetchQuestions(currentPage.value)
    } else {
      message.error('部分题目删除失败，请重试')
    }
  } catch (error) {
    console.error('批量删除题目错误:', error)
    message.error('批量删除题目时发生错误')
  } finally {
    deleteLoading.value = false
  }
}
// 查看详情模态框
const showDetailModal = ref(false)
const detailQuestion = ref({})

// 打开查看详情模态框
const openDetailModal = question => {
  detailQuestion.value = { ...question }
  showDetailModal.value = true
}

// 打开删除确认模态框
const openDeleteModal = question => {
  questionToDelete.value = question
  showDeleteModal.value = true
}

// 删除题目
const handleDeleteQuestion = async () => {
  if (!questionToDelete.value) return

  deleteLoading.value = true
  try {
    const res = await deleteQuestion(questionToDelete.value.questionId)

    if (res.code === 200) {
      message.success('删除题目成功')
      showDeleteModal.value = false

      // 重新获取当前页，如果当前页没有数据了，则获取上一页
      if (questions.value.length === 1 && currentPage.value > 1) {
        fetchQuestions(currentPage.value - 1)
      } else {
        fetchQuestions(currentPage.value)
      }
    } else {
      message.error(res.message || '删除题目失败')
    }
  } catch (error) {
    console.error('删除题目错误:', error)
    message.error('删除题目时发生错误')
  } finally {
    deleteLoading.value = false
  }
}

// 监听筛选条件变化
watch([filterDifficulty, filterTitle], () => {
  fetchQuestions(1)
})

// 下载Excel模板
const handleDownloadTemplate = () => {
  // 定义表头
  const headers = [
    '题目标题 (title)',
    '题目内容 (content)',
    '难度等级 (difficulty)',
  ]
  // 示例数据（可选）
  const data = [
    ['标题', '内容', '1'],
    ['', '', '', '2/medium'],
    ['', '', '', '3/hard'],
  ]

  // 构建工作表数据（第一行为表头 + 示例数据）
  const worksheetData = [headers, ...data]

  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet(worksheetData)

  // 设置列宽（可选）
  ws['!cols'] = [
    { wch: 15 }, // bankId
    { wch: 30 }, // title
    { wch: 50 }, // content
    { wch: 15 }, // difficulty
  ]

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '题目模板')

  // 导出 Excel 文件
  XLSX.writeFile(wb, '题目批量导入模板.xlsx')
}

// 处理文件选择
const handleFileChange = e => {
  const file = e.target.files[0] // 从文件选择框中获取文件
  if (
    file &&
    file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    batchAddFile.value = file
    message.success('文件已选择，请点击确认上传按钮')
  } else {
    message.error('请上传正确的 Excel 文件 (.xlsx)')
    batchAddFile.value = null
  }
}

// 批量添加题目
const handleBatchAddQuestion = async () => {
  if (!batchAddFile.value) {
    message.error('请先选择文件')
    return
  }

  batchAddLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', batchAddFile.value)
    formData.append('bankId', bankId.value)

    const res = await batchQuestions(formData)

    if (res.code === 200) {
      message.success(
        `批量创建成功，共创建${res.message.match(/\d+/)?.[0] || ''}道题目`,
      )
      showBatchAddModal.value = false
      batchAddFile.value = null
      fetchQuestions(currentPage.value)
    } else {
      message.error(res.message || '批量添加题目失败')
    }
  } catch (error) {
    console.error('批量添加题目错误:', error)
    message.error('批量添加题目时发生错误')
  } finally {
    batchAddLoading.value = false
  }
}

// AI创建题目模态框
const showAICreateModal = ref(false)
const aiCreateLoading = ref(false)
const aiRequestData = ref('')

// AI创建题目
const handleAICreateQuestion = async () => {
  if (!aiRequestData.value) {
    message.error('请输入请求数据')
    return
  }

  aiCreateLoading.value = true
  try {
    const res = await aiCreateQuestion({
      bankId: bankId.value,
      requestData: aiRequestData.value,
    })

    if (res.code === 200) {
      message.success('AI创建题目成功')
      showAICreateModal.value = false
      aiRequestData.value = ''
      fetchQuestions(currentPage.value)
    } else {
      message.error(res.message || 'AI创建题目失败')
    }
  } catch (error) {
    console.error('AI创建题目错误:', error)
    message.error('AI创建题目时发生错误')
  } finally {
    aiCreateLoading.value = false
  }
}

const handleBatchAddClick = () => {
  handleDownloadTemplate()
  showBatchAddModal.value = true
}

onMounted(() => {
  filterDifficulty.value = ''
  filterTitle.value = ''
  fetchQuestions()
})
</script>

<template>
  <div class="flex flex-col h-full p-4">
    <!-- Header with back button, title and actions -->
    <TitleBar>
      <template #title>
        <div class="flex items-center gap-2">
          <router-link to="/t/question" class="btn btn-ghost btn-sm btn-circle">
            <ArrowLeft theme="outline" size="20" />
          </router-link>
          <FileQuestion theme="outline" size="38" />
          <span>{{ bankName }}</span>
        </div>
      </template>
      <template #module>
        <button
          class="btn btn-primary btn-sm md:btn-md"
          @click="showCreateModal = true"
        >
          <Add theme="outline" size="18" />
          添加题目
        </button>
        <button
          class="btn btn-primary btn-sm md:btn-md"
          @click="handleBatchAddClick"
        >
          <Add theme="outline" size="18" />
          批量添加题目
        </button>
        <button
          class="btn btn-info btn-sm md:btn-md"
          @click="showAICreateModal = true"
        >
          <lightning theme="outline" size="18" />
          AI创建题目
        </button>
        <button
          class="btn btn-error btn-sm md:btn-md"
          @click="handleBatchDeleteQuestions = true"
        >
          <Delete theme="outline" size="18" />
          批量删除题目
        </button>
      </template>
    </TitleBar>

    <!-- Main content area -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      <!-- Filter box -->
      <div class="bg-base-100 rounded-lg shadow p-4 mb-4">
        <div class="flex flex-wrap gap-4">
          <div class="form-control w-full max-w-xs">
            <label class="label">
              <span class="label-text">难度筛选</span>
            </label>
            <select
              v-model="filterDifficulty"
              class="select select-bordered w-full"
            >
              <option value="">全部</option>
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
          <div class="form-control w-full max-w-xs">
            <label class="label">
              <span class="label-text">标题搜索</span>
            </label>
            <input
              v-model="filterTitle"
              type="text"
              placeholder="输入标题关键词"
              class="input input-bordered w-full"
            />
          </div>
          <div class="form-control w-full max-w-xs">
            <label class="label">
              <span class="label-text">状态筛选</span>
            </label>
            <select class="select select-bordered w-full">
              <option value="">全部</option>
              <option value="true">已启用</option>
              <option value="false">未启用</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State - Skeleton -->
      <div v-if="loading" class="w-full">
        <div class="skeleton h-12 w-full mb-4 rounded" />
        <div
          v-for="i in 5"
          :key="i"
          class="skeleton h-16 w-full mb-2 rounded"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!questions.length"
        class="flex flex-col items-center justify-center h-64"
      >
        <div class="text-center">
          <FileQuestion
            theme="outline"
            size="48"
            class="text-base-content/30 mb-4"
          />
          <p class="text-base-content/70 text-lg">
            该题库暂无题目，快去添加一个吧！
          </p>
          <button class="btn btn-primary mt-4" @click="showCreateModal = true">
            <Add theme="outline" size="18" class="mr-1" />
            添加第一个题目
          </button>
        </div>
      </div>

      <!-- Questions Table -->
      <div v-else class="overflow-x-auto w-full">
        <table class="table table-zebra">
          <!-- Table head -->
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  class="checkbox checkbox-neutral"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                />
              </th>
              <th>ID</th>
              <th>题目标题</th>
              <th>题目内容</th>
              <th>难度</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
              <th class="w-32 sticky right-0 bg-base-500 z-10 shadow-2xl">
                详情
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Table rows -->
            <tr
              v-for="question in questions"
              :key="question.questionId"
              class="hover"
            >
              <td>
                <input
                  v-model="selectedQuestions"
                  type="checkbox"
                  class="checkbox checkbox-neutral"
                  :value="question.questionId"
                  :disabled="!selectedQuestions"
                />
              </td>
              <td class="whitespace-nowrap">
                {{ question.questionId }}
              </td>
              <td class="max-w-md truncate">
                {{ question.title }}
              </td>
              <td class="max-w-md truncate">
                {{ question.content }}
              </td>
              <td>
                <div
                  class="badge badge-outline"
                  :class="getDifficultyStyle(question.difficulty)"
                >
                  {{
                    difficultyMap[question.difficulty] || question.difficulty
                  }}
                </div>
              </td>
              <td>
                <div
                  class="badge badge-dash"
                  :class="question.status ? 'badge-success' : 'badge-ghost'"
                >
                  {{ question.status ? '已启用' : '未启用' }}
                </div>
              </td>
              <td class="whitespace-nowrap">
                {{ formatDate(question.createdAt) }}
              </td>
              <td class="whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <button
                    class="btn btn-outline btn-info btn-sm text-info hover:text-white"
                    @click="openEditModal(question)"
                  >
                    <Edit theme="outline" size="16" />编辑题目
                  </button>
                  <button
                    class="btn btn-outline btn-error btn-sm text-error hover:text-white"
                    @click="openDeleteModal(question)"
                  >
                    <Delete theme="outline" size="16" />删除题目
                  </button>
                </div>
              </td>
              <td class="border-dashed sticky right-0 bg-base-100 w-32 z-10">
                <button
                  class="btn btn-outline btn-sm w-full"
                  @click="openDetailModal(question)"
                >
                  查看详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination section -->
    <div
      v-if="!loading && questions.length > 0"
      class="mt-auto border-t border-base-200 p-4 bg-base-100"
    >
      <div class="flex justify-center space-x-5">
        <div class="btn btn-sm">
          <div aria-label="status" class="status status-primary" />
          <span>总计题目数：</span>{{ total }}
        </div>
        <div class="join">
          <button
            class="join-item btn btn-sm"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            «
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            class="join-item btn btn-sm"
            :class="{ 'btn-active': currentPage === page }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button
            class="join-item btn btn-sm"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            »
          </button>
        </div>
      </div>
    </div>

    <!-- 添加题目模态框 -->
    <dialog class="modal modal-bottom" :open="showCreateModal">
      <div class="modal-box w-full h-full rounded-none shadow-xl">
        <div class="flex items-center justify-center gap-2 mb-4">
          <img src="/favicon.ico" class="w-8 h-8" />
          <h1 class="text-2xl font-bold">AI好助学</h1>
        </div>
        <h3 class="font-bold text-lg mb-4">添加题目</h3>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text"
              >题目标题<span class="text-error">*</span></span
            >
          </label>
          <textarea
            v-model="newQuestion.title"
            class="textarea textarea-bordered h-28"
            placeholder="请输入题目标题"
          />
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text"
              >题目内容<span class="text-error">*</span></span
            >
          </label>
          <textarea
            v-model="newQuestion.content"
            class="textarea textarea-bordered h-28"
            placeholder="请输入题目内容"
          />
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text"
              >难度等级<span class="text-error">*</span></span
            >
          </label>
          <div
            v-if="newQuestion && newQuestion.difficulty"
            class="rating rating-lg"
          >
            <input
              v-model="newQuestion.difficulty"
              type="radio"
              name="create-rating"
              class="mask mask-star-2 bg-green-500"
              value="1"
            />
            <input
              v-model="newQuestion.difficulty"
              type="radio"
              name="create-rating"
              class="mask mask-star-2 bg-yellow-500"
              value="2"
            />
            <input
              v-model="newQuestion.difficulty"
              type="radio"
              name="create-rating"
              class="mask mask-star-2 bg-red-500"
              value="3"
            />
          </div>
          <div class="text-sm mt-2">
            <span
              :class="{
                'text-green-500': newQuestion.difficulty === '1',
                'text-yellow-500': newQuestion.difficulty === '2',
                'text-red-500': newQuestion.difficulty === '3',
              }"
            >
              {{ difficultyMap[newQuestion.difficulty] }}
            </span>
          </div>
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showCreateModal = false">
            取消
          </button>
          <button class="btn btn-primary" @click="handleCreateQuestion">
            <span
              v-show="createLoading"
              class="loading loading-spinner loading-md"
            />
            确认添加
          </button>
        </div>
      </div>
      <div
        class="modal-backdrop bg-base-200 bg-opacity-50"
        @click="showCreateModal = false"
      />
    </dialog>

    <!-- AI创建题目模态框 -->
    <dialog class="modal" :open="showAICreateModal">
      <div class="modal-box w-500 rounded-xl shadow-lg">
        <h3 class="font-bold text-lg mb-4">AI创建题目</h3>
        <div class="form-control mb-4">
          <label class="label">
            <span>创建题目类型<span class="text-error">*</span></span>
          </label>
          <textarea
            v-model="aiRequestData"
            class="textarea textarea-bordered h-28"
            placeholder="请输入AI生成题目所需的请求数据"
          />
        </div>
        <div class="modal-action">
          <button class="btn" @click="showAICreateModal = false">取消</button>
          <button
            class="btn btn-primary"
            :disabled="aiCreateLoading"
            @click="handleAICreateQuestion"
          >
            <span v-if="aiCreateLoading" class="loading loading-spinner"></span>
            {{ aiCreateLoading ? '创建中...' : '确认创建' }}
          </button>
        </div>
      </div>
    </dialog>

    <!-- 批量添加题目模态框 -->
    <dialog class="modal" :open="showBatchAddModal">
      <div class="modal-box w-500 rounded-xl shadow-lg">
        <h3 class="font-bold text-lg mb-4">批量添加题目</h3>
        <div
          class="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg"
        >
          <input
            id="batchUpload"
            type="file"
            accept=".xlsx,.xls"
            class="hidden"
            @change="handleFileChange"
          />
          <label for="batchUpload" class="cursor-pointer">
            <div class="text-center">
              <FileQuestion
                theme="outline"
                size="48"
                class="text-base-content/30 mb-4"
              />
              <p class="text-base-content/70 text-lg mb-2">
                拖拽Excel文件到此处或点击上传
              </p>
              <p class="text-sm text-base-content/50">
                支持.xlsx和.xls格式文件
              </p>
            </div>
          </label>
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showBatchAddModal = false">
            取消
          </button>
          <button
            class="btn btn-primary"
            :disabled="!batchAddFile || !batchAddFile.value || batchAddLoading"
            @click="handleBatchAddQuestion"
          >
            <span
              v-if="batchAddLoading"
              class="loading loading-spinner loading-xs"
              :disabled="!batchAddFile"
              @click="handleBatchAddQuestion"
            />
            确认上传
          </button>
        </div>
      </div>
      <div
        class="modal-backdrop bg-base-200 bg-opacity-50"
        @click="showBatchAddModal = false"
      />
    </dialog>

    <!-- 编辑题目模态框 -->
    <dialog class="modal" :open="showEditModal">
      <div class="modal-box w-96 rounded-xl shadow-lg">
        <h3 class="font-bold text-lg mb-4">编辑题目</h3>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text"
              >题目标题<span class="text-error">*</span></span
            >
          </label>
          <textarea
            v-model="editQuestion.title"
            class="textarea textarea-bordered h-28"
            placeholder="请输入题目标题"
          />
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text"
              >题目内容<span class="text-error">*</span></span
            >
          </label>
          <textarea
            v-model="editQuestion.content"
            class="textarea textarea-bordered h-28"
            placeholder="请输入题目内容"
          />
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text"
              >难度等级<span class="text-error">*</span></span
            >
          </label>
          <div class="rating rating-lg">
            <input
              v-model="editQuestion.difficulty"
              type="radio"
              name="edit-rating"
              class="mask mask-star-2 bg-green-500"
              value="1"
            />
            <input
              v-model="editQuestion.difficulty"
              type="radio"
              name="edit-rating"
              class="mask mask-star-2 bg-yellow-500"
              value="2"
            />
            <input
              v-model="editQuestion.difficulty"
              type="radio"
              name="edit-rating"
              class="mask mask-star-2 bg-red-500"
              value="3"
            />
          </div>
          <div class="text-sm mt-2">
            <span
              :class="{
                'text-green-500': editQuestion.difficulty === '1',
                'text-yellow-500': editQuestion.difficulty === '2',
                'text-red-500': editQuestion.difficulty === '3',
              }"
            >
              {{ difficultyMap[editQuestion.difficulty] }}
            </span>
          </div>
        </div>
        <div class="form-control mb-4">
          <label class="label flex justify-start gap-2">
            <span class="label-text">状态</span>
            <input
              v-model="editQuestion.status"
              type="checkbox"
              class="toggle toggle-success"
            />
            <span class="text-sm">{{
              editQuestion.status ? '启用' : '停用'
            }}</span>
          </label>
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showEditModal = false">
            取消
          </button>
          <button
            class="btn btn-primary"
            :disabled="editLoading"
            @click="handleEditQuestion"
          >
            <span
              v-if="editLoading"
              class="loading loading-spinner loading-xs"
            />
            确认保存
          </button>
        </div>
      </div>
      <div
        class="modal-backdrop bg-base-200 bg-opacity-50"
        @click="showEditModal = false"
      />
    </dialog>

    <!-- 查看详情模态框 -->
    <dialog class="modal" :open="showDetailModal">
      <div class="modal-box w-96 rounded-xl shadow-lg">
        <h3 class="font-bold text-lg mb-4">题目详情</h3>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">题目ID</span>
          </label>
          <input
            v-model="detailQuestion.questionId"
            type="text"
            class="input input-bordered"
            readonly
          />
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">题目标题</span>
          </label>
          <input
            v-model="detailQuestion.title"
            type="text"
            class="input input-bordered"
            readonly
          />
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">题目内容</span>
          </label>
          <textarea
            v-model="detailQuestion.content"
            class="textarea textarea-bordered"
            readonly
          ></textarea>
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">难度</span>
          </label>
          <input
            type="text"
            :value="difficultyMap[detailQuestion.difficulty]"
            class="input input-bordered"
            readonly
          />
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">状态</span>
          </label>
          <input
            type="text"
            :value="detailQuestion.status ? '已启用' : '未启用'"
            class="input input-bordered"
            readonly
          />
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">创建时间</span>
          </label>
          <input
            type="text"
            :value="formatDate(detailQuestion.createdAt)"
            class="input input-bordered"
            readonly
          />
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showDetailModal = false">
            关闭
          </button>
        </div>
      </div>
    </dialog>

    <!-- 删除确认模态框 -->
    <dialog class="modal" :open="showDeleteModal">
      <div class="modal-box w-96 rounded-xl shadow-lg">
        <h3 class="font-bold text-lg mb-4">确认删除</h3>
        <p class="py-4">
          您确定要删除题目
          <span class="font-bold text-error">{{
            questionToDelete?.content
          }}</span>
          吗？此操作不可逆。
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showDeleteModal = false">
            取消
          </button>
          <button
            class="btn btn-error"
            :disabled="deleteLoading"
            @click="handleDeleteQuestion"
          >
            <span
              v-if="deleteLoading"
              class="loading loading-spinner loading-xs"
            />
            确认删除
          </button>
        </div>
      </div>
      <div
        class="modal-backdrop bg-base-200 bg-opacity-50"
        @click="showDeleteModal = false"
      />
    </dialog>
  </div>
</template>

<style scoped>
.truncate {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rating .mask-star-2 {
  cursor: pointer;
}
</style>
