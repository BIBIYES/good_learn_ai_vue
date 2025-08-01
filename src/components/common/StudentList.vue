<template>
  <div class="flex flex-col space-y-4 w-full">
    <!-- 搜索框 -->
    <div class="flex gap-2">
      <input
        v-model="searchUsername"
        type="text"
        placeholder="搜索用户名..."
        class="input input-bordered flex-grow"
        @keyup.enter="handleSearch"
      />
      <button
        class="btn btn-primary flex items-center"
        :disabled="isSearching"
        @click="handleSearch"
      >
        <span
          v-if="isSearching"
          class="loading loading-spinner loading-sm mr-2"
        ></span>
        <span v-else>🔍</span>
        <span>搜索</span>
      </button>
      <button
        class="btn btn-outline flex items-center"
        :disabled="isSearching"
        @click="handleReset"
      >
        重置
      </button>
    </div>
    <hr />
    <div
      v-for="item in studentList"
      :key="item.userId"
      class="w-full bg-base-200 p-4 rounded-lg cursor-pointer hover:bg-base-300"
      @click="selectStudent(item)"
    >
      <div class="flex items-center justify-between">
        <span>{{ item.username }}</span>
        <span>🏆 {{ item.credits }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCourseList } from '@/api/courseApi.js'
import { onMounted, ref } from 'vue'

const studentList = ref([])
const searchUsername = ref('')
const isSearching = ref(false)

const props = defineProps({
  courseId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['student-selected'])

const fetchStudentList = async (username = '') => {
  try {
    const res = await getCourseList(props.courseId, username)
    if (res.code === 200 && res.data) {
      studentList.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch student list:', error)
  }
}

const handleSearch = async () => {
  isSearching.value = true
  try {
    await fetchStudentList(searchUsername.value)
  } finally {
    isSearching.value = false
  }
}

const handleReset = async () => {
  searchUsername.value = ''
  isSearching.value = true
  try {
    await fetchStudentList()
  } finally {
    isSearching.value = false
  }
}

const selectStudent = student => {
  emit('student-selected', student)
}

onMounted(() => {
  fetchStudentList()
})
</script>

<style lang="scss" scoped>
.item {
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}
</style>
