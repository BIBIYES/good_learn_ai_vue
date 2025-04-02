<template>
  <div class="app">
    <div
      class="flex h-35 justify-between items-center card-border bg-base-100 overflow-hidden p-5 rounded-md"
    >
      <div
        class="bg-gray-600 w-20 h-20 rounded-md text-5xl flex justify-center items-center"
      >
        <p class="text-[rgba(255,255,255,0.5)]">计</p>
      </div>
      <div class="card-body">
        <h2 class="card-title">
          <slot name="title">Title</slot>
        </h2>
        <p>
          A card component has a figure, a body part, and inside body there are
          title and actions parts
        </p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary">打开试卷</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaperCard',
}
</script>

<style scoped></style>
