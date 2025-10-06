<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { joinClass, getMyClasses } from '@/api/classApi.js'
import message from '@/plugin/message.js'
import { useStudentStore } from '@/stores/studentStores.js'

const studentStore = useStudentStore()

const joinForm = reactive({
  joinCode: '',
})

const loading = ref(true)
const joinLoading = ref(false)
const myClasses = ref([])

const fetchClassData = async () => {
  loading.value = true
  try {
    const res = await getMyClasses()
    if (res.code === 200) {
      myClasses.value = Array.isArray(res.data) ? res.data : []
    } else {
      myClasses.value = []
      message.error(res.message || '获取班级列表失败')
    }
  } catch (err) {
    console.error('获取班级数据失败', err)
    myClasses.value = []
    message.error(err?.message || '获取班级数据失败')
  } finally {
    loading.value = false
  }
}

const displayClasses = computed(() =>
  myClasses.value.map(item => ({
    classId: item.classId,
    courseId: item.courseId || item.classId,
    className: item.className || `班级 ${item.classId}`,
    description: item.description || '',
    joinCode: item.joinCode || '',
    joinTime: item.joinTime,
    classStatus: item.classStatus ?? true,
    teacherName: item.teacherName || item.username || '教师',
    teacherEmail: item.teacherEmail || item.email || '',
    teacherAvatar: item.teacherAvatar || item.avatar || '',
  })),
)

watch(
  displayClasses,
  value => {
    studentStore.setStudentCourse(value)
  },
  { immediate: true },
)

const handleJoinClass = async () => {
  if (!joinForm.joinCode.trim()) {
    message.warning('请输入加入码')
    return
  }

  joinLoading.value = true
  try {
    const res = await joinClass({
      joinCode: joinForm.joinCode.trim().toUpperCase(),
    })
    if (res.code === 200) {
      message.success('加入班级成功')
      joinForm.joinCode = ''
      await fetchClassData()
    } else {
      message.error(res.message || '加入班级失败')
    }
  } catch (err) {
    console.error('加入班级失败', err)
    message.error(err?.message || '加入班级失败')
  } finally {
    joinLoading.value = false
  }
}

const formatJoinTime = time => {
  if (!time) return '—'
  try {
    return new Date(time).toLocaleString()
  } catch {
    return time
  }
}

onMounted(() => {
  fetchClassData()
})
</script>

<template>
  <div class="flex flex-col h-full p-4">
    <TitleBar>
      <template #title>
        <i class="fa-solid fa-graduation-cap text-primary"></i>
        <span>我的班级</span>
      </template>
      <template #module>
        <div class="flex flex-wrap items-center gap-2">
          <label class="input input-bordered flex items-center gap-2 w-48">
            <i class="fa-solid fa-key text-base-content/60"></i>
            <input
              v-model="joinForm.joinCode"
              class="grow uppercase"
              placeholder="输入加入码"
            />
          </label>
          <button
            class="btn btn-primary"
            :disabled="joinLoading"
            @click="handleJoinClass"
          >
            <span
              v-if="joinLoading"
              class="loading loading-spinner loading-sm"
            />
            加入班级
          </button>
        </div>
      </template>
    </TitleBar>

    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      <div v-if="loading" class="w-full h-64 flex justify-center items-center">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <div
        v-else-if="displayClasses.length === 0"
        class="h-64 flex flex-col items-center justify-center gap-3 text-center"
      >
        <i
          class="fa-regular fa-face-smile-beam text-5xl text-base-content/30"
        ></i>
        <p class="text-lg text-base-content/70">暂未加入任何班级</p>
        <p class="text-sm text-base-content/50">
          向老师索取加入码，输入后即可加入对应班级。
        </p>
      </div>

      <div
        v-else
        class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6"
      >
        <div
          v-for="classItem in displayClasses"
          :key="classItem.classId"
          class="class-card group cursor-pointer rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          @click="
            $router.push({
              name: 'student-course-detail-detail',
              params: { courseId: String(classItem.courseId) },
              query: { classId: classItem.classId },
            })
          "
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary"
                >
                  {{ classItem.className.charAt(0) }}
                </div>
                <div class="flex flex-col">
                  <h3 class="text-lg font-semibold text-base-content">
                    {{ classItem.className }}
                  </h3>
                  <span class="text-xs text-base-content/60"
                    >课程 ID：{{ classItem.courseId }}</span
                  >
                </div>
              </div>
              <div
                class="mt-2 flex items-center gap-2 text-sm text-base-content/70"
              >
                <i class="fa-solid fa-chalkboard-user text-primary"></i>
                <span>{{ classItem.teacherName }}</span>
              </div>
            </div>
            <span
              class="badge"
              :class="classItem.classStatus ? 'badge-success' : 'badge-error'"
            >
              {{ classItem.classStatus ? '正常' : '停用' }}
            </span>
          </div>

          <p class="mt-4 min-h-[48px] text-sm text-base-content/70">
            {{ classItem.description || '暂无班级简介' }}
          </p>

          <div
            class="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-base-content/60"
          >
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-calendar-days"></i>
              加入时间：{{ formatJoinTime(classItem.joinTime) }}
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-ticket"></i>
              加入码：<span class="font-mono">{{
                classItem.joinCode || '—'
              }}</span>
            </div>
          </div>

          <div
            class="mt-4 flex items-center justify-end gap-2 text-xs text-primary"
          >
            <span>点击进入课程详情</span>
            <i class="fa-solid fa-angles-right"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.class-card {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.badge-success {
  background-color: hsla(var(--su));
  color: hsla(var(--suc));
}

.badge-error {
  background-color: hsla(var(--er));
  color: hsla(var(--erc));
}
</style>
