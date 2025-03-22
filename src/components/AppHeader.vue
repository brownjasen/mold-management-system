<!-- src/components/AppHeader.vue -->
<template>
  <div class="app-header">
    <div class="logo">
      <h2>模具管理系统</h2>
    </div>

    <div class="nav-links">
      <el-button-group>
        <el-button
            :type="activeRoute === '/' ? 'primary' : 'default'"
            @click="$router.push('/')">
          模具列表
        </el-button>
        <el-button
            :type="activeRoute === '/materials' ? 'primary' : 'default'"
            @click="$router.push('/materials')">
          辅料管理
        </el-button>
      </el-button-group>
    </div>



    <div class="user-area" v-if="auth.state.isAuthenticated">
      <el-dropdown @command="handleCommand">
        <span class="user-dropdown">
          {{ auth.state.user?.name || auth.state.user?.username }}
          <i class="el-icon-arrow-down"></i>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import authStore from '@/store/auth';
import { ElMessage } from 'element-plus';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();

    const activeRoute = computed(() => route.path);

    // 处理下拉菜单命令
    const handleCommand = async (command) => {
      if (command === 'logout') {
        try {
          await authStore.logout();
          ElMessage.success('已成功退出登录');
          router.push('/login');
        } catch (error) {
          ElMessage.error('退出登录失败');
        }
      } else if (command === 'profile') {
        router.push('/profile');
      }
    };

    // 组件加载时获取用户信息
    onMounted(async () => {
      if (authStore.state.isAuthenticated && !authStore.state.user) {
        await authStore.loadUser();
      }
    });

    return {
      auth: authStore,
      activeRoute,
      handleCommand
    };
  }
};
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  margin-bottom: 20px;
}

.logo h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #409EFF;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.user-dropdown i {
  margin-left: 5px;
}
</style>
