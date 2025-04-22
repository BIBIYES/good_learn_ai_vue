import request from '@/utils/request'

/**
 * 老师创建试卷的一个方法
 * @param {试卷对象} obj 
 * @returns 返回创建成功或者失败
 */
export const addexam = (obj) => {
  return request.post('/exam/add-exam', obj)
}

/**
 * 分页获取试卷
 * @param {每页返回的数量} pageSize 每页条数，默认10条
 * @param {页码} page 页码，默认第1页 
 * @returns 
 */
export const getexam = (pageSize,page)=>{
  return request.get('/exam/page',{
      params:{
          pageSize,
          page,
      }
  })
}


/**
 * 根据ID删除试卷
 * @param {试卷ID} id 
 * @returns 返回删除成功或失败的结果
 */
export const deleteexam = (id) => {
  return request.put(`/exam/delete-exam/${id}`)
}

export const updateexam = () => {
  return request.post('/exam/update-exam')
}