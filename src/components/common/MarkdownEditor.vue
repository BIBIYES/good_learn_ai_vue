<script setup>
import { ref, onMounted, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

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
    default: '请输入Markdown内容...',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

// 编辑器内容
const editorContent = ref(props.modelValue)
// 预览内容
const previewContent = ref('')
// 当前激活的Tab
const activeTab = ref('edit') // 'edit' or 'preview'
// 是否处于全屏模式
const isFullScreen = ref(false)

// Markdown渲染器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (e) {
        console.warn('编辑器异常' + e)
      }
    }
    return '' // 使用默认的转义
  },
})

// 计算编辑器高度
const computedHeight = () => {
  if (isFullScreen.value) return '100vh'
  return typeof props.height === 'number' ? `${props.height}px` : props.height
}

// 处理输入变化
const handleInput = e => {
  const value = e.target.value
  editorContent.value = value
  emit('update:modelValue', value)
  updatePreview()
}

// 更新预览内容
const updatePreview = () => {
  previewContent.value = md.render(editorContent.value || '')
}

// 切换Tab
const switchTab = tab => {
  activeTab.value = tab
  if (tab === 'preview') {
    updatePreview()
  }
}

// 切换全屏
const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value
}

// 工具栏操作 - 插入Markdown语法
const insertMarkdown = (syntax, placeholder = '', selection = '') => {
  const textarea = document.getElementById('markdown-editor')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = textarea.value

  let insertText
  if (selection || start !== end) {
    const selectedText = selection || text.substring(start, end)
    insertText = syntax.replace('$1', selectedText)
  } else {
    insertText = syntax.replace('$1', placeholder)
  }

  // 插入文本
  textarea.focus()
  const newText = text.substring(0, start) + insertText + text.substring(end)
  editorContent.value = newText
  emit('update:modelValue', newText)

  // 设置光标位置到合适位置
  const cursorPos =
    start +
    insertText.indexOf(placeholder || selection) +
    (placeholder ? placeholder.length : selection ? selection.length : 0)

  setTimeout(() => {
    textarea.setSelectionRange(cursorPos, cursorPos)
  }, 0)
}

// 监听props变化
watch(
  () => props.modelValue,
  newValue => {
    if (newValue !== editorContent.value) {
      editorContent.value = newValue
      if (activeTab.value === 'preview') {
        updatePreview()
      }
    }
  },
)

// 组件挂载后初始化预览内容
onMounted(() => {
  updatePreview()
})
</script>

<template>
  <div class="markdown-editor" :class="{ fullscreen: isFullScreen }">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-tabs">
        <button
          class="toolbar-tab"
          :class="{ active: activeTab === 'edit' }"
          @click="switchTab('edit')"
        >
          编辑
        </button>
        <button
          class="toolbar-tab"
          :class="{ active: activeTab === 'preview' }"
          @click="switchTab('preview')"
        >
          预览
        </button>
      </div>

      <div v-if="activeTab === 'edit'" class="toolbar-buttons">
        <button
          title="粗体 (Ctrl+B)"
          @click="insertMarkdown('**$1**', '粗体文本')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z"
            />
          </svg>
        </button>
        <button
          title="斜体 (Ctrl+I)"
          @click="insertMarkdown('*$1*', '斜体文本')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z" />
          </svg>
        </button>
        <button title="标题" @click="insertMarkdown('### $1', '标题')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M17 11V4h2v17h-2v-8H7v8H5V4h2v7z" />
          </svg>
        </button>
        <button title="链接" @click="insertMarkdown('[$1](url)', '链接文本')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z"
            />
          </svg>
        </button>
        <button
          title="图片"
          @click="insertMarkdown('![$1](图片URL)', '图片描述')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
            />
          </svg>
        </button>
        <button
          title="代码块"
          @click="insertMarkdown('```\n$1\n```', '在此输入代码')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M16.95 8.464l1.414-1.414 4.95 4.95-4.95 4.95-1.414-1.414L20.485 12 16.95 8.464zm-9.9 0L3.515 12l3.535 3.536-1.414 1.414L.686 12l4.95-4.95L7.05 8.464z"
            />
          </svg>
        </button>
        <button title="列表" @click="insertMarkdown('- $1', '列表项')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M8 4h13v2H8V4zm-5-.5h3v3H3v-3zm0 7h3v3H3v-3zm0 7h3v3H3v-3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z"
            />
          </svg>
        </button>
        <button title="引用" @click="insertMarkdown('> $1', '引用文本')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"
            />
          </svg>
        </button>
        <button
          title="表格"
          @click="
            insertMarkdown(
              '| 表头1 | 表头2 |\n| --- | --- |\n| 内容1 | 内容2 |',
              '',
            )
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M13 10v4h6v-4h-6zm-2 0H5v4h6v-4zm2 9h6v-3h-6v3zm-2 0v-3H5v3h6zm2-14v3h6V5h-6zm-2 0H5v3h6V5zM4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
            />
          </svg>
        </button>
      </div>

      <div class="toolbar-actions">
        <button title="全屏" @click="toggleFullScreen">
          <svg
            v-if="!isFullScreen"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M20 3h2v6h-2V5h-4V3h4zM4 3h4v2H4v4H2V3h2zm16 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 编辑区域 -->
    <div class="editor-content" :style="{ height: computedHeight() }">
      <!-- 编辑模式 -->
      <textarea
        v-show="activeTab === 'edit'"
        id="markdown-editor"
        v-model="editorContent"
        :placeholder="placeholder"
        :disabled="disabled"
        class="editor-textarea"
        :style="{ height: '100%' }"
        @input="handleInput"
      ></textarea>

      <!-- 预览模式 -->
      <div
        v-show="activeTab === 'preview'"
        class="markdown-preview"
        v-html="previewContent"
      ></div>
    </div>
  </div>
