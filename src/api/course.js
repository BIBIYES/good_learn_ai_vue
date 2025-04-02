import request from '@/utils/request'

export const addCourse = (obj) => {
  return request.post('/course-members/into-course', obj)
}
