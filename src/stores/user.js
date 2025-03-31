import { defineStore } from 'pinia'
import { ref } from 'vue'
export const userStore = defineStore(
  'userInfo',
  () => {
    const userInfo = ref({})
    // 设置用户对象
    const setUserInfo = (e) => {
      userInfo.value = e
    }
    // 清楚登录
    const logout = () => {
      userInfo.value = null
    }
    return { userInfo, setUserInfo, logout }
  },
  {
    persist: true,
  },
)
