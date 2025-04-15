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