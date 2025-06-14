<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getTeacherCourse,
  createCourse,
  updateTeacherCourse,
} from '@/api/course'
import message from '@/plugin/message'
import { School, Add } from '@icon-park/vue-next'

const router = useRouter()
const loading = ref(true)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const createLoading = ref(false)
const editLoading = ref(false)

// 添加分页相关状态
const courses = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = ref(9)
const pageSizeOptions = [6, 9, 12, 15]
const total = ref(0)

const newCourse = ref({
  className: '',
  description: '',
  coursePassword: '',
})

const editForm = ref({
  courseId: '',
  coursePassword: '',
  className: '',
  description: '',
  monitorId: '',
  status: true,
})

const handleGetCourses = async (page = 1) => {
  loading.value = true
  try {
    const res = await getTeacherCourse(page, pageSize.value)
    if (res.code === 200) {
      courses.value = res.data.records.map(course => ({
        ...course,
        monitorName: course.monitorName || '无', // 如果 monitorName 为空，显示 '无'
      }))
      total.value = res.data.total
      totalPages.value = Math.ceil(res.data.total / pageSize.value)
      currentPage.value = page
    }
  } catch (err) {
    console.error('获取课程列表失败', err.message)
    message.error('获取课程列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageSizeChange = size => {
  pageSize.value = size
  currentPage.value = 1
  handleGetCourses(1)
}

const handlePageChange = page => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    handleGetCourses(page)
  }
}

const handleCreateCourse = async () => {
  if (!newCourse.value.className) {
    message.error('课程名称不能为空')
    return
  }
  if (!newCourse.value.coursePassword) {
    message.error('课程密码不能为空')
    return
  }

  createLoading.value = true
  try {
    const res = await createCourse({
      className: newCourse.value.className,
      description: newCourse.value.description,
      coursePassword: newCourse.value.coursePassword,
    })
    if (res.code === 200) {
      message.success('创建成功')
      showCreateModal.value = false
      newCourse.value = { className: '', description: '', coursePassword: '' }
      handleGetCourses(1)
    }
  } catch (err) {
    message.error(err.message)
  } finally {
    createLoading.value = false
  }
}

const openEditModal = course => {
  editForm.value = { ...course }
  showEditModal.value = true
}
const handleEditCourse = async () => {
  editLoading.value = true
  try {
    const res = await updateTeacherCourse({
      courseId: editForm.value.courseId,
      coursePassword: editForm.value.coursePassword,
      className: editForm.value.className,
      description: editForm.value.description,
      monitorId: editForm.value.monitorId,
      status: editForm.value.status,
    })
    if (res.code === 200) {
      message.success('编辑成功')
      showEditModal.value = false
      handleGetCourses(currentPage.value)
    }
  } catch (err) {
    message.error(err.message)
  } finally {
    editLoading.value = false
  }
}

