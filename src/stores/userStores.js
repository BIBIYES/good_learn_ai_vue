import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 用户信息状态管理
 * @description 管理用户登录状态、用户信息的存储和清除功能
 */
export const useUserStore = defineStore(
  'userInfo',
  () => {
    /** @type {Object} 存储用户信息的对象，初始化为空对象 */
    const userInfo = ref({})

    /**
     * 设置用户信息
     * @param {Object} e - 包含用户信息的对象
     */
    const setUserInfo = e => {
      userInfo.value = e
    }

    /**
     * 用户登出操作
     * @description 清除用户信息和本地存储的登录状态
     */
    const logout = () => {
      console.log('退出登录')
      userInfo.value = {}
      // 清除持久化存储
      localStorage.removeItem('userInfo')
    }

    return { userInfo, setUserInfo, logout }
  },
  {
    persist: true,
  },
)
