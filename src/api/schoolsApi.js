import request from '@/utils/request'

export const getSchools = () => {
  return request.get('/schools/get-schools')
}
