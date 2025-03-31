<script setup>
defineProps({
  // 标题图标大小
  iconSize: {
    type: Number,
    default: 38,
  },
  // 标题间距
  titleGap: {
    type: Number,
    default: 2,
  },
})
</script>

<template>
  <div class="app w-full">
    <div class="nav-bar flex justify-between items-center h-20 gap-4">
      <h1
        class="text-3xl font-bold text-gray-800 drop-shadow-lg truncate flex-shrink-0"
      >
        <div class="flex items-end gap-3">
          <!-- 触发开启关闭侧边栏 -->

          <slot name="title"></slot>
        </div>
      </h1>
      <div class="module flex items-center gap-2 flex-grow justify-end">
        <slot name="module"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-bar {
  transition: all 0.3s ease;
}

@media (max-width: 640px) {
  .nav-bar {
    flex-direction: column;
    height: auto;
    gap: 1rem;
  }

  .module {
    width: 100%;
  }
}
</style>
