<script setup>
import { DocumentFolder } from '@icon-park/vue-next'
</script>
<template>
  <div class="app flex flex-col h-full p-4">
    <TitleBar>
      <template v-slot:title
        ><document-folder theme="outline" size="38" /><span
          >我的试卷</span
        ></template
      >
      <template v-slot:module
        ><div class="tooltip tooltip-bottom" data-tip="向老师索要教室编号">
          <input
            class="input input-bordered join-item"
            placeholder="输入试卷来添加试卷"
          />
        </div>
        <button class="btn join-item rounded-r-full">添加试卷</button></template
      >
    </TitleBar>
    <!-- 试卷 -->
    <div
      class="grid grid-cols-1 rounded-2xl pr-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-content-start h-full overflow-y-auto"
    >
      <TestPaperBox v-for="i in 20" :key="i">
        <template #title>
          <div>数学模拟一卷子</div>
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
