<script setup>
// 导入Vue Router相关功能，用于路由导航和获取当前路由信息
import { useRoute } from 'vue-router'
import router from '@/router'

// 导入图标组件，用于UI展示

// 导入API和Store，用于数据获取和状态管理
import { getSession } from '@/api/chat'
import { useAIStore } from '@/stores/ai'
import { useUserStore } from '@/stores/user'

// 初始化Store和路由实例
const ai = useAIStore()
const user = useUserStore()
const route = useRoute()

// 定义响应式状态变量
const isLoading = ref(true) // 加载状态标志

/**
 * 获取聊天会话历史记录
 * 从服务器获取会话列表并更新到AI Store中
 */
const handleGetSession = async () => {
  const res = await getSession()
  if (res.code === 200) {
    ai.chatSessionHistory = res.data
    isLoading.value = false // 数据加载完成，更新加载状态
  }
}

// 组件挂载时获取会话历史
onMounted(() => {
  handleGetSession()
})

/**
 * 根据时间分组会话历史
 * 将聊天记录分为今天、昨天、三天前、七天前和更早的分组
 * @returns {Object} 按时间分组的会话对象
 */
const groupedChats = computed(() => {
  // 设置各个时间点，用于分组
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // 初始化分组对象
  const groups = {
    today: [],
    yesterday: [],
    threeDaysAgo: [],
    sevenDaysAgo: [],
    older: [],
  }

  // 遍历会话历史并根据创建时间分组
  if (ai.chatSessionHistory) {
    ai.chatSessionHistory.forEach(chat => {
      const chatDate = new Date(chat.createTime)
      chatDate.setHours(0, 0, 0, 0)

      // 根据日期将聊天记录分配到对应的时间组
      if (chatDate.getTime() === today.getTime()) {
        groups.today.push(chat)
      } else if (chatDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(chat)
      } else if (chatDate >= threeDaysAgo && chatDate < yesterday) {
        groups.threeDaysAgo.push(chat)
      } else if (chatDate >= sevenDaysAgo && chatDate < threeDaysAgo) {
        groups.sevenDaysAgo.push(chat)
      } else {
        groups.older.push(chat)
      }
    })
  }

  return groups
})

/**
 * 格式化日期为小时:分钟格式
 * @param {string} dateString - ISO格式的时间字符串
 * @returns {string} 格式化后的时间字符串 (HH:MM)
 */
