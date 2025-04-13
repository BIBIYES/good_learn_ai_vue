import axios from 'axios'
import message from '@/plugin/message'
import { userStore } from '@/stores/user'
import router from '@/router'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 50000
})

// 添加请求拦截器
request.interceptors.request.use(
  function (config) {
    // 在发送请求之前获取最新的token
    const user = userStore()
    const token = user.userInfo.jwtToken
    if (token) {
      config.headers.Authorization = `${token}`
    }
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 添加响应拦截器
request.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    console.log(response.data)

    if (response.data.code != 200) {
      message.error(response.data.message)
    }
    
    return response.data
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    console.log('请求出错',error)
    
    if (error.response && error.response.status === 401) {
      console.log('令牌出错')
      const user = userStore()
      message.info('登录已经过期，请重新登录')
      user.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default request
