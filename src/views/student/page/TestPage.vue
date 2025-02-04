<script setup>
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { onMounted } from 'vue'

// 正确注册 ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger)

onMounted(() => {
  gsap.from('.img-box', {
    x: -1000,
    duration: 1,
    ease: 'power1.inOut',
    scrollTrigger: {
      trigger: '.img-box',
      start: 'top center',
      end: 'top center',
      // markers: true,
      toggleActions: 'play none reverse none', // 关键配置
    },
  })
  gsap.to('.qiu', {
    x: '300',
    duration: 2,
    // 缓动效果（可选）
    ease: 'power1.out',
  })
})
</script>
<template>
  <div class="app bg-red-500 h-screen w-full">
    <div class="box1 h-screen w-full bg-yellow-200">
      <div class="qiu w-50 h-50 bg-sky-300 rounded-full"></div>
    </div>
    <div
      class="box2 h-screen w-full bg-sky-200 flex justify-center items-center"
    >
      <div class="img-box grid grid-cols-4 gap-4 bg-amber-700">
        <img src="../../../assets/author/ckl.png" alt="" />
        <img src="../../../assets/author/lh.png" alt="" />
        <img src="../../../assets/author/lzh.png" alt="" />
        <img src="../../../assets/author/zzx.png" alt="" />
      </div>
    </div>
  </div>
</template>
