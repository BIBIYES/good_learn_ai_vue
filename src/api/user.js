import request from '@/utils/request'

export const login = (obj) => {
  return request.post('/users/login', obj)
}
// 获取验证码的接口
export const getVerificationCodes = (obj) => {
  return request.post('/verification-codes/get', obj)
}

// 用注册接口
export const register = (obj) => {
  return request.post('/users/register', obj)
}
