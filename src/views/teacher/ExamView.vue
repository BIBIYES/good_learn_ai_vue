<script setup>
import { ref, onMounted } from 'vue'
import { Add, DocumentFolder, Delete, Edit } from '@icon-park/vue-next'
import { addexam, getexam, deleteexam, updateexam } from '@/api/test'
import message from '@/plugin/message'

// const msg = ref('');
const exam = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = ref(10) // Default page size set to 10
const loading = ref(true) // Loading state for skeleton effect
// const showCreateExam = ref(false)

// 按钮加载状态
const createLoading = ref(false)
const updateLoading = ref(false)
const deleteLoading = ref(false)

// 编辑题库相关变量
const editExamId = ref('')
const editExamName = ref('')
const editdescription = ref('')

// 删除确认相关变量
const deleteConfirmExamId = ref('')
const deleteConfirmExamName = ref('')

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
        status: record.status === 1 ? '作业' : '考试',
      }))
      totalPages.value = res.data.pages
      currentPage.value = res.data.current
      loading.value = false // 数据加载完成，更新加载状态
    } else {
      message.error(res.message || '获取试卷列表失败')
    }
  } catch (error) {
    console.error('获取题库列表错误:', error)
    message.error('获取题库列表时发生错误')
  } finally {
    loading.value = false
  }
}

const newExam = ref({
  examName: '', // 试卷名称
  description: '', // 考试描述
  status: 1, // 考试类型 1 考试 2 模拟
  examTime: '', // 考试时间
})
const handleCreateExam = async () => {
  if (!newExam.value.examName) {
    message.error('请输入试卷名称')
    return
  }
  createLoading.value = true
  try {
    const res = await addexam({
      examName: newExam.value.examName,
      description: newExam.value.description,
      status: newExam.value.status,
      examTime: newExam.value.examTime,
    })
    if (res.code === 200) {
      message.success('创建成功')
      const modalCheckbox = document.getElementById('create_exam_modal')
      if (modalCheckbox) modalCheckbox.checked = false // 关闭模态框
      newExam.value = { examName: '', description: '', status: 1, examTime: '' }
      newExam.value.description = '' // 重置描述
      fetchExam(currentPage.value) // 刷新列表
    } else {
      message.error(res.message || '创建失败')
    }
  } catch (error) {
    console.error('创建试卷错误:', error)
    message.error('创建试卷时发生错误')
  } finally {
    createLoading.value = false
  }
}

const handleEdit = exam => {
  // 设置编辑表单的初始值
  editExamId.value = exam.examId
  editExamName.value = exam.examName
  editdescription.value = exam.description || ''

  // 打开编辑模态框
  const modalCheckbox = document.getElementById('edit_exam_modal')
  if (modalCheckbox) modalCheckbox.checked = true
}

