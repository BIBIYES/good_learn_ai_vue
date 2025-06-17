<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import RichTextEditor from '@/components/common/RichTextEditor.vue'

const route = useRoute()
const router = useRouter()
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
      return 'success'
    case '2':
    case 'medium':
      return 'warning'
    case '3':
    case 'hard':
      return 'error'
    default:
      return 'info'
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
  if (!newQuestion.value.title) {
    message.error('题目标题不能为空')
    return
  }

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
        title: '',
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
  if (!editQuestion.value.title) {
    message.error('题目标题不能为空')
    return
  }

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
  // 不再自动下载模板，而是显示模态框
  showBatchAddModal.value = true
}

onMounted(() => {
  filterDifficulty.value = ''
  filterTitle.value = ''
  fetchQuestions()
})
</script>

<template>
  <div class="flex flex-col h-full p-4 bg-white relative">
    <div class="fixed right-0 bottom-0 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[rgba(100,220,130,0.18)] to-[rgba(80,200,110,0.04)] blur-3xl pointer-events-none"></div>
    <div class="fixed right-[20%] top-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-[rgba(100,180,255,0.1)] to-[rgba(70,150,230,0.03)] blur-3xl pointer-events-none"></div>
    <div class="fixed left-[15%] bottom-[15%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[rgba(255,210,100,0.08)] to-[rgba(230,190,80,0.02)] blur-3xl pointer-events-none"></div>
    <TitleBar class="p-4 mb-4">
      <template #title>
        <div class="flex flex-wrap items-center gap-2">
          <button @click="router.back()" class="btn btn-ghost btn-sm btn-circle">
            <ArrowLeft theme="outline" size="20" />
          </button>
          <FileQuestion theme="outline" size="38" />
          <span class="font-semibold">{{ bankName }}</span>
          <div v-if="!loading && total > 0" class="total-count-badge">
            总计：<span class="total-count-number">{{ total }}</span> 题
          </div>
        </div>
      </template>
      <template #module>
        <div class="flex flex-wrap gap-2 mt-2 md:mt-0">
          <button
            class="btn-liquid-glass"
            @click="showCreateModal = true"
          >
            <Add theme="outline" size="16" />
            <span class="hidden sm:inline">添加题目</span>
            <span class="sm:hidden">添加</span>
          </button>
          <button
            class="btn-liquid-glass"
            @click="handleBatchAddClick"
          >
            <Add theme="outline" size="16" />
            <span class="hidden md:inline">批量添加题目</span>
            <span class="md:hidden">批量添加</span>
          </button>
          <button
            class="btn-liquid-glass ai-btn"
            @click="showAICreateModal = true"
          >
            <Lightning theme="outline" size="16" />
            <span class="hidden md:inline">AI创建题目</span>
            <span class="md:hidden">AI创建</span>
          </button>
          <button
            class="btn-liquid-glass error"
            @click="handleBatchDeleteQuestions"
          >
            <Delete theme="outline" size="16" />
            <span class="hidden lg:inline">批量删除题目</span>
            <span class="lg:hidden">批量删除</span>
          </button>
        </div>
      </template>
    </TitleBar>

    <!-- Main content area -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      <!-- Filter box -->
      <div class="flex flex-wrap gap-4 p-4 mb-4">
        <div class="form-control flex-1 min-w-[200px] p-3 rounded-lg bg-gradient-to-br from-[rgba(248,255,250,0.15)] to-[rgba(245,253,248,0.08)] backdrop-blur-md border border-[rgba(140,220,160,0.25)]">
          <label class="label">
            <span class="label-text font-medium text-[rgba(60,180,110,0.8)]">难度筛选</span>
          </label>
          <select
            v-model="filterDifficulty"
            class="select w-full bg-[rgba(255,255,255,0.7)] backdrop-blur-sm border border-[rgba(140,220,160,0.3)] focus:border-[rgba(100,200,130,0.5)] focus:ring-2 focus:ring-[rgba(100,200,130,0.2)] transition-all duration-300"
          >
            <option value="">全部</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
        <div class="form-control flex-1 min-w-[200px] p-3 rounded-lg bg-gradient-to-br from-[rgba(248,255,250,0.15)] to-[rgba(245,253,248,0.08)] backdrop-blur-md border border-[rgba(140,220,160,0.25)]">
          <label class="label">
            <span class="label-text font-medium text-[rgba(60,180,110,0.8)]">标题搜索</span>
          </label>
          <input
            v-model="filterTitle"
            type="text"
            placeholder="输入标题关键词"
            class="input w-full bg-[rgba(255,255,255,0.7)] backdrop-blur-sm border border-[rgba(140,220,160,0.3)] focus:border-[rgba(100,200,130,0.5)] focus:ring-2 focus:ring-[rgba(100,200,130,0.2)] transition-all duration-300"
          />
        </div>
        <div class="form-control flex-1 min-w-[200px] p-3 rounded-lg bg-gradient-to-br from-[rgba(248,255,250,0.15)] to-[rgba(245,253,248,0.08)] backdrop-blur-md border border-[rgba(140,220,160,0.25)]">
          <label class="label">
            <span class="label-text font-medium text-[rgba(60,180,110,0.8)]">状态筛选</span>
          </label>
          <select 
            class="select w-full bg-[rgba(255,255,255,0.7)] backdrop-blur-sm border border-[rgba(140,220,160,0.3)] focus:border-[rgba(100,200,130,0.5)] focus:ring-2 focus:ring-[rgba(100,200,130,0.2)] transition-all duration-300"
          >
            <option value="">全部</option>
            <option value="true">已启用</option>
            <option value="false">未启用</option>
          </select>
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
        <div class="text-center glass-panel p-8">
          <FileQuestion
            theme="outline"
            size="64"
            class="text-gray-400 mb-6"
          />
          <p class="text-gray-600 text-xl font-medium mb-6">
            该题库暂无题目，快去添加一个吧！
          </p>
          <button class="btn-liquid-glass" @click="showCreateModal = true">
            <Add theme="outline" size="18" class="mr-2" />
            添加第一个题目
          </button>
        </div>
      </div>

      <!-- Questions Table -->
      <div v-else class="overflow-x-auto w-full">
        <!-- 移动端卡片视图 -->
        <div class="block lg:hidden">
          <div class="grid grid-cols-1 gap-4">
            <div
              v-for="question in questions"
              :key="question.questionId"
              class="bg-gradient-to-br from-[rgba(248,255,250,0.3)] to-[rgba(245,253,248,0.2)] backdrop-blur-md rounded-lg border border-[rgba(255,255,255,0.6)] shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
            >
              <!-- 卡片头部：ID和操作按钮 -->
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                  <input
                    v-model="selectedQuestions"
                    type="checkbox"
                    class="checkbox checkbox-sm checkbox-neutral"
                    :value="question.questionId"
                    :disabled="!selectedQuestions"
                  />
                  <span class="text-sm text-gray-600 font-medium">ID: {{ question.questionId }}</span>
                </div>
                <div class="dropdown dropdown-end">
                  <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12.5v.01M12 8.5v.01M12 16.5v.01M12 4.5v.01"></path>
                    </svg>
                  </div>
                  <ul tabindex="0" class="dropdown-content z-[1] menu menu-sm shadow bg-white rounded-lg w-32 border border-gray-200">
                    <li><a @click="openEditModal(question)"><Edit theme="outline" size="14" />编辑</a></li>
                    <li><a class="text-error" @click="openDeleteModal(question)"><Delete theme="outline" size="14" />删除</a></li>
                    <li><a @click="openDetailModal(question)">查看详情</a></li>
                  </ul>
                </div>
              </div>

              <!-- 题目标题 -->
              <div class="mb-3">
                <h3 class="font-bold text-lg text-gray-900 truncate">
                  {{ question.title || '无标题' }}
                </h3>
              </div>

              <!-- 题目内容 -->
              <div class="mb-4">
                <p class="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {{ question.content }}
                </p>
              </div>

              <!-- 状态和难度标签 -->
              <div class="flex flex-wrap gap-2 mb-4">
                <div
                  class="badge-liquid-glass"
                  :class="getDifficultyStyle(question.difficulty)"
                >
                  {{ difficultyMap[question.difficulty] || question.difficulty }}
                </div>
                <div
                  class="badge-liquid-glass"
                  :class="question.status ? 'success' : 'disabled'"
                >
                  {{ question.status ? '已启用' : '未启用' }}
                </div>
              </div>

              <!-- 创建时间 -->
              <div class="text-xs text-gray-500 mb-4 font-medium">
                创建时间: {{ formatDate(question.createdAt) }}
              </div>

              <!-- 操作按钮 -->
              <div class="flex flex-wrap gap-2">
                <button
                  class="btn-liquid-glass edit xs"
                  @click="openEditModal(question)"
                >
                  <Edit theme="outline" size="14" />
                  <span class="hidden sm:inline">编辑</span>
                </button>
                <button
                  class="btn-liquid-glass error xs"
                  @click="openDeleteModal(question)"
                >
                  <Delete theme="outline" size="14" />
                  <span class="hidden sm:inline">删除</span>
                </button>
                <button
                  class="btn-liquid-glass xs"
                  @click="openDetailModal(question)"
                >
                  <span class="hidden sm:inline">详情</span>
                  <span class="sm:hidden">查看</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 桌面端表格视图 -->
        <div class="overflow-x-auto bg-gradient-to-br from-[rgba(248,255,250,0.3)] to-[rgba(245,253,248,0.2)] backdrop-blur-md rounded-lg border border-[rgba(255,255,255,0.6)] shadow-sm hidden lg:block">
          <table class="table w-full">
            <!-- Table head -->
            <thead>
              <tr class="bg-[rgba(250, 255, 252, 0.4), rgba(248, 253, 250, 0.3)]">
                <th class="w-12">
                  <input
                    type="checkbox"
                    class="checkbox checkbox-neutral"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th class="w-20 font-semibold">ID</th>
                <th class="w-48 font-semibold">题目标题</th>
                <th class="min-w-64 font-semibold">题目内容</th>
                <th class="w-24 font-semibold text-center">难度</th>
                <th class="w-24 font-semibold text-center">状态</th>
                <th class="w-32 font-semibold">创建时间</th>
                <th class="w-48 font-semibold text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              <!-- Table rows -->
              <tr
                v-for="question in questions"
                :key="question.questionId"
                class="hover:bg-[rgba(245, 255, 250, 0.3), rgba(240, 253, 245, 0.2)] transition-colors duration-200"
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
                <td class="whitespace-nowrap text-sm font-medium">
                  {{ question.questionId }}
                </td>
                <td class="max-w-48">
                  <div class="truncate font-medium" :title="question.title">
                    {{ question.title || '无标题' }}
                  </div>
                </td>
                <td class="max-w-64">
                  <div class="truncate" :title="question.content">
                    {{ question.content }}
                  </div>
                </td>
                <td class="text-center">
                  <div
                    class="badge-liquid-glass mx-auto"
                    :class="getDifficultyStyle(question.difficulty)"
                  >
                    {{ difficultyMap[question.difficulty] || question.difficulty }}
                  </div>
                </td>
                <td class="text-center">
                  <div
                    class="badge-liquid-glass mx-auto"
                    :class="question.status ? 'success' : 'disabled'"
                  >
                    {{ question.status ? '已启用' : '未启用' }}
                  </div>
                </td>
                <td class="whitespace-nowrap text-sm font-medium">
                  {{ formatDate(question.createdAt) }}
                </td>
                <td class="whitespace-nowrap">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      class="btn-liquid-glass edit xs"
                      @click="openEditModal(question)"
                      title="编辑题目"
                    >
                      <Edit theme="outline" size="12" />
                    </button>
                    <button
                      class="btn-liquid-glass error xs"
                      @click="openDeleteModal(question)"
                      title="删除题目"
                    >
                      <Delete theme="outline" size="12" />
                    </button>
                    <button
                      class="btn-liquid-glass xs"
                      @click="openDetailModal(question)"
                      title="查看详情"
                    >
                      详情
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pagination section -->
    <div
      v-if="!loading && questions.length > 0"
      class="mt-auto py-6 flex justify-center items-center"
    >
      <div class="flex gap-2 pagination-container">
        <button
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          «
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          class="pagination-btn"
          :class="{ 'active': currentPage === page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        <button
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          »
        </button>
      </div>
    </div>

    <!-- Modals -->
    <!-- 添加题目模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[9999] flex items-center justify-center modal-container animate-modal-pop">
      <div class="absolute inset-0 bg-transparent" @click="showCreateModal = false"></div>
      <div class="relative z-[10000] bg-white rounded-xl w-11/12 max-w-3xl p-6 shadow-2xl border border-gray-100 m-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-xl">添加题目</h3>
          <button class="btn btn-sm btn-circle text-gray-500 hover:text-gray-700 hover:bg-gray-100" @click="showCreateModal = false">✕</button>
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">题目标题<span class="text-error">*</span></span>
          </label>
          <input
            v-model="newQuestion.title"
            class="input input-bordered"
            placeholder="请输入题目标题"
          />
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">题目内容<span class="text-error">*</span></span>
          </label>
          <RichTextEditor
            v-model="newQuestion.content"
            :height="300"
            :placeholder="'请输入题目内容'"
          />
        </div>
        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text font-medium">难度等级<span class="text-error">*</span></span>
          </label>
          <div class="flex items-center space-x-4">
            <div class="rating rating-lg custom-rating">
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
            <span
              :class="{
                'text-green-500 font-medium': newQuestion.difficulty === '1',
                'text-yellow-500 font-medium': newQuestion.difficulty === '2',
                'text-red-500 font-medium': newQuestion.difficulty === '3',
              }"
            >
              {{ difficultyMap[newQuestion.difficulty] }}
            </span>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn-liquid-glass bg-gray-50 hover:bg-gray-100 text-gray-700" @click="showCreateModal = false">
            取消
          </button>
          <button class="btn-liquid-glass wechat-green" @click="handleCreateQuestion">
            <span
              v-show="createLoading"
              class="loading loading-spinner loading-sm"
            />
            确认添加
          </button>
        </div>
      </div>
    </div>

    <!-- AI创建题目模态框 -->
    <div v-if="showAICreateModal" class="fixed inset-0 z-[9999] flex items-center justify-center modal-container animate-modal-pop">
      <div class="absolute inset-0 bg-transparent" @click="showAICreateModal = false"></div>
      <div class="relative z-[10000] bg-white rounded-xl w-11/12 max-w-3xl p-6 shadow-2xl border border-gray-100 m-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-xl">AI创建题目</h3>
          <button class="btn btn-sm btn-circle text-gray-500 hover:text-gray-700 hover:bg-gray-100" @click="showAICreateModal = false">✕</button>
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">创建题目类型<span class="text-error">*</span></span>
          </label>
          <RichTextEditor
            v-model="aiRequestData"
            :height="300"
            :placeholder="'请输入AI生成题目所需的请求数据'"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn-liquid-glass bg-gray-50 hover:bg-gray-100 text-gray-700" @click="showAICreateModal = false">取消</button>
                      <button
              class="btn-liquid-glass wechat-green"
              :disabled="aiCreateLoading"
              @click="handleAICreateQuestion"
            >
              <span v-if="aiCreateLoading" class="loading loading-spinner loading-sm"></span>
              {{ aiCreateLoading ? '创建中...' : '确认创建' }}
            </button>
        </div>
      </div>
    </div>

    <!-- 批量添加题目模态框 -->
    <div v-if="showBatchAddModal" class="fixed inset-0 z-[9999] flex items-center justify-center modal-container animate-modal-pop">
      <div class="absolute inset-0 bg-transparent" @click="showBatchAddModal = false"></div>
      <div class="relative z-[10000] bg-white rounded-xl w-11/12 max-w-3xl p-6 shadow-2xl border border-gray-100 m-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-xl">批量添加题目</h3>
          <button class="btn btn-sm btn-circle text-gray-500 hover:text-gray-700 hover:bg-gray-100" @click="showBatchAddModal = false">✕</button>
        </div>
        <div class="flex flex-col gap-6 mb-6">
          <!-- 下载模板选项 -->
          <div class="form-control">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="checkbox checkbox-success" />
              <span class="label-text text-base font-medium">下载Excel导入模板</span>
            </label>
            <div class="mt-2">
                              <button 
                class="btn-liquid-glass wechat-green-light" 
                @click="handleDownloadTemplate"
              >
                <FileQuestion theme="outline" size="16" />
                下载模板
              </button>
            </div>
          </div>
          
          <!-- 文件上传区域 -->
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
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn-liquid-glass bg-gray-50 hover:bg-gray-100 text-gray-700" @click="showBatchAddModal = false">
            取消
          </button>
                      <button
              class="btn-liquid-glass wechat-green"
              :disabled="!batchAddFile || !batchAddFile.value || batchAddLoading"
              @click="handleBatchAddQuestion"
            >
              <span
                v-if="batchAddLoading"
                class="loading loading-spinner loading-sm"
              />
              确认上传
            </button>
        </div>
      </div>
    </div>

    <!-- 编辑题目模态框 -->
    <div v-if="showEditModal" class="fixed inset-0 z-[9999] flex items-center justify-center modal-container animate-modal-pop">
      <div class="absolute inset-0 bg-transparent" @click="showEditModal = false"></div>
      <div class="relative z-[10000] bg-white rounded-xl w-11/12 max-w-3xl p-6 shadow-2xl border border-gray-100 m-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-xl">编辑题目</h3>
          <button class="btn btn-sm btn-circle text-gray-500 hover:text-gray-700 hover:bg-gray-100" @click="showEditModal = false">✕</button>
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">题目标题<span class="text-error">*</span></span>
          </label>
          <input
            v-model="editQuestion.title"
            class="input input-bordered"
            placeholder="请输入题目标题"
          />
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">题目内容<span class="text-error">*</span></span>
          </label>
          <RichTextEditor
            v-model="editQuestion.content"
            :height="300"
            :placeholder="'请输入题目内容'"
          />
        </div>
        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text font-medium">难度等级<span class="text-error">*</span></span>
          </label>
          <div class="flex items-center space-x-4">
            <div class="rating rating-lg custom-rating">
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
            <span
              :class="{
                'text-green-500 font-medium': editQuestion.difficulty === '1',
                'text-yellow-500 font-medium': editQuestion.difficulty === '2',
                'text-red-500 font-medium': editQuestion.difficulty === '3',
              }"
            >
              {{ difficultyMap[editQuestion.difficulty] }}
            </span>
          </div>
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">状态</span>
          </label>
          <div class="flex items-center space-x-2">
            <input
              v-model="editQuestion.status"
              type="checkbox"
              class="toggle toggle-success"
            />
            <span class="text-sm">{{ editQuestion.status ? '启用' : '禁用' }}</span>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn-liquid-glass bg-gray-50 hover:bg-gray-100 text-gray-700" @click="showEditModal = false">
            取消
          </button>
          <button class="btn-liquid-glass wechat-green" @click="handleEditQuestion">
            <span
              v-show="editLoading"
              class="loading loading-spinner loading-sm"
            />
            确认修改
          </button>
        </div>
      </div>
    </div>

    <!-- 查看详情模态框 -->
    <div v-if="showDetailModal" class="fixed inset-0 z-[9999] flex items-center justify-center modal-container animate-modal-pop">
      <div class="absolute inset-0 bg-transparent" @click="showDetailModal = false"></div>
      <div class="relative z-[10000] bg-white rounded-xl w-96 p-6 shadow-2xl border border-gray-100 m-auto">
        <h3 class="font-bold text-lg mb-4">题目详情</h3>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">题目ID</span>
          </label>
          <input
            v-model="detailQuestion.questionId"
            type="text"
            class="input glass-input-border"
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
            class="input glass-input-border"
            readonly
          />
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">题目内容</span>
          </label>
          <textarea
            v-model="detailQuestion.content"
            class="textarea glass-input-border"
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
            class="input glass-input-border"
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
            class="input glass-input-border"
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
            class="input glass-input-border"
            readonly
          />
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn-liquid-glass bg-gray-50 hover:bg-gray-100 text-gray-700" @click="showDetailModal = false">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-[9999] flex items-center justify-center modal-container animate-modal-pop">
      <div class="absolute inset-0 bg-transparent" @click="showDeleteModal = false"></div>
      <div class="relative z-[10000] bg-white rounded-xl w-96 p-6 shadow-2xl border border-gray-100 m-auto">
        <h3 class="font-bold text-lg mb-4">确认删除</h3>
        <p class="py-4">
          您确定要删除题目
          <span class="font-bold text-error">{{
            questionToDelete?.content
          }}</span>
          吗？此操作不可逆。
        </p>
        <div class="flex justify-end gap-2">
          <button class="btn-liquid-glass bg-gray-50 hover:bg-gray-100 text-gray-700" @click="showDeleteModal = false">
            取消
          </button>
          <button
            class="btn-liquid-glass wechat-green"
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
    </div>
  </div>
