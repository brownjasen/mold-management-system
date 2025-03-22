// src/services/cache.js
import storage from '@/utils/storage';
import processAPI from '@/api/process';

// 缓存同步队列
const syncQueue = [];
let isSyncing = false;

/**
 * 缓存服务 - 结合API和本地存储实现数据持久化
 */
export default {
    /**
     * 获取工序详情（带缓存）
     * @param {string|number} processId - 工序ID
     * @returns {Promise<Object>} 工序详情
     */
    async getProcessWithCache(processId) {
        try {
            // 尝试从API获取最新数据
            const response = await processAPI.getProcessById(processId);
            const processData = response.data;

            // 获取所有缓存的工序
            const cachedProcesses = storage.getProcesses();

            // 更新缓存
            const index = cachedProcesses.findIndex(p => p.id == processId);
            if (index !== -1) {
                cachedProcesses[index] = processData;
            } else {
                cachedProcesses.push(processData);
            }

            // 保存到本地存储
            storage.saveProcesses(cachedProcesses);

            return processData;
        } catch (error) {
            console.error('从API获取工序失败:', error);

            // 如果API失败，尝试从缓存获取
            const cachedProcesses = storage.getProcesses();
            const cachedProcess = cachedProcesses.find(p => p.id == processId);

            if (cachedProcess) {
                console.log('使用缓存的工序数据');
                return cachedProcess;
            }

            // 如果缓存中也没有，则抛出错误
            throw new Error('无法获取工序数据');
        }
    },

    /**
     * 获取子工序列表（带缓存）
     * @param {string|number} processId - 工序ID
     * @returns {Promise<Array>} 子工序列表
     */
    async getSubProcessesWithCache(processId) {
        try {
            // 尝试从API获取最新数据
            const response = await processAPI.getSubProcessesByProcessId(processId);
            const subProcesses = response.data;

            // 保存到本地存储(作为工序的一部分)
            const cachedProcesses = storage.getProcesses();
            const processIndex = cachedProcesses.findIndex(p => p.id == processId);

            if (processIndex !== -1) {
                cachedProcesses[processIndex].subProcesses = subProcesses;
                storage.saveProcesses(cachedProcesses);
            }

            return subProcesses;
        } catch (error) {
            console.error('从API获取子工序失败:', error);

            // 如果API失败，尝试从缓存获取
            const cachedProcesses = storage.getProcesses();
            const cachedProcess = cachedProcesses.find(p => p.id == processId);

            if (cachedProcess && cachedProcess.subProcesses) {
                console.log('使用缓存的子工序数据');
                return cachedProcess.subProcesses;
            }

            // 如果缓存中也没有，则返回空数组
            return [];
        }
    },

    /**
     * 将操作添加到同步队列，在网络恢复后执行
     * @param {Function} operation - 要执行的操作函数
     * @param {string} description - 操作描述
     */
    addToSyncQueue(operation, description) {
        syncQueue.push({ operation, description });

        // 保存同步队列到本地存储
        storage.saveData('sync_queue', syncQueue.map(item => ({
            description: item.description,
            timestamp: new Date().toISOString()
        })));

        // 如果在线，尝试立即同步
        if (navigator.onLine && !isSyncing) {
            this.processSyncQueue();
        }
    },

    /**
     * 处理同步队列
     * @returns {Promise<void>}
     */
    async processSyncQueue() {
        if (syncQueue.length === 0 || isSyncing || !navigator.onLine) {
            return;
        }

        isSyncing = true;

        try {
            while (syncQueue.length > 0 && navigator.onLine) {
                const item = syncQueue[0];
                console.log(`执行同步操作: ${item.description}`);

                try {
                    await item.operation();
                    // 操作成功，从队列中移除
                    syncQueue.shift();
                } catch (error) {
                    console.error(`同步操作失败: ${item.description}`, error);
                    // 如果网络仍然在线但操作失败，可能是其他错误
                    // 移到队列末尾，稍后再尝试
                    const failedItem = syncQueue.shift();
                    syncQueue.push(failedItem);

                    // 避免无限循环
                    break;
                }
            }
        } finally {
            isSyncing = false;

            // 更新本地存储中的队列
            storage.saveData('sync_queue', syncQueue.map(item => ({
                description: item.description,
                timestamp: new Date().toISOString()
            })));
        }
    },

    /**
     * 检查并尝试同步未完成的操作
     */
    checkAndSync() {
        // 如果网络在线且不在同步过程中，尝试处理队列
        if (navigator.onLine && !isSyncing) {
            this.processSyncQueue();
        }
    }
};

// 添加网络状态监听
window.addEventListener('online', () => {
    console.log('网络已恢复，尝试同步数据');
    cache.checkAndSync();
});
