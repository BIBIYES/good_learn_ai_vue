<script setup>
// 导入Vue Router
import { useRouter } from 'vue-router'
// 导入GSAP动画库
import { gsap } from 'gsap'
import { ref, onMounted, onUnmounted, watch } from 'vue'

// 获取router实例
const router = useRouter()

// 定义欢迎文本数组，包含初始值和最终显示文本
const welcomeTexts = ref([
  { value: '', final: '欢迎使用好助学!😄' },
  { value: '', final: 'Welcome to' },
  { value: '', final: 'good learn!' },
])

const generateRandomChars = length => {
  const generateBinary = () => Math.random() > 0.5 ? '1' : '0'

  const generateHex = () => {
    const hex = '0123456789ABCDEF'
    return hex[Math.floor(Math.random() * hex.length)]
  }

  const generateAscii = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
    return chars[Math.floor(Math.random() * chars.length)]
  }

  const getRandomEncodingStyle = () => {
    const styles = [
      () => Array(4).fill(0).map(generateBinary).join(''),
      () => '\\x' + Array(2).fill(0).map(generateHex).join(''),
      () => generateAscii(),
      () => '%' + Array(2).fill(0).map(generateHex).join('')
    ]

    return styles[Math.floor(Math.random() * styles.length)]()
  }

  let randomText = ''
  for (let i = 0; i < length; i++) {
    randomText += getRandomEncodingStyle()

    if (i > 0 && i < length - 1 && i % (Math.floor(Math.random() * 2) + 3) === 0) {
      randomText += ' '
    }
  }

  return randomText.substring(0, length)
}

const animateText = index => {
  const targetText = welcomeTexts.value[index].final
  const animationDuration = 4

  gsap.to(
    {},
    {
      duration: animationDuration,
      onUpdate: function () {
        const progress = this.progress()
        if (progress < 0.6) {
          if (progress % 0.1 < 0.01) {

            welcomeTexts.value[index].value = generateRandomChars(
              targetText.length * (index === 0 ? 1.5 : 1)
            )
          }
        }

        else {
          const revealRatio = (progress - 0.6) / 0.4
          const revealLength = Math.floor(targetText.length * revealRatio)
          welcomeTexts.value[index].value =
            targetText.substring(0, revealLength) +
            generateRandomChars(targetText.length - revealLength)
        }
      },
      onComplete: () => {
        welcomeTexts.value[index].value = targetText
      },
    },
  )
}

let colorBg = null
let bgScript = null

// 路由变化动画处理函数
const animateCardTransition = (direction) => {
  const card = document.querySelector('.card-body')
  if (card) {
    gsap.fromTo(
      card,
      {
        opacity: 0,
        x: direction === 'toRegister' ? 100 : -100
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: 'power2.out'
      }
    )
  }
}

watch(
  () => router.currentRoute.value.path,
  (newPath, oldPath) => {
    if (newPath === '/register' && oldPath === '/login') {
      // 从登录到注册页面的过渡动画
      animateCardTransition('toRegister')
    } else if (newPath === '/login' && oldPath === '/register') {
      // 从注册到登录页面的过渡动画
      animateCardTransition('toLogin')
    }
  }
)

// 组件挂载时启动动画
onMounted(() => {
  // 依次执行每行文本的动画，设置间隔时间
  animateText(0)
  setTimeout(() => animateText(1), 800) // 第二行延迟0.8秒
  setTimeout(() => animateText(2), 1600) // 第三行延迟1.6秒

  // 加载背景脚本
  bgScript = document.createElement('script')
  bgScript.src = '/RandomCubesBg.min.js'
  bgScript.onload = () => {
    // 脚本加载完成后初始化背景
    if (window.Color4Bg) {
      colorBg = new window.Color4Bg.RandomCubesBg({
        dom: "login-bg-container",
        colors: ["#ffffff", "#66cc8a", "#79be92", "#cedbde"],
        loop: true
      })
    }
  }
  document.head.appendChild(bgScript)

  // 初始路由加载动画
  const card = document.querySelector('.card-body')
  if (card) {
    gsap.fromTo(
      card,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
  }
})

// 组件卸载时清理资源
onUnmounted(() => {
  // 清理背景实例
  if (colorBg && typeof colorBg.destroy === 'function') {
    colorBg.destroy()
    colorBg = null
  }
  
  // 移除脚本标签
  if (bgScript && bgScript.parentNode) {
    bgScript.parentNode.removeChild(bgScript)
  }
})
</script>

<template>
  <!-- 登录页面主容器 -->
  <div
    class="h-screen w-full flex flex-col md:flex-row items-center justify-center p-4 gap-8 bg-base-100 overflow-hidden relative">
    <!-- 背景容器 -->
    <div id="login-bg-container" class="absolute inset-0 z-0"></div>

    <!-- 内容区域 -->
    <div class="z-10 w-full h-full flex flex-col md:flex-row items-center justify-center gap-8">
      <!-- 欢迎文字区域 -->
      <div
        class="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left animate__animated animate__fadeInLeft">
        <p class="text-5xl mb-10 font-bold">
          {{ welcomeTexts[0].value }}
        </p>
        <p class="text-3xl italic">
          {{ welcomeTexts[1].value }}
        </p>
        <p class="text-3xl italic">
          {{ welcomeTexts[2].value }}
        </p>
      </div>

      <!-- 登录/注册表单区域 -->
      <div class="w-full md:w-96">
        <!-- 表单卡片 -->
        <div
          class="liquid-glass-card relative backdrop-blur-xl border-0 overflow-hidden hover:shadow-xl transition-all duration-300">
          <div class="card-body p-8 relative z-10">
            <router-view v-slot="{ Component }">
              <component :is="Component" />
            </router-view>
          </div>
          <!-- 玻璃效果光晕 -->
          <div class="liquid-glass-effects">
            <div class="liquid-glass-highlight"></div>
            <div class="liquid-glass-glow"></div>
            <div class="liquid-glass-edge-glow"></div>
          </div>
        </div>

        <!-- 切换标签 - 移到卡片下方 -->
        <div class="liquid-glass-tabs mt-6 flex rounded-lg overflow-hidden">
          <button class="tab-btn flex-1 py-3 px-6 text-center font-medium transition-all"
            :class="{ 'tab-active': $route.path === '/login' }" @click="router.push('/login')">
            登录
          </button>
          <button class="tab-btn flex-1 py-3 px-6 text-center font-medium transition-all"
            :class="{ 'tab-active': $route.path === '/register' }" @click="router.push('/register')">
            注册
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义字体配置 */
@font-face {
  font-family: 'Fusion';
  src: url('@/assets/font/fusion.otf') format('opentype');
  font-display: swap;
}

* {
  font-family: 'Fusion', sans-serif;
}

/* 背景相关样式 */
#login-bg-container {
  pointer-events: none;
}

