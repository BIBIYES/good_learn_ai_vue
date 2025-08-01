import { useUserStore } from '@/stores/userStores.js'

/**
 * 此方法会获取用户的信息来返回头像路径
 * @returns 返回头像的路径
 */
export const getAvatarPath = () => {
  const user = useUserStore()
  if (user.userInfo.avatar) {
    return user.userInfo.avatar
  } else {
    return `http://q1.qlogo.cn/g?b=qq&nk=${user.userInfo.email}&s=100`
  }
}

/**
 * 此方法会获取用户的信息来返回头像路径
 * @returns 返回头像的路径
 */
export const getEmailAvatarPath = email => {
  return `http://q1.qlogo.cn/g?b=qq&nk=${email}&s=100`
}
