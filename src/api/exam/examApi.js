/**
 * @description 试卷相关接口
 * @author 骆子豪
 */
import request from '@/utils/request'

/**
 * @description 获取试卷里的题目
 */
export const getExamQuestion = data => {
  return request.get(
    `/exam-question/page-unpublished?current=${data.current}&pageSize=${data.pageSize}&examId=${data.examId}`,
  )
}

/**
 * @description 试卷里面添加题目
 */

export const addExamQuestion = () => {
  return request.post('/exam-question/create')
}

/**
 * @description 删除试卷
 */

export const deleteExam = examId => {
  return request({
    url: `/exams/${examId}`,
    method: 'DELETE',
  })
}

/**
 * @description 创建试卷
 */

export const createExam = data => {
  return request({
    url: '/exams',
    method: 'POST',
    data,
  })
}

/**
 * @description 更新试卷的名称
 */

export const updateExam = data => {
  return request({
    url: `/exams/${data.examId}`,
    method: 'PUT',
    data,
  })
}

/**
 * @description 删除试卷里的题目
 */

export const deleteExamQuestion = questionId => {
  return request({
    url: `/exam-question/delete/${questionId}`,
    method: 'DELETE',
  })
}

/**
 * 老师创建试卷的一个方法
 * @param {试卷对象} obj
 * @returns 返回创建成功或者失败
 */
export const addexam = obj => {
  return request.post('/exam/add-exam', obj)
}

/**
 * 分页获取试卷
 * @param {页码} page 页码，默认第1页
 * @param {每页返回的数量} pageSize 每页条数，默认10条
 * @returns
 */
export const getexam = (page, pageSize) => {
  return request.get('/exam/page', {
    params: {
      pageSize,
      page,
    },
  })
}

/**
 * 根据ID删除试卷
 * @param {试卷ID} id
 * @returns 返回删除成功或失败的结果
 */
export const deleteexam = id => {
  return request.put(`/exam/delete-exam/${id}`)
}

export const updateexam = data => {
  return request.post('/exam/update-exam', data)
}

/**
 * @description 获取所有题库（无分页）用户题目选择器组件
 * @returns 返回所有课程
 */
export const getQuestionBankAll = () => {
  return request.get('/question-bank/all')
}
