import { defineStore } from 'pinia'
// 学生相关的数据
export const useStudentStore = defineStore(
  'student',
  () => {
    // 存放学生页面的我的课程
    const studentCourse = ref([])
    
    // 设置我的课程
    const setStudentCourse = (data) => {
      studentCourse.value = data
    }

    // 通过id来获取当前学生的信息
    const getStudentCourse = (id) => {
      return studentCourse.value.find((item) => item.id === id)
    }

    return { studentCourse, setStudentCourse, getStudentCourse }
  }
)
