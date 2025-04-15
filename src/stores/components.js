import { defineStore } from 'pinia'
import { ref } from 'vue'

// 组件相关的数据
export const useComponentsStore = defineStore(
  'components',
  () => {
    // ai状态栏是否关闭
    const aiSiderBarStatus = ref(false)
    
    // 切换侧边栏状态
    function toggleAiSiderBar() {
      aiSiderBarStatus.value = !aiSiderBarStatus.value
     
      
    }

    return {
      aiSiderBarStatus,
      toggleAiSiderBar
    }
  }
 
)
