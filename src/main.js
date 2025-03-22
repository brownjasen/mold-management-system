import './assets/main.css'

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import authStore from './store/auth';

// 创建应用实例
const app = createApp(App);

// 应用配置
app.use(router);
app.use(ElementPlus);

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
    console.error('全局错误:', err, vm, info);
};

// 初始化auth状态
if (authStore.state.isAuthenticated) {
    authStore.loadUser().then(() => {
        // 用户信息加载完成后挂载应用
        app.mount('#app');
    }).catch(error => {
        console.error('加载用户信息失败:', error);
        // 即使用户信息加载失败，也挂载应用
        app.mount('#app');
    });
} else {
    // 未登录状态直接挂载应用
    app.mount('#app');
}
