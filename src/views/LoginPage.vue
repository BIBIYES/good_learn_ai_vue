<script setup>
// 导入Vue Router
import { useRouter } from 'vue-router'
// 导入GSAP动画库
import { gsap } from 'gsap'
import { ref, onMounted } from 'vue'

// 获取router实例
const router = useRouter()

// 定义欢迎文本数组，包含初始值和最终显示文本
const welcomeTexts = ref([
  { value: '', final: '欢迎使用好助学!😄' },
  { value: '', final: 'Welcome to' },
  { value: '', final: 'good learn!' },
])

// 生成指定长度的随机字符
const generateRandomChars = length => {
  const specialChars =
    '!@#$%^&*()_+~`|}{[]:;?><,./-=¢∞§¶•ªº–≠œ∑´®†¥¨ˆøπåß∂ƒ©˙∆˚¬…æ«≈ç√∫~'
  let randomText = ''
  for (let i = 0; i < length; i++) {
    randomText += specialChars[Math.floor(Math.random() * specialChars.length)]
  }
  return randomText
}

// 执行文本动画效果
const animateText = index => {
  const targetText = welcomeTexts.value[index].final
  const animationDuration = 4 // 动画持续时间（秒）

  gsap.to(
    {},
    {
      duration: animationDuration,
      onUpdate: function () {
        const progress = this.progress()

        // 前60%时间显示随机字符
        if (progress < 0.6) {
          if (progress % 0.1 < 0.01) {
            // 降低随机字符更新频率
            welcomeTexts.value[index].value = generateRandomChars(
              targetText.length,
            )
          }
        }
        // 后40%时间逐步显示正确文本
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

// 组件挂载时启动动画
onMounted(() => {
  // 依次执行每行文本的动画，设置间隔时间
  animateText(0)
  setTimeout(() => animateText(1), 800) // 第二行延迟0.8秒
  setTimeout(() => animateText(2), 1600) // 第三行延迟1.6秒
})
</script>

<template>
  <!-- 登录页面主容器 -->
  <div
    class="h-screen w-full flex flex-col md:flex-row items-center justify-center p-4 gap-8 bg-base-100 overflow-hidden"
  >
    <!-- 欢迎文字区域 -->
    <div
      class="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left animate__animated animate__fadeInLeft"
    >
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
      <!-- 切换标签 -->
      <div class="tabs tabs-boxed bg-base-200 p-1 mb-6 rounded-lg shadow-sm">
        <button
          class="tab tab-lg flex-1 transition-all font-medium border-r-2 border-gray-300"
          :class="{ 'tab-active': $route.path === '/login' }"
          @click="router.push('/login')"
        >
          登录
        </button>
        <button
          class="tab tab-lg flex-1 transition-all font-medium"
          :class="{ 'tab-active': $route.path === '/register' }"
          @click="router.push('/register')"
        >
          注册
        </button>
      </div>

      <!-- 表单卡片 -->
      <div
        class="card bg-base-100 shadow-2xl border border-base-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        <div class="card-body p-8">
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
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
</style>
