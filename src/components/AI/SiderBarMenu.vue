<script setup>
import HistoryCard from './HistoryCard.vue'
</script>

<template>
  <div class="app h-screen">
    <div class="sidebar-container h-screen flex flex-col pt-2">
      <div class="btn w-full mb-7">智识顾问</div>
      <!--  历史会话组件 -->
      <HistoryCard />
    </div>
  </div>
</template>

<style scoped></style>
