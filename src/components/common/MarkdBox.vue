<script setup>
import { Marked } from 'marked'
import { computed } from 'vue'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import 'github-markdown-css/github-markdown.css'
import { onMounted } from 'vue'
// 导入常用的编程语言高亮支持
import 'highlight.js/lib/languages/sql'
import 'highlight.js/lib/languages/python'
import 'highlight.js/lib/languages/javascript'
import 'highlight.js/lib/languages/typescript'
import 'highlight.js/lib/languages/xml'
import 'highlight.js/lib/languages/css'
import 'highlight.js/lib/languages/json'
import 'highlight.js/lib/languages/bash'
import 'highlight.js/lib/languages/yaml'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: 'light'
  }
})

// 创建marked实例并配置
const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    }
  })
)

// 转换markdown并进行XSS防护
const htmlContent = computed(() => {
  let parsed = marked.parse(props.content)
  // 为代码块添加复制按钮
  parsed = parsed.replace(
    /<pre><code class="([^"]+)">/g,
    '<div class="code-block-wrapper"><button class="copy-button">复制</button><pre><code class="$1">'
  )
  parsed = parsed.replace(/<\/code><\/pre>/g, '</code></pre></div>')
  return parsed
})

// 添加复制功能
onMounted(() => {
  const copyButtons = document.querySelectorAll('.copy-button')
  copyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const codeBlock = button.nextElementSibling.querySelector('code')
      const code = codeBlock.textContent

      try {
        await navigator.clipboard.writeText(code)
        button.textContent = '已复制'
        button.classList.add('copied')

        setTimeout(() => {
          button.textContent = '复制'
          button.classList.remove('copied')
        }, 2000)
      } catch (err) {
        console.error('复制失败:', err)
        button.textContent = '复制失败'

        setTimeout(() => {
          button.textContent = '复制'
        }, 2000)
      }
    })
  })
})
</script>

<template>
  <div
    class="markdown-body"
    :class="theme"
    v-html="htmlContent"
  />
</template>
<style>
.code-block-wrapper {
  position: relative;
}

.copy-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-button:hover {
  background-color: #e5e7eb;
}

.copy-button.copied {
  background-color: #10b981;
  color: white;
  border-color: #059669;
}

.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
</style>
