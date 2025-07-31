/**
 * 格式化日期时间，返回包含日期时间和星期的对象
 * @param {string|Date} date - 日期字符串或Date对象
 * @returns {Object} - 包含格式化后的日期时间和星期的对象
 */
export const formatDateObject = date => {
  // 确保date是Date对象
  const dateObj = date instanceof Date ? date : new Date(date)

  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    return {
      dateTime: '无效日期',
      weekDay: '无效日期',
    }
  }

  // 格式化日期时间
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')

  // 获取星期
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = '星期' + weekDays[dateObj.getDay()]

  return {
    dateTime: `${year}-${month}-${day} ${hours}:${minutes}`,
    weekDay: weekDay,
  }
}

// 使用示例
// const dateInfo = formatDateObject('2025-04-14T19:01:00')
// console.log(dateInfo.dateTime) // 输出: "2025-04-14 19:01"
// console.log(dateInfo.weekDay)  // 输出: "星期一"

import dayjs from 'dayjs'

/**
 * @description 使用 dayjs 格式化日期时间
 * @param {string | Date} date - 日期
 * @param {string} [format='YYYY-MM-DD HH:mm'] - 格式
 * @returns {string} - 格式化后的日期时间字符串
 */
export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm') => {
  return dayjs(date).format(format)
}
