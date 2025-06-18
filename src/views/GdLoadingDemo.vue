<template>
  <div>
    <div
      class="container mx-auto p-4 h-screen flex items-center justify-center"
    >
      <div class="card bg-base-100 shadow-xl w-full max-w-lg">
        <div class="card-body">
          <div class="bg-gray-100 p-4 rounded-lg loading-demo-container">
            <GdLoadingText />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import GdLoadingText from '@/components/common/GdLoadingText.vue'
</script>

<style scoped>
.loading-demo-container {
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 导入像素字体 */
@font-face {
  font-family: 'Fusion';
  src: url('@/assets/font/fusion.otf') format('opentype');
  font-display: swap;
}
</style>
