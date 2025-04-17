<script setup>
import { ref, onMounted } from 'vue'
import { getTeacherCourse, createCourse, updateTeacherCourse } from '@/api/course'
import message from '@/plugin/message'
import {School} from '@icon-park/vue-next'
import { Add } from '@icon-park/vue-next'


const loading = ref(true)
const courses = ref([])
const showCreateModal = ref(false)
const showEditModal = ref(false)


const newCourse = ref({
  className: '',
  description: ''
})

const editForm = ref({
  courseId: '',
  className: '',
  description: '',
  monitorId: '',
  status: true
})

const handleGetCourses = async () => {
  loading.value = true
  try {
    const res = await getTeacherCourse()
    if (res.code === 200) {
      courses.value = res.data.reverse()
    }
  } catch (err) {
    message.error(err.message)
  } finally {
    loading.value = false
  }
}

const handleCreateCourse = async () => {
  if (!newCourse.value.className) {
    message.error('课程名称不能为空')
    return
  }
  try {
    const res = await createCourse({
      className: newCourse.value.className,
      description: newCourse.value.description
    })
    if (res.code === 200) {
      message.success('创建成功')
      showCreateModal.value = false
      newCourse.value = { className: '', description: '' }
      handleGetCourses()
    }
  } catch (err) {
    message.error(err.message)
  }
}

const openEditModal = (course) => {
  editForm.value = { ...course }
  showEditModal.value = true
}

const handleEditCourse = async () => {
  try {
    const res = await updateTeacherCourse({
      courseId: editForm.value.courseId,
      className: editForm.value.className,
      description: editForm.value.description,
      monitorId: editForm.value.monitorId,
      status: editForm.value.status
    })
    if (res.code === 200) {
      message.success('编辑成功')
      showEditModal.value = false
      handleGetCourses()
    }
  } catch (err) {
    message.error(err.message)
  }
}

onMounted(() => {
  handleGetCourses()
})
</script>
<template>
  <div class="flex flex-col h-full p-4">
    <!-- Header with title and create button -->
    <TitleBar>
      <template #title>
        <school
          theme="outline"
          size="38"
        />
        <span>我的课程</span>
      </template>
      <template #module>
        <button
          class="btn btn-primary btn-sm md:btn-md"
          @click="showCreateModal = true"
        >
          <Add
            theme="outline"
            size="18"
          />
          新建课程
        </button>
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
        v-else-if="courses.length === 0"
        class="flex flex-col items-center justify-center h-64"
      >
        <div class="text-center">
          <School
            theme="outline"
            size="48"
            class="text-base-content/30 mb-4"
          />
          <p class="text-base-content/70 text-lg">
            暂无课程，快去创建一个吧！
          </p>
          <button
            class="btn btn-primary mt-4"
            @click="showCreateModal = true"
          >
            <Add
              theme="outline"
              size="18"
              class="mr-1"
            />
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
          class="relative group bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 border border-gray-100 hover:shadow-2xl transition-all animate__animated animate__fadeIn"
        >
          <div class="flex items-center gap-3 mb-2">
            <div class="bg-green-100 w-12 h-12 rounded-lg flex justify-center items-center text-green-600 text-2xl font-bold">
              {{ item.className.charAt(0) }}
            </div>
            <div class="flex-1">
              <span class="text-lg font-bold text-gray-800 flex items-center gap-2">
                {{ item.className }}
                <span
                  class="ml-2 px-2 py-0.5 rounded text-xs font-medium"
                  :class="item.status ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'"
                >
                  {{ item.status ? '启用' : '停用' }}
                </span>
              </span>
              <span class="text-sm text-gray-500">{{ item.teacherName || '教师' }}<span
                v-if="item.teacherEmail"
                class="ml-2 text-xs text-gray-400"
              >{{ item.teacherEmail }}</span></span>
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
                  <a @click="openEditModal(item)">编辑</a>
                </li>
              </ul>
            </div>
          </div>
          <div class="text-gray-500 flex items-center text-sm flex-1 min-h-[40px] border-l-4 border-green-200 pl-3 bg-gray-50 rounded">
            <div>{{ item.description || '暂无介绍' }}</div> 
          </div>
          <div class="flex items-center justify-between mt-4 text-xs text-gray-400 border-t pt-3">
            <span>课程ID: {{ item.courseId }}</span>
            <span>创建时间: {{ item.createdAt ? (item.createdAt.split('T')[0]) : '—' }}</span>
            <button
              class="btn btn-sm btn-outline btn-primary"
              @click="openEditModal(item)"
            >
              编辑
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination section (optional, if you have pagination) -->
    <div class="mt-auto border-t border-base-200 p-4 bg-base-100">
      <div
        v-if="!loading && courses.length > 0"
        class="flex justify-center space-x-5"
      >
        <div class="btn btn-sm">
          <div
            aria-label="status"
            class="status status-primary"
          />
          <span>总计课程数：</span>{{ courses.length }}
        </div>
      </div>
    </div>

    <!-- 新建课程弹窗 -->
    <dialog
      class="modal"
      :open="showCreateModal"
    >
      <form
        method="dialog"
        class="modal-box w-96 rounded-xl shadow-lg"
      >
        <h3 class="font-bold text-lg mb-4">
          新建课程
        </h3>
        <div class="form-control mb-2">
          <label class="label">课程名称<span class="text-error">*</span></label>
          <input
            v-model="newCourse.className"
            class="input input-bordered"
            placeholder="请输入课程名称"
          >
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
          <button
            class="btn btn-primary"
            @click.prevent="handleCreateCourse"
          >
            确认创建
          </button>
        </div>
      </form>
    </dialog>
    
    <!-- 编辑课程弹窗 -->
    <dialog
      class="modal"
      :open="showEditModal"
    >
      <form
        method="dialog"
        class="modal-box w-96 rounded-xl shadow-lg"
      >
        <h3 class="font-bold text-lg mb-4">
          编辑课程
        </h3>
        <div class="form-control mb-2">
          <label class="label">课程名称<span class="text-error">*</span></label>
          <input
            v-model="editForm.className"
            class="input input-bordered"
          >
        </div>
        <div class="form-control mb-2">
          <label class="label">课程介绍</label>
          <textarea
            v-model="editForm.description"
            class="textarea textarea-bordered h-24"
          />
        </div>
        <div class="form-control mb-2">
          <label class="label">状态</label>
          <select
            v-model="editForm.status"
            class="select select-bordered"
          >
            <option :value="true">
              启用
            </option>
            <option :value="false">
              停用
            </option>
          </select>
        </div>
        <div class="modal-action">
          <button
            class="btn btn-ghost"
            @click.prevent="showEditModal = false"
          >
            取消
          </button>
          <button
            class="btn btn-primary"
            @click.prevent="handleEditCourse"
          >
            确认保存
          </button>
        </div>
      </form>
    </dialog>
  </div>
</template>