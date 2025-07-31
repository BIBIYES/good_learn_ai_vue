class FastGPT {
  constructor(key) {
    if (!key) {
      throw new Error(
        'FastGPT API密钥是必需的。请在实例化时提供有效的API密钥。',
      )
    }
    this.key = key
  }

  async chat(message, chatId = 1, onEvent = () => {}) {
    console.log('发送请求')
    const obj = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId,
        stream: true,
        detail: true,
        messages: [
          {
            content: message,
            role: 'user',
          },
        ],
      }),
    }

    try {
      const response = await fetch(
        'https://cloud.fastgpt.cn/api/v1/chat/completions',
        obj,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let lastEventType = ''
      let lastEventData = ''

      const processBuffer = chunk => {
        const lines = chunk.split('\n')
        let i = 0

        while (i < lines.length) {
          const line = lines[i].trim()
          if (line.startsWith('event: ')) {
            lastEventType = line.slice(7).trim()
            i++
            if (i < lines.length && lines[i].startsWith('data: ')) {
              lastEventData = lines[i].slice(6).trim()
              if (lastEventData) {
                try {
                  onEvent(lastEventType, lastEventData)
                } catch (error) {
                  console.error('事件处理错误:', error)
                }
              }
            }
          }
          i++
        }

        return lines[lines.length - 1] || ''
      }

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          buffer = processBuffer(buffer)
        }

        if (buffer) {
          processBuffer(buffer + '\n')
        }
      } catch (error) {
        console.error('数据流处理错误:', error)
        throw new Error('数据流处理失败')
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      console.error('请求出错:', error)
      throw error
    }
  }

  reNumber(onNumber) {
    for (let i = 1; i < 100; i++) {
      setTimeout(() => onNumber(i), i * 1000)
    }
  }
}

export default FastGPT
