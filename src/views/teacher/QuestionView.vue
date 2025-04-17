<script setup>
import { Garage, Add, Edit, Delete } from '@icon-park/vue-next'
import { getQuestionBankList, createQuestionBank } from '@/api/question'
import message from '@/plugin/message.js'

const questionBanks = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = ref(9) // Default page size set to 9
const loading = ref(false)

const newBankName = ref('')
const newBankDescription = ref('')

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
  try {
    const res = await createQuestionBank({ 
      bankName: newBankName.value, 
      description: newBankDescription.value 
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
  }
}

const handleEdit = (bank) => {
  message.info(`编辑题库: ${bank.bankName}`)
  // Implement edit functionality
}

const handleDelete = (bank) => {
  message.warning(`删除题库: ${bank.bankName}`)
  // Implement delete functionality
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchQuestionBanks(page)
  }
}

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString() // More detailed format
  } catch (e) {
    console.log(e)
    return dateString
  }
}

onMounted(() => {
  fetchQuestionBanks()
})
</script>

<template>
  <div class="flex flex-col h-full bg-base-100">
    <!-- Header with title and create button -->
    <div class="navbar bg-base-200 px-4 shadow-sm sticky top-0 z-10">
      <div class="flex-1">
        <div class="flex items-center gap-2 text-xl font-bold">
          <Garage
            theme="outline"
            size="28"
            class="text-primary"
          />
          <span>我的题库</span>
        </div>
      </div>
      <div class="flex-none">
        <label
          for="create_bank_modal"
          class="btn btn-primary btn-sm md:btn-md"
        >
          <Add
            theme="outline"
            size="18"
          />
          创建题库
        </label>
      </div>
    </div>

    <!-- Main content area -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center h-64"
      >
        <span class="loading loading-spinner loading-lg text-primary" />
        <p class="mt-4 text-base-content/70">
          加载中...
        </p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!questionBanks.length"
        class="flex flex-col items-center justify-center h-64"
      >
        <div class="text-center">
          <Garage
            theme="outline"
            size="48"
            class="text-base-content/30 mb-4"
          />
          <p class="text-base-content/70 text-lg">
            暂无题库，快去创建一个吧！
          </p>
          <label
            for="create_bank_modal"
            class="btn btn-primary mt-4"
          >
            <Add
              theme="outline"
              size="18"
              class="mr-1"
            />
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
          class="card bg-base-100 shadow hover:shadow-md transition-all duration-300 border border-base-200 overflow-hidden group"
        >
          <div class="card-body p-5">
            <div class="flex justify-between items-start">
              <h2
                class="card-title text-lg font-medium truncate"
                :title="bank.bankName"
              >
                {{ bank.bankName }}
              </h2>
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
                    <a @click="handleEdit(bank)"><Edit
                      theme="outline"
                      size="14"
                    /> 编辑</a>
                  </li>
                  <li>
                    <a
                      class="text-error"
                      @click="handleDelete(bank)"
                    ><Delete
                      theme="outline"
                      size="14"
                    /> 删除</a>
                  </li>
                </ul>
              </div>
            </div>

            <span 
              class="badge badge-sm mt-1 mb-2"
              :class="bank.status ? 'badge-success badge-outline' : 'badge-ghost'"
            >
              {{ bank.status ? '已启用' : '未启用' }}
            </span>

            <p class="text-sm text-base-content/70 min-h-[40px] line-clamp-2">
              {{ bank.description || '暂无描述' }}
            </p>
            
            <div class="text-xs text-base-content/60 mt-4 pt-3 border-t border-base-200">
              <div class="flex justify-between items-center">
                <span>创建于: {{ formatDate(bank.createdAt) }}</span>
                <button class="btn btn-ghost btn-xs">
                  查看详情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination - always at bottom -->
    <div class="mt-auto border-t border-base-200 p-4 bg-base-100">
      <div
        v-if="!loading"
        class="flex justify-center"
      >
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
    <input
      id="create_bank_modal"
      type="checkbox"
      class="modal-toggle"
    >
    <div
      class="modal"
      role="dialog"
    >
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">
          创建新题库
        </h3>
        <div class="form-control mb-2">
          <label class="label">
            <span class="label-text">题库名称<span class="text-error">*</span></span>
          </label>
          <input
            v-model="newBankName"
            type="text"
            placeholder="例如：计算机网络期末考试"
            class="input input-bordered w-full"
          >
        </div>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">题库描述</span>
          </label>
          <textarea
            v-model="newBankDescription"
            class="textarea textarea-bordered h-24"
            placeholder="输入题库的简要描述"
          />
        </div>
        <div class="modal-action">
          <label
            for="create_bank_modal"
            class="btn btn-ghost"
          >取消</label>
          <button
            class="btn btn-primary"
            @click="handleCreateBank"
          >
            确认创建
          </button>
        </div>
      </div>
      <label
        class="modal-backdrop"
        for="create_bank_modal"
      >Close</label>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>