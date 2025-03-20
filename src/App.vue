<script setup>
// 不需要导入MoldListView，路由会自动处理组件加载
</script>

<template>
  <div class="app-container">
    <router-view></router-view>
  </div>
</template>

<style>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%; /* 添加这行确保容器占满可用宽度 */
  box-sizing: border-box; /* 确保padding不会增加元素实际宽度 */
}

body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f7fa;
}
</style>
