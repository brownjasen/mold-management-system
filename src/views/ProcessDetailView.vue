<template>
  <div class="process-detail">
    <div class="header">
      <el-button @click="goBack">返回</el-button>
      <h2>工序详情: {{ processName }}</h2>
    </div>

    <!-- 工序基本信息 -->
    <el-card class="info-card">
      <el-descriptions title="工序信息" :column="3" border>
        <el-descriptions-item label="工序名称">{{ processName }}</el-descriptions-item>
        <el-descriptions-item label="所属模具">{{ moldCode }}</el-descriptions-item>
        <el-descriptions-item label="权重">{{ processWeight }}%</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ startTime || '未开始' }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ endTime || '未完成' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(status)">{{ getStatusText(status) }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 子工序列表 -->
    <el-card class="sub-process-card">
      <template #header>
        <div class="card-header">
          <span>子工序列表</span>
          <el-button type="primary" size="small" @click="showAddSubProcessDialog">添加子工序</el-button>
        </div>
      </template>

      <el-table :data="subProcesses" border stripe>
        <el-table-column prop="name" label="名称" width="150"></el-table-column>
        <el-table-column prop="weight" label="权重(%)" width="100"></el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180"></el-table-column>
        <el-table-column prop="endTime" label="完成时间" width="180"></el-table-column>
        <el-table-column label="操作" min-width="220">
          <template #default="scope">
            <div class="button-group">
              <el-button
                  size="small"
                  @click="startSubProcess(scope.row)"
                  :disabled="scope.row.status !== 'notStarted'"
                  type="primary">
                开始
              </el-button>
              <el-button
                  size="small"
                  @click="completeSubProcess(scope.row)"
                  :disabled="scope.row.status !== 'inProgress'"
                  type="success">
                完成
              </el-button>
              <el-button
                  size="small"
                  type="danger"
                  @click="deleteSubProcess(scope.row)"
                  :disabled="scope.row.status !== 'notStarted'">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 子工序完成度 -->
      <div class="progress-container">
        <span>完成度:</span>
        <el-progress :percentage="subProcessCompletionRate" :status="subProcessStatus"></el-progress>
      </div>
    </el-card>

    <!-- 添加子工序对话框 -->
    <el-dialog v-model="addSubProcessVisible" title="添加子工序" width="30%">
      <el-form :model="newSubProcess" label-width="100px">
        <el-form-item label="子工序名称">
          <el-input v-model="newSubProcess.name" placeholder="请输入子工序名称"></el-input>
        </el-form-item>
        <el-form-item label="权重(%)">
          <el-input-number v-model="newSubProcess.weight" :min="0.1" :max="100" :step="0.1"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="addSubProcessVisible = false">取消</el-button>
          <el-button type="primary" @click="addSubProcess">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import processAPI from '@/api/process.js';
import { ElMessage } from 'element-plus';
import cacheService from '@/services/cache';

