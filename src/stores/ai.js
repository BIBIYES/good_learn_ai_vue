import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * AI聊天相关的状态管理
 * @description 管理AI聊天界面的状态，包括输入内容、加载状态和聊天历史记录
 */
export const useAIStore = defineStore(
  'ai',
  () => {
    /** @type {string} 用户在聊天输入框中的输入内容 */
    const input = ref('')

    /** @type {boolean} AI响应加载状态标识 */
    const aiLoading = ref(false)

    /** @type {Array} 存储聊天会话的历史记录 */
    const chatSessionHistory = ref([])

    return { input, aiLoading, chatSessionHistory }
  },{
    persist: true
  }
)
