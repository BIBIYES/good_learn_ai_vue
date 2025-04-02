<script setup>
import TitleBar from '@/components/common/TitleBar.vue'
import { School } from '@icon-park/vue-next'
</script>
<template>
  <div class="app flex flex-col h-full p-4">
    <TitleBar>
      <template v-slot:title>
        <school theme="outline" size="38" />
        <span>我的班级</span>
      </template>
      <template v-slot:module>
        <div class="join">
          <div class="tooltip tooltip-bottom" data-tip="向老师索要教室编号">
            <input
              class="input input-bordered join-item w-full max-w-xs"
              placeholder="输入教室编号来加入教室"
            />
          </div>
          <button class="btn btn-primary join-item" @click="handleAddCouser()">
            加入课程
          </button>
        </div>
      </template>
    </TitleBar>
    <!-- 课程 -->
    <div class="overflow-y-auto"></div>
  </div>
</template>
