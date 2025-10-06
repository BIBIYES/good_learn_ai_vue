<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import {
  createClass,
  deleteClass,
  getAllClasses,
  getClassMembers,
  updateClass,
} from '@/api/classApi.js'
import message from '@/plugin/message.js'

const props = defineProps({
  courseId: {
    type: [Number, String],
    required: true,
  },
})

const loading = ref(false)
const classList = ref([])
const classMembers = ref([])

const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const membersDialogVisible = ref(false)

const createLoading = ref(false)
const editLoading = ref(false)
const deleteLoading = ref(false)
const membersLoading = ref(false)

const selectedClass = ref(null)

const createForm = reactive({
  className: '',
  description: '',
  joinCode: '',
})

const editForm = reactive({
  classId: null,
  className: '',
  description: '',
})

const generateJoinCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

const filteredClasses = computed(() =>
  classList.value.filter(
    item => Number(item.courseId) === Number(props.courseId),
  ),
)

const fetchClasses = async () => {
  if (!props.courseId) return
  loading.value = true
  try {
    const res = await getAllClasses()
    if (res.code === 200) {
      classList.value = Array.isArray(res.data) ? res.data : []
    } else {
      message.error(res.message || '获取班级列表失败')
    }
  } catch (err) {
    console.error(err)
    message.error(err?.message || '获取班级列表失败')
  } finally {
    loading.value = false
  }
}

watch(
  () => props.courseId,
  value => {
    if (value) {
      fetchClasses()
    }
  },
  { immediate: true },
)

const openCreateDialog = () => {
  createForm.className = ''
  createForm.description = ''
  createForm.joinCode = generateJoinCode()
  createDialogVisible.value = true
}

const handleCreateClass = async () => {
  if (!createForm.className.trim()) {
    message.warning('请输入班级名称')
    return
  }

  if (!createForm.joinCode.trim()) {
    message.warning('请输入班级加入码')
    return
  }

  createLoading.value = true
  try {
    const res = await createClass({
      courseId: Number(props.courseId),
      className: createForm.className.trim(),
      description: createForm.description.trim(),
      joinCode: createForm.joinCode.trim().toUpperCase(),
    })
    if (res.code === 200) {
      message.success('班级创建成功')
      createDialogVisible.value = false
      await fetchClasses()
    } else {
      message.error(res.message || '班级创建失败')
    }
  } catch (err) {
    console.error(err)
    message.error(err?.message || '班级创建失败')
  } finally {
    createLoading.value = false
  }
}

const openEditDialog = classItem => {
  editForm.classId = classItem.classId
  editForm.className = classItem.className
  editForm.description = classItem.description || ''
  editDialogVisible.value = true
}

const handleEditClass = async () => {
  if (!editForm.className.trim()) {
    message.warning('请输入班级名称')
    return
  }

  editLoading.value = true
  try {
    const res = await updateClass({
      classId: editForm.classId,
      className: editForm.className.trim(),
      description: editForm.description.trim(),
    })
    if (res.code === 200) {
      message.success('班级信息已更新')
      editDialogVisible.value = false
      await fetchClasses()
    } else {
      message.error(res.message || '班级更新失败')
    }
  } catch (err) {
    console.error(err)
    message.error(err?.message || '班级更新失败')
  } finally {
    editLoading.value = false
  }
}

const openDeleteDialog = classItem => {
  selectedClass.value = classItem
  deleteDialogVisible.value = true
}

const handleDeleteClass = async () => {
  if (!selectedClass.value) return
  deleteLoading.value = true
  try {
    const res = await deleteClass(selectedClass.value.classId)
    if (res.code === 200) {
      message.success('班级已删除')
      deleteDialogVisible.value = false
      await fetchClasses()
    } else {
      message.error(res.message || '班级删除失败')
    }
  } catch (err) {
    console.error(err)
    message.error(err?.message || '班级删除失败')
  } finally {
    deleteLoading.value = false
  }
}

const openMembersDialog = async classItem => {
  selectedClass.value = classItem
  classMembers.value = []
  membersDialogVisible.value = true
  await nextTick()
  await fetchClassMembers(classItem.classId)
}

const fetchClassMembers = async classId => {
  membersLoading.value = true
  try {
    const res = await getClassMembers(classId)
    if (res.code === 200) {
      classMembers.value = Array.isArray(res.data) ? res.data : []
    } else {
      message.error(res.message || '获取班级成员失败')
    }
  } catch (err) {
    console.error(err)
    message.error(err?.message || '获取班级成员失败')
  } finally {
    membersLoading.value = false
  }
}

const copyJoinCode = async code => {
  try {
    await navigator.clipboard.writeText(code)
    message.success('加入码已复制')
  } catch (err) {
    console.error(err)
    message.error('复制失败，请手动复制')
  }
}

