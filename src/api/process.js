// src/api/process.js
import apiClient from './config';

export default {
    // 获取工序详情
    getProcessById(id) {
        return apiClient.get(`/processes/${id}`);
    },

    // 获取模具的特定类型工序
    getProcessesByMoldAndType(moldId, moduleType) {
        return apiClient.get(`/processes/mold/${moldId}/module/${moduleType}`);
    },

    // 创建工序
    createProcess(moldId, process) {
        return apiClient.post(`/processes/mold/${moldId}`, process);
    },

    // 开始工序
    startProcess(id) {
        return apiClient.post(`/processes/${id}/start`);
    },

    // 完成工序
    completeProcess(id) {
        return apiClient.post(`/processes/${id}/complete`);
    },

    // 更新工序
    updateProcess(id, process) {
        return apiClient.put(`/processes/${id}`, process);
    },

    // 删除工序
    deleteProcess(id) {
        return apiClient.delete(`/processes/${id}`);
    }
};
