/**
 * 题目难度常量映射
 * easy: 简单
 * medium: 中等
 * hard: 困难
 */
export const difficultyMap = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

/**
 * 获取难度等级对应的样式类型
 * @param {string} difficulty 难度级别
 * @returns {string} Element UI的类型名称
 */
export const getDifficultyType = difficulty => {
  switch (difficulty) {
    case 'easy':
      return 'success'
    case 'medium':
      return 'warning'
    case 'hard':
      return 'danger'
    default:
      return 'info'
  }
}
