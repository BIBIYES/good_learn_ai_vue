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
export const getQuestionBankById = (
  size,
  current,
  bankId,
  difficulty,
  title,
) => {
  return request.get('/question/page', {
    params: {
      size,
      current,
      bankId,
      difficulty,
      title,
    },
  })
}

//添加题目
/**
 *
 * @param {题目对象} obj
 * @returns
 */
export const createQuestion = obj => {
  return request.post('/question/create', obj)
}

/**
 * AI 创建题目
 * @param {Object} data - 请求数据
 * @returns {Promise}
 */
export const aiCreateQuestion = data => {
  return request.post('/question/ai-create', data, {
    headers: {
      Authorization: 'Bearer {{token}}', // 根据实际情况替换 {{token}}
    },
  })
}

//批量添加
//添加题目
/**
 *
 * @param {题目对象} obj
 * @returns
 */
export const batchQuestions = obj => {
  return request.post('/question/batch-create', obj)
}

/**
 *
 * @param {题目id} questionId
 * @returns
 */
export const deleteQuestion = questionId => {
  return request.delete(`/question/delete/${questionId}`)
}

/**
 *
 * @param {题目id} questionId
 * @returns
 */
export const updateQuestion = obj => {
  return request.put('/question/update', obj)
}

/**
 * 获取单个题目详情
 * @param {题目id} questionId
 * @returns
 */
export const getQuestionDetail = questionId => {
  return request.get(`/question/${questionId}`)
}
