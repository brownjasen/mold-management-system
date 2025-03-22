// src/api/repair.js
import apiClient from './config';

export default {
    // 获取所有返修记录
    getAllRepairRecords() {
        return apiClient.get('/repair-records');
    },

    // 获取单个返修记录
    getRepairRecordById(id) {
        return apiClient.get(`/repair-records/${id}`);
    },

    // 获取模具的所有返修记录
    getRepairRecordsByMoldId(moldId) {
        return apiClient.get(`/repair-records/mold/${moldId}`);
    },

    // 获取特定状态的返修记录
    getRepairRecordsByStatus(status) {
        return apiClient.get(`/repair-records/status/${status}`);
    },

    // 创建返修记录
    createRepairRecord(moldId, repairRecord) {
        return apiClient.post(`/repair-records/mold/${moldId}`, repairRecord);
    },

    // 开始返修
    startRepair(id) {
        return apiClient.post(`/repair-records/${id}/start`);
    },

    // 完成返修
    completeRepair(id) {
        return apiClient.post(`/repair-records/${id}/complete`);
    },

    // 更新返修记录
    updateRepairRecord(id, repairRecord) {
        return apiClient.put(`/repair-records/${id}`, repairRecord);
    },

    // 删除返修记录
    deleteRepairRecord(id) {
        return apiClient.delete(`/repair-records/${id}`);
    }
};
