<script setup>
// 组件接收父组件传递的属性

import { defineProps } from 'vue'

// 接收父组件传递的属性
const props = defineProps(['img'])
</script>
<template>
  <div class="app">
    <img :src="props.img" alt="" class="rounded-4xl w-full h-full" />
  </div>
</template>
<style></style>
