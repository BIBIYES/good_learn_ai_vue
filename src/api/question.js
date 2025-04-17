import request from '@/utils/request'


/**
 * 添加题库
 * @param {题库对象} obj 
 * @returns 
 */
export const createQuestionBank = (obj)=>{
    return request.post('/question-bank/create',obj)
}

/**
 * 分页获取题库
 * @param {页码} current 
 * @param {每页返回的数量} size 
 * @returns 
 */
export const getQuestionBankList = (current,size)=>{
    return request.get('/question-bank/page',{
        params:{
            current,
            size
        }
    })
}


/**
 * 删除题库
 * @param {题库id} bankId 
 * @returns 
 */
export const deleteQuestionBank = (bankId)=>{
    return request.put(`/question-bank/delete/${bankId}` )
}

/**
 * 
 * @param {题目对象携带id} obj 
 * @returns 
 */
export const updateQuestionBank = (obj)=>{
    return request.post('/question-bank/update',obj)
}

