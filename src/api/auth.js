// src/api/auth.js
import apiClient from './config';

export default {
    /**
     * 用户登录
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise<Object>} 返回包含token的响应
     */
    login(username, password) {
        return apiClient.post('/auth/login', { username, password });
    },

    /**
     * 用户注册
     * @param {Object} userData - 用户数据
     * @returns {Promise<Object>} 返回新用户数据
     */
    register(userData) {
        return apiClient.post('/auth/register', userData);
    },

    /**
     * 获取当前用户信息
     * @returns {Promise<Object>} 返回用户信息
     */
    getCurrentUser() {
        return apiClient.get('/auth/me');
    },

    /**
     * 刷新认证token
     * @returns {Promise<Object>} 返回新token
     */
    refreshToken() {
        return apiClient.post('/auth/refresh');
    },

    /**
     * 用户登出
     * @returns {Promise<void>}
     */
    logout() {
        return apiClient.post('/auth/logout');
    }
};
