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
 * @description 更新试卷
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
