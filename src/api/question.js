import request from '@/utils/request'

/**
 * 添加题库
 * @param {题库对象} obj
 * @returns
 */
export const createQuestionBank = obj => {
  return request.post('/question-bank/create', obj)
}

/**
 * 分页获取题库
 * @param {页码} current
 * @param {每页返回的数量} size
 * @returns
 */
export const getQuestionBankList = (current, size) => {
  return request.get('/question-bank/page', {
    params: {
      current,
      size,
    },
  })
}

/**
 * 删除题库
 * @param {题库id} bankId
 * @returns
 */
export const deleteQuestionBank = bankId => {
  return request.put(`/question-bank/delete/${bankId}`)
}

/**
 * 更新题目
 * @param {题目对象携带id} obj
 * @returns
 */
export const updateQuestionBank = obj => {
  return request.post('/question-bank/update', obj)
}

/**
 * 分页获取题目
 * @param {每页返回的数量} size
 * @param {页码} current
 * @param {题库id} bankId
 * @returns
 */
export const getQuestionBankById = (size, current, bankId) => {
  return request.get('/question/page', {
    params: {
      size,
      current,
      bankId,
    },
  })
}

/**
 *
 * @param {题目对象} obj
 * @returns
 */
export const createQuestion = obj => {
  return request.post('/question/create', obj)
}

/**
 *
 * @param {题目id} questionId
 * @returns
 */
export const deleteQuestion = questionId => {
  return request.put(`/question/delete/${questionId}`)
}

/**
 *
 * @param {题目id} questionId
 * @returns
 */
export const updateQuestion = obj => {
  return request.post('/question/update', obj)
}
