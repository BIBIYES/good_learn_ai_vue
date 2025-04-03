<template>
  <div class="app">
    <div
      class="flex flex-col space-y-3 bg-base-100 hover:bg-base-200 transition-colors duration-300 p-5 rounded-lg shadow-md border border-base-300 cursor-pointer relative overflow-hidden"
    >
      <div class="flex items-center space-x-4">
        <!-- 左侧图标盒子 -->
        <div
          class="bg-primary w-16 h-16 rounded-lg text-4xl flex justify-center items-center shadow-sm flex-shrink-0"
        >
          <p class="text-primary-content">{{ firstChar }}</p>
        </div>

        <!-- 中央内容区域 -->
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <!-- 标题和教师信息 -->
            <div>
              <h3 class="text-xl font-bold text-base-content truncate">
                {{ title }}
              </h3>

              <!-- 教师信息 -->
              <div class="flex items-center gap-2 mt-1">
                <div class="avatar">
                  <div class="w-6 h-6 rounded-full">
                    <img
                      :src="teacherAvatar || '/api/placeholder/24/24'"
                      alt="Teacher"
                    />
                  </div>
                </div>
                <span class="text-sm font-medium">{{ teacherName }}</span>

                <!-- 成员数量 -->
                <div
                  class="badge badge-primary badge-outline badge-sm gap-1 ml-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  {{ memberCount }}
                </div>
              </div>
            </div>

            <!-- 学分显示 -->
            <div
              class="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="font-medium">{{ credits }}</span>
              <span class="text-xs text-base-content/60">学分</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 描述 -->
      <p class="text-sm text-base-content/70 line-clamp-2 pl-20">
        {{ description }}
      </p>

      <!-- 底部状态栏 -->
      <div class="flex justify-between items-center mt-1 pl-20">
        <!-- 课程状态 -->
        <div class="flex items-center">
          <span class="badge badge-sm" :class="statusClass">{{
            statusText
          }}</span>
          <span class="text-xs text-base-content/60 ml-2"
            >加入时间: {{ formatDate(joinTime) }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseCard',
  props: {
    title: {
      type: String,
      default: '计算机网络',
    },
    description: {
      type: String,
      default: "自己啊实打实的打撒大叔大婶啊大叔大婶大a's'd's啊实打实的藐视",
    },
    teacherName: {
      type: String,
      default: '张教授',
    },
    teacherAvatar: {
      type: String,
      default: '',
    },
    memberCount: {
      type: Number,
      default: 42,
    },
    joinTime: {
      type: String,
      default: new Date().toISOString(),
    },
    credits: {
      type: Number,
      default: 3,
    },
    status: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    firstChar() {
      return this.title.charAt(0)
    },
    statusText() {
      return this.status === 1 ? '正常' : '禁用'
    },
    statusClass() {
      return this.status === 1 ? 'badge-success' : 'badge-error'
    },
  },
  methods: {
    formatDate(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString()
      } catch (e) {
        console.log(e)

        return dateString
      }
    },
  },
}
</script>

<style scoped></style>
