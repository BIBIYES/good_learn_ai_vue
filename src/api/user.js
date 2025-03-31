import request from '@/utils/request'

export const login = (obj) => {
  return request.post('/users/login', obj)
}
