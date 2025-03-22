<!-- src/components/NetworkStatus.vue -->
<template>
  <div
      class="network-status"
      v-if="!isOnline"
  >
    <el-alert
        title="网络已断开"
        type="error"
        :closable="false"
        show-icon
        description="您已离线。部分功能可能不可用，正在使用缓存数据。"
    >
      <template #default>
        <el-button size="small" @click="checkConnection">重试连接</el-button>
      </template>
    </el-alert>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  setup() {
    const isOnline = ref(navigator.onLine);

    const updateOnlineStatus = () => {
      isOnline.value = navigator.onLine;
    };

    const checkConnection = async () => {
      try {
        // 尝试发送一个简单请求来检查网络连接
        const result = await fetch('/api/health-check', {
          method: 'HEAD',
          cache: 'no-store'
        });
        isOnline.value = result.ok;
      } catch (error) {
        isOnline.value = false;
      }
    };

    onMounted(() => {
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      // 初始检查
      checkConnection();
    });

    onUnmounted(() => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    });

    return {
      isOnline,
      checkConnection
    };
  }
};
</script>

<style scoped>
.network-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  width: 300px;
}
</style>
