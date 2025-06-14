<template>
  <div class="flex flex-col items-center">
    <span class="loading loading-ball text-primary loading-xl"></span>
    <span class="shimmer-text">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '正在加载...',
  },
})
</script>

<style lang="scss" scoped>
.shimmer-text {
  position: relative;
  display: inline-block;
  color: rgba(0, 0, 0, 0.2);
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.2) 25%,
    rgba(0, 0, 0, 0.8) 50%,
    rgba(0, 0, 0, 0.2) 75%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 2s infinite linear;
  font-weight: 500;
  margin-top: 0.75rem;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
