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
      }
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
    loadProcessData() {
      // 模拟API调用加载数据
      this.moldCode = 'SC25-01';

      // 根据processId加载不同工序数据
      if (this.processId === 'design') {
        this.processName = '设计图纸';
        this.processWeight = 2;
        this.status = 'completed';
        this.startTime = '2023-09-03 10:00';
        this.endTime = '2023-09-03 17:00';

        this.subProcesses = [
          {
            id: 'design-1',
            name: '模架设计',
            weight: 0.8,
            status: 'completed',
            startTime: '2023-09-03 10:00',
            endTime: '2023-09-03 14:00'
          },
          {
            id: 'design-2',
            name: '三大件设计',
            weight: 0.7,
            status: 'completed',
            startTime: '2023-09-03 14:30',
            endTime: '2023-09-03 16:00'
          },
          {
            id: 'design-3',
            name: '辅料设计',
            weight: 0.5,
            status: 'completed',
            startTime: '2023-09-03 16:00',
            endTime: '2023-09-03 17:00'
          }
        ];
      } else if (this.processId === 'material') {
        this.processName = '模料';
        this.processWeight = 7;
        this.status = 'inProgress';
        this.startTime = '2023-09-04 09:00';
        this.endTime = null;

        this.subProcesses = [
          {
            id: 'material-1',
            name: '材料选型',
            weight: 1.5,
            status: 'completed',
            startTime: '2023-09-04 09:00',
            endTime: '2023-09-04 11:00'
          },
          {
            id: 'material-2',
            name: '材料采购',
            weight: 2,
            status: 'inProgress',
            startTime: '2023-09-04 13:00',
            endTime: null
          },
          {
            id: 'material-3',
            name: '材料检验',
            weight: 3.5,
            status: 'notStarted',
            startTime: null,
            endTime: null
          }
        ];
      } else {
        // 默认空数据
        this.processName = '未知工序';
        this.subProcesses = [];
      }

      // 计算子工序完成率
      this.updateSubProcessCompletionRate();
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
    addSubProcess() {
      const subProcess = {
        id: `sub-${Date.now()}`,
        name: this.newSubProcess.name,
        weight: this.newSubProcess.weight,
        status: 'notStarted',
        startTime: null,
        endTime: null
      };

      this.subProcesses.push(subProcess);
      this.addSubProcessVisible = false;
      this.updateSubProcessCompletionRate();
    },

    // 开始子工序
    startSubProcess(subProcess) {
      subProcess.status = 'inProgress';
      subProcess.startTime = this.formatDateTime(new Date());

      // 更新主工序状态
      if (this.status === 'notStarted') {
        this.status = 'inProgress';
        this.startTime = this.formatDateTime(new Date());
      }

      this.updateSubProcessCompletionRate();
    },

    // 完成子工序
    completeSubProcess(subProcess) {
      subProcess.status = 'completed';
      subProcess.endTime = this.formatDateTime(new Date());
      this.updateSubProcessCompletionRate();

      // 检查是否所有子工序都已完成
      const allCompleted = this.subProcesses.every(p => p.status === 'completed');
      if (allCompleted) {
        this.status = 'completed';
        this.endTime = this.formatDateTime(new Date());
      }
    },

    // 删除子工序
    deleteSubProcess(subProcess) {
      if (subProcess.status !== 'notStarted') {
        this.$message.warning('只能删除未开始的子工序');
        return;
      }

      const index = this.subProcesses.findIndex(p => p.id === subProcess.id);
      if (index !== -1) {
        this.subProcesses.splice(index, 1);
        this.updateSubProcessCompletionRate();
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
