<script setup>
const props = defineProps({
  // 输入框数量
  length: {
    type: Number,
    default: 4
  },
  // 是否自动聚焦第一个输入框
  autoFocus: {
    type: Boolean,
    default: true
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'complete'])

// 输入框引用
const inputRefs = ref([])
// 输入值
const inputValues = ref(Array(props.length).fill(''))

// 暴露给父组件的方法
const clear = () => {
  inputValues.value = Array(props.length).fill('')
  if (props.autoFocus && inputRefs.value[0]) {
    inputRefs.value[0].focus()
  }
}

// 暴露方法给父组件
defineExpose({
  clear,
  focus: () => {
    if (inputRefs.value[0]) {
      inputRefs.value[0].focus()
    }
  }
})

// 处理输入
const handleInput = (event, index) => {
  const value = event.target.value
  // 确保只取最后一个字符
  const singleChar = value.slice(-1)
  
  // 更新当前输入框的值
  inputValues.value[index] = singleChar
  
  // 触发更新事件
  emit('update:modelValue', inputValues.value.join(''))
  
  // 自动聚焦到下一个输入框
  if (singleChar && index < props.length - 1 && inputRefs.value[index + 1]) {
    inputRefs.value[index + 1].focus()
  }
  
  // 如果所有输入框都有值，触发完成事件
  if (inputValues.value.every(val => val) && inputValues.value.length === props.length) {
    emit('complete', inputValues.value.join(''))
  }
}

// 处理键盘事件
const handleKeydown = (event, index) => {
  // 处理退格键
  if (event.key === 'Backspace') {
    if (index > 0 && !inputValues.value[index]) {
      // 如果当前输入框为空且不是第一个，则聚焦到前一个输入框
      inputRefs.value[index - 1].focus()
      // 清空前一个输入框的值
      inputValues.value[index - 1] = ''
      emit('update:modelValue', inputValues.value.join(''))
    } else if (index === 0 && inputValues.value[index]) {
      // 如果是第一个输入框且有值，则清空当前输入框
      inputValues.value[index] = ''
      emit('update:modelValue', inputValues.value.join(''))
    }
  }
  // 处理左右箭头键
  else if (event.key === 'ArrowLeft' && index > 0) {
    inputRefs.value[index - 1].focus()
  } else if (event.key === 'ArrowRight' && index < props.length - 1) {
    inputRefs.value[index + 1].focus()
  }
}

// 处理粘贴事件
const handlePaste = (event, index) => {
  event.preventDefault()
  const pasteData = event.clipboardData.getData('text/plain').trim()
  
  // 如果粘贴的内容长度大于等于输入框数量，则填充所有输入框
  if (pasteData.length >= props.length) {
    for (let i = 0; i < props.length; i++) {
      inputValues.value[i] = pasteData[i] || ''
    }
    // 聚焦到最后一个输入框
    if (inputRefs.value[props.length - 1]) {
      inputRefs.value[props.length - 1].focus()
    }
  } 
  // 否则从当前位置开始填充
  else {
    const remainingLength = props.length - index
    const fillLength = Math.min(pasteData.length, remainingLength)
    
    for (let i = 0; i < fillLength; i++) {
      inputValues.value[index + i] = pasteData[i] || ''
    }
    
    // 聚焦到最后填充的输入框的下一个，如果有的话
    const nextFocusIndex = Math.min(index + fillLength, props.length - 1)
    if (inputRefs.value[nextFocusIndex]) {
      inputRefs.value[nextFocusIndex].focus()
    }
  }
  
  emit('update:modelValue', inputValues.value.join(''))
  
  // 检查是否所有输入框都已填充
  if (inputValues.value.every(val => val) && inputValues.value.length === props.length) {
    emit('complete', inputValues.value.join(''))
  }
}

onMounted(() => {
  // 自动聚焦第一个输入框
  if (props.autoFocus && inputRefs.value[0] && !props.disabled) {
    inputRefs.value[0].focus()
  }
})
</script>

<template>
  <div class="pin-input-container">
    <div class="flex justify-center gap-2">
      <input 
        v-for="(_, index) in props.length" 
        :key="index"
        :ref="el => { if(el) inputRefs[index] = el }"
        v-model="inputValues[index]"
        type="text" 
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="1" 
        :disabled="disabled"
        class="pin-input animate__animated animate__fadeIn"
        @input="(e) => handleInput(e, index)"
        @keydown="(e) => handleKeydown(e, index)"
        @paste="(e) => handlePaste(e, index)"
      >
    </div>
  </div>
</template>

<style scoped>
.pin-input-container {
  width: 100%;
}

.pin-input {
  width: 3rem;
  height: 3rem;
  text-align: center;
  font-size: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.pin-input:focus {
  border-color: var(--color-primary, #4f46e5);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  outline: none;
}

.pin-input.animate__fadeIn {
  animation-duration: 0.3s;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .pin-input {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }
}
</style>