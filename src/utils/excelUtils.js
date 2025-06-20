/**
 * Excel导入导出工具函数
 */
import * as XLSX from 'xlsx'

/**
 * 生成题目导入模板并下载
 * @description 创建带有表头和示例数据的Excel模板，并自动触发下载
 * @param {string} filename - 下载的文件名
 */
export const generateQuestionTemplate = (
  filename = '题目批量导入模板.xlsx',
) => {
  // 定义表头 - 与后端接口需要的字段保持一致
  const headers = [
    '题目标题 (title)',
    '题目内容 (content)',
    '难度等级 (difficulty)',
  ]

  // 示例数据 - 提供更完整的示例帮助用户理解格式要求
  const data = [
    [
      'MySQL基础查询',
      "请写出一个SQL语句，查询名为'students'的表中所有学生的姓名(name)和年龄(age)信息。",
      '1',
    ],
    [
      'MySQL条件查询',
      "请写出一个SQL语句，从'employees'表中查询工资(salary)大于5000且部门(department)为'销售部'的所有员工姓名(name)和工号(id)。",
      '2',
    ],
    [
      'MySQL排序查询',
      "请写出一个SQL语句，从'products'表中查询所有产品信息，并按照价格(price)降序排列。",
      '1',
    ],
    [
      'MySQL分组统计',
      "请写出一个SQL语句，统计'orders'表中每个客户(customer_id)的订单总金额(total_amount)，并按总金额从高到低排序。",
      '2',
    ],
    [
      'MySQL多表连接查询',
      "请写出一个SQL语句，查询'students'表和'scores'表，获取每个学生的姓名(name)及其对应的数学(math)成绩，要求使用内连接(INNER JOIN)。",
      '3',
    ],
  ]

  // 添加说明行 - 帮助用户理解如何填写模板
  const instructions = [
    ['注意事项：'],
    ['1. 请不要修改表头行和格式'],
    ['2. 难度等级: 1=简单, 2=中等, 3=困难'],
    ['3. 请按照示例格式填写数据'],
    [''],
    ['示例数据（导入前请删除）:'],
  ]

  // 构建工作表数据
  const worksheetData = [...instructions, headers, ...data]

  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet(worksheetData)

  // 设置列宽
  ws['!cols'] = [
    { wch: 30 }, // title
    { wch: 50 }, // content
    { wch: 15 }, // difficulty
  ]

  // 设置说明部分的合并单元格
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // 合并"注意事项"单元格
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // 合并第一条说明
    { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }, // 合并第二条说明
    { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } }, // 合并第三条说明
    { s: { r: 5, c: 0 }, e: { r: 5, c: 2 } }, // 合并"示例数据"
  ]

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '题目模板')

  // 导出 Excel 文件
  XLSX.writeFile(wb, filename)
}

/**
 * 解析Excel文件为题目数据
 * @description 读取Excel文件并转换为题目JSON数据
 * @param {File} file - 上传的Excel文件对象
 * @param {string} bankId - 题库ID
 * @returns {Promise<Array>} 返回解析后的题目数据数组
 */
export const parseExcelToQuestions = (file, bankId) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('文件不能为空'))
      return
    }

    const reader = new FileReader()

    reader.onload = e => {
      try {
        // 使用XLSX库解析Excel数据
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          reject(new Error('Excel文件不包含任何工作表'))
          return
        }

        const worksheet = workbook.Sheets[firstSheetName]

        // 将工作表数据转换为JSON
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        // 找到表头行（跳过说明部分）
        let headerRowIndex = -1
        for (let i = 0; i < excelData.length; i++) {
          const row = excelData[i]
          if (
            row &&
            Array.isArray(row) &&
            row.length >= 3 &&
            String(row[0]).includes('题目标题') &&
            String(row[1]).includes('题目内容') &&
            String(row[2]).includes('难度等级')
          ) {
            headerRowIndex = i
            break
          }
        }

        if (headerRowIndex === -1) {
          reject(new Error('Excel文件格式错误，未找到正确的表头'))
          return
        }

        // 提取数据行（排除表头和空行）
        const dataRows = excelData
          .slice(headerRowIndex + 1)
          .filter(
            row =>
              row &&
              Array.isArray(row) &&
              row.length >= 3 &&
              row[0] &&
              row[1] &&
              row[2],
          )

        if (dataRows.length === 0) {
          reject(new Error('Excel文件中没有有效的题目数据'))
          return
        }

        // 将Excel数据转换为API所需的JSON格式
        const questions = dataRows.map(row => ({
          bankId: bankId,
          title: String(row[0]).trim(),
          content: String(row[1]).trim(),
          difficulty: String(row[2]).trim(),
        }))

        resolve(questions)
      } catch (error) {
        console.error('解析Excel文件错误:', error)
        reject(new Error('解析Excel文件时发生错误: ' + error.message))
      }
    }

    reader.onerror = () => {
      reject(new Error('读取文件失败'))
    }

    // 开始读取文件
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 检查文件类型是否为Excel
 * @description 验证文件是否为Excel格式(.xlsx)
 * @param {File} file - 要检查的文件
 * @returns {boolean} 是否为Excel文件
 */
export const isExcelFile = file => {
  return (
    file &&
    file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
}

/**
 * 将JSON数据导出为Excel文件
 * @description 将数据转换为Excel并下载
 * @param {Array} data - 要导出的数据数组
 * @param {Array} headers - 表头数组
 * @param {string} filename - 导出的文件名
 * @param {string} sheetName - 工作表名称
 */
export const exportJsonToExcel = (
  data,
  headers,
  filename = 'export.xlsx',
  sheetName = 'Sheet1',
) => {
  // 添加表头行
  const worksheetData = [headers]

  // 提取每行数据
  data.forEach(item => {
    const row = headers.map(header => {
      const key = header.split(' ')[0].toLowerCase()
      return item[key] || ''
    })
    worksheetData.push(row)
  })

  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet(worksheetData)

  // 创建工作簿并添加工作表
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // 导出文件
  XLSX.writeFile(wb, filename)
}
