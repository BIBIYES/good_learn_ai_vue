import request from '@/utils/request'

export const addCourse = (obj) => {
  return request.post('/course-members/into-course', obj)
}

// 获取学生我的课程
export const getCourse = () => {
  return request.get('/course-members/get-student-own-courses')
}

// 获取课程中的签到信息
export const getSign = (courseId) => {
  return request.get(`/course-attendance/get-attendance-info/${courseId}`)
}

// 签到接口
export const sign = (obj) => {
  return request.post('/student-attendance-record/student-check-in', obj)
}

/**
 * 老师创建课程的一个方法
 * @param {课程对象} obj 
 * @returns 返回创建成功或者失败
 */
export const createCourse = (obj) => {
  return request.post('/course/createCourse', obj)
}

/**
 * 不需要传递参数，直接从临牌中获取老师的userId
 * @returns 返回老师创建的所有课程
 */
export const getTeacherCourse = () => {
  return request.get('/course/get-course')
}

/**
 * 老师跟新课程信息，通常也可以拿来跟新课程密码
 * @param {课程对象} obj 
 * @returns 返回跟新成功获取失败
 */
export const updateTeacherCourse = (obj) => {
  return request.post('/course/compile-course', obj)
}