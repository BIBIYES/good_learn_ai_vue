<script setup>
  import { nextTick, onMounted, computed, ref } from 'vue'
  import { aiStore } from '@/stores/ai'
  import { storeToRefs } from 'pinia'

  const ai = aiStore()
  const emit = defineEmits(['send'])

  // 使用AI Store中的状态
  const { input: textInput, aiLoading: isLodaing } = storeToRefs(ai)
  const textareaRef = ref(null)
  const containerRef = ref(null)
  const currentHeight = ref(48) // 初始高度

  // 计算圆角半径 - 随高度增加而减小
  const borderRadius = computed(() => {
    const minRadius = 8 // 最小圆角 8px
    const maxRadius = 24 // 最大圆角 24px (约等于rounded-[100px]的一半)
    const minHeight = 48 // 最小高度
    const maxHeight = 160 // 最大高度

    // 高度越大，圆角越小，但不小于minRadius
    if (currentHeight.value <= minHeight) return maxRadius
    if (currentHeight.value >= maxHeight) return minRadius

    // 计算适当的圆角大小 - 线性插值
    const heightRatio = (currentHeight.value - minHeight) / (maxHeight - minHeight)
    const radius = maxRadius - heightRatio * (maxRadius - minRadius)
    return Math.round(radius)
  })

  // 调整文本区域和容器高度的函数
  const adjustHeight = async () => {
    await nextTick()
    const textarea = textareaRef.value
    const container = containerRef.value
    if (!textarea || !container) return

    // 首先重置高度
    textarea.style.height = 'auto'

    // 设置textarea的高度，根据内容但不超过最大值
    const newHeight = Math.min(textarea.scrollHeight, 160) // 允许高度到h-40
    textarea.style.height = `${newHeight}px`

    // 调整外部容器高度 - 添加适当的padding
    const paddingTotal = 16 // 上下各8px的padding
    const containerHeight = newHeight + paddingTotal
    container.style.height = `${containerHeight}px`

    // 更新当前高度值
    currentHeight.value = containerHeight
  }

  // 监听输入变化
  const handleInput = () => {
    adjustHeight()
  }

  // 处理按键事件，按下Enter键发送消息
  const handleKeydown = (event) => {
    // 如果按下Enter键且没有按住Shift键，则发送消息
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // 阻止默认的换行行为
      if (textInput.trim() !== '' && !isLodaing.value) {
        emit('send', textInput)
      }
    }
  }

  // 组件挂载后初始化高度
  onMounted(() => {
    adjustHeight()
  })
</script>

<template>
  <div class="app flex items-center justify-center">
    <div
      ref="containerRef"
      class="bg-base-200 w-200 flex items-center px-4 transition-all"
      :class="{
        skeleton: isLodaing
      }"
      :style="{
        'min-height': '48px',
        'border-radius': `${borderRadius}px`
      }"
    >
      <textarea
        ref="textareaRef"
        v-model="textInput"
        @input="handleInput"
        @keydown="handleKeydown"
        rows="1"
        class="w-full resize-none overflow-y-auto border-none outline-none bg-base-200 py-2 px-3"
        :style="{
          'min-height': '32px',
          'max-height': '160px',
          'border-radius': `${borderRadius}px`
        }"
        placeholder="输入你的问题..."
        :class="{
          skeleton: isLodaing
        }"
      ></textarea>
      <div
        class="w-8 p-1 h-8 bg-white rounded-full flex items-center justify-center ml-2 cursor-pointer hover:bg-base-100 transition-colors flex-shrink-0"
        @click="emit('send', textInput)"
      >
        <img src="@/assets/icon/send.svg" alt="" class="w-full h-full" v-if="!isLodaing" />
        <span class="loading loading-spinner" v-else></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  textarea::-webkit-scrollbar {
    width: 4px;
  }

  textarea::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  textarea::-webkit-scrollbar-track {
    background: transparent;
  }

  textarea {
    scrollbar-width: thin;
  }

  .transition-all {
    transition: all 0.2s ease;
  }
</style>