export default {
  data() {
    return {
      moldId: '',
      processId: '',
      moldCode: '',
      processName: '',
      processWeight: 0,
      status: 'notStarted',
      startTime: '',
      endTime: '',

      // 子工序数据
      subProcesses: [],
      subProcessCompletionRate: 0,
      subProcessStatus: 'exception',

      // 添加子工序对话框
      addSubProcessVisible: false,
      newSubProcess: {
        name: '',
        weight: 1
      },

      // 添加loading状态
      loading: false
    }
  },
  mounted() {
    // 获取路由参数
    if (this.$route) {
      this.moldId = this.$route.params.moldId;
      this.processId = this.$route.params.processId;
    }

    // 加载工序数据
    this.loadProcessData();
  },
  methods: {
    // 返回上一页
    goBack() {
      this.$router.push(`/mold/${this.moldId}`);
    },

    // 加载工序数据
    async loadProcessData() {
      this.loading = true;
      try {
        // 使用缓存服务获取数据
        const processData = await cacheService.getProcessWithCache(this.processId);

        this.processName = processData.name;
        this.processWeight = processData.weight;
        this.status = processData.status;
        this.startTime = processData.startTime;
        this.endTime = processData.endTime;
        this.moldCode = processData.mold ? processData.mold.moldCode : '';

        // 获取子工序列表
        this.subProcesses = await cacheService.getSubProcessesWithCache(this.processId);

        // 计算子工序完成率
        this.updateSubProcessCompletionRate();
      } catch (error) {
        console.error('加载工序数据失败:', error);
        ElMessage.error('加载工序数据失败，请刷新页面重试');
      } finally {
        this.loading = false;
      }
    },

    // 获取状态对应的类型
    getStatusType(status) {
      if (status === 'notStarted') return 'danger';
      if (status === 'inProgress') return 'warning';
      if (status === 'completed') return 'success';
      return 'info';
    },

    // 获取状态文本
    getStatusText(status) {
      if (status === 'notStarted') return '未开始';
      if (status === 'inProgress') return '进行中';
      if (status === 'completed') return '已完成';
      return '未知';
    },

    // 显示添加子工序对话框
    showAddSubProcessDialog() {
      this.newSubProcess = {
        name: '',
        weight: 1
      };
      this.addSubProcessVisible = true;
    },

    // 添加子工序
    async addSubProcess() {
      if (!this.newSubProcess.name) {
        ElMessage.warning('请输入子工序名称');
        return;
      }

      try {
        const subProcessData = {
          name: this.newSubProcess.name,
          weight: this.newSubProcess.weight,
          status: 'notStarted'
        };

        const response = await processAPI.createSubProcess(this.processId, subProcessData);
        this.subProcesses.push(response.data);
        this.addSubProcessVisible = false;
        this.updateSubProcessCompletionRate();
        ElMessage.success('子工序添加成功');
      } catch (error) {
        console.error('添加子工序失败:', error);
        ElMessage.error('添加子工序失败');
      }
    },

    // 开始子工序
    async startSubProcess(subProcess) {
      try {
        const response = await processAPI.startSubProcess(subProcess.id);
        const updatedSubProcess = response.data;

        // 更新本地数据
        const index = this.subProcesses.findIndex(p => p.id === subProcess.id);
        if (index !== -1) {
          this.subProcesses[index] = updatedSubProcess;
        }

        // 如果工序状态是未开始，也需要更新工序状态
        if (this.status === 'notStarted') {
          await this.refreshProcessData();
        }

        this.updateSubProcessCompletionRate();
        ElMessage.success('子工序已开始');
      } catch (error) {
        console.error('开始子工序失败:', error);
        ElMessage.error('开始子工序失败');
      }
    },

    // 完成子工序
    async completeSubProcess(subProcess) {
      try {
        const response = await processAPI.completeSubProcess(subProcess.id);
        const updatedSubProcess = response.data;

        // 更新本地数据
        const index = this.subProcesses.findIndex(p => p.id === subProcess.id);
        if (index !== -1) {
          this.subProcesses[index] = updatedSubProcess;
        }

        // 刷新工序状态以检查是否所有子工序都已完成
        await this.refreshProcessData();

        this.updateSubProcessCompletionRate();
        ElMessage.success('子工序已完成');
      } catch (error) {
        console.error('完成子工序失败:', error);
        ElMessage.error('完成子工序失败');
      }
    },

    // 删除子工序
    async deleteSubProcess(subProcess) {
      if (subProcess.status !== 'notStarted') {
        ElMessage.warning('只能删除未开始的子工序');
        return;
      }

      try {
        await processAPI.deleteSubProcess(subProcess.id);

        // 更新本地数据
        const index = this.subProcesses.findIndex(p => p.id === subProcess.id);
        if (index !== -1) {
          this.subProcesses.splice(index, 1);
        }

        this.updateSubProcessCompletionRate();
        ElMessage.success('子工序已删除');
      } catch (error) {
        console.error('删除子工序失败:', error);
        ElMessage.error('删除子工序失败');
      }
    },

    // 刷新工序数据
    async refreshProcessData() {
      try {
        const response = await processAPI.getProcessById(this.processId);
        const processData = response.data;

        this.status = processData.status;
        this.startTime = processData.startTime;
        this.endTime = processData.endTime;
      } catch (error) {
        console.error('刷新工序数据失败:', error);
      }
    },

    // 更新子工序完成率
    updateSubProcessCompletionRate() {
      if (this.subProcesses.length === 0) {
        this.subProcessCompletionRate = 0;
        this.subProcessStatus = 'exception';
        return;
      }

      let totalWeight = 0;
      let completedWeight = 0;

      this.subProcesses.forEach(subProcess => {
        totalWeight += subProcess.weight;
        if (subProcess.status === 'completed') {
          completedWeight += subProcess.weight;
        } else if (subProcess.status === 'inProgress') {
          // 进行中的工序计算50%的权重
          completedWeight += (subProcess.weight * 0.5);
        }
      });

      this.subProcessCompletionRate = Math.round((completedWeight / totalWeight) * 100);

      if (this.subProcessCompletionRate === 0) {
        this.subProcessStatus = 'exception';
      } else if (this.subProcessCompletionRate === 100) {
        this.subProcessStatus = 'success';
      } else {
        this.subProcessStatus = 'warning';
      }
    },

    // 格式化日期时间
    formatDateTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
  }
}
</script>


<style scoped>
.process-detail {
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin-left: 20px;
  margin-bottom: 0;
}

.info-card {
  margin-bottom: 20px;
}

.sub-process-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-container {
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.progress-container span {
  margin-right: 10px;
  width: 80px;
}

.progress-container .el-progress {
  flex: 1;
}

.button-group {
  display: flex;
  justify-content: center;
}

.el-button + .el-button {
  margin-left: 10px;
}

/* 表格内按钮样式 */
.el-table .el-button {
  min-width: 60px;
  margin: 2px;
}

/* 确保所有表格中的操作列有足够的空间 */
:deep(.el-table__cell.is-right) {
  text-align: center;
}
</style>
