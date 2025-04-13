import { ref } from 'vue'
import { userStore } from '@/stores/user'

// 创建一个单例实例
const content = ref('')
let controller = null
let baseUrl = '/api/v1/ai/generateStream'
let token = ''

/**
 * AI流式客户端方法
 * @param {Object} options - 配置选项
 * @param {string} options.baseUrl - API基础URL
 * @param {string} options.token - 认证令牌
 * @returns {Object} - 包含方法的对象
 */
const AIStreamClient = (options = {}) => {
  // 更新配置
  baseUrl = options.baseUrl || baseUrl
  token = options.token || token

  return {
    /**
     * 发送消息到AI并流式接收响应
     * @param {string} message - 发送给AI的消息
     * @param {Object} callbacks - 回调函数
     * @param {Function} callbacks.onStart - 请求开始时调用
     * @param {Function} callbacks.onData - 接收到每块数据时调用
     * @param {Function} callbacks.onComplete - 请求完成时调用
     * @param {Function} callbacks.onError - 发生错误时调用
     * @returns {Function} - 中止请求的函数
     */
    async sendMessage(message, { onStart, onData, onComplete, onError } = {}) {
      // 如果有正在进行的请求，先中止它
      this.abort()

      // 创建新的AbortController
      controller = new AbortController()
      const signal = controller.signal

      try {
        // 调用onStart回调（如果提供）
        if (onStart && typeof onStart === 'function') {
          onStart()
        }

        // 获取最新的token
        const user = userStore()
        const currentToken = user.userInfo.jwtToken

        const response = await fetch(baseUrl, {
          method: 'POST',
          signal,
          headers: {
            Authorization: currentToken || token,
            'Content-Type': 'application/json'
          },
          body: message
        })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let fullContent = ''

        while (true) {
          const { value, done } = await reader.read()

          if (done) {
            // 调用onComplete回调（如果提供）
            if (onComplete && typeof onComplete === 'function') {
              onComplete(fullContent)
            }
            break
          }

          const decodedChunk = decoder.decode(value, { stream: true })
          buffer += decodedChunk

          // 处理完整行
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 保留不完整的行在缓冲区

          lines.forEach((line) => {
            if (line.trim() !== '') {
              const jsonString = line.replace(/^data:/, '')
              try {
                const jsonData = JSON.parse(jsonString)
                fullContent += jsonData.result?.output?.text || ''
                content.value = fullContent

                // 调用onData回调（如果提供）
                if (onData && typeof onData === 'function') {
                  onData(jsonData)
                }
              } catch (error) {
                console.error('JSON parsing error:', error)
              }
            }
          })
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Request error:', error)

          // 调用onError回调（如果提供）
          if (onError && typeof onError === 'function') {
            onError(error)
          }
        }
      }

      // 返回中止请求的函数
      return () => this.abort()
    },

    /**
     * 中止当前请求
     */
    abort() {
      if (controller) {
        controller.abort()
        controller = null
      }
    },

    /**
     * 获取当前内容
     * @returns {import('vue').Ref<string>} - 包含当前内容的Ref
     */
    getContent() {
      return content
    },

    /**
     * 获取当前AbortController
     * @returns {AbortController|null} - 当前AbortController或null（如果没有正在进行的请求）
     */
    getController() {
      return controller
    }
  }
}

export default AIStreamClient
