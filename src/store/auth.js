// src/store/auth.js
import { reactive, readonly } from 'vue';
import authAPI from '@/api/auth';
import storage from '@/utils/storage';

const state = reactive({
    user: null,
    token: storage.getData('auth_token'),
    isAuthenticated: !!storage.getData('auth_token'),
    loading: false,
    error: null
});

const getters = {
    isAdmin: () => state.user && state.user.role === 'ADMIN',
    isUser: () => state.user && state.user.role === 'USER'
};

const actions = {
    /**
     * 用户登录
     * @param {string} username - 用户名
     * @param {string} password - 密码
     */
    async login(username, password) {
        state.loading = true;
        state.error = null;

        try {
            const response = await authAPI.login(username, password);
            const { token, refreshToken, user } = response.data;

            // 保存认证信息
            storage.saveData('auth_token', token);
            storage.saveData('refresh_token', refreshToken);

            // 更新状态
            state.token = token;
            state.user = user;
            state.isAuthenticated = true;

            return user;
        } catch (error) {
            state.error = error.response?.data?.message || '登录失败';
            throw error;
        } finally {
            state.loading = false;
        }
    },

    /**
     * 用户注册
     * @param {Object} userData - 用户数据
     */
    async register(userData) {
        state.loading = true;
        state.error = null;

        try {
            const response = await authAPI.register(userData);
            return response.data;
        } catch (error) {
            state.error = error.response?.data?.message || '注册失败';
            throw error;
        } finally {
            state.loading = false;
        }
    },

    /**
     * 加载当前用户信息
     */
    async loadUser() {
        if (!state.token) return null;

        state.loading = true;

        try {
            const response = await authAPI.getCurrentUser();
            state.user = response.data;
            return state.user;
        } catch (error) {
            // Token可能已过期
            state.error = error.response?.data?.message || '获取用户信息失败';
            state.user = null;
            state.isAuthenticated = false;
            storage.removeData('auth_token');
            storage.removeData('refresh_token');
        } finally {
            state.loading = false;
        }
    },

    /**
     * 用户登出
     */
    async logout() {
        try {
            if (state.token) {
                await authAPI.logout();
            }
        } catch (error) {
            console.error('登出时发生错误:', error);
        } finally {
            // 清除本地存储的认证信息
            storage.removeData('auth_token');
            storage.removeData('refresh_token');

            // 重置状态
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        }
    }
};

// 创建并导出auth store
export default {
    state: readonly(state),
    ...getters,
    ...actions
};
