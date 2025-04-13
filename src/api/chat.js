import request from '@/utils/request'

export const getSession = () => {
  return request.get('/ai/getChatHistory')
}

export const getChat = (sessionId) => {
  return request.get(`/chat-history/${sessionId}`)
}
