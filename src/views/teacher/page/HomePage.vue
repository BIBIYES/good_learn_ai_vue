<script setup lang="ts">
import TitleBar from '@/components/common/TitleBar.vue'
import { Home } from '@icon-park/vue-next'
</script>

<template>
  <div class="app p-4">
    <div class="nav-bar flex justify-between h-20 items-center">
      <TitleBar>
        <template v-slot:title>
          <Home theme="outline" size="38" />
          <span>首页</span>
          <p>你好老师欢迎你</p>
        </template>
      </TitleBar>
    </div>
  </div>
</template>
