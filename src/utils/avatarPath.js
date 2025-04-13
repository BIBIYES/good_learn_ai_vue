import { userStore } from '@/stores/user'
const user = userStore()

/**
 * 此方法会获取用户的信息来返回头像路径
 * @returns 返回头像的路径
 */
export const getAvatarPath = () => {
  if(user.userInfo.avatar){
    return user.userInfo.avatar
  }else{
     return `http://q1.qlogo.cn/g?b=qq&nk=${user.userInfo.email}&s=100`
  }
}
