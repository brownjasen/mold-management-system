// src/api/mold.js
import apiClient from './config';

export default {
    // 获取所有模具
    getAllMolds() {
        return apiClient.get('/molds');
    },

    // 获取单个模具
    getMoldById(id) {
        return apiClient.get(`/molds/${id}`);
    },

    // 创建模具
    createMold(mold) {
        return apiClient.post('/molds', mold);
    },

    // 更新模具
    updateMold(id, mold) {
        return apiClient.put(`/molds/${id}`, mold);
    },

    // 删除模具
    deleteMold(id) {
        return apiClient.delete(`/molds/${id}`);
    },

    // 开始设计
    startDesign(id) {
        return apiClient.post(`/molds/${id}/start-design`);
    }
};
