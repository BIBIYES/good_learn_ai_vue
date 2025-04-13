<script setup>
import TitleBar from '@/components/common/TitleBar.vue'

import { DocumentFolder } from '@icon-park/vue-next'
</script>
<template>
  <div class="app flex flex-col h-full p-4">
    <TitleBar>
      <template #title>
        <document-folder
          theme="outline"
          size="38"
        />
        <span>我的试卷</span>
      </template>
      <template #module>
        <div class="join">
          <div
            class="tooltip tooltip-bottom"
            data-tip="输入试卷编号"
          >
            <input
              class="input input-bordered join-item w-full max-w-xs"
              placeholder="输入试卷编号来添加试卷"
            >
          </div>
          <button class="btn btn-primary join-item">
            添加试卷
          </button>
        </div>
      </template>
    </TitleBar>
    <!-- 试卷 -->
    <div
      class="grid grid-cols-1 rounded-2xl pr-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-content-start h-full overflow-y-auto"
    />
  </div>
</template>
