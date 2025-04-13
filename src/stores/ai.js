import { defineStore } from 'pinia'
import { ref } from 'vue'

export const aiStore = defineStore(
  'ai',
  () => {
    // 输入框的输入内容
    const input = ref('')
    // 加载事件
    const aiLoading = ref(false)
    const chatSessionHistory = ref([])
    return { input, aiLoading,chatSessionHistory }
  },{
    persist: true
  }
)
