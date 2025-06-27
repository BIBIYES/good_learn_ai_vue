<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuestionBankById } from '@/api/question'
import message from '@/plugin/message'

import DgLoadingText from '@/components/common/GdLoadingText.vue'

// 导入模态框组件
import CreateQuestionModal from './components/CreateQuestionModal.vue'
import EditQuestionModal from './components/EditQuestionModal.vue'
import DeleteQuestionModal from './components/DeleteQuestionModal.vue'
import BatchAddQuestionModal from './components/BatchAddQuestionModal.vue'
import QuestionDetailModal from './components/QuestionDetailModal.vue'
import BatchDeleteQuestionModal from './components/BatchDeleteQuestionModal.vue'
import AIQuestionGenerate from './components/AIQuestionGenerate.vue'

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

// 统一管理所有模态框状态
const modals = ref({
  create: false,
  edit: false,
  delete: false,
  detail: false,
  batchAdd: false,
  batchDelete: false,
  aiGenerate: false,
})

// 编辑题目数据
const editQuestion = ref({
  questionId: '',
  bankId: bankId.value,
  content: '',
  difficulty: '1',
  status: true,
})

// 删除题目数据
const questionToDelete = ref(null)

// 查看详情数据
const detailQuestion = ref({})

// 获取题目列表
const fetchQuestions = async (page = 1) => {
  loading.value = true
  try {
    const res = await getQuestionBankById(
      pageSize.value,
      page,
      bankId.value,
      filterDifficulty.value || '',
      filterTitle.value || '',
    )

    if (res.code === 200 && res.data) {
      questions.value = res.data.records || []
      currentPage.value = res.data.current || 1
      totalPages.value = res.data.pages || 1
      total.value = res.data.total || 0

      if (questions.value.length === 0) {
        message.info('当前题库没有题目或没有匹配的题目')
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

// 规范化难度值
const normalizeDifficulty = difficulty => {
  return difficulty === 'easy'
    ? '1'
    : difficulty === 'medium'
      ? '2'
      : difficulty === 'hard'
        ? '3'
        : difficulty
}

// 统一的模态框控制函数
const openModal = (type, data = null) => {
  modals.value[type] = true
  if (type === 'edit' && data) {
    editQuestion.value = {
      questionId: data.questionId,
      bankId: data.bankId,
      content: data.content,
      title: data.title,
      difficulty: normalizeDifficulty(data.difficulty),
      status: data.status,
    }
  }
  if (type === 'delete' && data) {
    questionToDelete.value = data
  }
  if (type === 'detail' && data) {
    detailQuestion.value = { ...data }
  }
}

const closeModal = type => {
  modals.value[type] = false
  // 清理相关数据
  if (type === 'edit') editQuestion.value = {}
  if (type === 'delete') questionToDelete.value = null
  if (type === 'detail') detailQuestion.value = {}
}

// 监听dialog的close事件
const handleDialogClose = type => {
  closeModal(type)
}

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
const handleBatchDeleteQuestions = () => {
  if (selectedQuestions.value.length === 0) {
    message.error('请至少选择一个题目进行删除')
    return
  }

  // 打开批量删除模态框
  openModal('batchDelete')
}

const selectedQuestions = ref([])

// 监听筛选条件变化
watch([filterDifficulty, filterTitle], () => {
  fetchQuestions(1)
})

// 页面数据刷新处理函数
const handleDataRefresh = () => {
  fetchQuestions(currentPage.value)
}

// AI生成成功后的处理
const handleAIGenerateSuccess = () => {
  handleDataRefresh()
  closeModal('aiGenerate')
}

// 批量删除成功后的处理
const handleBatchDeleteSuccess = () => {
  selectedQuestions.value = []
  closeModal('batchDelete')
  // 刷新数据
  fetchQuestions(currentPage.value)
}

onMounted(() => {
  filterDifficulty.value = ''
  filterTitle.value = ''
  fetchQuestions()
})
</script>

<template>
  <div class="question-bank-detail-page">
    <TitleBar class="page-title-bar">
      <template #title>
        <div class="title-content">
          <button
            class="btn btn-ghost btn-sm btn-circle"
            @click="router.back()"
          >
            <LineMdArrowLeft />
          </button>
          <LineMdQuestionCircle />
          <span class="bank-name">{{ bankName }}</span>
          <div v-if="!loading && total > 0" class="total-count-badge">
            总计：<span class="total-count-number">{{ total }}</span> 题
          </div>
        </div>
      </template>
      <template #module>
        <div class="module-actions">
          <button class="btn-liquid-glass" @click="openModal('create')">
            <LineMdPlus />
            <span class="btn-text-desktop">添加题目</span>
            <span class="btn-text-mobile">添加</span>
          </button>
          <button class="btn-liquid-glass" @click="openModal('batchAdd')">
            <LineMdPlus />
            <span class="btn-text-desktop-md">批量添加题目</span>
            <span class="btn-text-mobile-md">批量添加</span>
          </button>
          <button class="btn-liquid-glass" disabled title="功能开发中">
            <LineMdQuestionCircle />
            <span class="btn-text-desktop-md">导出题目(开发中)</span>
            <span class="btn-text-mobile-md">导出(开发中)</span>
          </button>
          <button
            class="btn-liquid-glass ai-btn"
            @click="openModal('aiGenerate')"
          >
            <LineMdFlash />
            <span class="btn-text-desktop-md">AI创建题目</span>
            <span class="btn-text-mobile-md">AI创建</span>
          </button>
          <button
            class="btn-liquid-glass error"
            :disabled="selectedQuestions.length === 0"
            @click="handleBatchDeleteQuestions"
          >
            <LineMdTrash />
            <span class="btn-text-desktop-lg">批量删除题目</span>
            <span class="btn-text-mobile-lg">批量删除</span>
          </button>
        </div>
      </template>
    </TitleBar>

    <!-- Main content area -->
    <div class="main-content">
      <!-- Filter box -->
      <div class="filter-box">
        <div class="filter-item">
          <label class="label">
            <span class="filter-label">难度筛选</span>
          </label>
          <select v-model="filterDifficulty" class="select filter-select">
            <option value="">全部</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="label">
            <span class="filter-label">标题搜索</span>
          </label>
          <input
            v-model="filterTitle"
            type="text"
            placeholder="输入标题关键词"
            class="input filter-input"
          />
        </div>
        <div class="filter-item">
          <label class="label">
            <span class="filter-label">状态筛选</span>
          </label>
          <select class="select filter-select">
            <option value="">全部</option>
            <option value="true">已启用</option>
            <option value="false">未启用</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-box">
          <div class="loading-content">
            <DgLoadingText text="正在获取题目列表...."></DgLoadingText>
          </div>
        </div>
      </div>

      <!-- Questions Table -->
      <div v-else class="questions-container">
        <!-- 移动端卡片视图 -->
        <div class="mobile-view">
          <div class="mobile-cards-grid">
            <div
              v-for="question in questions"
              :key="question.questionId"
              class="question-card"
            >
              <!-- 卡片头部：ID和操作按钮 -->
              <div class="card-header">
                <div class="card-id-section">
                  <input
                    v-model="selectedQuestions"
                    type="checkbox"
                    class="checkbox checkbox-sm checkbox-neutral"
                    :value="question.questionId"
                    :disabled="!selectedQuestions"
                  />
                  <span class="question-id">ID: {{ question.questionId }}</span>
                </div>
                <div class="dropdown dropdown-end">
                  <div
                    tabindex="0"
                    role="button"
                    class="btn btn-ghost btn-sm btn-circle"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      class="card-actions-icon"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 12.5v.01M12 8.5v.01M12 16.5v.01M12 4.5v.01"
                      ></path>
                    </svg>
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content z-[1] menu menu-sm shadow bg-white rounded-lg w-32 border border-gray-200"
                  >
                    <li>
                      <a @click="openModal('edit', question)"
                        ><LineMdEdit />编辑</a
                      >
                    </li>
                    <li>
                      <a
                        class="text-error"
                        @click="openModal('delete', question)"
                        ><LineMdTrash />删除</a
                      >
                    </li>
                    <li>
                      <a @click="openModal('detail', question)">查看详情</a>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- 题目标题 -->
              <div class="card-title-section">
                <h3 class="question-title">
                  {{ question.title || '无标题' }}
                </h3>
              </div>

              <!-- 题目内容 -->
              <div class="card-content-section">
                <p class="question-content">
                  {{ question.content }}
                </p>
              </div>

              <!-- 状态和难度标签 -->
              <div class="card-tags-section">
                <div
                  class="badge-liquid-glass"
                  :class="getDifficultyStyle(question.difficulty)"
                >
                  {{
                    difficultyMap[question.difficulty] || question.difficulty
                  }}
                </div>
                <div
                  class="badge-liquid-glass"
                  :class="question.status ? 'success' : 'disabled'"
                >
                  {{ question.status ? '已启用' : '未启用' }}
                </div>
              </div>

              <!-- 创建时间 -->
              <div class="card-time-section">
                创建时间: {{ formatDate(question.createdAt) }}
              </div>

              <!-- 操作按钮 -->
              <div class="card-actions-section">
                <button
                  class="btn-liquid-glass edit xs"
                  @click="openModal('edit', question)"
                >
                  <LineMdEdit />
                  <span class="btn-text-desktop">编辑</span>
                </button>
                <button
                  class="btn-liquid-glass error xs"
                  @click="openModal('delete', question)"
                >
                  <LineMdTrash />
                  <span class="btn-text-desktop">删除</span>
                </button>
                <button
                  class="btn-liquid-glass xs"
                  @click="openModal('detail', question)"
                >
                  <span class="btn-text-desktop">详情</span>
                  <span class="btn-text-mobile">查看</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 桌面端表格视图 -->
        <div class="desktop-view">
          <table class="table w-full">
            <!-- Table head -->
            <thead>
              <tr class="table-header-row">
                <th class="checkbox-cell">
                  <input
                    type="checkbox"
                    class="checkbox checkbox-neutral"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th class="id-cell">ID</th>
                <th class="title-cell">题目标题</th>
                <th class="content-cell">题目内容</th>
                <th class="difficulty-cell">难度</th>
                <th class="status-cell">状态</th>
                <th class="time-cell">创建时间</th>
                <th class="actions-cell">操作</th>
              </tr>
            </thead>
            <tbody>
              <!-- Table rows -->
              <tr
                v-for="question in questions"
                :key="question.questionId"
                class="table-body-row"
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
                <td class="question-id-text">
                  {{ question.questionId }}
                </td>
                <td class="max-w-48">
                  <div class="truncate-text" :title="question.title">
                    {{ question.title || '无标题' }}
                  </div>
                </td>
                <td class="max-w-64">
                  <div class="truncate-text" :title="question.content">
                    {{ question.content }}
                  </div>
                </td>
                <td class="text-center">
                  <div
                    class="badge-liquid-glass mx-auto"
                    :class="getDifficultyStyle(question.difficulty)"
                  >
                    {{
                      difficultyMap[question.difficulty] || question.difficulty
                    }}
                  </div>
                </td>
                <td>
                  <div
                    class="badge-liquid-glass mx-auto"
                    :class="question.status ? 'success' : 'disabled'"
                  >
                    {{ question.status ? '已启用' : '未启用' }}
                  </div>
                </td>
                <td class="time-text">
                  {{ formatDate(question.createdAt) }}
                </td>
                <td class="whitespace-nowrap">
                  <div class="table-actions">
                    <button
                      class="btn-liquid-glass edit xs"
                      title="编辑题目"
                      @click="openModal('edit', question)"
                    >
                      <LineMdEdit />
                    </button>
                    <button
                      class="btn-liquid-glass error xs"
                      title="删除题目"
                      @click="openModal('delete', question)"
                    >
                      <LineMdTrash />
                    </button>
                    <button
                      class="btn-liquid-glass xs"
                      title="查看详情"
                      @click="openModal('detail', question)"
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
    <div v-if="!loading" class="pagination-section">
      <div class="pagination-container">
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
          :class="{ active: currentPage === page }"
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

    <!-- 添加题目模态框 -->
    <dialog
      id="create-question-modal"
      class="modal"
      :open="modals.create"
      @close="handleDialogClose('create')"
    >
      <div class="modal-box max-w-3xl">
        <CreateQuestionModal :bank-id="bankId" @success="handleDataRefresh" />
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
        @click="closeModal('create')"
      >
        <button>关闭</button>
      </form>
    </dialog>

    <!-- AI创建题目模态框 -->
    <dialog
      id="ai-generate-modal"
      class="modal"
      :open="modals.aiGenerate"
      @close="handleDialogClose('aiGenerate')"
    >
      <div class="modal-box max-w-none w-auto">
        <h3 class="modal-title">题目生成器</h3>
        <AIQuestionGenerate
          :bank-id="bankId"
          @success="handleAIGenerateSuccess"
        />
      </div>

      <form
        method="dialog"
        class="modal-backdrop"
        @click="closeModal('aiGenerate')"
      >
        <button>关闭</button>
      </form>
    </dialog>

    <!-- 批量添加题目模态框 -->
    <dialog
      id="batch-add-question-modal"
      class="modal"
      :open="modals.batchAdd"
      @close="handleDialogClose('batchAdd')"
    >
      <div class="modal-box max-w-3xl">
        <BatchAddQuestionModal :bank-id="bankId" @success="handleDataRefresh" />
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
        @click="closeModal('batchAdd')"
      >
        <button>关闭</button>
      </form>
    </dialog>

    <!-- 编辑题目模态框 -->
    <dialog
      id="edit-question-modal"
      class="modal"
      :open="modals.edit"
      @close="handleDialogClose('edit')"
    >
      <div class="modal-box max-w-3xl">
        <EditQuestionModal
          :question-data="editQuestion"
          @success="handleDataRefresh"
        />
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeModal('edit')">
        <button>关闭</button>
      </form>
    </dialog>

    <!-- 删除确认模态框 -->
    <dialog
      id="delete-question-modal"
      class="modal"
      :open="modals.delete"
      @close="handleDialogClose('delete')"
    >
      <div class="modal-box max-w-md">
        <h3 class="modal-title">删除题目</h3>
        <DeleteQuestionModal
          :question="questionToDelete"
          @success="handleDataRefresh"
        />
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
        @click="closeModal('delete')"
      >
        <button>关闭</button>
      </form>
    </dialog>

    <!-- 详情模态框 -->
    <dialog
      id="question-detail-modal"
      class="modal"
      :open="modals.detail"
      @close="handleDialogClose('detail')"
    >
      <div class="modal-box max-w-3xl">
        <QuestionDetailModal :question="detailQuestion" />
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
        @click="closeModal('detail')"
      >
        <button>关闭</button>
      </form>
    </dialog>

    <!-- 批量删除题目模态框 -->
    <dialog
      id="batch-delete-question-modal"
      class="modal"
      :open="modals.batchDelete"
      @close="handleDialogClose('batchDelete')"
    >
      <div class="modal-box max-w-md">
        <h3 class="modal-title">批量删除题目</h3>
        <BatchDeleteQuestionModal
          :selected-questions="selectedQuestions"
          @success="handleBatchDeleteSuccess"
        />
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
        @click="closeModal('batchDelete')"
      >
        <button>关闭</button>
      </form>
    </dialog>
  </div>
</template>

<style lang="scss" scoped>
// 颜色变量定义
$primary-color: #22c55e;
$primary-color-dark: #15803d;
$text-color: #374151;
$border-color: rgba(140, 220, 160, 0.3);
$border-focus-color: rgba(100, 200, 130, 0.5);
$ring-focus-color: rgba(100, 200, 130, 0.2);

.modal-box {
  max-height: 90vh;
}
// 页面整体样式，服务于题库详情主页面
.question-bank-detail-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  background-color: #fff;
  position: relative;
}

// 顶部标题栏样式，服务于TitleBar组件
.page-title-bar {
  padding: 1rem;
  margin-bottom: 1rem;

  .title-content {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;

    .bank-name {
      font-weight: 600;
    }
  }

  .module-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;

    @media (min-width: 768px) {
      margin-top: 0;
    }
  }

  .btn-text-desktop {
    display: none;
    @media (min-width: 640px) {
      display: inline;
    }
  }
  .btn-text-mobile {
    @media (min-width: 640px) {
      display: none;
    }
  }
  .btn-text-desktop-md {
    display: none;
    @media (min-width: 768px) {
      display: inline;
    }
  }
  .btn-text-mobile-md {
    @media (min-width: 768px) {
      display: none;
    }
  }
  .btn-text-desktop-lg {
    display: none;
    @media (min-width: 1024px) {
      display: inline;
    }
  }
  .btn-text-mobile-lg {
    @media (min-width: 1024px) {
      display: none;
    }
  }
}

// 主内容区样式，服务于main-content区域
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
}

// 筛选框区域样式，服务于filter-box
.filter-box {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;

  .filter-item {
    flex: 1;
    min-width: 200px;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background-image: linear-gradient(
      to bottom right,
      rgba(248, 255, 250, 0.15),
      rgba(245, 253, 248, 0.08)
    );
    backdrop-filter: blur(16px);
    border: 1px solid rgba(140, 220, 160, 0.25);
  }

  .filter-label {
    font-weight: 500;
    color: rgba(60, 180, 110, 0.8);
  }

  .filter-select,
  .filter-input {
    width: 100%;
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(4px);
    border: 1px solid $border-color;
    transition: all 0.3s;

    &:focus {
      border-color: $border-focus-color;
      box-shadow: 0 0 0 2px $ring-focus-color;
      outline: none;
    }
  }
}

// 加载状态样式，服务于loading-container
.loading-container {
  width: 100%;
  overflow-x: auto;

  .loading-box {
    background-image: linear-gradient(
      to bottom right,
      rgba(248, 255, 250, 0.3),
      rgba(245, 253, 248, 0.2)
    );
    backdrop-filter: blur(16px);
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    padding: 2rem;
  }

  .loading-content {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 3rem;
    padding-bottom: 3rem;
  }
}

// 题目列表容器样式，服务于questions-container
.questions-container {
  width: 100%;
  overflow-x: auto;
  animation: fadeIn 0.5s; // Assuming animate.css is available
}

// 移动端卡片视图样式，服务于mobile-view
.mobile-view {
  display: block;

  @media (min-width: 1024px) {
    display: none;
  }

  .mobile-cards-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
  }

  .question-card {
    background-image: linear-gradient(
      to bottom right,
      rgba(248, 255, 250, 0.3),
      rgba(245, 253, 248, 0.2)
    );
    backdrop-filter: blur(16px);
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    padding: 1rem;
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .card-id-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .question-id {
    font-size: 0.875rem;
    color: #4b5563;
    font-weight: 500;
  }

  .card-actions-icon {
    width: 1rem;
    height: 1rem;
    stroke: currentColor;
  }

  .card-title-section {
    margin-bottom: 0.75rem;
    .question-title {
      font-weight: 700;
      font-size: 1.125rem;
      color: #111827;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .card-content-section {
    margin-bottom: 1rem;
    .question-content {
      font-size: 0.875rem;
      color: #4b5563;
      line-height: 1.625;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .card-tags-section {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .card-time-section {
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .card-actions-section {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}

// 桌面端表格视图样式，服务于desktop-view
.desktop-view {
  overflow-x: auto;
  background-image: linear-gradient(
    to bottom right,
    rgba(248, 255, 250, 0.3),
    rgba(245, 253, 248, 0.2)
  );
  backdrop-filter: blur(16px);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  display: none;

  @media (min-width: 1024px) {
    display: block;
  }

  .table-header-row {
    background: rgba(250, 255, 252, 0.4), rgba(248, 253, 250, 0.3);
  }

  th {
    font-weight: 600;
  }
  .checkbox-cell {
    width: 3rem;
  }
  .id-cell {
    width: 5rem;
  }
  .title-cell {
    width: 12rem;
  }
  .content-cell {
    min-width: 16rem;
  }
  .difficulty-cell,
  .status-cell {
    width: 6rem;
    text-align: center;
  }
  .time-cell {
    width: 8rem;
  }
  .actions-cell {
    width: 12rem;
    text-align: center;
  }

  .table-body-row {
    transition: background-color 0.2s;
    &:hover {
      background: rgba(245, 255, 250, 0.3), rgba(240, 253, 245, 0.2);
    }
    td:nth-child(5),
    td:nth-child(6) {
      text-align: center;
    }
  }

  .question-id-text,
  .time-text {
    white-space: nowrap;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .truncate-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .table-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
}

// 分页器区域样式，服务于pagination-section
.pagination-section {
  margin-top: auto;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;

  .pagination-container {
    display: flex;
    gap: 0.5rem;
  }
}

// 模态框标题样式，服务于modal-title
.modal-title {
  font-weight: 700;
  font-size: 1.125rem;
  margin-bottom: 1rem;
}

// 文本截断样式，服务于truncate
.truncate {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 通用徽章样式，服务于badge
.badge {
  white-space: nowrap;
  font-size: 0.75rem;
}

// 响应式按钮样式，服务于.btn-sm和.btn-xs
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

// 按钮基础样式，服务于.btn
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

// 液态玻璃按钮基础样式，服务于.btn-liquid-glass
.btn-liquid-glass {
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: linear-gradient(
    145deg,
    rgba(248, 255, 252, 0.7),
    rgba(245, 253, 248, 0.6)
  );
  color: rgb(40, 130, 90);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(248, 255, 252, 0.5);
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.05),
    inset 0 1px 1px rgba(255, 255, 255, 0.6);
}

.btn-liquid-glass:hover {
  background: linear-gradient(
    145deg,
    rgba(250, 255, 253, 0.8),
    rgba(248, 253, 250, 0.7)
  );
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.btn-liquid-glass:active {
  background: linear-gradient(
    145deg,
    rgba(245, 253, 248, 0.7),
    rgba(242, 250, 245, 0.6)
  );
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.04),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  transform: translateY(0);
}

// 液态玻璃按钮变体样式，服务于.info、.ai-btn、.error等
.btn-liquid-glass.info,
.btn-liquid-glass.ai-btn {
  background: linear-gradient(
    145deg,
    rgba(147, 112, 255, 0.9),
    rgba(100, 70, 220, 0.8)
  );
  color: white;
  border-color: rgba(147, 112, 255, 0.4);
  box-shadow:
    0 2px 10px rgba(100, 70, 220, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.btn-liquid-glass.info:hover,
.btn-liquid-glass.ai-btn:hover {
  background: linear-gradient(
    145deg,
    rgba(157, 122, 255, 0.95),
    rgba(110, 80, 230, 0.85)
  );
  box-shadow:
    0 4px 15px rgba(100, 70, 220, 0.25),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.btn-liquid-glass.info:active,
.btn-liquid-glass.ai-btn:active {
  background: linear-gradient(
    145deg,
    rgba(137, 102, 245, 0.9),
    rgba(90, 60, 210, 0.8)
  );
  box-shadow:
    0 2px 5px rgba(100, 70, 220, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.btn-liquid-glass.error {
  background: linear-gradient(
    145deg,
    rgba(239, 68, 68, 0.8),
    rgba(220, 38, 38, 0.7)
  );
  color: white;
  border-color: rgba(239, 68, 68, 0.3);
  box-shadow:
    0 2px 10px rgba(220, 38, 38, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.btn-liquid-glass.error:hover {
  background: linear-gradient(
    145deg,
    rgba(249, 78, 78, 0.9),
    rgba(230, 48, 48, 0.8)
  );
  box-shadow:
    0 4px 15px rgba(220, 38, 38, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.btn-liquid-glass.error:active {
  background: linear-gradient(
    145deg,
    rgba(229, 58, 58, 0.8),
    rgba(210, 28, 28, 0.7)
  );
  box-shadow:
    0 2px 5px rgba(220, 38, 38, 0.1),
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
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.03),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

// 液态玻璃徽章样式，服务于badge-liquid-glass
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
  background: linear-gradient(
    145deg,
    rgba(34, 197, 94, 0.3),
    rgba(21, 128, 61, 0.2)
  );
  color: rgb(21, 128, 61);
  border: 1px solid rgba(34, 197, 94, 0.4);
  box-shadow:
    0 1px 3px rgba(21, 128, 61, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

.badge-liquid-glass.warning {
  background: linear-gradient(
    145deg,
    rgba(234, 179, 8, 0.3),
    rgba(161, 98, 7, 0.2)
  );
  color: rgb(161, 98, 7);
  border: 1px solid rgba(234, 179, 8, 0.4);
  box-shadow:
    0 1px 3px rgba(161, 98, 7, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

.badge-liquid-glass.error {
  background: linear-gradient(
    145deg,
    rgba(239, 68, 68, 0.3),
    rgba(185, 28, 28, 0.2)
  );
  color: rgb(185, 28, 28);
  border: 1px solid rgba(239, 68, 68, 0.4);
  box-shadow:
    0 1px 3px rgba(185, 28, 28, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

.badge-liquid-glass.disabled {
  background: linear-gradient(
    145deg,
    rgba(156, 163, 175, 0.3),
    rgba(75, 85, 99, 0.2)
  );
  color: rgb(75, 85, 99);
  border: 1px solid rgba(156, 163, 175, 0.4);
  box-shadow:
    0 1px 3px rgba(75, 85, 99, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

// 玻璃面板样式，服务于glass-panel
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

// 玻璃卡片样式，服务于glass-card
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

// 玻璃输入框样式，服务于glass-input-border
.glass-input-border {
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
}

// 玻璃上传按钮样式，服务于glass-upload
.glass-upload {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.glass-upload:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(59, 130, 246, 0.5);
}

// 表格样式，服务于.table
.table {
  background: transparent;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 0.75rem;
  overflow: hidden;
}

.table thead tr {
  background: linear-gradient(
    145deg,
    rgba(250, 255, 252, 0.4),
    rgba(248, 253, 250, 0.3)
  );
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
  background: linear-gradient(
    145deg,
    rgba(250, 255, 252, 0.25),
    rgba(248, 253, 250, 0.15)
  );
  backdrop-filter: blur(5px);
}

.table tbody tr:nth-child(odd) {
  background: linear-gradient(
    145deg,
    rgba(248, 253, 250, 0.15),
    rgba(245, 250, 248, 0.1)
  );
  backdrop-filter: blur(5px);
}

.table tbody tr:hover {
  background: linear-gradient(
    145deg,
    rgba(245, 255, 250, 0.3),
    rgba(240, 253, 245, 0.2)
  );
}

.table tbody td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

// 题目总数徽章样式，服务于total-count-badge
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

// 自定义星级评分样式，服务于custom-rating
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
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.15),
    0 0 0 2px rgba(255, 255, 255, 0.5);
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

// 自定义开关样式，服务于custom-toggle
.custom-toggle {
  height: 1.5rem;
  width: 3rem;
  background-color: rgba(200, 200, 200, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.custom-toggle:checked {
  background-color: #22c55e;
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.1),
    0 0 0 2px rgba(34, 197, 94, 0.2);
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

// 分页按钮样式，服务于pagination-btn
.pagination-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: linear-gradient(
    145deg,
    rgba(248, 255, 252, 0.7),
    rgba(245, 253, 248, 0.6)
  );
  color: rgb(40, 130, 90);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(248, 255, 252, 0.5);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 1px rgba(255, 255, 255, 0.6);
}

.pagination-btn:hover:not(:disabled) {
  background: linear-gradient(
    145deg,
    rgba(34, 197, 94, 0.1),
    rgba(21, 128, 61, 0.05)
  );
  border-color: rgba(34, 197, 94, 0.2);
  box-shadow:
    0 2px 5px rgba(21, 128, 61, 0.05),
    inset 0 1px 1px rgba(255, 255, 255, 0.7);
}

.pagination-btn.active {
  background: linear-gradient(
    145deg,
    rgba(34, 197, 94, 0.15),
    rgba(21, 128, 61, 0.1)
  );
  border-color: rgba(34, 197, 94, 0.25);
  color: rgb(21, 128, 61);
  box-shadow:
    0 2px 5px rgba(21, 128, 61, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
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

// 富文本编辑器样式，服务于:deep(.w-e-toolbar)等
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

// 编辑按钮专用样式，服务于.btn-liquid-glass.edit
.btn-liquid-glass.edit {
  background: linear-gradient(
    145deg,
    rgba(96, 165, 250, 0.8),
    rgba(59, 130, 246, 0.7)
  );
  color: white;
  border-color: rgba(96, 165, 250, 0.3);
  box-shadow:
    0 2px 10px rgba(59, 130, 246, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.btn-liquid-glass.edit:hover {
  background: linear-gradient(
    145deg,
    rgba(116, 185, 255, 0.9),
    rgba(79, 150, 255, 0.8)
  );
  box-shadow:
    0 4px 15px rgba(59, 130, 246, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.btn-liquid-glass.edit:active {
  background: linear-gradient(
    145deg,
    rgba(76, 145, 230, 0.8),
    rgba(39, 110, 226, 0.7)
  );
  box-shadow:
    0 2px 5px rgba(59, 130, 246, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

// AI按钮专用样式，服务于.btn-liquid-glass.ai-btn
.btn-liquid-glass.ai-btn {
  background: linear-gradient(
    145deg,
    rgba(147, 112, 255, 0.9),
    rgba(100, 70, 220, 0.8)
  );
  color: white;
  border-color: rgba(147, 112, 255, 0.4);
  box-shadow:
    0 2px 10px rgba(100, 70, 220, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.btn-liquid-glass.ai-btn:hover {
  background: linear-gradient(
    145deg,
    rgba(157, 122, 255, 0.95),
    rgba(110, 80, 230, 0.85)
  );
  box-shadow:
    0 4px 15px rgba(100, 70, 220, 0.25),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.btn-liquid-glass.ai-btn:active {
  background: linear-gradient(
    145deg,
    rgba(137, 102, 245, 0.9),
    rgba(90, 60, 210, 0.8)
  );
  box-shadow:
    0 2px 5px rgba(100, 70, 220, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.btn-liquid-glass.ai-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.03),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

// 微信风格绿色按钮样式，服务于.btn-liquid-glass.wechat-green
.btn-liquid-glass.wechat-green {
  background: #07c160;
  color: white;
  border: none;
  box-shadow: 0 2px 6px rgba(7, 193, 96, 0.3);
}

.btn-liquid-glass.wechat-green:hover {
  background: #06ad56;
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.4);
}

.btn-liquid-glass.wechat-green:active {
  background: #069e4f;
  box-shadow: 0 2px 4px rgba(7, 193, 96, 0.3);
}

.btn-liquid-glass.wechat-green:disabled {
  background: rgba(7, 193, 96, 0.5);
  opacity: 0.8;
  cursor: not-allowed;
  transform: none;
}

// 微信风格绿色浅色按钮样式，服务于.btn-liquid-glass.wechat-green-light
.btn-liquid-glass.wechat-green-light {
  background: rgba(7, 193, 96, 0.1);
  color: #07c160;
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

// 模态框动画和滚动条样式，服务于.animate-modal-pop、.modal-container
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

/* daisyUI自带抽屉样式，不需要自定义 */
</style>
