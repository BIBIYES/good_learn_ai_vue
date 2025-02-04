<template>
  <div class="app">
    <div class="card card-border bg-base-100">
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

<style scoped>
/* 如果需要自定义样式，可以在这里添加 */
</style>
