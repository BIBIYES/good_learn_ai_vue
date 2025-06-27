<script setup>
import { ref, onMounted } from 'vue'
import { getexam } from '@/api/test'
import message from '@/plugin/message'
import CreateExamModal from './components/CreateExamModal.vue'
import EditExamModal from './components/EditExamModal.vue'
import DeleteExamModal from './components/DeleteExamModal.vue'

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
</script>

<template>
  <div class="flex flex-col h-full p-4">
    <TitleBar>
      <template #title>
        <DocumentFolder theme="outline" size="38" />
        <span>我的试卷</span>
      </template>
      <template #module>
        <label for="create_exam_modal" class="btn btn-primary btn-sm md:btn-md">
          <Add theme="outline" size="18" />
          创建试卷
        </label>
      </template>
    </TitleBar>

    <!-- 主内容区域 -->
    <div
      class="flex-1 overflow-y-auto p-4 md:p-6 bg-base-100 rounded-box shadow-sm"
    >
      <!-- 空状态 -->
      <div
        v-if="!loading && !exam.length"
        class="flex flex-col items-center justify-center h-64"
      >
        <div class="text-center">
          <DocumentFolder
            theme="outline"
            size="48"
            class="text-base-content/30 mb-4"
          />
          <p class="text-base-content/70 text-lg">暂无试卷，快去创建一个吧！</p>
          <label for="create_exam_modal" class="btn btn-primary mt-4">
            <Add theme="outline" size="18" class="mr-1" />
            创建第一张试卷
          </label>
        </div>
      </div>

      <!-- 试卷表格 -->
      <div v-else>
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <!-- 表头 -->
            <thead>
              <tr>
                <th>试卷ID</th>
                <th>试卷名称</th>
                <th>描述</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>更新时间</th>
                <th class="text-center">操作</th>
              </tr>
            </thead>
            <!-- 表格内容 -->
            <tbody v-if="!loading">
              <tr v-for="item in exam" :key="item.examId" class="hover">
                <td>{{ item.examId }}</td>
                <td>
                  <div class="font-medium">{{ item.examName }}</div>
                </td>
                <td class="max-w-xs truncate">
                  {{ item.description || '暂无描述' }}
                </td>
                <td>
                  <div
                    class="badge"
                    :class="
                      item.status === '草稿' ? 'badge-primary' : 'badge-success'
                    "
                  >
                    {{ item.status }}
                  </div>
                </td>
                <td>{{ formatDate(item.createdAt) }}</td>
                <td>{{ formatDate(item.updatedAt) }}</td>
                <td>
                  <div class="flex justify-center gap-2">
                    <button
                      class="btn btn-sm btn-ghost btn-circle"
                      title="编辑"
                      @click="handleEdit(item)"
                    >
                      <Edit theme="outline" size="16" />
                    </button>
                    <router-link
                      :to="{
                        name: '',
                        params: { examId: item.examId },
                        query: { examName: item.examName },
                      }"
                      class="btn btn-sm btn-ghost btn-circle"
                      title="查看详情"
                    >
                      <LinkOne theme="outline" size="16" />
                    </router-link>
                    <button
                      class="btn btn-sm btn-ghost btn-circle text-error"
                      title="删除"
                      @click="handleDelete(item)"
                    >
                      <Delete theme="outline" size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
            <!-- 加载状态 - 表格骨架屏 -->
            <tbody v-else>
              <tr v-for="i in 5" :key="i">
                <td><div class="skeleton h-4 w-10"></div></td>
                <td><div class="skeleton h-4 w-28"></div></td>
                <td><div class="skeleton h-4 w-32"></div></td>
                <td><div class="skeleton h-4 w-12"></div></td>
                <td><div class="skeleton h-4 w-24"></div></td>
                <td><div class="skeleton h-4 w-24"></div></td>
                <td>
                  <div class="flex justify-center gap-2">
                    <div class="skeleton h-8 w-8 rounded-full"></div>
                    <div class="skeleton h-8 w-8 rounded-full"></div>
                    <div class="skeleton h-8 w-8 rounded-full"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 分页和其他信息 -->
    <div class="mt-auto border-t border-base-200 p-4 bg-base-100">
      <div class="flex flex-wrap md:flex-row justify-between items-center">
        <!-- 左侧信息区域 -->
        <div class="flex items-center space-x-3 mb-3 md:mb-0 w-full md:w-auto">
          <div class="flex items-center">
            <span class="text-sm mr-2">每页显示:</span>
            <select
              v-model="pageSize"
              class="select select-sm select-bordered"
              :disabled="loading"
              @change="handlePageSizeChange(pageSize)"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div class="badge badge-neutral">
            总计: {{ loading ? '-' : totalItems }} 条
          </div>
          <div class="text-sm hidden md:block text-base-content/70">
            第 {{ currentPage }}/{{ totalPages || 1 }} 页
          </div>
        </div>

        <!-- 右侧分页按钮 -->
        <div class="join w-full md:w-auto flex justify-center md:justify-end">
          <button
            class="join-item btn btn-sm tooltip"
            data-tip="首页"
            :disabled="currentPage === 1 || loading"
            @click="changePage(1)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
              />
              <path
                fill-rule="evenodd"
                d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
              />
            </svg>
          </button>
          <button
            class="join-item btn btn-sm"
            :disabled="currentPage === 1 || loading"
            @click="changePage(currentPage - 1)"
          >
            «
          </button>

          <!-- 数字分页 - 动态显示最多5个页码 -->
          <template v-if="totalPages > 0 && !loading">
            <template v-if="totalPages <= 5">
              <button
                v-for="page in totalPages"
                :key="page"
                class="join-item btn btn-sm"
                :class="{ 'btn-active': currentPage === page }"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
            </template>
            <template v-else>
              <!-- 复杂分页逻辑 -->
              <template v-if="currentPage <= 3">
                <button
                  v-for="page in 5"
                  :key="page"
                  class="join-item btn btn-sm"
                  :class="{ 'btn-active': currentPage === page }"
                  @click="changePage(page)"
                >
                  {{ page }}
                </button>
              </template>
              <template v-else-if="currentPage >= totalPages - 2">
                <button
                  v-for="page in 5"
                  :key="totalPages - 5 + page"
                  class="join-item btn btn-sm"
                  :class="{
                    'btn-active': currentPage === totalPages - 5 + page,
                  }"
                  @click="changePage(totalPages - 5 + page)"
                >
                  {{ totalPages - 5 + page }}
                </button>
              </template>
              <template v-else>
                <button
                  v-for="offset in 5"
                  :key="currentPage - 3 + offset"
                  class="join-item btn btn-sm"
                  :class="{ 'btn-active': offset === 3 }"
                  @click="changePage(currentPage - 3 + offset)"
                >
                  {{ currentPage - 3 + offset }}
                </button>
              </template>
            </template>
          </template>
          <button v-else class="join-item btn btn-sm" disabled>1</button>

          <button
            class="join-item btn btn-sm"
            :disabled="currentPage === totalPages || loading"
            @click="changePage(currentPage + 1)"
          >
            »
          </button>
          <button
            class="join-item btn btn-sm tooltip"
            data-tip="末页"
            :disabled="currentPage === totalPages || loading"
            @click="changePage(totalPages)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"
              />
              <path
                fill-rule="evenodd"
                d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"
              />
            </svg>
          </button>
        </div>

        <!-- 移动端跳转输入框 -->
        <div class="flex items-center mt-3 w-full md:hidden justify-center">
          <span class="text-sm mr-2">跳转到:</span>
          <input
            v-model="jumpToPage"
            type="number"
            min="1"
            :max="totalPages"
            class="input input-bordered input-sm w-16 text-center"
            :disabled="loading"
          />
          <button
            class="btn btn-sm btn-primary ml-2"
            :disabled="
              loading ||
              !jumpToPage ||
              jumpToPage < 1 ||
              jumpToPage > totalPages
            "
            @click="handleJumpToPage"
          >
            跳转
          </button>
        </div>
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

<style scoped></style>
