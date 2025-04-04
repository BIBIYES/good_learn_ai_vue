import request from '@/utils/request'

export const addCourse = (obj) => {
  return request.post('/course-members/into-course', obj)
}

export const getCourse = () => {
  return request.get('/course-members/get-student-own-courses')
}
