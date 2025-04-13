import { defineStore } from 'pinia'
import { ref } from 'vue'

export const userStore = defineStore(
  'userInfo',
  () => {
    // 初始化为空对象而非空字符串
    const userInfo = ref({})

    // 设置用户对象
    const setUserInfo = (e) => {
      userInfo.value = e
    }

    // 清除登录（修正拼写错误）
    const logout = () => {
      console.log("退出登录");
      userInfo.value = {}
    }

    return { userInfo, setUserInfo, logout }
  },
  {
    persist: true,
  },
)
