<script setup>
import NetworkStatus from './components/NetworkStatus.vue';
import AppHeader from './components/AppHeader.vue';
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <div class="content">
      <router-view></router-view>
    </div>
    <NetworkStatus />
  </div>
</template>

<style>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.content {
  padding: 20px;
}

body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f7fa;
}
</style>
