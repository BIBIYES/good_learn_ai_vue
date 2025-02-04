<script setup></script>
<template>
  <div class="app flex flex-col h-full p-4">
    <div class="nav-bar flex justify-between items-center h-20">
      <!-- 调整“我的试卷”样式 -->
      <h1 class="text-3xl font-bold text-gray-800 drop-shadow-lg truncate">
        <div class="flex items-center">
          <!-- 标题 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-9"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            ></path>
          </svg>
          我的试卷
        </div>
      </h1>
      <div class="join">
        <div class="tooltip tooltip-bottom" data-tip="向老师索要试卷编号">
          <input
            class="input input-bordered join-item"
            placeholder="输入试卷编号来添加"
          />
        </div>
        <button class="btn join-item rounded-r-full">添加试卷</button>
      </div>
    </div>
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
