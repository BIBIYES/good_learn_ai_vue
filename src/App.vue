<script setup></script>
<template>
  <div class="g-container">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>
<style scoped>
.g-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
