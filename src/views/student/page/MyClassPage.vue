<script setup></script>
<template>
  <div class="app flex flex-col h-full p-4">
    <div class="nav-bar flex justify-between items-center h-20">
      <!-- 调整“我的试卷”样式 -->
      <h1 class="text-3xl font-bold text-gray-800 drop-shadow-lg truncate">
        <!-- 标题 -->
        <div class="flex items-center">
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
              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
            ></path>
          </svg>
          加入的教室
        </div>
      </h1>
      <div class="join">
        <div class="tooltip tooltip-bottom" data-tip="向老师索要教室编号">
          <input
            class="input input-bordered join-item"
            placeholder="输入教室编号来加入教室"
          />
        </div>
        <button class="btn join-item rounded-r-full">添加添加教室</button>
      </div>
    </div>
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
