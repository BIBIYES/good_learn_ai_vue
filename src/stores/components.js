import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 组件状态管理
 * @description 管理全局组件的状态，主要用于控制AI侧边栏的显示和隐藏
 */
export const useComponentsStore = defineStore(
  'components',
  () => {
    /** @type {boolean} AI侧边栏的显示状态，true表示显示，false表示隐藏 */
    const aiSideBarStatus = ref(false)
    
    /**
     * 切换AI侧边栏的显示状态
     * @description 在显示和隐藏状态之间切换
     */
    function toggleAiSideBar() {
      aiSideBarStatus.value = !aiSideBarStatus.value
    }

    return {
      aiSideBarStatus,
      toggleAiSideBar
    }
}
)
