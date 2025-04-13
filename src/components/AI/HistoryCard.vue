<script setup>
import { ref, onMounted, computed } from 'vue'
import { getSession } from '@/api/chat'
import { useRoute } from 'vue-router'
import { History } from '@icon-park/vue-next'
import router from '@/router'
import { Edit, DeleteFive, More } from '@icon-park/vue-next'

const route = useRoute()

const chatHistory = ref([])

const isLodaing = ref(true)

const handleGetSession = async () => {
  const res = await getSession()
  if (res.code == 200) {
    chatHistory.value = res.data
    isLodaing.value = false
  }
}

onMounted(() => {
  handleGetSession()
})

// 根据时间分组会话
const groupedChats = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const groups = {
    today: [],
    yesterday: [],
    threeDaysAgo: [],
    sevenDaysAgo: [],
    older: []
  }

  chatHistory.value.forEach((chat) => {
    const chatDate = new Date(chat.createTime)
    chatDate.setHours(0, 0, 0, 0)

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

  return groups
})

// 格式化日期显示
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<template>
  <div class="app w-full h-full">
    <ul class="menu rounded-box w-full h-[calc(100vh-100px)]">
      <div class="flex items-center space-x-2">
        <History
          theme="outline"
          size="20"
          fill="#333"
        />
        <span class="text-md font-bold">历史消息</span>
      </div>
      <div
        v-if="isLodaing"
        class="flex justify-center items-center p-4"
      >
        <span class="loading loading-spinner" />
      </div>
      <!-- 今天 -->
      <li v-if="groupedChats.today.length > 0">
        <h2 class="menu-title">
          今天
        </h2>
        <ul>
          <li
            v-for="(item, index) in groupedChats.today"
            :key="'today-' + index"
            @click="
              router.push({ name: 'ai-chat', params: { id: item.sessionId } })
            "
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
                    <More
                      theme="outline"
                      size="15"
                      fill="#333"
                    />
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-sm"
                  >
                    <li>
                      <a class="text-black">
                        <Edit
                          theme="outline"
                          size="20"
                          fill="#333"
                        />修改名称</a>
                    </li>
                    <li>
                      <a class="text-red-500">
                        <DeleteFive
                          theme="outline"
                          size="20"
                          fill="#fa1010"
                        />删除
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </li>

      <!-- 昨天 -->
      <li v-if="groupedChats.yesterday.length > 0">
        <h2 class="menu-title">
          昨天
        </h2>
        <ul>
          <li
            v-for="(item, index) in groupedChats.yesterday"
            :key="'yesterday-' + index"
            @click="
              router.push({ name: 'ai-chat', params: { id: item.sessionId } })
            "
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
                    <More
                      theme="outline"
                      size="15"
                      fill="#333"
                    />
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-sm"
                  >
                    <li>
                      <a class="text-black">
                        <Edit
                          theme="outline"
                          size="20"
                          fill="#333"
                        />修改名称</a>
                    </li>
                    <li>
                      <a class="text-red-500">
                        <DeleteFive
                          theme="outline"
                          size="20"
                          fill="#fa1010"
                        />删除
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </li>

      <!-- 三天前 -->
      <li v-if="groupedChats.threeDaysAgo.length > 0">
        <h2 class="menu-title">
          三天前
        </h2>
        <ul>
          <li
            v-for="(item, index) in groupedChats.threeDaysAgo"
            :key="'threeDays-' + index"
            @click="
              router.push({ name: 'ai-chat', params: { id: item.sessionId } })
            "
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
                    <More
                      theme="outline"
                      size="15"
                      fill="#333"
                    />
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-sm"
                  >
                    <li>
                      <a class="text-black">
                        <Edit
                          theme="outline"
                          size="20"
                          fill="#333"
                        />修改名称</a>
                    </li>
                    <li>
                      <a class="text-red-500">
                        <DeleteFive
                          theme="outline"
                          size="20"
                          fill="#fa1010"
                        />删除
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </li>

      <!-- 七天前 -->
      <li v-if="groupedChats.sevenDaysAgo.length > 0">
        <h2 class="menu-title">
          七天前
        </h2>
        <ul>
          <li
            v-for="(item, index) in groupedChats.sevenDaysAgo"
            :key="'sevenDays-' + index"
            @click="
              router.push({ name: 'ai-chat', params: { id: item.sessionId } })
            "
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
                    <More
                      theme="outline"
                      size="15"
                      fill="#333"
                    />
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-sm"
                  >
                    <li>
                      <a class="text-black">
                        <Edit
                          theme="outline"
                          size="20"
                          fill="#333"
                        />修改名称</a>
                    </li>
                    <li>
                      <a class="text-red-500">
                        <DeleteFive
                          theme="outline"
                          size="20"
                          fill="#fa1010"
                        />删除
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </li>

      <!-- 更久之前 -->
      <li v-if="groupedChats.older.length > 0">
        <h2 class="menu-title">
          更久之前
        </h2>
        <ul>
          <li
            v-for="(item, index) in groupedChats.older"
            :key="'older-' + index"
            @click="
              router.push({ name: 'ai-chat', params: { id: item.sessionId } })
            "
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
                    <More
                      theme="outline"
                      size="15"
                      fill="#333"
                    />
                  </div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-sm"
                  >
                    <li>
                      <a class="text-black">
                        <Edit
                          theme="outline"
                          size="20"
                          fill="#333"
                        />修改名称</a>
                    </li>
                    <li>
                      <a class="text-red-500">
                        <DeleteFive
                          theme="outline"
                          size="20"
                          fill="#fa1010"
                        />删除
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
