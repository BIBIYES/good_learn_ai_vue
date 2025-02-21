<script setup>
import TitleBar from '@/components/common/TitleBar.vue'
import { School } from '@icon-park/vue-next'
</script>
<template>
  <div class="app flex flex-col h-full p-4">
    <TitleBar>
      <template v-slot:title
        ><school theme="outline" size="38" />我的班级</template
      >
      <template v-slot:module
        ><div class="tooltip tooltip-bottom" data-tip="向老师索要教室编号">
          <input
            class="input input-bordered join-item"
            placeholder="输入教室编号来加入教室"
          />
        </div>
        <button class="btn join-item rounded-r-full">
          添加添加教室
        </button></template
      >
    </TitleBar>
    <!-- 试卷 -->
    <div
      class="grid grid-cols-1 rounded-2xl pr-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-content-start h-full overflow-y-auto"
    >
      <TestPaperBox v-for="i in 20" :key="i">
        <template #title>
          <div>Linux教室-301班级</div>
        </template>
        <template #author>
          <div>傅顺</div>
        </template>
        <template #date>
          <div>2024-2-3</div>
        </template>
      </TestPaperBox>
    </div>
  </div>
</template>
