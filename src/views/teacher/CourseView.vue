<script setup>
import { ref, onMounted } from 'vue'
import { getTeacherCourse, createCourse, updateTeacherCourse } from '@/api/course'
import message from '@/plugin/message'
import {School} from '@icon-park/vue-next'


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
  <div class="app flex flex-col h-full p-4">
    <TitleBar>
      <template #title>
        <school
          theme="outline"
          size="38"
        />
        <span>我的课程</span>
      </template>
    </TitleBar>
    <div
      v-if="loading"
      class="w-full h-screen flex justify-center items-center animate__animated animate__fadeIn"
    >
      <span class="loading loading-spinner loading-xl" />
    </div>
    <div
      v-else
      class="overflow-y-auto space-y-5 mt-4"
    >
      <div
        v-if="courses.length === 0"
        class="text-center text-gray-400"
      >
        暂无课程，点击右上角新建课程
      </div>
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="item in courses"
          :key="item.courseId"
          class="relative  group bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 border border-gray-100 hover:shadow-2xl transition-all animate__animated animate__fadeIn"
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
          </div>
          <div class="text-gray-500 flex items-center text-sm flex-1 min-h-[40px] border-l-4 border-green-200 pl-3 bg-gray-50 rounded">
            <div>{{ item.description || '暂无介绍' }}</div> 
          </div>
          <div class="flex items-center justify-between mt-4 text-xs text-gray-400 border-t pt-3">
            <span>课程ID: {{ item.courseId }}</span>
            <span>创建时间: {{ item.createdAt ? (item.createdAt.split('T')[0]) : '—' }}</span>
            <div class="flex gap-2">
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
          <label class="label">课程名称</label>
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
            class="textarea textarea-bordered"
            placeholder="请输入课程介绍"
          />
        </div>
        <div class="modal-action">
          <button
            class="btn"
            @click.prevent="showCreateModal = false"
          >
            取消
          </button>
          <button
            class="btn btn-primary"
            @click.prevent="handleCreateCourse"
          >
            创建
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
          <label class="label">课程名称</label>
          <input
            v-model="editForm.className"
            class="input input-bordered"
          >
        </div>
        <div class="form-control mb-2">
          <label class="label">课程介绍</label>
          <textarea
            v-model="editForm.description"
            class="textarea textarea-bordered"
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
            class="btn"
            @click.prevent="showEditModal = false"
          >
            取消
          </button>
          <button
            class="btn btn-primary"
            @click.prevent="handleEditCourse"
          >
            保存
          </button>
        </div>
      </form>
    </dialog>
  </div>
</template>