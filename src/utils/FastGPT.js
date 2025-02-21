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

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            // 提取事件类型
            const eventType = line.slice(7).trim()
            const nextLine = lines[lines.indexOf(line) + 1] // 下一行是 data
            if (nextLine && nextLine.startsWith('data: ')) {
              const eventData = nextLine.slice(6).trim() // 提取数据
              onEvent(eventType, eventData) // 将 event 和 data 传递到外部
            }
          }
        }
      }

      // 处理剩余的数据
      if (buffer) {
        const line = buffer.trim()
        if (line.startsWith('event: ')) {
          const eventType = line.slice(7).trim()
          const dataLine = line[line.indexOf(line) + 1] // 下一行是 data
          if (dataLine && dataLine.startsWith('data: ')) {
            const eventData = dataLine.slice(6).trim()
            onEvent(eventType, eventData) // 将 event 和 data 传递到外部
          }
        }
      }
    } catch (error) {
      console.error('请求出错:', error)
      throw error
    }
  }

  reNumber(onNumber) {
    for (let i = 1; i < 100; i++) {
      setTimeout(() => {}, 1000)
      onNumber(i)
    }
  }
}

export default FastGPT
