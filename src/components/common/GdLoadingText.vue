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
    default: '#53a979', // 主色调固定为绿色
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
  glowIntensity: 0, // 马赛克材质的发光强度
}

// 弹床参数
let trampoline = {
  text: props.text,
  width: 0,
  y: 0,
  color: '#000000',
  bounceStrength: -10, // 增加弹跳强度，使动画更有活力
  glowIntensity: 0,
  scale: 1, // 文字缩放
  targetScale: 1, // 目标缩放
  stretchAmount: 0, // 文字拉伸量
}

// 绘制各种形状，添加马赛克风格效果
const drawShape = (ctx, shape) => {
  ctx.save()
  ctx.translate(shape.x, shape.y)
  ctx.rotate(shape.rotation)

  // 获取基础颜色
  const baseColor = props.color

  // 为形状添加像素风效果
  const addPixelEffect = (ctx, shapePath) => {
    // 解析基础颜色
    let r, g, b
    if (baseColor.startsWith('#')) {
      r = parseInt(baseColor.substring(1, 3), 16)
      g = parseInt(baseColor.substring(3, 5), 16)
      b = parseInt(baseColor.substring(5, 7), 16)
    } else {
      // 默认绿色
      r = 83
      g = 169
      b = 121
    }

    // 创建裁剪区域
    shapePath()
    ctx.clip()

    // 像素的大小 - 使用更大的像素块来增强锯齿感
    const pixelSize = Math.max(6, Math.floor(shape.size / 5))

    // 计算形状的边界框
    const boundingBoxSize = shape.size
    const startX = -boundingBoxSize / 2
    const startY = -boundingBoxSize / 2

    // 定义经典像素游戏风格的颜色调色板 - 只使用2-3种颜色
    const palette = [
      {
        r: Math.max(0, r - 40),
        g: Math.max(0, g - 40),
        b: Math.max(0, b - 40),
      }, // 暗色
      { r, g, b }, // 基础色
      {
        r: Math.min(255, r + 30),
        g: Math.min(255, g + 30),
        b: Math.min(255, b + 30),
      }, // 亮色
    ]

    // 绘制低分辨率像素
    for (let x = startX; x < startX + boundingBoxSize; x += pixelSize) {
      for (let y = startY; y < startY + boundingBoxSize; y += pixelSize) {
        // 使用简单的像素游戏光照模型
        // 左上方亮，右下方暗

        // 计算像素在形状内的相对位置 (-1到1的范围)
        const relX = x / (boundingBoxSize / 2)
        const relY = y / (boundingBoxSize / 2)

        // 确定使用调色板中的哪个颜色
        let colorIndex

        // 简单的光照方向：左上角亮，右下角暗
        if (relX + relY < -0.5) {
          // 左上角区域使用亮色
          colorIndex = 2
        } else if (relX + relY > 0.5) {
          // 右下角区域使用暗色
          colorIndex = 0
        } else {
          // 中间区域使用基础色
          colorIndex = 1
        }

        // 获取选定的颜色
        const selectedColor = palette[colorIndex]

        // 设置填充颜色
        ctx.fillStyle = `rgb(${Math.floor(selectedColor.r)}, ${Math.floor(selectedColor.g)}, ${Math.floor(selectedColor.b)})`

        // 绘制像素方块，不留间隙以体现像素风格
        ctx.fillRect(x, y, pixelSize, pixelSize)
      }
    }

    // 添加像素游戏风格的黑色边框
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    shapePath()
    ctx.stroke()
  }

  switch (shape.type) {
    case SHAPES.SQUARE:
      addPixelEffect(ctx, () => {
        ctx.beginPath()
        ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size)
        ctx.closePath()
      })
      break

    case SHAPES.CIRCLE:
      addPixelEffect(ctx, () => {
        ctx.beginPath()
        ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2)
        ctx.closePath()
      })
      break

    case SHAPES.TRIANGLE:
      addPixelEffect(ctx, () => {
        ctx.beginPath()
        ctx.moveTo(0, -shape.size / 2)
        ctx.lineTo(shape.size / 2, shape.size / 2)
        ctx.lineTo(-shape.size / 2, shape.size / 2)
        ctx.closePath()
      })
      break

    case SHAPES.PENTAGON:
      addPixelEffect(ctx, () => drawPolygon(ctx, 5, shape.size / 2))
      break

    case SHAPES.HEXAGON:
      addPixelEffect(ctx, () => drawPolygon(ctx, 6, shape.size / 2))
      break

    case SHAPES.STAR:
      addPixelEffect(ctx, () =>
        drawStar(ctx, 5, shape.size / 2, shape.size / 4),
      )
      break
  }

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

  // 设置像素字体样式
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

  // 文字不再有辉光效果

  // 使用实心颜色绘制文字，不使用渐变
  ctx.fillStyle = '#000000'
  ctx.fillText(trampoline.text, width / 2, trampoline.y)

  // 底部水平线已移除

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

      // 创建向上迸发的粒子效果 - 减少粒子数量
      createParticles(shape.x, trampoline.y - 10, shape.color, 15)
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
  shape.y = height * 0.5
  shape.x = width / 2
  shape.vy = 0

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

  // 在点击位置创建粒子效果
  createParticles(x, y, props.color, 20)
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

  // 设置弹床位置 - 将文本位置下移
  trampoline.y = height * 0.75

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
    // 使用整数坐标，增强像素感
    this.x = Math.round(x)
    this.y = Math.round(y)

    // 固定的几种尺寸，不使用随机值
    const sizeOptions = [4, 6, 8]
    this.size = sizeOptions[Math.floor(Math.random() * sizeOptions.length)]

    // 使用固定的几个角度，增强像素风格的机械感
    const angleOptions = [
      Math.PI * 0.25, // 右上 45°
      Math.PI * 0.5, // 正上 90°
      Math.PI * 0.75, // 左上 135°
    ]
    const angle = angleOptions[Math.floor(Math.random() * angleOptions.length)]

    // 使用固定的几个速度值
    const speedOptions = [4, 6, 8]
    const speed = speedOptions[Math.floor(Math.random() * speedOptions.length)]

    // 使用整数速度，增强像素感
    this.speedX = Math.round(Math.cos(angle) * speed)
    this.speedY = Math.round(-Math.sin(angle) * speed) - 2

    this.color = color
    this.alpha = 1
    this.gravity = 0.2

    // 使用固定的几个生命周期值
    this.life = 20 + Math.floor(Math.random() * 3) * 5
    this.remainingLife = this.life

    // 只使用 0°, 90°, 180°, 270° 的旋转角度
    this.rotation = Math.floor(Math.random() * 4) * (Math.PI / 2)
    this.rotationSpeed = 0 // 不使用连续旋转
  }

  // 更新粒子状态
  update() {
    this.speedY += this.gravity
    this.x += this.speedX
    this.y += this.speedY

    // 更明显的旋转效果
    this.rotation += this.rotationSpeed

    this.remainingLife--
    this.alpha = this.remainingLife / this.life

    // 添加一些飘动效果
    this.speedX *= 0.98

    // 生命末期旋转加速
    if (this.remainingLife < this.life * 0.3) {
      this.rotationSpeed *= 1.01
    }

    // 保持足够的不透明度以便看清方块
    this.alpha = Math.max(this.alpha, 0.2)
  }

  // 绘制粒子
  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = this.color

    // 绘制方块粒子
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)

    // 更大的方块尺寸
    const rectSize = this.size

    // 填充方块
    ctx.fillRect(-rectSize / 2, -rectSize / 2, rectSize, rectSize)

    // 添加边框使方块更明显
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 0.5
    ctx.strokeRect(-rectSize / 2, -rectSize / 2, rectSize, rectSize)

    ctx.restore()
  }

  // 判断粒子是否存活
  isAlive() {
    return this.remainingLife > 0
  }
}