</template>

<style scoped>
.truncate {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rating .mask-star-2 {
  cursor: pointer;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .table {
    display: none;
  }
}

.badge {
  white-space: nowrap;
  font-size: 0.75rem;
}

@media (max-width: 480px) {
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .btn-xs {
    padding: 0.125rem 0.25rem;
    font-size: 0.625rem;
  }
}


.btn {
  flex-shrink: 0;
}

.btn.flex-1 {
  flex-shrink: 1;
  min-width: 0;
}


@media (max-width: 640px) {
  .flex-wrap {
    gap: 0.25rem;
  }
  
  .btn {
    min-width: 2.5rem;
  }
}

.btn-liquid-glass {
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: linear-gradient(145deg, rgba(248, 255, 252, 0.7), rgba(245, 253, 248, 0.6));
  color: rgb(40, 130, 90);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(248, 255, 252, 0.5);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05), 
              inset 0 1px 1px rgba(255, 255, 255, 0.6);
}

.btn-liquid-glass:hover {
  background: linear-gradient(145deg, rgba(250, 255, 253, 0.8), rgba(248, 253, 250, 0.7));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08), 
              inset 0 1px 1px rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.btn-liquid-glass:active {
  background: linear-gradient(145deg, rgba(245, 253, 248, 0.7), rgba(242, 250, 245, 0.6));
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04), 
              inset 0 1px 1px rgba(255, 255, 255, 0.4);
  transform: translateY(0);
}

