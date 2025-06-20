<script setup>
import { ref, shallowRef, onBeforeUnmount, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  height: {
    type: [Number, String],
    default: 300,
  },
  placeholder: {
    type: String,
    default: '请输入内容...',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref(props.modelValue)

// 工具栏配置
const toolbarConfig = {
  excludeKeys: [],
}

// 编辑器配置
const editorConfig = {
  placeholder: props.placeholder,
  readOnly: props.disabled,
  scroll: true,
  autoFocus: false,
}

// 组件销毁时，也销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

// 监听内容变化
const handleChange = editor => {
  emit('update:modelValue', editor.getHtml())
}

// 监听props变化
watch(
  () => props.modelValue,
  newValue => {
    if (newValue !== valueHtml.value) {
      valueHtml.value = newValue
    }
  },
)

// 监听禁用状态变化
watch(
  () => props.disabled,
  newValue => {
    if (editorRef.value) {
      editorRef.value.enable(!newValue)
    }
  },
)
</script>

<template>
  <div class="rich-text-editor">
    <div style="border: 1px solid #ccc; border-radius: 5px">
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :default-config="toolbarConfig"
        :mode="props.disabled ? 'simple' : 'default'"
      />
      <Editor
        v-model="valueHtml"
        :style="{
          height:
            typeof props.height === 'number'
              ? `${props.height}px`
              : props.height,
        }"
        :default-config="editorConfig"
        @on-created="editorRef = $event"
        @on-change="handleChange"
      />
    </div>
  </div>
</template>

<style scoped>
.rich-text-editor {
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
