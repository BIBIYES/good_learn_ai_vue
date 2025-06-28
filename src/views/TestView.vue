<script setup></script>
<template>
  <div class="my-container bg-blue-500">
    <div class="">
      <el-table :data="tableData" style="width: 100%">
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
}
</style>
