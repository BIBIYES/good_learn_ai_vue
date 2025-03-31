<script setup>
import { ref } from 'vue'
const controller = new AbortController()
const signal = controller.signal
const content = ref('')

const seed = async () => {
  try {
    console.log('发送请求')
    const response = await fetch('/api/v1/ai/generateStream', {
      method: 'POST',
      signal,
      headers: {
        Authorization:
          'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJJZCI6MTg5NTc2Nzc5NjAwMDkyMzY0OSwiaWF0IjoxNzQyODk4NDM1LCJleHAiOjE3NDI5ODQ4MzV9.QeNyG7zbj0zIrJBShu3KCK44eZdenLOimH_6p61tjOo',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ msg: '你好' }),
    })

    // Get the reader
    const reader = response.body.getReader()

    // Text decoder to convert chunks to readable text
    const decoder = new TextDecoder()

    // Buffer to store incomplete chunks
    let buffer = ''

    while (true) {
      // Read a chunk of data
      const { value, done } = await reader.read()

      // If done, break the loop
      if (done) {
        console.log('请求完成')
        break
      }

      // Decode the chunk
      const decodedChunk = decoder.decode(value, { stream: true })

      // Append to buffer
      buffer += decodedChunk

      // Process complete lines
      const lines = buffer.split('\n')

      // Keep incomplete last line in buffer
      buffer = lines.pop()

      // Process complete lines
      lines.forEach((line) => {
        if (line.trim() !== '') {
          // console.log(line)
          const jsonString = line.replace(/^data:/, '')
          try {
            const jsonData = JSON.parse(jsonString)
            console.log(jsonData)
          } catch (error) {
            console.error('JSON 解析失败:', error)
          }
        }
      })
    }
  } catch (error) {
    console.error('请求出错:', error)
  }
}
</script>
<template>
  <div class="app p-4">
    <button class="btn" @click="seed()">发送请求</button>
    <button class="btn">nihao</button>
    <button class="btn btn-error">Error</button>
  </div>
  <p>{{ content }}</p>
</template>
<style></style>
