import request from '@/utils/request'

export const addCourse = obj => {
  return request.post('/course-members/into-course', obj)
}

export const getCourse = () => {
  return request.get('/course-members/get-student-own-courses')
}

export const createCourse = obj => {
  return request.post('/course/createCourse', obj)
}

export const getTeacherCourse = (current = 1, size = 10) => {
  return request.get('/course/get-course', {
    params: {
      current,
      size,
    },
  })
}

export const updateTeacherCourse = obj => {
  return request.put('/course/compile-course', obj)
}

export const getCourseDetail = obj => {
  return request.post('/course/get-coursems', obj)
}

export const getCourseList = (courseId, username) => {
  return request.get(`/course/get-students/${courseId}`, {
    params: {
      username,
    },
  })
}
