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
 * 
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


export const deleteQuestionBank = (obj)=>{
    return request.delete('/question-bank/delete', obj )
}

