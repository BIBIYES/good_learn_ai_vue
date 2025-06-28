import request from '@/utils/request'

export const addCourse = obj => {
  return request.post('/course-members/into-course', obj)
}

// 获取学生我的课程
export const getCourse = () => {
  return request.get('/course-members/get-student-own-courses')
}

// 获取课程中的签到信息
export const getSign = courseId => {
  return request.get(`/course-attendance/get-attendance-info/${courseId}`)
}

// 签到接口
export const sign = obj => {
  return request.post('/student-attendance-record/student-check-in', obj)
}

/**
 * 老师创建课程的一个方法
 * @param {课程对象} obj
 * @returns 返回创建成功或者失败
 */
export const createCourse = obj => {
  return request.post('/course/createCourse', obj)
}

/**
 * 获取老师创建的所有课程，支持分页
 * @param {Number} current 页码，默认第1页
 * @param {Number} size 每页条数，默认10条
 * @returns 返回老师创建的所有课程
 */
export const getTeacherCourse = (current = 1, size = 10) => {
  return request.get('/course/get-course', {
    params: {
      current,
      size,
    },
  })
}

/**
 * 老师跟新课程信息，通常也可以拿来跟新课程密码
 * @param {课程对象} obj
 * @returns 返回跟新成功获取失败
 */
export const updateTeacherCourse = obj => {
  return request.put('/course/compile-course', obj)
}

/**
 * 老师发起签到
 * @param {Object} obj - 包含courseId, type和可选的pinCode
 * @returns 返回发起成功或者失败
 */
export const initiateSignIn = obj => {
  return request.post(`/course-attendance/initiate-check-in`, obj)
}

/**
 * 获取当前课程中的签到信息
 * @param {number} courseId
 * @returns
 */
export const getSignInInfo = courseId => {
  return request.get(`/course-attendance/get-attendance-info/${courseId}`)
}

/**
 * 停止签到
 * @param {number} courseId
 * @returns
 */
export const stopSignIn = attendanceId => {
  return request.put(`/course-attendance/stop-check-in`, { attendanceId })
}

/**
 * 获取课程详情
 * @param {Object} obj - 包含courseId的对象
 * @returns 课程详情
 */
export const getCourseDetail = obj => {
  return request.post(`/course/get-coursems`, obj)
}

/**
 * 获取课程中的学生列表
 * @param {number} courseId 课程id
 * @param {string} username 学生姓名 默认空
 * @returns
 */
export const getCourseList = (courseId, username) => {
  return request.get(`/course/get-students/${courseId}`, {
    params: {
      username,
    },
  })
}
