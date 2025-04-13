<script setup>

</script>
<template>
  <div class="app flex h-screen">
    <div class="border-base-200 w-60">
      <SiderBarMenu />
    </div>
    <div class="flex-1 overflow-hidden">
      <RouterView />
    </div>
  </div>
</template>
<style scoped></style>
