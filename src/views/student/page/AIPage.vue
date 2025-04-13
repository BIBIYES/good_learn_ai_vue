<script setup>

</script>
<template>
  <div class="app flex h-screen bg-base-200/50 pl-1.5">
    <div class="w-60">
      <SiderBarMenu />
    </div>
    <div class="flex-1 overflow-hidden p-1.5">
      <RouterView />
    </div>
  </div>
</template>
<style scoped></style>
