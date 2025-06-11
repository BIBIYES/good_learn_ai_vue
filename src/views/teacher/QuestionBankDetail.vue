<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  getQuestionBankById,
  createQuestion,
  deleteQuestion,
  updateQuestion,
} from '@/api/question'
import message from '@/plugin/message'
import { FileQuestion, Add, ArrowLeft, Edit, Delete } from '@icon-park/vue-next'

const route = useRoute()
const bankId = ref(route.params.bankId)
const bankName = ref(route.query.bankName || '题库详情')

const questions = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 创建题目模态框
const showCreateModal = ref(false)
const createLoading = ref(false)
const newQuestion = ref({
  bankId: bankId.value,
  content: '',
  difficulty: '1', // 默认简单难度
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

// 获取题目列表
const fetchQuestions = async (page = 1) => {
  loading.value = true
  try {
    const res = await getQuestionBankById(pageSize.value, page, bankId.value)
    if (res.code === 200) {
      questions.value = res.data.records
      currentPage.value = res.data.current
      totalPages.value = res.data.pages
      total.value = res.data.total
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

onMounted(() => {
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
      </template>
    </TitleBar>

    <!-- Main content area -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6">
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
              <th>ID</th>
              <th>题目内容</th>
              <th>难度</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <!-- Table rows -->
            <tr
              v-for="question in questions"
              :key="question.questionId"
              class="hover"
            >
              <td class="whitespace-nowrap">
                {{ question.questionId }}
              </td>
              <td class="max-w-md truncate">
                {{ question.content }}
              </td>
              <td>
                <div
                  class="badge"
                  :class="getDifficultyStyle(question.difficulty)"
                >
                  {{
                    difficultyMap[question.difficulty] || question.difficulty
                  }}
                </div>
              </td>
              <td>
                <div
                  class="badge"
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
                    class="btn btn-ghost btn-xs"
                    @click="openEditModal(question)"
                  >
                    <Edit theme="outline" size="16" />
                  </button>
                  <button
                    class="btn btn-ghost btn-xs text-error"
                    @click="openDeleteModal(question)"
                  >
                    <Delete theme="outline" size="16" />
                  </button>
                </div>
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
    <dialog class="modal" :open="showCreateModal">
      <div class="modal-box w-96 rounded-xl shadow-lg">
        <h3 class="font-bold text-lg mb-4">添加题目</h3>
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
          <div class="rating rating-lg">
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
          <button
            class="btn btn-primary"
            :disabled="createLoading"
            @click="handleCreateQuestion"
          >
            <span
              v-if="createLoading"
              class="loading loading-spinner loading-xs"
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

    <!-- 编辑题目模态框 -->
    <dialog class="modal" :open="showEditModal">
      <div class="modal-box w-96 rounded-xl shadow-lg">
        <h3 class="font-bold text-lg mb-4">编辑题目</h3>
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
