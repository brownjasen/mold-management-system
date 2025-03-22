// src/utils/storage.js

// 存储键定义
const STORAGE_KEYS = {
    MOLDS: 'mold_management_molds',
    PROCESSES: 'mold_management_processes',
    MATERIALS: 'mold_management_materials',
    USER_PREFERENCES: 'mold_management_user_preferences'
};

/**
 * 本地存储服务
 */
export default {
    /**
     * 保存数据到本地存储
     * @param {string} key - 存储键名
     * @param {any} data - 要存储的数据
     */
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存数据到本地存储失败:', error);
            return false;
        }
    },

    /**
     * 从本地存储获取数据
     * @param {string} key - 存储键名
     * @param {any} defaultValue - 如果没有数据返回的默认值
     * @returns {any} 存储的数据或默认值
     */
    getData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('从本地存储获取数据失败:', error);
            return defaultValue;
        }
    },

    /**
     * 从本地存储中移除数据
     * @param {string} key - 存储键名
     */
    removeData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('从本地存储移除数据失败:', error);
            return false;
        }
    },

    /**
     * 保存模具数据
     * @param {Array} molds - 模具数据数组
     */
    saveMolds(molds) {
        return this.saveData(STORAGE_KEYS.MOLDS, molds);
    },

    /**
     * 获取模具数据
     * @returns {Array} 模具数据数组
     */
    getMolds() {
        return this.getData(STORAGE_KEYS.MOLDS, []);
    },

    /**
     * 保存工序数据
     * @param {Array} processes - 工序数据数组
     */
    saveProcesses(processes) {
        return this.saveData(STORAGE_KEYS.PROCESSES, processes);
    },

    /**
     * 获取工序数据
     * @returns {Array} 工序数据数组
     */
    getProcesses() {
        return this.getData(STORAGE_KEYS.PROCESSES, []);
    },

    /**
     * 保存辅料数据
     * @param {Array} materials - 辅料数据数组
     */
    saveMaterials(materials) {
        return this.saveData(STORAGE_KEYS.MATERIALS, materials);
    },

    /**
     * 获取辅料数据
     * @returns {Array} 辅料数据数组
     */
    getMaterials() {
        return this.getData(STORAGE_KEYS.MATERIALS, []);
    },

    /**
     * 保存用户首选项
     * @param {Object} preferences - 用户首选项对象
     */
    saveUserPreferences(preferences) {
        return this.saveData(STORAGE_KEYS.USER_PREFERENCES, preferences);
    },

    /**
     * 获取用户首选项
     * @returns {Object} 用户首选项对象
     */
    getUserPreferences() {
        return this.getData(STORAGE_KEYS.USER_PREFERENCES, {});
    }
};
