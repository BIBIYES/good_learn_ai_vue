import { ref } from 'vue'
import { userStore } from '@/stores/user'

class AIStreamClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || '/api/v1/ai/generateStream'
    this.token = options.token || ''
    this.controller = null
    this.content = ref('')
  }

  /**
   * Send a message to the AI and stream the response
   * @param {string} message - The message to send to the AI
   * @param {Object} callbacks - Callback functions
   * @param {Function} callbacks.onStart - Called when the request starts
   * @param {Function} callbacks.onData - Called for each chunk of data received
   * @param {Function} callbacks.onComplete - Called when the request completes
   * @param {Function} callbacks.onError - Called if an error occurs
   * @returns {Function} - Function to abort the request
   */
  async sendMessage(message, { onStart, onData, onComplete, onError } = {}) {
    // Create a new AbortController for this request
    this.controller = new AbortController()
    const signal = this.controller.signal

    try {
      // Call onStart callback if provided
      if (onStart && typeof onStart === 'function') {
        onStart()
      }

      // 获取最新的token
      const user = userStore()
      const token = user.userInfo.jwtToken

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        signal,
        headers: {
          Authorization: token || this.token,
          'Content-Type': 'application/json',
        },
        body: message,
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
          // Call onComplete callback if provided
          if (onComplete && typeof onComplete === 'function') {
            onComplete(fullContent)
          }
          break
        }

        const decodedChunk = decoder.decode(value, { stream: true })
        buffer += decodedChunk

        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep the incomplete line in buffer

        lines.forEach((line) => {
          if (line.trim() !== '') {
            const jsonString = line.replace(/^data:/, '')
            try {
              const jsonData = JSON.parse(jsonString)
              fullContent += jsonData.content || ''
              this.content.value = fullContent

              // Call onData callback if provided
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

        // Call onError callback if provided
        if (onError && typeof onError === 'function') {
          onError(error)
        }
      }
    }

    // Return a function to abort the request
    return () => this.abort()
  }

  /**
   * Abort the current request
   */
  abort() {
    if (this.controller) {
      this.controller.abort()
      this.controller = null
    }
  }

  /**
   * Get the current content
   * @returns {import('vue').Ref<string>} - Ref containing the current content
   */
  getContent() {
    return this.content
  }
}

export default AIStreamClient
