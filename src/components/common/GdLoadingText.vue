<template>
  <div class="loading-container">
    <canvas ref="canvas" class="bounce-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: '正在加载...',
  },
  // 固定绿色，从浅到深
  color: {
    type: String,
    default: '#66cc8a', // 主色调固定为绿色，与FloatingSquaresBg.js相同
  },
})

const canvas = ref(null)
let ctx = null
let width = 0
let height = 0
let animationFrame = null
let mouseX = null
let mouseY = null

// 定义粒子数组
let particles = []

// 定义各种形状类型
const SHAPES = {
  SQUARE: 'square',
  CIRCLE: 'circle',
  TRIANGLE: 'triangle',
  PENTAGON: 'pentagon',
  HEXAGON: 'hexagon',
  STAR: 'star',
}

// 当前形状对象
let shape = {
  x: 0,
  y: 0,
  size: 40,
  color: props.color,
  type: SHAPES.SQUARE,
  vy: 0, // 垂直速度
  gravity: 0.3, // 增加重力，使动画更流畅
  bounceCount: 0, // 弹跳次数
  rotation: 0, // 旋转角度
  rotationSpeed: 0.02, // 增加旋转速度
  hovered: false,
  targetSize: 40,
  glowIntensity: 0, // 发光强度
  opacity: 0.8, // 添加透明度，增强玻璃感
}

// 弹床参数
let trampoline = {
  text: props.text,
  width: 0,
  y: 0,
  color: '#000000', // 修改回黑色
  bounceStrength: -10, // 增加弹跳强度，使动画更有活力
  glowIntensity: 0,
  scale: 1, // 文字缩放
  targetScale: 1, // 目标缩放
  stretchAmount: 0, // 文字拉伸量
}

// 绘制各种形状，添加光晕玻璃风格效果
const drawShape = (ctx, shape) => {
  ctx.save()
  ctx.translate(shape.x, shape.y)
  ctx.rotate(shape.rotation)

  // 获取基础颜色
  const baseColor = props.color

  // 设置全局透明度
  ctx.globalAlpha = shape.opacity

  // 创建绘制路径函数
  const createShapePath = () => {
    switch (shape.type) {
      case SHAPES.SQUARE:
        ctx.beginPath()
        ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size)
        ctx.closePath()
        break
      case SHAPES.CIRCLE:
        ctx.beginPath()
        ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2)
        ctx.closePath()
        break
      case SHAPES.TRIANGLE:
        ctx.beginPath()
        ctx.moveTo(0, -shape.size / 2)
        ctx.lineTo(shape.size / 2, shape.size / 2)
        ctx.lineTo(-shape.size / 2, shape.size / 2)
        ctx.closePath()
        break
      case SHAPES.PENTAGON:
        drawPolygon(ctx, 5, shape.size / 2)
        break
      case SHAPES.HEXAGON:
        drawPolygon(ctx, 6, shape.size / 2)
        break
      case SHAPES.STAR:
        drawStar(ctx, 5, shape.size / 2, shape.size / 4)
        break
    }
  }

  // 添加光晕效果
  if (shape.glowIntensity > 0 || shape.hovered) {
    ctx.shadowColor = baseColor
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  // 绘制半透明填充
  createShapePath()
  ctx.fillStyle = baseColor
  ctx.fill()

  // 添加白色边框 - 从FloatingSquaresBg.js中借鉴
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  createShapePath()
  ctx.stroke()

  ctx.restore()
}

// 绘制正多边形，现在只定义路径不填充
const drawPolygon = (ctx, sides, radius) => {
  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()
  // 不再在这里填充，由调用者负责填充
}

// 绘制星形，现在只定义路径不填充
const drawStar = (ctx, points, outerRadius, innerRadius) => {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / points - Math.PI / 2
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()
  // 不再在这里填充，由调用者负责填充
}

