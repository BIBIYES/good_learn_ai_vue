<template>
  <div class="bg-base-200 py-2">
    <div class="container mx-auto">
      <div class="flex items-center justify-between">
        <div class="text-lg font-bold">组件演示</div>
        <div class="flex gap-4">
          <router-link
            to="/gd-loading-demo"
            class="btn btn-sm"
            active-class="btn-primary"
          >
            GdLoading演示
          </router-link>
          <router-link
            to="/about"
            class="btn btn-sm"
            active-class="btn-primary"
          >
            关于页面
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 导航组件，用于演示页面间的导航
</script>
