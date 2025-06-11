import request from '@/utils/request'

export const login = obj => {
  return request.post('/users/login', obj)
}
// 获取验证码的接口
export const getVerificationCodes = obj => {
  return request.post('/verification-codes/get', obj)
}

// 用注册接口
export const register = obj => {
  return request.post('/users/register', obj)
}

/**
 * @description 用户在已知密码的情况下修改密码
 * @param {*} obj
 * @returns
 */
export const changePassword = obj => {
  return request.post('/users/change-password', obj)
}

/**
 * @description 用户忘记密码的
 * @param {*} obj
 * @returns
 */
export const forGetPassword = obj => {
  return request.post('/users/forgot-password', obj)
}