</template>

<style>
/* Markdown编辑器样式 */
.markdown-editor {
  border: 1px solid rgba(220, 240, 230, 0.5);
  border-radius: 0.5rem;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.markdown-editor.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  border-radius: 0;
  background: white;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: rgba(248, 255, 252, 0.9);
  border-bottom: 1px solid rgba(220, 240, 230, 0.5);
}

.toolbar-tabs {
  display: flex;
  gap: 0.5rem;
}

.toolbar-tab {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #555;
}

.toolbar-tab.active {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(21, 128, 61);
}

.toolbar-tab:hover {
  background: rgba(34, 197, 94, 0.05);
}

.toolbar-buttons {
  display: flex;
  gap: 0.25rem;
  margin-left: 1rem;
  flex-grow: 1;
}

.toolbar-buttons button,
.toolbar-actions button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-buttons button:hover,
.toolbar-actions button:hover {
  background: rgba(34, 197, 94, 0.1);
}

.editor-content {
  flex-grow: 1;
  position: relative;
  display: flex;
  overflow-y: auto;
}

.editor-textarea {
  width: 100%;
  resize: none;
  border: none;
  padding: 1rem;
  font-family: 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #333;
  outline: none;
  flex-grow: 1;
}

.markdown-preview {
  width: 100%;
  padding: 1rem;
  overflow-y: auto;
  line-height: 1.6;
}

/* Markdown预览样式 */
.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.markdown-preview h1 {
  font-size: 2rem;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3rem;
}

.markdown-preview h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3rem;
}

.markdown-preview h3 {
  font-size: 1.25rem;
}

.markdown-preview h4 {
  font-size: 1rem;
}

.markdown-preview p {
  margin: 1rem 0;
}

.markdown-preview pre {
  background-color: #f6f8fa;
  border-radius: 0.3rem;
  padding: 1rem;
  overflow: auto;
  margin: 1rem 0;
}

.markdown-preview code {
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 0.3rem;
  font-family: 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace;
  padding: 0.2rem 0.4rem;
  font-size: 0.85rem;
}

.markdown-preview pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.markdown-preview blockquote {
  border-left: 4px solid #dfe2e5;
  padding: 0 1rem;
  color: #6a737d;
  margin: 1rem 0;
}

.markdown-preview ul,
.markdown-preview ol {
  padding-left: 2rem;
  margin: 1rem 0;
}

.markdown-preview li {
  margin: 0.25rem 0;
}

.markdown-preview table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

.markdown-preview table th,
.markdown-preview table td {
  border: 1px solid #dfe2e5;
  padding: 0.6rem 1rem;
}

.markdown-preview table th {
  background-color: #f6f8fa;
}

.markdown-preview img {
  max-width: 100%;
  display: block;
  margin: 1rem auto;
}

.markdown-preview hr {
  height: 2px;
  background-color: #e1e4e8;
  border: none;
  margin: 1.5rem 0;
}
</style>
