import request from '@/utils/request'

export const getSession = () => {
  return request.get('/ai/getChatHistory')
}

export const getChat = sessionId => {
  return request.get(`/chat-history/${sessionId}`)
}

// 上传机器人的回复

export const uploadBotChat = data => {
  return request.post('/chat-history/add-history-message', data)
}
