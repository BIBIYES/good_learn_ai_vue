<script setup>
import { ref, watch } from 'vue'
import Editor from '@tinymce/tinymce-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: [Number, String],
    default: 300
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const editorValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== editorValue.value) {
      editorValue.value = newValue
    }
  }
)

const handleEditorChange = (content) => {
  editorValue.value = content
  emit('update:modelValue', content)
}

const editorInit = {
  height: props.height,
  menubar: false,
  plugins: [
    'advlist',
    'autolink',
    'lists',
    'link',
    'image',
    'charmap',
    'preview',
    'anchor',
    'searchreplace',
    'visualblocks',
    'code',
    'fullscreen',
    'insertdatetime',
    'media',
    'table',
    'code',
    'help',
    'wordcount'
  ],
  toolbar:
    'undo redo | bold italic underline strikethrough | ' +
    'fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | ' +
    'outdent indent | numlist bullist | forecolor backcolor removeformat | ' +
    'image media link | code fullscreen',
  content_style: `
    body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; font-size: 14px; }
    .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
      color: rgba(0,0,0,0.4);
      content: attr(data-mce-placeholder);
    }
  `,
  placeholder: props.placeholder,
  language: 'zh_CN'
}
</script>

<template>
  <div class="rich-text-editor">
    <Editor
      v-model="editorValue"
      :init="editorInit"
      :disabled="disabled"
      @input="handleEditorChange"
    />
  </div>
</template>

<style scoped>
.rich-text-editor {
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
