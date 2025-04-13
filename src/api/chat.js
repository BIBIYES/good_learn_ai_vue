import request from '@/utils/request'

export const getSession = () => {
  return request.get('/ai/getChatHistory')
}
