<script setup>
import { onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import router from '@/router'

const texts = ref([
  { value: '', final: '欢迎使用好助学!😄' },
  { value: '', final: 'Welcome to' },
  { value: '', final: 'good learn!' },
])

// 生成随机乱码（增加更多字符让变化更丰富）
const generateRandomChars = (length) => {
  const chars =
    '!@#$%^&*()_+~`|}{[]:;?><,./-=¢∞§¶•ªº–≠œ∑´®†¥¨ˆøπåß∂ƒ©˙∆˚¬…æ«≈ç√∫~'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

const runTextAnimation = (index) => {
  const finalText = texts.value[index].final
  const duration = 4 // 增加总时长（秒）

  gsap.to(
    {},
    {
      duration,
      onUpdate: function () {
        const progress = this.progress()

        // 前60%时间显示慢速乱码（原70%减少到60%）
        if (progress < 0.6) {
          // 添加节流控制，让乱码变化速度减半
          if (progress % 0.1 < 0.01) {
            // 每5%进度才更新一次乱码
            texts.value[index].value = generateRandomChars(finalText.length)
          }
        }
        // 后40%时间逐渐修正（原30%增加到40%）
        else {
          const correctRatio = (progress - 0.6) / 0.4
          const correctLength = Math.floor(finalText.length * correctRatio)
          texts.value[index].value =
            finalText.substring(0, correctLength) +
            generateRandomChars(finalText.length - correctLength)
        }
      },
      onComplete: () => {
        texts.value[index].value = finalText
      },
    },
  )
}

onMounted(() => {
  // 增加行间延迟，让动画更有序
  runTextAnimation(0)
  setTimeout(() => runTextAnimation(1), 800) // 第二行延迟0.8秒
  setTimeout(() => runTextAnimation(2), 1600) // 第三行延迟1.6秒
})
</script>

<template>
  <div
    class="h-screen w-full flex flex-col md:flex-row items-center justify-center p-4 gap-8 bg-base-100 overflow-hidden"
  >
    <!-- 欢迎文字区域 (保持不变) -->
    <div
      class="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left animate__animated animate__fadeInLeft"
    >
      <p class="text-5xl mb-10 font-bold">{{ texts[0].value }}</p>
      <p class="text-3xl italic">{{ texts[1].value }}</p>
      <p class="text-3xl italic">{{ texts[2].value }}</p>
    </div>

    <div class="w-full md:w-96">
      <div class="tabs tabs-boxed bg-base-200 p-1 mb-6 rounded-lg shadow-sm">
        <button
          @click="router.push('/login')"
          class="tab tab-lg flex-1 transition-all font-medium border-r-2 border-gray-300"
          :class="{ 'tab-active': $route.path === '/login' }"
        >
          登录
        </button>
        <button
          @click="router.push('/register')"
          class="tab tab-lg flex-1 transition-all font-medium"
          :class="{ 'tab-active': $route.path === '/register' }"
        >
          注册
        </button>
      </div>

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
/* 保持原有字体样式 */
@font-face {
  font-family: 'Fusion';
  src: url('@/assets/font/fusion.otf') format('opentype');
  font-display: swap;
}

* {
  font-family: 'Fusion', sans-serif;
}
</style>
