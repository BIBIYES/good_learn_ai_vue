<script setup>
import { useComponentsStore } from '@/stores/components'
const componentsStore = useComponentsStore()
</script>
<template>
  <div class="app flex h-screen bg-base-200/50">
    <div
      class="sidebar-container"
      :class="{
        'sidebar-visible': !componentsStore.aiSideBarStatus,
        'sidebar-hidden': componentsStore.aiSideBarStatus,
      }"
    >
      <SiderBarMenu />
    </div>
    <div class="flex-1 overflow-hidden transition-all duration-300">
      <RouterView />
    </div>
  </div>
</template>
<style scoped>
.sidebar-container {
  width: 260px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.sidebar-hidden {
  width: 0;
  opacity: 0;
  margin-left: -20px;
}

.sidebar-visible {
  width: 260px;
  opacity: 1;
  margin-left: 0;
}
</style>
