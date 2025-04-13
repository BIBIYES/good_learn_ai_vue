<script setup>
import SiderBarMenu from '@/components/AI/SiderBarMenu.vue'
</script>
<template>
  <div class="app flex h-screen">
    <div class="border-base-200 w-50">
      <SiderBarMenu></SiderBarMenu>
    </div>
    <div class="flex-1 overflow-hidden">
      <RouterView></RouterView>
    </div>
  </div>
</template>
<style scoped></style>
