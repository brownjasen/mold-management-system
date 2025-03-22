// src/api/subprocess.js
import apiClient from './config';

export default {
    // 获取子工序详情
    getSubProcessById(id) {
        return apiClient.get(`/sub-processes/${id}`);
    },

    // 获取工序的所有子工序
    getSubProcessesByProcessId(processId) {
        return apiClient.get(`/sub-processes/process/${processId}`);
    },

    // 创建子工序
    createSubProcess(processId, subProcess) {
        return apiClient.post(`/sub-processes/process/${processId}`, subProcess);
    },

    // 开始子工序
    startSubProcess(id) {
        return apiClient.post(`/sub-processes/${id}/start`);
    },

    // 完成子工序
    completeSubProcess(id) {
        return apiClient.post(`/sub-processes/${id}/complete`);
    },

    // 删除子工序
    deleteSubProcess(id) {
        return apiClient.delete(`/sub-processes/${id}`);
    }
};