const formatJoinTime = value => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2 text-base-content/80">
        <i class="fa-solid fa-layer-group text-primary"></i>
        <span class="font-semibold">课程班级</span>
        <span class="badge badge-outline"
          >{{ filteredClasses.length }} 个班级</span
        >
      </div>
      <div class="flex items-center gap-2">
        <button
          class="btn btn-ghost btn-sm"
          :disabled="loading"
          @click="fetchClasses"
        >
          <i class="fa-solid fa-rotate"></i>
          刷新
        </button>
        <button class="btn btn-primary btn-sm" @click="openCreateDialog">
          <i class="fa-solid fa-plus"></i>
          新建班级
        </button>
      </div>
    </div>

    <div v-if="loading" class="card bg-base-100 border border-dashed">
      <div class="card-body items-center justify-center text-base-content/60">
        <span class="loading loading-spinner loading-lg text-primary" />
        <p class="mt-3 text-sm">正在加载班级信息...</p>
      </div>
    </div>

    <div
      v-else-if="filteredClasses.length === 0"
      class="card bg-base-100 border border-dashed"
    >
      <div class="card-body items-center text-center gap-3">
        <i class="fa-regular fa-folder-open text-4xl text-base-content/30"></i>
        <h3 class="text-lg font-semibold">暂未创建班级</h3>
        <p class="text-sm text-base-content/60">
          为该课程创建一个或多个班级，方便管理学生和分组教学。
        </p>
        <button class="btn btn-primary btn-sm" @click="openCreateDialog">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          立即创建
        </button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div
        v-for="item in filteredClasses"
        :key="item.classId"
        class="card bg-base-100 border border-base-200 shadow-sm transition hover:shadow-lg"
      >
        <div class="card-body gap-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-chalkboard text-primary"></i>
                <h3 class="text-lg font-bold text-base-content">
                  {{ item.className }}
                </h3>
              </div>
              <span class="text-sm text-base-content/60">
                课程 ID：{{ item.courseId }}
              </span>
              <span class="text-xs text-base-content/50">
                负责教师：{{ item.teacherName || '未填写' }}
              </span>
            </div>
            <div class="flex flex-col items-end gap-2">
              <span
                class="badge"
                :class="item.status ? 'badge-success' : 'badge-error'"
              >
                {{ item.status ? '启用' : '停用' }}
              </span>
              <button
                v-if="item.joinCode"
                class="btn btn-xs btn-ghost"
                title="复制加入码"
                @click="copyJoinCode(item.joinCode)"
              >
                <i class="fa-regular fa-copy"></i>
              </button>
            </div>
          </div>

          <div
            class="rounded-lg bg-base-200/60 p-3 text-sm text-base-content/70"
          >
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-key text-primary"></i>
              <span>加入码：</span>
              <span class="font-mono text-base-content">
                {{ item.joinCode || '—' }}
              </span>
            </div>
            <div v-if="item.description" class="mt-2 flex items-start gap-2">
              <i class="fa-solid fa-align-left text-primary/70 mt-0.5"></i>
              <p class="leading-6">{{ item.description }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs text-base-content/60">
            <div class="flex items-center gap-1">
              <i class="fa-regular fa-clock"></i>
              创建：{{
                item.createdAt ? item.createdAt.replace('T', ' ') : '—'
              }}
            </div>
            <div class="flex items-center gap-1">
              <i class="fa-solid fa-arrows-rotate"></i>
              更新：{{
                item.updatedAt ? item.updatedAt.replace('T', ' ') : '—'
              }}
            </div>
          </div>

          <div class="card-actions mt-2 flex items-center justify-between">
            <button
              class="btn btn-outline btn-sm"
              @click="openMembersDialog(item)"
            >
              <i class="fa-solid fa-user-group"></i>
              班级成员
            </button>
            <div class="flex items-center gap-2">
              <button class="btn btn-sm" @click="openEditDialog(item)">
                <i class="fa-solid fa-pen-to-square"></i>
                编辑
              </button>
              <button
                class="btn btn-error btn-sm text-error-content"
                @click="openDeleteDialog(item)"
              >
                <i class="fa-solid fa-trash"></i>
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建班级 -->
    <dialog class="modal" :open="createDialogVisible">
      <div class="modal-box w-full max-w-lg">
        <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
          <i class="fa-solid fa-plus text-primary"></i>
          创建班级
        </h3>
        <div class="form-control mb-3">
          <label class="label"><span class="label-text">班级名称</span></label>
          <input
            v-model="createForm.className"
            class="input input-bordered"
            placeholder="例如：2024级软件一班"
          />
        </div>
        <div class="form-control mb-3">
          <label class="label flex items-center justify-between">
            <span class="label-text">班级加入码</span>
            <button
              type="button"
              class="btn btn-ghost btn-xs"
              @click="createForm.joinCode = generateJoinCode()"
            >
              <i class="fa-solid fa-shuffle mr-1"></i>
              随机生成
            </button>
          </label>
          <input
            v-model="createForm.joinCode"
            class="input input-bordered font-mono uppercase"
            maxlength="8"
            placeholder="输入或生成加入码"
          />
        </div>
        <div class="form-control mb-3">
          <label class="label"><span class="label-text">班级描述</span></label>
          <textarea
            v-model="createForm.description"
            class="textarea textarea-bordered h-28"
            placeholder="补充班级介绍、授课安排等信息"
          />
        </div>
        <div class="modal-action">
          <button class="btn" @click="createDialogVisible = false">取消</button>
          <button
            class="btn btn-primary"
            :disabled="createLoading"
            @click="handleCreateClass"
          >
            <span
              v-if="createLoading"
              class="loading loading-spinner loading-sm"
            ></span>
            确认创建
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="createDialogVisible = false">关闭</button>
      </form>
    </dialog>

    <!-- 编辑班级 -->
    <dialog class="modal" :open="editDialogVisible">
      <div class="modal-box w-full max-w-lg">
        <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
          <i class="fa-solid fa-pen-to-square text-primary"></i>
          编辑班级
        </h3>
        <div class="form-control mb-3">
          <label class="label"><span class="label-text">班级名称</span></label>
          <input v-model="editForm.className" class="input input-bordered" />
        </div>
        <div class="form-control mb-3">
          <label class="label"><span class="label-text">班级描述</span></label>
          <textarea
            v-model="editForm.description"
            class="textarea textarea-bordered h-28"
            placeholder="补充班级介绍信息"
          />
        </div>
        <div class="modal-action">
          <button class="btn" @click="editDialogVisible = false">取消</button>
          <button
            class="btn btn-primary"
            :disabled="editLoading"
            @click="handleEditClass"
          >
            <span
              v-if="editLoading"
              class="loading loading-spinner loading-sm"
            ></span>
            保存修改
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="editDialogVisible = false">关闭</button>
      </form>
    </dialog>

    <!-- 删除班级 -->
    <dialog class="modal" :open="deleteDialogVisible">
      <div class="modal-box w-full max-w-md">
        <h3 class="font-bold text-lg mb-4 text-error flex items-center gap-2">
          <i class="fa-solid fa-triangle-exclamation"></i>
          删除班级
        </h3>
        <p class="text-base-content/70 mb-4">
          确认要删除班级
          <span class="font-semibold">{{ selectedClass?.className }}</span>
          吗？删除后班级将被停用，成员将无法继续加入。
        </p>
        <div class="modal-action">
          <button class="btn" @click="deleteDialogVisible = false">取消</button>
          <button
            class="btn btn-error text-error-content"
            :disabled="deleteLoading"
            @click="handleDeleteClass"
          >
            <span
              v-if="deleteLoading"
              class="loading loading-spinner loading-sm"
            ></span>
            确认删除
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="deleteDialogVisible = false">关闭</button>
      </form>
    </dialog>

    <!-- 班级成员 -->
    <dialog class="modal" :open="membersDialogVisible">
      <div class="modal-box w-full max-w-3xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <i class="fa-solid fa-user-group text-primary"></i>
            {{ selectedClass?.className || '班级成员' }}
          </h3>
          <button
            class="btn btn-sm btn-ghost"
            @click="membersDialogVisible = false"
          >
            关闭
          </button>
        </div>
        <div v-if="membersLoading" class="flex justify-center py-10">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
        <div v-else>
          <div
            v-if="classMembers.length === 0"
            class="rounded-lg border border-dashed border-base-200 p-6 text-center text-base-content/60"
          >
            该班级暂时没有成员。
          </div>
          <div v-else class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr class="text-sm text-base-content/60">
                  <th class="w-16">序号</th>
                  <th class="min-w-[140px]">学生姓名</th>
                  <th class="min-w-[160px]">学号</th>
                  <th class="min-w-[200px]">邮箱</th>
                  <th class="min-w-[160px]">加入时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(member, index) in classMembers" :key="member.id">
                  <td>{{ index + 1 }}</td>
                  <td class="flex items-center gap-2">
                    <div class="avatar placeholder">
                      <div class="w-8 rounded-full bg-primary/10 text-primary">
                        <span class="text-sm">
                          {{
                            member.studentName?.charAt(0) ||
                            member.username?.charAt(0) ||
                            '学'
                          }}
                        </span>
                      </div>
                    </div>
                    <span>{{
                      member.studentName || member.username || '未填写'
                    }}</span>
                  </td>
                  <td>{{ member.schoolNumber || '—' }}</td>
                  <td>{{ member.email || '—' }}</td>
                  <td>{{ formatJoinTime(member.joinTime) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="membersDialogVisible = false">关闭</button>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
.badge-success {
  background-color: hsla(var(--su));
  color: hsla(var(--suc));
}

.badge-error {
  background-color: hsla(var(--er));
  color: hsla(var(--erc));
}
</style>