// 创建粒子效果
const createParticles = (x, y, baseColor, count = 8) => {
  // 减少粒子数量以提高性能
  // 解析基础颜色
  let baseR, baseG, baseB
  if (baseColor.startsWith('#')) {
    baseR = parseInt(baseColor.substring(1, 3), 16)
    baseG = parseInt(baseColor.substring(3, 5), 16)
    baseB = parseInt(baseColor.substring(5, 7), 16)
  } else {
    // 默认绿色
    baseR = 83
    baseG = 169
    baseB = 121
  }

  // 像素风格的颜色调色板 - 只使用几种固定的颜色
  const pixelPalette = [
    `rgb(${baseR}, ${baseG}, ${baseB})`, // 基础色
    `rgb(${baseR + 40}, ${baseG + 40}, ${baseB + 40})`, // 亮色
    `rgb(${baseR - 30}, ${baseG - 30}, ${baseB - 30})`, // 暗色
  ]

  // 生成像素风格的颜色
  const generatePixelColor = () => {
    // 从调色板中随机选择一种颜色
    return pixelPalette[Math.floor(Math.random() * pixelPalette.length)]
  }

  for (let i = 0; i < count; i++) {
    // 为每个粒子生成像素风格的颜色
    const particleColor = generatePixelColor()

    // 创建新粒子
    const particle = new Particle(x, y, particleColor)

    // 像素风格的粒子大小应该更加统一，只有少量变化
    // 使用固定的几种尺寸，而不是随机值
    const sizeVariant = Math.floor(Math.random() * 3) // 0, 1, 2
    if (sizeVariant === 0) {
      particle.size = 5 // 小
    } else if (sizeVariant === 1) {
      particle.size = 7 // 中
    } else {
      particle.size = 9 // 大
    }

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
  height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* 从顶部开始布局，不居中 */
  padding-top: 20px; /* 顶部添加一些空间 */
  font-family: 'Fusion', sans-serif;
  overflow: hidden; /* 防止内容溢出 */
}

.bounce-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  border-radius: 8px; /* 添加圆角边框 */
}
</style>