onMounted(() => {
  handleGetCourses(1)
})
</script>
<template>
  <div class="flex flex-col h-full p-4">
    <!-- Header with title and create button -->
    <TitleBar>
      <template #title>
        <school theme="outline" size="38" />
        <span>我的课程</span>
      </template>
      <template #module>
        <button
          class="btn btn-primary btn-sm md:btn-md"
          @click="showCreateModal = true"
        >
          <Add theme="outline" size="18" />
          创建课程
        </button>
      </template>
    </TitleBar>

    <!-- Main content area -->
    <div class="flex-1 overflow-y-auto p-4 md:p-4">
      <!-- Loading State - Simple Spinner -->
      <div
        v-if="loading"
        class="w-full h-full flex justify-center items-center"
      >
        <DgLoadingText text="正在获取课程列表...."></DgLoadingText>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="courses.length === 0"
        class="flex flex-col items-center justify-center h-64"
      >
        <div class="text-center">
          <School theme="outline" size="48" class="text-base-content/30 mb-4" />
          <p class="text-base-content/70 text-lg">暂无课程，快去创建一个吧！</p>
          <button class="btn btn-primary mt-4" @click="showCreateModal = true">
            <Add theme="outline" size="18" class="mr-1" />
            创建第一个课程
          </button>
        </div>
      </div>

      <!-- Course Grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <div
          v-for="item in courses"
          :key="item.courseId"
          class="relative group bg-base-100 rounded-2xl shadow-md p-6 flex flex-col gap-3 border border-base-200 hover:shadow-lg transition-all duration-300 ease-in-out animate__animated animate__fadeIn"
        >
          <div class="relative">
            <!-- Dropdown menu in absolute position at top right -->
            <div class="dropdown dropdown-end absolute top-0 right-0 z-10">
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
                  <a @click="openEditModal(item)">编辑</a>
                </li>
              </ul>
            </div>

            <div class="flex items-center gap-3 mb-2 pr-8">
              <div
                class="bg-primary text-primary-content w-12 h-12 rounded-lg flex justify-center items-center text-2xl font-bold"
              >
                {{ item.className.charAt(0) }}
              </div>
              <div class="flex-1">
                <span
                  class="text-lg font-bold text-base-content flex items-center gap-2"
                >
                  {{ item.className }}
                  <span
                    class="ml-2 px-2 py-0.5 rounded text-xs font-medium"
                    :class="
                      item.status
                        ? 'bg-success/10 text-success'
                        : 'bg-base-200 text-base-content/50'
                    "
                  >
                    {{ item.status ? '启用' : '停用' }}
                  </span>
                </span>
                <span class="text-sm text-base-content/70"
                  >{{ item.teacherName || '教师'
                  }}<span
                    v-if="item.teacherEmail"
                    class="ml-2 text-xs text-base-content/50"
                    >{{ item.teacherEmail }}</span
                  ></span
                >
              </div>
            </div>
          </div>
          <div
            class="text-base-content/60 flex items-center text-sm flex-1 min-h-[40px] border-l-4 border-primary/20 pl-3 bg-base-200/30 rounded"
          >
            <div>{{ item.description || '暂无介绍' }}</div>
          </div>
          <div class="flex justify-end text-xs text-base-content/40 pt-3">
            <button
              class="btn btn-sm btn-outline btn-primary"
              @click.stop="router.push(`/t/course/${item.courseId}`)"
            >
              打开
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination section -->
    <div class="mt-auto border-t border-base-200 p-4 bg-base-100">
      <div
        v-if="!loading && courses.length > 0"
        class="flex flex-wrap justify-center gap-5 items-center"
      >
        <div class="btn btn-sm">
          <div aria-label="status" class="status status-primary" />
          <span>总计课程数：</span>{{ total }}
        </div>

        <!-- 页面大小选择器 -->
        <div class="flex items-center gap-2">
          <span class="text-sm">每页显示：</span>
          <select
            v-model="pageSize"
            class="select select-bordered select-sm w-24"
            @change="handlePageSizeChange(pageSize)"
          >
            <option v-for="size in pageSizeOptions" :key="size" :value="size">
              {{ size }} 条
            </option>
          </select>
        </div>

        <div v-if="totalPages > 0" class="join">
          <button
            class="join-item btn btn-sm"
            :disabled="currentPage === 1"
            @click="handlePageChange(currentPage - 1)"
          >
            «
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            class="join-item btn btn-sm"
            :class="{ 'btn-active': currentPage === page }"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
          <button
            class="join-item btn btn-sm"
            :disabled="currentPage === totalPages"
            @click="handlePageChange(currentPage + 1)"
          >
            »
          </button>
        </div>
      </div>
    </div>

    <!-- 新建课程弹窗 -->
    <dialog class="modal" :open="showCreateModal">
      <form method="dialog" class="modal-box w-96 rounded-xl shadow-lg">
        <h3 class="font-bold text-lg mb-4">新建课程</h3>
        <div class="form-control mb-2">
          <label class="label">课程名称<span class="text-error">*</span></label>
          <input
            v-model="newCourse.className"
            class="input input-bordered"
            placeholder="请输入课程名称"
          />
        </div>
        <div class="form-control mb-2">
          <label class="label">课程密码<span class="text-error">*</span></label>
          <input
            v-model="newCourse.coursePassword"
            class="input input-bordered"
            type="password"
            placeholder="请输入课程密码"
          />
        </div>
        <div class="form-control mb-2">
          <label class="label">课程介绍</label>
          <textarea
            v-model="newCourse.description"
            class="textarea textarea-bordered h-24"
            placeholder="请输入课程介绍"
          />
        </div>
        <div class="modal-action">
          <button
            class="btn btn-ghost"
            @click.prevent="showCreateModal = false"
          >
            取消
          </button>
          <button class="btn btn-primary" @click.prevent="handleCreateCourse">
            <span
              v-if="createLoading"
              class="loading loading-spinner loading-sm"
            ></span>
            确认创建
          </button>
        </div>
      </form>
    </dialog>

    <!-- 编辑课程弹窗 -->
    <dialog class="modal" :open="showEditModal">
      <form method="dialog" class="modal-box w-96 rounded-xl shadow-lg">
        <h3 class="font-bold text-lg mb-4">编辑课程</h3>
        <div class="form-control mb-2">
          <label class="label">课程名称<span class="text-error">*</span></label>
          <input v-model="editForm.className" class="input input-bordered" />
        </div>
        <div class="form-control mb-2">
          <label class="label">课程介绍</label>
          <textarea
            v-model="editForm.description"
            class="textarea textarea-bordered h-24"
          />
        </div>
        <div class="form-control mb-2">
          <label class="label">课程密码</label>
          <input
            v-model="editForm.coursePassword"
            class="input input-bordered"
          />
        </div>
        <div class="form-control mb-2">
          <label class="label">状态</label>
          <select v-model="editForm.status" class="select select-bordered">
            <option :value="true">启用</option>
            <option :value="false">停用</option>
          </select>
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" @click.prevent="showEditModal = false">
            取消
          </button>
          <button class="btn btn-primary" @click.prevent="handleEditCourse">
            <span
              v-if="editLoading"
              class="loading loading-spinner loading-sm"
            ></span>
            确认保存
          </button>
        </div>
      </form>
    </dialog>
  </div>
</template>