/* 液态玻璃效果样式 */
.liquid-glass-card {
  background: rgba(220, 250, 235, 0.4);
  border-radius: 24px;
  box-shadow:
    0 8px 32px rgba(102, 204, 138, 0.2),
    0 4px 16px rgba(102, 204, 138, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
  position: relative;
  min-height: 320px;
  width: 100%;
  transform-style: preserve-3d;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.liquid-glass-card:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow:
    0 12px 40px rgba(102, 204, 138, 0.25),
    0 8px 20px rgba(102, 204, 138, 0.2),
    inset 0 0 0 1.5px rgba(255, 255, 255, 0.5);
}

.liquid-glass-effects {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  border-radius: 24px;
  pointer-events: none;
}

.liquid-glass-highlight {
  position: absolute;
  width: 180%;
  height: 100%;
  top: -80%;
  left: -40%;
  background: radial-gradient(ellipse at center,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0) 60%);
  transform: rotate(-15deg);
  pointer-events: none;
  z-index: 1;
}


.liquid-glass-edge-glow {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  box-shadow:
    inset 0 0 10px rgba(255, 255, 255, 0.2),
    0 0 10px rgba(102, 204, 138, 0.1);
  z-index: 1;
  opacity: 0.4;
  animation: edge-pulse 4s ease-in-out infinite alternate;
}

@keyframes edge-pulse {
  0% {
    opacity: 0.3;
  }

  100% {
    opacity: 0.5;
  }
}

.liquid-glass-glow {
  position: absolute;
  width: 150%;
  height: 150%;
  top: -25%;
  left: -25%;
  background: radial-gradient(circle at bottom right,
      rgba(102, 204, 138, 0.4) 0%,
      rgba(121, 190, 146, 0.2) 30%,
      rgba(206, 219, 222, 0.1) 60%,
      rgba(255, 255, 255, 0) 80%);
  opacity: 0.6;
  filter: blur(20px);
  transform: rotate(15deg);
  z-index: 0;
  animation: glow-pulse 8s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
  0% {
    opacity: 0.5;
    transform: rotate(10deg) translateY(5%);
  }

  50% {
    opacity: 0.7;
    transform: rotate(15deg) translateY(0);
  }

  100% {
    opacity: 0.6;
    transform: rotate(20deg) translateY(-5%);
  }
}

:deep(input),
:deep(select),
:deep(textarea) {
  backdrop-filter: blur(5px);
  background: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

:deep(button.btn),
:deep(input[type="submit"]) {
  background: linear-gradient(135deg, rgba(102, 204, 138, 0.7), rgba(85, 170, 115, 0.8)) !important;
  border: none !important;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  font-weight: 600 !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease !important;
  position: relative;
  overflow: hidden;
}

:deep(button.btn:hover),
:deep(input[type="submit"]:hover) {
  background: linear-gradient(135deg, rgba(112, 214, 148, 0.8), rgba(95, 180, 125, 0.9)) !important;
  box-shadow:
    0 6px 15px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
  transform: translateY(-1px);
}

:deep(button.btn:active),
:deep(input[type="submit"]:active) {
  transform: translateY(1px);
  box-shadow:
    0 2px 8px rgba(66, 158, 93, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

:deep(button.btn::before) {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0) 70%);
  transform: scale(0);
  opacity: 0;
  transition: transform 0.6s ease, opacity 0.6s ease;
}

:deep(button.btn:hover::before) {
  transform: scale(1);
  opacity: 1;
}

:deep(label) {
  color: rgba(0, 40, 20, 0.9);
  font-weight: 500;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3);
}

/* 添加卡片缓慢漂浮动画效果 */
.liquid-glass-card {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-8px);
  }

  100% {
    transform: translateY(0px);
  }
}


.liquid-glass-tabs {
  background: rgba(220, 250, 235, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow:
    0 4px 16px rgba(102, 204, 138, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.tab-btn {
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: rgba(0, 40, 20, 0.7);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  font-weight: 500;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.2);
}

.tab-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(102, 204, 138, 0), rgba(102, 204, 138, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tab-btn:hover::before {
  opacity: 1;
}

.tab-btn.tab-active {
  background: rgba(102, 204, 138, 0.2);
  color: rgba(0, 40, 20, 0.9);
  font-weight: 600;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.4),
    0 0 10px rgba(102, 204, 138, 0.3);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.2);
}

.tab-btn.tab-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 2px;
  background: rgba(102, 204, 138, 0.8);
  border-radius: 1px;
  box-shadow: 0 0 4px rgba(102, 204, 138, 0.3);
}
</style>
