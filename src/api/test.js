import request from '@/utils/request'

/**
 * 老师创建课程的一个方法
 * @param {课程对象} obj 
 * @returns 返回创建成功或者失败
 */
export const addexam = (obj) => {
  return request.post('/exam/add-exam', obj)
}

/**
 * 分页获取题目
 * @param {每页返回的数量} size 
 * @param {页码} current 
 * @param {试卷ID} examId
 * @returns 
 */
export const getexam = (size,current, examId)=>{
  return request.get('/exam/page',{
      params:{
          size,
          current,
          examId
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