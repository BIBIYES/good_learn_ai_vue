<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import {
  getQuestionBankList,
  createQuestionBank,
  deleteQuestionBank,
  updateQuestionBank,
} from '@/api/questionApi.js'
import message from '@/plugin/message.js'
import DgLoadingText from '@/components/common/GdLoadingText.vue'

const router = useRouter()

const questionBanks = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = ref(10) // Default components size set to 9
const loading = ref(false)

// 按钮加载状态
const createLoading = ref(false)
const updateLoading = ref(false)
const deleteLoading = ref(false)

const newBankName = ref('')
const newBankDescription = ref('')

// 编辑题库相关变量
const editBankId = ref('')
const editBankName = ref('')
const editBankDescription = ref('')

// 删除确认相关变量
const deleteConfirmBankId = ref('')
const deleteConfirmBankName = ref('')

const fetchQuestionBanks = async (page = 1) => {
  loading.value = true
  try {
    const res = await getQuestionBankList(page, pageSize.value)
    if (res.code === 200) {
      questionBanks.value = res.data.records
      currentPage.value = res.data.current
      totalPages.value = res.data.pages
    } else {
      message.error(res.message || '获取题库列表失败')
    }
  } catch (error) {
    console.error('获取题库列表错误:', error)
    message.error('获取题库列表时发生错误')
  } finally {
    loading.value = false
  }
}

const handleCreateBank = async () => {
  if (!newBankName.value) {
    message.warning('请输入题库名称')
    return
  }
  createLoading.value = true
  try {
    const res = await createQuestionBank({
      bankName: newBankName.value,
      description: newBankDescription.value,
    })
    if (res.code === 200) {
      message.success('创建成功')
      // Close modal
      const modalCheckbox = document.getElementById('create_bank_modal')
      if (modalCheckbox) modalCheckbox.checked = false
      // Reset form and refresh list
      newBankName.value = ''
      newBankDescription.value = ''
      fetchQuestionBanks(currentPage.value)
    } else {
      message.error(res.message || '创建失败')
    }
  } catch (error) {
    console.error('创建题库错误:', error)
    message.error('创建题库时发生错误')
  } finally {
    createLoading.value = false
  }
}

const handleEdit = bank => {
  // 设置编辑表单的初始值
  editBankId.value = bank.bankId
  editBankName.value = bank.bankName
  editBankDescription.value = bank.description || ''

  // 打开编辑模态框
  const modalCheckbox = document.getElementById('edit_bank_modal')
  if (modalCheckbox) modalCheckbox.checked = true
}

const handleUpdate = async () => {
  if (!editBankName.value) {
    message.warning('请输入题库名称')
    return
  }
  updateLoading.value = true
  try {
    const res = await updateQuestionBank({
      bankId: editBankId.value,
      bankName: editBankName.value,
      description: editBankDescription.value,
    })
    if (res.code === 200) {
      message.success('更新成功')
      // 关闭模态框
      const modalCheckbox = document.getElementById('edit_bank_modal')
      if (modalCheckbox) modalCheckbox.checked = false
      // 刷新列表
      fetchQuestionBanks(currentPage.value)
    } else {
      message.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新题库错误:', error)
    message.error('更新题库时发生错误')
  } finally {
    updateLoading.value = false
  }
}

const handleDelete = bank => {
  // 设置要删除的题库信息
  deleteConfirmBankId.value = bank.bankId
  deleteConfirmBankName.value = bank.bankName

  // 打开确认删除模态框
  const modalCheckbox = document.getElementById('delete_confirm_modal')
  if (modalCheckbox) modalCheckbox.checked = true
}

const confirmDelete = async () => {
  deleteLoading.value = true
  try {
    const res = await deleteQuestionBank(deleteConfirmBankId.value)
    if (res.code === 200) {
      message.success('删除成功')
      // 关闭模态框
      const modalCheckbox = document.getElementById('delete_confirm_modal')
      if (modalCheckbox) modalCheckbox.checked = false
      // 刷新列表
      fetchQuestionBanks(currentPage.value)
    } else {
      message.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除题库错误:', error)
    message.error('删除题库时发生错误')
  } finally {
    deleteLoading.value = false
  }
}

const changePage = page => {
  if (page >= 1 && page <= totalPages.value) {
    fetchQuestionBanks(page)
  }
}

const formatDate = dateString => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString() // More detailed format
  } catch (e) {
    console.log(e)
    return dateString
  }
}

