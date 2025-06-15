<script setup>
import { useComponentsStore } from '@/stores/components'
const componentsStore = useComponentsStore()
</script>
<template>
  <div class="app flex h-screen bg-base-200/50">
    <div
      class="w-65"
      :class="{
        hidden: componentsStore.aiSideBarStatus,
      }"
    >
      <SiderBarMenu />
    </div>
    <div class="flex-1 overflow-hidden p-1.5">
      <RouterView />
    </div>
  </div>
</template>
<style scoped></style>
