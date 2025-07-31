<script setup></script>
<template>
  <div class="my-container">
    <div class="g-sidebar"></div>
    <div class="g-main">
      <el-table :data="tableData">
        <el-table-column prop="date" label="Date" width="180" />
        <el-table-column prop="name" label="Name" width="180" />
        <el-table-column prop="address" label="Address" />
      </el-table>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.my-container {
  width: 100%;
  height: 100vh;
  display: flex;
}
.g-sidebar {
  width: 200px;
  height: 100%;
  background-color: #f0f0f0;
}
.g-main {
  padding: 1rem;
  flex: 1;
  height: 100%;
  background-color: skyblue;
  overflow-x: auto;
}
</style>
