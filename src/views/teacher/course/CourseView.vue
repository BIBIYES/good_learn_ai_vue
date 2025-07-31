<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  getTeacherCourse,
  createCourse,
  updateTeacherCourse,
} from '@/api/courseApi.js'
import message from '@/plugin/message.js'
const router = useRouter()

const createLoading = ref(false)
const editLoading = ref(false)

const dialogs = reactive({
  create: {
    visible: false,
  },
  edit: {
    visible: false,
  },
})

// 课程列表
const courses = ref([])
// 分页和加载状态
const pagination = reactive({
  loading: true,
  currentPage: 1,
  totalPages: 1,
  pageSize: 9,
  total: 0,
})
const pageSizeOptions = [6, 9, 12, 15]

const newCourse = ref({
  className: '',
  description: '',
  coursePassword: '',
  status: true,
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
  pagination.loading = true
  try {
    const res = await getTeacherCourse(page, pagination.pageSize)
    if (res.code === 200) {
      courses.value = res.data.records.map(course => ({
        ...course,
        monitorName: course.monitorName || '无', // 如果 monitorName 为空，显示 '无'
      }))
      pagination.total = res.data.total
      pagination.totalPages = Math.ceil(res.data.total / pagination.pageSize)
      pagination.currentPage = page
    }
  } catch (err) {
    console.error('获取课程列表失败', err.message)
    message.error('获取课程列表失败')
  } finally {
    pagination.loading = false
  }
}

const handlePageSizeChange = size => {
  pagination.pageSize = size
  pagination.currentPage = 1
  handleGetCourses(1)
}

const handlePageChange = page => {
  if (page >= 1 && page <= pagination.totalPages) {
    pagination.currentPage = page
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
      dialogs.create.visible = false
      newCourse.value = {
        className: '',
        description: '',
        coursePassword: '',
        status: true,
      }
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
  dialogs.edit.visible = true
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
      dialogs.edit.visible = false
      handleGetCourses(pagination.currentPage)
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
    <TitleBar>
      <template #title>
        <LineMdPencilAltTwotone />
        <span>我的课程</span>
      </template>
      <template #module>
        <el-button type="primary" @click="dialogs.create.visible = true">
          <template #icon>
            <LineMdPlus />
          </template>
          创建课程
        </el-button>
      </template>
    </TitleBar>

    <!-- Main content area -->
    <div
      v-loading="pagination.loading"
      element-loading-text="正在获取课程列表...."
      class="flex-1 overflow-y-auto p-4 md:p-4"
    >
      <!-- Empty State -->
      <div
        v-if="!pagination.loading && courses.length === 0"
        class="flex flex-col items-center justify-center h-64"
      >
        <div class="text-center">
          <School theme="outline" size="48" class="text-base-content/30 mb-4" />
          <p class="text-base-content/70 text-lg">暂无课程，快去创建一个吧！</p>
          <button
            class="btn btn-primary mt-4"
            @click="dialogs.create.visible = true"
          >
            <Add theme="outline" size="18" class="mr-1" />
            创建第一个课程
          </button>
        </div>
      </div>

      <!-- course-detail Grid -->
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
    <div class="flex justify-end">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="pageSizeOptions"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新建课程弹窗 -->
    <el-dialog
      v-model="dialogs.create.visible"
      title="新建课程"
      width="500px"
      align-center
    >
      <div class="form-control mb-2">
        <label class="label">课程名称<span class="text-error">*</span></label>
        <input
          v-model="newCourse.className"
          class="input input-bordered w-full"
          placeholder="请输入课程名称"
        />
      </div>
      <div class="form-control mb-2">
        <label class="label">课程密码<span class="text-error">*</span></label>
        <input
          v-model="newCourse.coursePassword"
          class="input input-bordered w-full"
          type="password"
          placeholder="请输入课程密码"
        />
      </div>
      <div class="form-control mb-2">
        <label class="label">课程介绍</label>
        <textarea
          v-model="newCourse.description"
          class="textarea textarea-bordered h-24 w-full"
          placeholder="请输入课程介绍"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogs.create.visible = false">
            <template #icon>
              <LineMdClose />
            </template>
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="createLoading"
            @click="handleCreateCourse"
          >
            <template #icon>
              <LineMdEditTwotone />
            </template>
            确认创建
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑课程弹窗 -->
    <el-dialog
      v-model="dialogs.edit.visible"
      title="编辑课程"
      width="500px"
      align-center
    >
      <div class="form-control mb-2">
        <label class="label">课程名称<span class="text-error">*</span></label>
        <input
          v-model="editForm.className"
          class="input input-bordered w-full"
        />
      </div>
      <div class="form-control mb-2">
        <label class="label">课程介绍</label>
        <textarea
          v-model="editForm.description"
          class="textarea textarea-bordered h-24 w-full"
        />
      </div>
      <div class="form-control mb-2">
        <label class="label">课程密码</label>
        <input
          v-model="editForm.coursePassword"
          class="input input-bordered w-full"
        />
      </div>
      <div class="form-control mb-2">
        <label class="label">状态</label>
        <select v-model="editForm.status" class="select select-bordered w-full">
          <option :value="true">启用</option>
          <option :value="false">停用</option>
        </select>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button :icon="LineMdClose" @click="dialogs.edit.visible = false">
            <template #icon>
              <LineMdClose />
            </template>
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="editLoading"
            @click="handleEditCourse"
          >
            <template #icon>
              <LineMdEditTwotone />
            </template>
            确认保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