const handleUpdate = async () => {
  if (!editExamName.value) {
    message.warning('请输入试卷名称')
    return
  }
  updateLoading.value = true
  try {
    const res = await updateexam({
      examId: editExamId.value,
      examName: editExamName.value,
      description: editdescription.value,
    })
    if (res.code === 200) {
      message.success('更新成功')
      // 关闭模态框
      const modalCheckbox = document.getElementById('edit_exam_modal')
      if (modalCheckbox) modalCheckbox.checked = false
      // 刷新列表
      fetchExam(currentPage.value)
    } else {
      message.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新试卷错误:', error)
    message.error('更新试卷时发生错误')
  } finally {
    updateLoading.value = false
  }
}

const handleDelete = exam => {
  // 设置要删除的试卷信息
  deleteConfirmExamId.value = exam.examId
  deleteConfirmExamName.value = exam.examName

  // 打开确认删除模态框
  const modalCheckbox = document.getElementById('delete_confirm_modal')
  if (modalCheckbox) modalCheckbox.checked = true
}

const confirmDelete = async () => {
  deleteLoading.value = true
  try {
    const res = await deleteexam(deleteConfirmExamId.value)
    if (res.code === 200) {
      message.success('删除成功')
      // 关闭模态框
      const modalCheckbox = document.getElementById('delete_confirm_modal')
      if (modalCheckbox) modalCheckbox.checked = false
      // 刷新列表
      fetchExam(currentPage.value)
    } else {
      message.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除试卷错误:', error)
    message.error('删除试卷时发生错误')
  } finally {
    deleteLoading.value = false
  }
}

const changePage = page => {
  if (page >= 1 && page <= totalPages.value) {
    fetchExam(page)
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

onMounted(() => {
  fetchExam(1)
})
</script>

<template>
  <div class="flex flex-col h-full p-4">
    <TitleBar>
      <template #title>
        <DocumentFolder theme="outline" size="38" />
        <span>我的试卷</span>
      </template>
      <template #module>
        <label
          for="create_exam_modal"
          class="btn btn-primary btn-sm md:btn-md mr-2"
        >
          <Add theme="outline" size="18" />
          创建试卷
        </label>
      </template>
    </TitleBar>
    <!-- Main content area -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      <!-- Loading State - Skeleton -->
      <div
        v-if="loading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <!-- Skeleton Cards - repeat 6 skeletons -->
        <div
          v-for="i in 6"
          :key="i"
          class="card bg-base-100 shadow-lg rounded-2xl p-6"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="skeleton w-12 h-12 rounded-lg" />
            <div class="flex-1">
              <div class="skeleton h-5 w-2/3 mb-2" />
              <div class="skeleton h-3 w-1/3" />
            </div>
            <div class="skeleton w-6 h-6 rounded-full" />
          </div>
          <div class="skeleton h-20 w-full mb-4 rounded" />
          <div class="flex justify-between mt-4 pt-3 border-t">
            <div class="skeleton h-3 w-1/4" />
            <div class="skeleton h-3 w-1/4" />
            <div class="skeleton h-6 w-16 rounded" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!exam.length"
        class="flex flex-col items-center justify-center h-64"
      >
        <div class="text-center">
          <DocumentFolder
            theme="outline"
            size="48"
            class="text-base-content/30 mb-4"
          />
          <p class="text-base-content/70 text-lg">暂无试卷，快去创建一个吧！</p>
          <label
            for="create_exam_modal"
            class="btn btn-primary mt-4"
            @click="handleCreateExam = true"
          >
            <Add theme="outline" size="18" class="mr-1" />
            创建第一张试卷
          </label>
        </div>
      </div>

      <!-- Test Cards -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <div
          v-for="item in exam"
          :key="item.examId"
          class="relative card bg-base-100 shadow-lg rounded-2xl p-6"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="bg-primary text-primary-content w-12 h-12 rounded-lg flex justify-center items-center text-2xl font-bold"
            >
              {{ item.examName.charAt(0) }}
            </div>
            <div class="flex-1">
              <span
                class="text-lg font-bold text-base-content flex items-center gap-2"
              >
                {{ item.examName }}
                <span
                  class="ml-2 px-2 py-0.5 rounded text-xs font-medium"
                  :class="
                    item.status
                      ? 'bg-success/10 text-success'
                      : 'bg-base-200 text-base-content/50'
                  "
                >
                  {{ item.status ? '作业' : '考试' }}
                </span>
              </span>
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
                  <a @click="handleEdit(item)">
                    <Edit theme="outline" size="14" /> 编辑</a
                  >
                </li>
                <li>
                  <a class="text-error" @click="handleDelete(item)">
                    <Delete theme="outline" size="14" /> 删除</a
                  >
                </li>
              </ul>
            </div>
          </div>

          <div
            class="text-base-content/60 flex items-center text-sm flex-1 min-h-[40px] border-l-4 border-primary/20 pl-3 bg-base-200/30 rounded"
          >
            <div>{{ item.description || '暂无描述' }}</div>
          </div>

          <div
            class="flex items-center justify-between mt-4 text-xs text-base-content/40 border-t pt-3"
          >
            <span>试卷ID: {{ item.examId }}</span>
            <span>创建时间: {{ formatDate(item.createdAt) }}</span>
            <router-link
              :to="{
                name: '',
                params: { examId: item.examId },
                query: { examName: item.examName },
              }"
              class="btn btn-sm btn-outline btn-primary"
            >
              查看详情
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-auto border-t border-base-200 p-4 bg-base-100">
      <div v-if="!loading" class="flex justify-center space-x-5">
        <div class="btn btn-sm">
          <div aria-label="status" class="status status-primary" />
          <span>总计试卷数：</span>{{ exam.length }}
        </div>
        <!-- 分页按钮 -->
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

    <!-- Create Test Modal -->
    <input id="create_exam_modal" type="checkbox" class="modal-toggle" />
    <div class="modal" role="dialog">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">创建新试卷</h3>
        <div class="form-control mb-2">
          <label class="label">
            <span class="label-text"
              >试卷名称<span class="text-error">*</span></span
            >
          </label>
          <input
            v-model="newExam.examName"
            type="text"
            placeholder="请输入试卷名称,如：数据库基础第一单元测试"
            class="input input-bordered"
          />
        </div>
        <div class="form-control mb-4 flex flex-col">
          <label class="label">
            <span class="label-text">试卷描述</span>
          </label>
          <textarea
            v-model="newExam.description"
            class="textarea textarea-bordered h-24"
            placeholder="输入试卷的简要描述"
          />
        </div>
        <div class="modal-action">
          <label for="create_exam_modal" class="btn btn-ghost">取消</label>
          <button class="btn btn-primary" @click="handleCreateExam">
            <span
              v-show="createLoading"
              class="loading loading-spinner loading-md"
            />
            确认创建
          </button>
        </div>
      </div>
      <label class="modal-backdrop" for="create_exam_modal">Close </label>
    </div>

    <!-- Edit Test Modal -->
    <input id="edit_exam_modal" type="checkbox" class="modal-toggle" />
    <div class="modal" role="dialog">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">编辑试卷</h3>
        <div class="form-control mb-2">
          <label class="label">
            <span class="label-text"
              >试卷名称<span class="text-error">*</span></span
            >
          </label>
          <input
            v-model="editExamName"
            type="text"
            placeholder="例如：计算机网络期末考试"
            class="input input-bordered w-full"
          />
        </div>
        <div class="form-control mb-4 flex flex-col">
          <label class="label">
            <span class="label-text">试卷描述</span>
          </label>
          <textarea
            v-model="editdescription"
            class="textarea textarea-bordered h-24"
            placeholder="输入题库的简要描述"
          />
        </div>
        <div class="modal-action">
          <label for="edit_exam_modal" class="btn btn-ghost">取消</label>
          <button class="btn btn-primary" @click="handleUpdate">
            <span
              v-show="updateLoading"
              class="loading loading-spinner loading-md"
            />
            确认更新
          </button>
        </div>
      </div>
      <label class="modal-backdrop" for="edit_exam_modal">Close</label>

      <!-- Delete Test Modal -->
      <input id="delete_confirm_modal" type="checkbox" class="modal-toggle" />
      <div class="modal" role="dialog">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">确认删除</h3>
          <p class="py-4">
            您确定要删除试卷
            <span class="font-bold text-error">{{
              deleteConfirmExamName
            }}</span>
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
  </div>
</template>

<style scoped></style>
