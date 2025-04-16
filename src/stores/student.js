import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 学生相关的状态管理
 * @description 管理学生课程数据，包括课程列表的存储、设置和查询功能
 */
export const useStudentStore = defineStore(
  'student',
  () => {
    /** @type {Array} 存储学生的课程列表数据 */
    const studentCourse = ref([])
    
    /**
     * 设置学生的课程列表
     * @param {Array} data - 要设置的课程数据数组
     */
    const setStudentCourse = (data) => {
      studentCourse.value = data
    }

    /**
     * 根据课程ID获取特定课程信息
     * @param {string|number} courseId - 要查询的课程ID
     * @returns {Object|undefined} 返回匹配的课程对象，如果未找到则返回undefined
     */
    const getStudentCourse = (courseId) => {
      return studentCourse.value.find((course) => course.courseId == courseId)
    }

    return { studentCourse, setStudentCourse, getStudentCourse }
  }
  ,
  { persist: true }
)