// 绘制弹床文字
const drawTrampoline = (ctx, trampoline) => {
  ctx.save()

  // 设置字体样式
  ctx.font = 'bold 28px Fusion, Arial'
  ctx.textAlign = 'center'

  // 应用缩放和拉伸变形
  ctx.translate(width / 2, trampoline.y)
  ctx.scale(
    trampoline.scale + trampoline.stretchAmount,
    trampoline.scale - trampoline.stretchAmount * 0.5,
  )
  ctx.translate(-width / 2, -trampoline.y)

  // 测量文字宽度
  trampoline.width = ctx.measureText(trampoline.text).width

  // 创建绿色渐变
  const gradient = ctx.createLinearGradient(
    width / 2 - trampoline.width / 2,
    trampoline.y - 15,
    width / 2 + trampoline.width / 2,
    trampoline.y + 15,
  )
  gradient.addColorStop(0, '#44aa66') // 深绿色
  gradient.addColorStop(0.5, '#66cc8a') // 中绿色
  gradient.addColorStop(1, '#99eebb') // 浅绿色

  // 添加光晕效果 - 减弱光晕强度
  if (trampoline.glowIntensity > 0) {
    ctx.shadowColor = props.color
    ctx.shadowBlur = 8 // 减少模糊半径
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  // 先绘制白色描边
  ctx.lineWidth = 2 // 适中的描边宽度
  ctx.strokeStyle = 'white'
  ctx.strokeText(trampoline.text, width / 2, trampoline.y)

  // 重置阴影，避免阴影影响填充文字
  ctx.shadowBlur = 0

  // 使用渐变色绘制文字
  ctx.fillStyle = gradient
  ctx.fillText(trampoline.text, width / 2, trampoline.y)

  ctx.restore()
}

// 更新形状状态
const updateShape = () => {
  // 应用重力 - 增加重力使动画更流畅
  shape.vy += shape.gravity * 1.2

  // 更新位置（只更新Y轴，X轴保持居中）
  shape.y += shape.vy

  // 保持形状在水平居中位置（修复偏移bug）
  shape.x = width / 2

  // 限制形状不要超出上边界
  if (shape.y - shape.size / 2 < 0) {
    shape.y = shape.size / 2
    shape.vy = 0.5 // 给一个小的向下初速度，避免卡顿
  }

  // 检测是否碰到弹床
  if (shape.y + shape.size / 2 > trampoline.y - 10 && shape.vy > 0) {
    // 只有在形状中心点位于弹床文字宽度范围内时才弹跳
    if (Math.abs(shape.x - width / 2) < trampoline.width / 2 + 20) {
      // 弹跳
      shape.vy = trampoline.bounceStrength
      shape.bounceCount++

      // 改变形状
      changeShape()

      // 增加弹床的辉光强度
      trampoline.glowIntensity = 1

      // 增加形状的发光强度，使玻璃材质看起来更明亮
      shape.glowIntensity = 1

      // 形变效果 - 文字被压扁
      trampoline.targetScale = 0.95
      trampoline.stretchAmount = 0.15

      // 创建向上迸发的粒子效果 - 增加粒子数量，但限制最大数量
      createParticles(
        shape.x,
        trampoline.y - 10,
        shape.color,
        Math.min(40, Math.floor(width / 12)),
      )
    }
  }

  // 如果形状落到画布底部，重置位置
  if (shape.y - shape.size / 2 > height) {
    resetShape()
  }

  // 如果形状飞出画布顶部，给予重力影响
  if (shape.y < -shape.size) {
    shape.vy = 2
  }

  // 衰减弹床辉光和形变
  trampoline.glowIntensity *= 0.9
  trampoline.stretchAmount *= 0.8

  // 衰减形状发光强度
  shape.glowIntensity *= 0.95

  // 平滑过渡文字缩放
  trampoline.scale += (trampoline.targetScale - trampoline.scale) * 0.1

  // 文字逐渐恢复原来的大小
  trampoline.targetScale += (1 - trampoline.targetScale) * 0.05

  // 旋转形状
  shape.rotation += shape.rotationSpeed

  // 鼠标交互
  if (mouseX !== null && mouseY !== null) {
    const dx = shape.x - mouseX
    const dy = shape.y - mouseY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < shape.size) {
      shape.hovered = true
      shape.targetSize = 50

      // 鼠标悬停时只给形状一个向上的推力，不改变X轴位置
      shape.vy -= 0.15
    } else {
      shape.hovered = false
      shape.targetSize = 40
    }
  } else {
    shape.hovered = false
    shape.targetSize = 40
  }

  // 平滑过渡大小
  shape.size += (shape.targetSize - shape.size) * 0.1
}