const viewBankDetail = bank => {
  router.push({
    name: 'QuestionBankDetail',
    params: { bankId: bank.bankId },
    query: { bankName: bank.bankName },
  })
}

onMounted(() => {
  fetchQuestionBanks()
})
</script>

<template>
  <div class="flex flex-col h-full p-4">
    <!-- Header with title and create button -->
    <TitleBar>
      <template #title>
        <LineMdCheckList3 />
        <span>我的题库</span>
      </template>
      <template #module>
        <label for="create_bank_modal" class="btn btn-primary btn-sm md:btn-md">
          <LineMdPlus />
          创建题库
        </label>
      </template>
    </TitleBar>
    <!-- Main content area -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="w-full h-full flex justify-center items-center"
      >
        <DgLoadingText text="正在获取题库列表...."></DgLoadingText>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!questionBanks.length"
        class="flex flex-col items-center justify-center h-64"
      >
        <div class="text-center">
          <Garage theme="outline" size="48" class="text-base-content/30 mb-4" />
          <p class="text-base-content/70 text-lg">暂无题库，快去创建一个吧！</p>
          <label for="create_bank_modal" class="btn btn-primary mt-4">
            <Add theme="outline" size="18" class="mr-1" />
            创建第一个题库
          </label>
        </div>
      </div>

      <!-- Question Bank Grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <div
          v-for="bank in questionBanks"
          :key="bank.bankId"
          class="relative group bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 border border-gray-100 hover:shadow-2xl transition-all animate__animated animate__fadeIn"
        >
          <!-- 第一行：头像和下拉菜单 -->
          <div class="flex items-center gap-3 mb-3">
            <div
              class="bg-green-100 w-12 h-12 rounded-lg flex-shrink-0 flex justify-center items-center text-green-600 text-2xl font-bold"
            >
              {{ bank.bankName.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-lg text-gray-800 truncate">
                {{ bank.bankName }}
              </div>
              <!-- 状态显示区域 -->
              <div class="flex flex-wrap gap-2 mt-1">
                <span class="badge badge-success badge-sm">已启用</span>
                <span class="badge badge-info badge-sm">难度：中等</span>
              </div>
            </div>
            <div class="dropdown dropdown-end flex-shrink-0">
              <div
                tabindex="0"
                role="button"
                class="btn btn-ghost btn-sm btn-circle"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="w-4 h-4 stroke-current"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 12.5v.01M12 8.5v.01M12 16.5v.01M12 4.5v.01"
                  />
                </svg>
              </div>
              <ul
                tabindex="0"
                class="dropdown-content z-[1] menu menu-sm shadow bg-base-100 rounded-box w-32"
              >
                <li>
                  <a @click="handleEdit(bank)"
                    ><Edit theme="outline" size="14" /> 编辑</a
                  >
                </li>
                <li>
                  <a class="text-error" @click="handleDelete(bank)"
                    ><Delete theme="outline" size="14" /> 删除</a
                  >
                </li>
              </ul>
            </div>
          </div>

          <div
            class="text-gray-500 flex items-start text-sm flex-1 min-h-[40px] border-l-4 border-green-200 pl-3 bg-gray-50 rounded p-2 overflow-y-auto max-h-[80px]"
          >
            <div class="line-clamp-3">{{ bank.description || '暂无描述' }}</div>
          </div>

          <div
            class="flex flex-wrap items-center gap-2 justify-between mt-4 text-xs text-gray-400 border-t pt-3"
          >
            <div class="flex flex-wrap gap-x-3 gap-y-1 items-center">
              <span class="truncate max-w-[150px] whitespace-nowrap"
                >题库ID: {{ bank.bankId }}</span
              >
              <span class="truncate max-w-[150px] whitespace-nowrap"
                >创建时间: {{ formatDate(bank.createdAt) }}</span
              >
            </div>
            <button
              class="btn btn-sm btn-outline btn-primary mt-1 sm:mt-0"
              @click="viewBankDetail(bank)"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination - always at bottom -->
    <div class="mt-auto border-t border-base-200 p-4 bg-base-100">
      <div
        v-if="!loading"
        class="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-5"
      >
        <div class="btn btn-sm">
          <div aria-label="status" class="status status-primary" />
          <span>总计题库数：</span>{{ questionBanks.length }}
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

    <!-- Create Question Bank Modal -->
    <input id="create_bank_modal" type="checkbox" class="modal-toggle" />
    <div class="modal" role="dialog">
      <div class="modal-box overflow-hidden">
        <h3 class="font-bold text-lg mb-4">创建新题库</h3>
        <div class="form-control mb-2">
          <label class="label">
            <span class="label-text"
              >题库名称<span class="text-error">*</span></span
            >
          </label>
          <input
            v-model="newBankName"
            type="text"
            placeholder="例如：计算机网络期末考试"
            class="input input-bordered w-full"
          />
        </div>
        <div class="form-control mb-4 flex flex-col">
          <label class="label">
            <span class="label-text">题库描述</span>
          </label>
          <textarea
            v-model="newBankDescription"
            class="textarea textarea-bordered h-24 resize-x"
            placeholder="输入题库的简要描述"
          />
        </div>
        <div class="modal-action">
          <label for="create_bank_modal" class="btn btn-ghost">取消</label>
          <button class="btn btn-primary" @click="handleCreateBank">
            <span
              v-show="createLoading"
              class="loading loading-spinner loading-md"
            />
            确认创建
          </button>
        </div>
      </div>
      <label class="modal-backdrop" for="create_bank_modal">Close</label>
    </div>

    <!-- Edit Question Bank Modal -->
    <input id="edit_bank_modal" type="checkbox" class="modal-toggle" />
    <div class="modal" role="dialog">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">编辑题库</h3>
        <div class="form-control mb-2">
          <label class="label">
            <span class="label-text"
              >题库名称<span class="text-error">*</span></span
            >
          </label>
          <input
            v-model="editBankName"
            type="text"
            placeholder="例如：计算机网络期末考试"
            class="input input-bordered w-full"
          />
        </div>
        <div class="form-control mb-4 flex flex-col">
          <label class="label">
            <span class="label-text">题库描述</span>
          </label>
          <textarea
            v-model="editBankDescription"
            class="textarea textarea-bordered h-24"
            placeholder="输入题库的简要描述"
          />
        </div>
        <div class="modal-action">
          <label for="edit_bank_modal" class="btn btn-ghost">取消</label>
          <button class="btn btn-primary" @click="handleUpdate">
            <span
              v-show="updateLoading"
              class="loading loading-spinner loading-md"
            />
            确认更新
          </button>
        </div>
      </div>
      <label class="modal-backdrop" for="edit_bank_modal">Close</label>
    </div>

    <!-- Delete Confirmation Modal -->
    <input id="delete_confirm_modal" type="checkbox" class="modal-toggle" />
    <div class="modal" role="dialog">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">确认删除</h3>
        <p class="py-4">
          您确定要删除题库
          <span class="font-bold text-error">{{ deleteConfirmBankName }}</span>
          吗？此操作不可逆。
        </p>
        <div class="modal-action">
          <label for="delete_confirm_modal" class="btn btn-ghost">取消</label>
          <button class="btn btn-error" @click="confirmDelete">
            <span
              v-show="deleteLoading"
              class="loading loading-spinner loading-md"
            />
            确认删除
          </button>
        </div>
      </div>
      <label class="modal-backdrop" for="delete_confirm_modal">Close</label>
    </div>
  </div>
</template>

<style scoped></style>
