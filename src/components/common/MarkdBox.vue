<script setup>
import { Marked } from 'marked'
import { computed } from 'vue'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import 'github-markdown-css/github-markdown.css'
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
    '<div class="code-block-wrapper"><button class="copy-btn btn btn-xs btn-neutral">复制</button><pre><code class="$1">'
  )
  parsed = parsed.replace(/<\/code><\/pre>/g, '</code></pre></div>')
  return parsed
})

// 添加复制功能
onMounted(() => {
  const copyButtons = document.querySelectorAll('.copy-btn')
  copyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const codeBlock = button.nextElementSibling.querySelector('code')
      const code = codeBlock.textContent

      try {
        await navigator.clipboard.writeText(code)
        button.textContent = '已复制'
        button.classList.add('btn-primary')

        setTimeout(() => {
          button.textContent = '复制'
          button.classList.remove('btn-primary')
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
    class="markdown-body w-full max-w-full px-4"
    :class="theme"
    v-html="htmlContent"
  />
</template>
<style>
.code-block-wrapper {
  position: relative;
  margin: 1em 0;
  max-width: 100%;
  overflow-x: auto;
}
.copy-btn {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  z-index: 10;
  transition: all 0.2s ease;
  opacity: 0.7;
}
.copy-btn:hover {
  opacity: 1;
}
.copy-btn.btn-primary {
  background-color: #4CAF50;
  border-color: #4CAF50;
}
</style>
