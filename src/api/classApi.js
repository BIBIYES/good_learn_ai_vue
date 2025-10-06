import request from '@/utils/request'

export const createClass = payload => {
  return request.post('/class/create', payload)
}

export const getAllClasses = () => {
  return request.get('/class/get-all-classes')
}

export const updateClass = payload => {
  return request.put('/class/update-class-member', payload)
}

export const deleteClass = classId => {
  return request.put(`/class/delete/${classId}`)
}

export const getClassMembers = classId => {
  return request.get(`/class-members/get-class-members/${classId}`)
}

export const joinClass = payload => {
  return request.post('/class-members/into-class', payload)
}

export const exitClass = (userId, classId) => {
  return request.post(`/class-members/exit-class/${userId}/${classId}`)
}

export const getMyClasses = () => {
  return request.get('/class-members/get-my-classes')
}