// 改变形状
const changeShape = () => {
  // 选择一个新的随机形状
  const shapeTypes = Object.values(SHAPES)
  const currentIndex = shapeTypes.indexOf(shape.type)
  let newIndex

  do {
    newIndex = Math.floor(Math.random() * shapeTypes.length)
  } while (newIndex === currentIndex)

  shape.type = shapeTypes[newIndex]

  // 使用固定的绿色，但略微改变亮度
  shape.color = props.color

  // 改变旋转方向
  shape.rotationSpeed = (Math.random() - 0.5) * 0.08
}

// 重置形状位置
const resetShape = () => {
  shape.y = height * 0.5 // 将起始点调整到中间位置0.5
  shape.x = width / 2
  shape.vy = 1 // 给一个小的初始向下速度

  // 随机选择一个形状类型
  const shapeTypes = Object.values(SHAPES)
  shape.type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]

  shape.color = props.color
  shape.rotation = 0

  // 重置大小
  shape.size = 40
  shape.targetSize = 40
}

const handleMouseMove = e => {
  if (!canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  mouseX = e.clientX - rect.left
  mouseY = e.clientY - rect.top
}

// 鼠标点击事件 - 创建粒子效果
const handleMouseClick = e => {
  if (!canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // 在点击位置创建更多粒子效果，大幅增加数量
  createParticles(x, y, props.color, Math.min(60, Math.floor(width / 10)))

  // 在周围区域也创建一些粒子，制造爆炸效果
  for (let i = 0; i < 3; i++) {
    const radius = 20 + Math.random() * 30
    const angle = Math.random() * Math.PI * 2
    const burstX = x + Math.cos(angle) * radius
    const burstY = y + Math.sin(angle) * radius
    createParticles(
      burstX,
      burstY,
      props.color,
      Math.min(20, Math.floor(width / 15)),
    )
  }
}

const handleMouseLeave = () => {
  mouseX = null
  mouseY = null
}

const resize = () => {
  if (!canvas.value) return

  const rect = canvas.value.parentElement.getBoundingClientRect()
  width = rect.width
  height = rect.height

  canvas.value.width = width
  canvas.value.height = height

  // 设置弹床位置 - 将文本位置移到更低的位置
  trampoline.y = height * 0.75 // 将弹床位置调整到0.75，更靠近底部

  // 初始化形状位置
  resetShape()
}

const animate = () => {
  if (!ctx || !canvas.value) return

  ctx.clearRect(0, 0, width, height)

  // 更新形状状态
  updateShape()

  // 更新粒子
  updateParticles()

  // 绘制弹床
  drawTrampoline(ctx, trampoline)

  // 绘制形状
  drawShape(ctx, shape)

  // 绘制粒子
  drawParticles(ctx)

  animationFrame = requestAnimationFrame(animate)
}

const init = () => {
  if (!canvas.value) return

  ctx = canvas.value.getContext('2d')
  resize()

  window.addEventListener('resize', resize)
  canvas.value.addEventListener('mousemove', handleMouseMove)
  canvas.value.addEventListener('mouseleave', handleMouseLeave)
  canvas.value.addEventListener('click', handleMouseClick)

  animate()
}

// 像素游戏风格粒子类
class Particle {
  constructor(x, y, color) {
    this.x = Math.round(x)
    this.y = Math.round(y)

    // 使用更多尺寸选项
    const sizeOptions = [3, 4, 6, 8, 10]
    this.size = sizeOptions[Math.floor(Math.random() * sizeOptions.length)]

    // 更多角度选项，使粒子向各个方向飞散
    const angle = Math.random() * Math.PI * 2 // 完全随机的360度角度

    // 使用更多速度变化
    const speedOptions = [3, 4, 6, 8, 10]
    const speed = speedOptions[Math.floor(Math.random() * speedOptions.length)]

    // 使用随机速度
    this.speedX = Math.cos(angle) * speed
    this.speedY = Math.sin(angle) * speed - (Math.random() * 3 + 2) // 向上偏移的初始速度

    // 随机选择颜色，有一定概率使用更亮的颜色
    this.color = Math.random() > 0.7 ? '#ffffff' : color
    this.alpha = 0.8 + Math.random() * 0.2 // 随机透明度
    this.gravity = 0.15 + Math.random() * 0.1 // 随机重力

    // 使用更长的生命周期并增加随机性
    this.life = 30 + Math.floor(Math.random() * 40)
    this.remainingLife = this.life

    // 随机旋转角度和速度
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 0.1

    // 添加随机闪烁效果
    this.flashFrequency = 0.02 + Math.random() * 0.04
    this.flashPhase = Math.random() * Math.PI * 2

    // 随机加速度变化
    this.accelerationX = (Math.random() - 0.5) * 0.05
    this.accelerationY = (Math.random() - 0.5) * 0.05
  }

  // 更新粒子状态
  update() {
    // 应用重力
    this.speedY += this.gravity

    // 应用随机加速度
    this.speedX += this.accelerationX
    this.speedY += this.accelerationY

    // 更新位置
    this.x += this.speedX
    this.y += this.speedY

    // 更新旋转
    this.rotation += this.rotationSpeed

    // 生命周期减少
    this.remainingLife--

    // 计算基础透明度
    let baseAlpha = (this.remainingLife / this.life) * 0.8

    // 添加闪烁效果
    const flickerEffect =
      Math.sin(this.remainingLife * this.flashFrequency + this.flashPhase) *
        0.2 +
      0.8
    this.alpha = baseAlpha * flickerEffect

    // 添加飘动效果
    this.speedX *= 0.98

    // 随机改变加速度
    if (Math.random() < 0.05) {
      this.accelerationX = (Math.random() - 0.5) * 0.1
      this.accelerationY = (Math.random() - 0.5) * 0.1
    }

    // 生命末期旋转加速
    if (this.remainingLife < this.life * 0.3) {
      this.rotationSpeed *= 1.02
    }

    // 限制粒子不要飞出太远
    if (
      this.x < -this.size * 2 ||
      this.x > width + this.size * 2 ||
      this.y < -this.size * 2 ||
      this.y > height + this.size * 2
    ) {
      this.remainingLife = 0 // 如果飞出范围，直接结束生命周期
    }
  }

  // 绘制粒子
  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = this.color

    // 添加光晕效果
    ctx.shadowColor = this.color
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // 根据形状类型绘制不同的粒子
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)

    const rectSize = this.size

    // 根据粒子形状类型绘制不同形状
    if (!this.shapeType || this.shapeType === 0) {
      // 方形粒子
      ctx.fillRect(-rectSize / 2, -rectSize / 2, rectSize, rectSize)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = 1
      ctx.strokeRect(-rectSize / 2, -rectSize / 2, rectSize, rectSize)
    } else if (this.shapeType === 1) {
      // 圆形粒子
      ctx.beginPath()
      ctx.arc(0, 0, rectSize / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = 1
      ctx.stroke()
    } else {
      // 三角形粒子
      ctx.beginPath()
      ctx.moveTo(0, -rectSize / 2)
      ctx.lineTo(rectSize / 2, rectSize / 2)
      ctx.lineTo(-rectSize / 2, rectSize / 2)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    ctx.restore()
  }

  // 判断粒子是否存活
  isAlive() {
    return this.remainingLife > 0
  }
}

// 创建粒子效果
const createParticles = (x, y, baseColor, count = 15) => {
  // 使用与FloatingSquaresBg.js相同的颜色，增加更多绿色变体
  const colors = [
    '#ffffff',
    '#66cc8a',
    '#79be92',
    '#cedbde',
    '#88ddaa', // 新增绿色变体
    '#55bb77', // 新增绿色变体
    '#99eebb', // 新增绿色变体
    '#44aa66', // 新增绿色变体
  ]

  // 根据容器大小限制粒子数量，但增加基础数量
  const maxParticles = Math.floor(Math.min(width, height) / 8) // 减小除数，增加粒子
  const actualCount = Math.min(count * 2, maxParticles) // 乘以2增加粒子数量

  // 限制总粒子数量，但增加上限
  if (particles.length > 150) {
    // 从100增加到150
    // 如果已有太多粒子，保留较新的
    particles = particles.slice(-120) // 从80增加到120
  }

  for (let i = 0; i < actualCount; i++) {
    // 从颜色数组中随机选择一种颜色
    const particleColor = colors[Math.floor(Math.random() * colors.length)]

    // 创建新粒子，位置增加随机偏移
    const offsetX = (Math.random() - 0.5) * 30 // 水平随机偏移±15像素
    const offsetY = (Math.random() - 0.5) * 20 // 垂直随机偏移±10像素
    const particle = new Particle(x + offsetX, y + offsetY, particleColor)

    // 随机粒子大小，增加更多变体
    const sizeVariant = Math.floor(Math.random() * 5) // 从3增加到5种尺寸
    if (sizeVariant === 0) {
      particle.size = 3 // 极小
    } else if (sizeVariant === 1) {
      particle.size = 5 // 小
    } else if (sizeVariant === 2) {
      particle.size = 7 // 中
    } else if (sizeVariant === 3) {
      particle.size = 9 // 大
    } else {
      particle.size = 11 // 极大
    }

    // 增加随机性 - 随机选择不同的形状
    const shapeType = Math.floor(Math.random() * 3)
    particle.shapeType = shapeType // 添加形状类型：0方形，1圆形，2三角形

    particles.push(particle)
  }
}

// 更新所有粒子
const updateParticles = () => {
  // 过滤掉已经"死亡"的粒子
  particles = particles.filter(particle => {
    particle.update()
    return particle.isAlive()
  })
}

// 绘制所有粒子
const drawParticles = ctx => {
  particles.forEach(particle => {
    particle.draw(ctx)
  })
}

const cleanup = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }

  window.removeEventListener('resize', resize)

  if (canvas.value) {
    canvas.value.removeEventListener('mousemove', handleMouseMove)
    canvas.value.removeEventListener('mouseleave', handleMouseLeave)
    canvas.value.removeEventListener('click', handleMouseClick)
  }
}

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  cleanup()
})
</script>

<style lang="scss" scoped>
/* 自定义字体配置 */
@font-face {
  font-family: 'Fusion';
  src: url('@/assets/font/fusion.otf') format('opentype');
  font-display: swap;
}

.loading-container {
  position: relative;
  width: 100%;
  height: 260px; /* 增加高度 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 改为居中对齐，而不是从顶部开始 */
  font-family: 'Fusion', sans-serif;
  overflow: hidden; /* 修改回hidden以防止内容溢出 */
  border-radius: 8px;
}

.bounce-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  border-radius: 8px;
  pointer-events: auto; /* 确保可以接收鼠标事件 */
}
</style>
