<script setup></script>
<template>
  <div class="app">
    <div class="nav-bar flex justify-between items-center h-20">
      <!-- 调整“我的试卷”样式 -->
      <h1 class="text-3xl font-bold text-gray-800 drop-shadow-lg truncate">
        <!-- 标题 -->
        <div class="flex items-center justify-center">
          <slot
            name="title"
            class="flex items-center justify-center space-x-2"
          ></slot>
        </div>
      </h1>
      <div class="module">
        <slot name="module"></slot>
      </div>
    </div>
  </div>
</template>
<style></style>
