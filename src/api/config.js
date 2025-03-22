// src/api/config.js - 更新版
import axios from 'axios';
import router from '@/router';
import storage from '@/utils/storage';

// 创建axios实例
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
apiClient.interceptors.request.use(
    config => {
        // 添加认证token
        const token = storage.getData('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
apiClient.interceptors.response.use(
    response => {
        return response;
    },
    async error => {
        const originalRequest = error.config;

        // 如果是401错误并且不是刷新token的请求
        if (error.response && error.response.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== '/auth/refresh') {

            originalRequest._retry = true;
            const refreshToken = storage.getData('refresh_token');

            if (refreshToken) {
                try {
                    // 尝试刷新token
                    const response = await axios.post('http://localhost:8080/api/auth/refresh', {
                        refreshToken
                    });

                    const { token } = response.data;
                    storage.saveData('auth_token', token);

                    // 使用新token重试原请求
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axios(originalRequest);
                } catch (refreshError) {
                    // 刷新token失败，需要重新登录
                    storage.removeData('auth_token');
                    storage.removeData('refresh_token');
                    router.push('/login');
                    return Promise.reject(refreshError);
                }
            } else {
                // 没有刷新token，直接导航到登录页
                router.push('/login');
            }
        }

        // 其他错误处理
        return Promise.reject(error);
    }
);

export default apiClient;