const formatDate = dateString => {
  const date = new Date(dateString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 根据用户角色和会话ID生成正确的路由路径
 * @param {string} sessionId - 会话ID
 * @returns {string} 完整的路由路径
 */
const getSessionPath = sessionId => {
  const role = user.userInfo?.role || ''
  const basePath = role === 'teacher' ? '/t/ai/chat/' : '/s/ai/chat/'
  return basePath + sessionId
}
</script>

<template>
  <!-- 历史消息容器 -->
  <div class="w-full">
    <!-- 标题栏 -->
    <div class="flex items-center space-x-2 px-2 py-1">
      <LineMdCompassTwotoneLoop />
      <span class="text-md font-bold">历史消息</span>
    </div>

    <!-- 加载状态指示器 -->
    <div v-if="isLoading" class="flex justify-center items-center p-4">
      <span class="loading loading-spinner" />
    </div>

    <div v-else class="w-full flex flex-col space-y-2">
      <!-- 今天的聊天记录 -->
      <div v-if="groupedChats.today.length > 0" class="w-full">
        <h2 class="menu-title px-2">今天</h2>
        <ul class="menu menu-sm w-full">
          <li
            v-for="(item, index) in groupedChats.today"
            :key="'today-' + index"
            @click="router.push(getSessionPath(item.sessionId))"
          >
            <a
              class="flex justify-between items-center"
              :class="{ 'menu-active': route.params.id === item.sessionId }"
            >
              <span class="truncate max-w-[110px]">{{ item.sessionName }}</span>
              <div class="flex items-center space-x-2">
                <span class="text-xs opacity-60">{{
                  formatDate(item.createTime)
                }}</span>
                <!-- 操作下拉菜单 -->
                <div class="dropdown dropdown-bottom dropdown-end">
                  <div
                    tabindex="0"
                    role="button"
                    class="btn-ghost opacity-70 hover:opacity-100 rounded-full p-1 transition-all"
                  >
                    <IcBaselineMoreHoriz />
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-sm"
                  >
                    <li>
                      <a class="text-black"> <LineMdEdit />修改名称</a>
                    </li>
                    <li>
                      <a class="text-red-500"> <LineMdTrash />删除 </a>
                    </li>
                  </ul>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </div>

      <!-- 昨天的聊天记录 -->
      <div v-if="groupedChats.yesterday.length > 0" class="w-full">
        <h2 class="menu-title px-2">昨天</h2>
        <ul class="menu menu-sm w-full">
          <li
            v-for="(item, index) in groupedChats.yesterday"
            :key="'yesterday-' + index"
            @click="router.push(getSessionPath(item.sessionId))"
          >
            <a
              class="flex justify-between items-center"
              :class="{ 'menu-active': route.params.id === item.sessionId }"
            >
              <span class="truncate max-w-[110px]">{{ item.sessionName }}</span>
              <div class="flex items-center space-x-2">
                <span class="text-xs opacity-60">{{
                  formatDate(item.createTime)
                }}</span>
                <!-- 操作下拉菜单 -->
                <div class="dropdown dropdown-bottom dropdown-end">
                  <div
                    tabindex="0"
                    role="button"
                    class="btn-ghost opacity-70 hover:opacity-100 rounded-full p-1 transition-all"
                  >
                    <IcBaselineMoreHoriz />
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-sm"
                  >
                    <li>
                      <a class="text-black"> <LineMdEdit />修改名称</a>
                    </li>
                    <li>
                      <a class="text-red-500"> <LineMdTrash />删除 </a>
                    </li>
                  </ul>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </div>

      <!-- 三天前的聊天记录 -->
      <div v-if="groupedChats.threeDaysAgo.length > 0" class="w-full">
        <h2 class="menu-title px-2">三天前</h2>
        <ul class="menu menu-sm w-full">
          <li
            v-for="(item, index) in groupedChats.threeDaysAgo"
            :key="'threeDays-' + index"
            @click="router.push(getSessionPath(item.sessionId))"
          >
            <a
              class="flex justify-between items-center"
              :class="{ 'menu-active': route.params.id === item.sessionId }"
            >
              <span class="truncate max-w-[110px]">{{ item.sessionName }}</span>
              <div class="flex items-center space-x-2">
                <span class="text-xs opacity-60">{{
                  formatDate(item.createTime)
                }}</span>
                <div class="dropdown dropdown-bottom dropdown-end">
                  <div
                    tabindex="0"
                    role="button"
                    class="btn-ghost opacity-70 hover:opacity-100 rounded-full p-1 transition-all"
                  >
                    <IcBaselineMoreHoriz />
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-sm"
                  >
                    <li>
                      <a class="text-black"> <LineMdEdit />修改名称</a>
                    </li>
                    <li>
                      <a class="text-red-500"> <LineMdTrash />删除 </a>
                    </li>
                  </ul>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </div>

      <!-- 七天前的聊天记录 -->
      <div v-if="groupedChats.sevenDaysAgo.length > 0" class="w-full">
        <h2 class="menu-title px-2">七天前</h2>
        <ul class="menu menu-sm w-full">
          <li
            v-for="(item, index) in groupedChats.sevenDaysAgo"
            :key="'sevenDays-' + index"
            @click="router.push(getSessionPath(item.sessionId))"
          >
            <a
              class="flex justify-between items-center"
              :class="{ 'menu-active': route.params.id === item.sessionId }"
            >
              <span class="truncate max-w-[110px]">{{ item.sessionName }}</span>
              <div class="flex items-center space-x-2">
                <span class="text-xs opacity-60">{{
                  formatDate(item.createTime)
                }}</span>
                <div class="dropdown dropdown-bottom dropdown-end">
                  <div
                    tabindex="0"
                    role="button"
                    class="btn-ghost opacity-70 hover:opacity-100 rounded-full p-1 transition-all"
                  >
                    <IcBaselineMoreHoriz />
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-sm"
                  >
                    <li>
                      <a class="text-black"> <LineMdEdit />修改名称</a>
                    </li>
                    <li>
                      <a class="text-red-500"> <LineMdTrash />删除 </a>
                    </li>
                  </ul>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </div>

      <!-- 更早之前的聊天记录 -->
      <div v-if="groupedChats.older.length > 0" class="w-full">
        <h2 class="menu-title px-2">更久之前</h2>
        <ul class="menu menu-sm w-full">
          <li
            v-for="(item, index) in groupedChats.older"
            :key="'older-' + index"
            @click="router.push(getSessionPath(item.sessionId))"
          >
            <a
              class="flex justify-between items-center"
              :class="{ 'menu-active': route.params.id === item.sessionId }"
            >
              <span class="truncate max-w-[110px]">{{ item.sessionName }}</span>
              <div class="flex items-center space-x-2">
                <span class="text-xs opacity-60">{{
                  formatDate(item.createTime)
                }}</span>
                <div class="dropdown dropdown-bottom dropdown-end">
                  <div
                    tabindex="0"
                    role="button"
                    class="btn-ghost opacity-70 hover:opacity-100 rounded-full p-1 transition-all"
                  >
                    <IcBaselineMoreHoriz />
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-sm"
                  >
                    <li>
                      <a class="text-black"> <LineMdEdit />修改名称</a>
                    </li>
                    <li>
                      <a class="text-red-500"> <LineMdTrash />删除 </a>
                    </li>
                  </ul>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
