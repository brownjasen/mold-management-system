// src/services/errorLogger.js
import storage from '@/utils/storage';

// 错误日志的最大数量
const MAX_LOGS = 100;

export default {
    /**
     * 记录错误
     * @param {Error} error - 错误对象
     * @param {string} context - 错误发生的上下文
     * @param {Object} extraData - 额外数据
     */
    logError(error, context, extraData = {}) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            context,
            extraData,
            userAgent: navigator.userAgent
        };

        // 获取现有日志
        const logs = storage.getData('error_logs', []);

        // 添加新日志
        logs.unshift(errorLog);

        // 保持日志数量在限制内
        if (logs.length > MAX_LOGS) {
            logs.length = MAX_LOGS;
        }

        // 保存日志
        storage.saveData('error_logs', logs);

        // 输出到控制台（开发环境）
        if (process.env.NODE_ENV !== 'production') {
            console.error(`[${context}] ${error.message}`, error, extraData);
        }

        // 可以在这里添加将错误发送到服务器的代码
    },

    /**
     * 获取错误日志
     * @returns {Array} 错误日志数组
     */
    getErrorLogs() {
        return storage.getData('error_logs', []);
    },

    /**
     * 清除错误日志
     */
    clearErrorLogs() {
        storage.removeData('error_logs');
    }
};