.btn-liquid-glass.info {
  background: linear-gradient(145deg, rgba(147, 112, 255, 0.9), rgba(100, 70, 220, 0.8));
  color: white;
  border-color: rgba(147, 112, 255, 0.4);
  box-shadow: 0 2px 10px rgba(100, 70, 220, 0.2), 
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.btn-liquid-glass.info:hover {
  background: linear-gradient(145deg, rgba(157, 122, 255, 0.95), rgba(110, 80, 230, 0.85));
  box-shadow: 0 4px 15px rgba(100, 70, 220, 0.25), 
              inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.btn-liquid-glass.info:active {
  background: linear-gradient(145deg, rgba(137, 102, 245, 0.9), rgba(90, 60, 210, 0.8));
  box-shadow: 0 2px 5px rgba(100, 70, 220, 0.15), 
              inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.btn-liquid-glass.error {
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.7));
  color: white;
  border-color: rgba(239, 68, 68, 0.3);
  box-shadow: 0 2px 10px rgba(220, 38, 38, 0.15), 
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.btn-liquid-glass.error:hover {
  background: linear-gradient(145deg, rgba(249, 78, 78, 0.9), rgba(230, 48, 48, 0.8));
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.2), 
              inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.btn-liquid-glass.error:active {
  background: linear-gradient(145deg, rgba(229, 58, 58, 0.8), rgba(210, 28, 28, 0.7));
  box-shadow: 0 2px 5px rgba(220, 38, 38, 0.1), 
              inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.btn-liquid-glass.xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.5rem;
}

.btn-liquid-glass:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03), 
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.badge-liquid-glass {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.badge-liquid-glass.success {
  background: linear-gradient(145deg, rgba(34, 197, 94, 0.3), rgba(21, 128, 61, 0.2));
  color: rgb(21, 128, 61);
  border: 1px solid rgba(34, 197, 94, 0.4);
  box-shadow: 0 1px 3px rgba(21, 128, 61, 0.1), 
              inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

.badge-liquid-glass.warning {
  background: linear-gradient(145deg, rgba(234, 179, 8, 0.3), rgba(161, 98, 7, 0.2));
  color: rgb(161, 98, 7);
  border: 1px solid rgba(234, 179, 8, 0.4);
  box-shadow: 0 1px 3px rgba(161, 98, 7, 0.1), 
              inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

.badge-liquid-glass.error {
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.3), rgba(185, 28, 28, 0.2));
  color: rgb(185, 28, 28);
  border: 1px solid rgba(239, 68, 68, 0.4);
  box-shadow: 0 1px 3px rgba(185, 28, 28, 0.1), 
              inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

.badge-liquid-glass.disabled {
  background: linear-gradient(145deg, rgba(156, 163, 175, 0.3), rgba(75, 85, 99, 0.2));
  color: rgb(75, 85, 99);
  border: 1px solid rgba(156, 163, 175, 0.4);
  box-shadow: 0 1px 3px rgba(75, 85, 99, 0.1), 
              inset 0 1px 1px rgba(255, 255, 255, 0.5);
}


.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.glass-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.glass-input-border {
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
}

.glass-upload {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.glass-upload:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(59, 130, 246, 0.5);
}

.table {
  background: transparent;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 0.75rem;
  overflow: hidden;
}

.table thead tr {
  background: linear-gradient(145deg, rgba(250, 255, 252, 0.4), rgba(248, 253, 250, 0.3));
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
}

.table thead th {
  padding: 1rem;
  font-weight: 600;
  text-align: left;
  color: rgba(0, 0, 0, 0.7);
}

.table tbody tr:nth-child(even) {
  background: linear-gradient(145deg, rgba(250, 255, 252, 0.25), rgba(248, 253, 250, 0.15));
  backdrop-filter: blur(5px);
}

.table tbody tr:nth-child(odd) {
  background: linear-gradient(145deg, rgba(248, 253, 250, 0.15), rgba(245, 250, 248, 0.1));
  backdrop-filter: blur(5px);
}

.table tbody tr:hover {
  background: linear-gradient(145deg, rgba(245, 255, 250, 0.3), rgba(240, 253, 245, 0.2));
}

.table tbody td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

/* 题目总数徽章 */
.total-count-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  background: rgba(34, 197, 94, 0.08);
  color: rgb(21, 128, 61);
  border: 1px solid rgba(34, 197, 94, 0.12);
}

.total-count-number {
  font-weight: 700;
  color: rgb(21, 128, 61);
}

/* 自定义星级评分样式 */
.custom-rating .mask-star-2 {
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  background-size: contain;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  margin-right: 0.5rem;
  position: relative;
  transition: all 0.2s ease;
}

.custom-rating .mask-star-2:hover {
  transform: scale(1.1);
}

.custom-rating .mask-star-2:checked {
  transform: scale(1.15);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(255, 255, 255, 0.5);
}

.custom-rating .mask-star-2.bg-green-500 {
  background-color: #22c55e;
}

.custom-rating .mask-star-2.bg-yellow-500 {
  background-color: #eab308;
}

.custom-rating .mask-star-2.bg-red-500 {
  background-color: #ef4444;
}

.custom-toggle {
  height: 1.5rem;
  width: 3rem;
  background-color: rgba(200, 200, 200, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.custom-toggle:checked {
  background-color: #22c55e;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.custom-toggle:focus {
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

@media (max-width: 768px) {
  .total-count-badge {
    margin-top: 0.5rem;
    height: 2rem;
    padding: 0.25rem 0.75rem;
  }
  
  .total-count-number {
    font-size: 1rem;
  }
  
  .pagination-btn {
    min-width: 2.5rem;
    height: 2.5rem;
    font-size: 0.875rem;
  }
}

/* 分页器样式 */
.pagination-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: linear-gradient(145deg, rgba(248, 255, 252, 0.7), rgba(245, 253, 248, 0.6));
  color: rgb(40, 130, 90);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(248, 255, 252, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 
              inset 0 1px 1px rgba(255, 255, 255, 0.6);
}

.pagination-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, rgba(34, 197, 94, 0.1), rgba(21, 128, 61, 0.05));
  border-color: rgba(34, 197, 94, 0.2);
  box-shadow: 0 2px 5px rgba(21, 128, 61, 0.05), 
              inset 0 1px 1px rgba(255, 255, 255, 0.7);
}

.pagination-btn.active {
  background: linear-gradient(145deg, rgba(34, 197, 94, 0.15), rgba(21, 128, 61, 0.1));
  border-color: rgba(34, 197, 94, 0.25);
  color: rgb(21, 128, 61);
  box-shadow: 0 2px 5px rgba(21, 128, 61, 0.08), 
              inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 
              inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.join .pagination-btn:first-child {
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

.join .pagination-btn:last-child {
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

:deep(.rich-text-editor) {
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.w-e-toolbar) {
  background: rgba(249, 250, 251, 0.9) !important;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5) !important;
  backdrop-filter: blur(5px);
}

:deep(.w-e-text-container) {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(5px);
}

:deep(.w-e-menu-item) {
  background: transparent !important;
}

:deep(.w-e-menu-item:hover) {
  background: rgba(59, 130, 246, 0.1) !important;
}

.btn-liquid-glass.edit {
  background: linear-gradient(145deg, rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.7));
  color: white;
  border-color: rgba(96, 165, 250, 0.3);
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.15), 
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.btn-liquid-glass.edit:hover {
  background: linear-gradient(145deg, rgba(116, 185, 255, 0.9), rgba(79, 150, 255, 0.8));
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2), 
              inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.btn-liquid-glass.edit:active {
  background: linear-gradient(145deg, rgba(76, 145, 230, 0.8), rgba(39, 110, 226, 0.7));
  box-shadow: 0 2px 5px rgba(59, 130, 246, 0.1), 
              inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

/* AI按钮专用样式，优先级更高 */
.btn-liquid-glass.ai-btn {
  background: linear-gradient(145deg, rgba(147, 112, 255, 0.9), rgba(100, 70, 220, 0.8));
  color: white;
  border-color: rgba(147, 112, 255, 0.4);
  box-shadow: 0 2px 10px rgba(100, 70, 220, 0.2), 
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.btn-liquid-glass.ai-btn:hover {
  background: linear-gradient(145deg, rgba(157, 122, 255, 0.95), rgba(110, 80, 230, 0.85));
  box-shadow: 0 4px 15px rgba(100, 70, 220, 0.25), 
              inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.btn-liquid-glass.ai-btn:active {
  background: linear-gradient(145deg, rgba(137, 102, 245, 0.9), rgba(90, 60, 210, 0.8));
  box-shadow: 0 2px 5px rgba(100, 70, 220, 0.15), 
              inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.btn-liquid-glass.ai-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03), 
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

/* 微信风格绿色按钮 */
.btn-liquid-glass.wechat-green {
  background: #07C160;
  color: white;
  border: none;
  box-shadow: 0 2px 6px rgba(7, 193, 96, 0.3);
}

.btn-liquid-glass.wechat-green:hover {
  background: #06AD56;
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.4);
}

.btn-liquid-glass.wechat-green:active {
  background: #069E4F;
  box-shadow: 0 2px 4px rgba(7, 193, 96, 0.3);
}

.btn-liquid-glass.wechat-green:disabled {
  background: rgba(7, 193, 96, 0.5);
  opacity: 0.8;
  cursor: not-allowed;
  transform: none;
}

.btn-liquid-glass.wechat-green-light {
  background: rgba(7, 193, 96, 0.1);
  color: #07C160;
  border: 1px solid rgba(7, 193, 96, 0.3);
  box-shadow: 0 2px 4px rgba(7, 193, 96, 0.1);
}

.btn-liquid-glass.wechat-green-light:hover {
  background: rgba(7, 193, 96, 0.15);
  border-color: rgba(7, 193, 96, 0.4);
  box-shadow: 0 3px 8px rgba(7, 193, 96, 0.15);
}

.btn-liquid-glass.wechat-green-light:active {
  background: rgba(7, 193, 96, 0.2);
  box-shadow: 0 1px 3px rgba(7, 193, 96, 0.1);
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; 
  overflow: auto;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  z-index: 1001;
}

.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1002; 
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow-y: auto; 
}


@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

.animate-modal-pop > div:last-child {
  animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  margin: auto;
  position: relative; 
  z-index: 1003; 
}


.modal-container > div:last-child {
  max-height: 80vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 200, 130, 0.3) transparent;
  margin: auto;
}

.modal-container > div:last-child::-webkit-scrollbar {
  width: 5px;
}

.modal-container > div:last-child::-webkit-scrollbar-track {
  background: transparent;
}

.modal-container > div:last-child::-webkit-scrollbar-thumb {
  background-color: rgba(100, 200, 130, 0.3);
  border-radius: 10px;
}

.modal-box {
  background: white !important;
  backdrop-filter: none !important;
  border: 1px solid rgba(220, 240, 230, 0.5);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.0);
  padding: 1.5rem;
  max-height: 90vh;
  overflow-y: auto;
}


.modal-box .form-control,
.modal-box input,
.modal-box select,
.modal-box .rich-text-editor,
.modal-box button {
  backdrop-filter: none !important;
}


.modal-backdrop button {
  display: none;
}


[class*="modal"] button.btn-liquid-glass {
  transition: all 0.2s ease;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

[class*="modal"] button.btn-liquid-glass:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}


[class*="modal"] h3 {
  color: rgba(40, 130, 90, 0.9);
  font-weight: 600;
  letter-spacing: 0.01em;
}

.modal-container .relative[class^="z-"],
.modal-container .relative.z-10000 {
  border-radius: 16px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.1),
    0 4px 15px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.9) inset;
  max-width: 90vw;
  max-height: 85vh;
  position: relative;
  z-index: 10000; 
  overflow-y: auto; 
  background-color: rgba(255, 255, 255, 0.98); 
  backdrop-filter: blur(5px); 
}


@media (max-width: 768px) {
  .modal-container .relative[class^="z-"],
  .modal-container .relative.z-10000 {
    width: 95vw !important;
    max-height: 80vh;
  }
}
</style>
