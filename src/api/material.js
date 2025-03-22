// src/api/material.js
import apiClient from './config';

export default {
    // 获取所有辅料
    getAllMaterials() {
        return apiClient.get('/materials');
    },

    // 获取单个辅料
    getMaterialById(id) {
        return apiClient.get(`/materials/${id}`);
    },

    // 获取库存不足的辅料
    getLowStockMaterials() {
        return apiClient.get('/materials/low-stock');
    },

    // 搜索辅料
    searchMaterials(query) {
        return apiClient.get(`/materials/search?query=${query}`);
    },

    // 创建辅料
    createMaterial(material) {
        return apiClient.post('/materials', material);
    },

    // 更新辅料
    updateMaterial(id, material) {
        return apiClient.put(`/materials/${id}`, material);
    },

    // 入库操作
    stockIn(id, quantity) {
        return apiClient.post(`/materials/${id}/stock-in?quantity=${quantity}`);
    },

    // 出库操作
    stockOut(id, quantity) {
        return apiClient.post(`/materials/${id}/stock-out?quantity=${quantity}`);
    },

    // 删除辅料
    deleteMaterial(id) {
        return apiClient.delete(`/materials/${id}`);
    }
};
