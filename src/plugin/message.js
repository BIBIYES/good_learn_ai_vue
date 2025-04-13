const message = {
  /**
   * 创建一个消息元素并添加到 DOM
   * @param {string} message - 消息文本
   * @param {string} type - 消息类型 ('info', 'success', 'warning', 'error')
   * @param {number} duration - 显示时间(毫秒)，默认 3000 毫秒
   *
   */
  create(message, type, duration = 3000) {
    // 消息位置容器
    const messageContainer = document.createElement('div')
    messageContainer.className = 'toast toast-top toast-center z-50 w-100'

    // SVG 图标（不同类型对应不同图标）
    const icons = {
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      warning:
        'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      error:
        'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    }

    // 设置消息内容
    messageContainer.innerHTML = `
      <div class="alert alert-${type}" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${icons[type]}"></path>
        </svg>
        <span>${message}</span>
      </div>
    `

    // 添加到页面
    document.body.appendChild(messageContainer)

    // 设定定时器，自动移除
    setTimeout(() => {
      messageContainer.style.opacity = '0'
      messageContainer.style.transition = 'opacity 0.5s'

      setTimeout(() => {
        if (messageContainer.parentNode) {
          messageContainer.parentNode.removeChild(messageContainer)
        }
      }, 500)
    }, duration)

    return messageContainer
  },

  info(message, duration = 3000, position = 'top-center') {
    return this.create(message, 'info', duration, position)
  },

  success(message, duration = 3000, position = 'top-center') {
    return this.create(message, 'success', duration, position)
  },

  warning(message, duration = 3000, position = 'top-center') {
    return this.create(message, 'warning', duration, position)
  },

  error(message, duration = 3000, position = 'top-center') {
    return this.create(message, 'error', duration, position)
  }
}

export default message
