<template>
  <div class="mold-detail">
    <div class="header">
      <el-button @click="goBack">返回</el-button>
      <h2>模具详情: {{ moldCode }}</h2>
    </div>

    <!-- 模具基本信息 -->
    <el-card class="info-card">
      <el-descriptions title="模具信息" :column="4" border>
        <el-descriptions-item label="模具编号">{{ moldCode }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ orderTime }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ startTime || '未开始' }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ endTime || '未完成' }}</el-descriptions-item>
      </el-descriptions>

      <div class="progress-container">
        <span>总体进度:</span>
        <el-progress :percentage="completionRate" :status="progressStatus"></el-progress>
      </div>
    </el-card>

    <!-- 模块标签页 -->
    <el-card class="module-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="模架" name="frame">
          <div class="module-content">
            <h3>模架工序</h3>
            <el-table :data="frameProcesses" border stripe>
              <el-table-column prop="name" label="工序名称" width="150"></el-table-column>
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
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button
                      size="small"
                      @click="startProcess(scope.row)"
                      :disabled="scope.row.status !== 'notStarted'"
                      type="primary">
                    开始
                  </el-button>
                  <el-button
                      size="small"
                      @click="completeProcess(scope.row)"
                      :disabled="scope.row.status !== 'inProgress'"
                      type="success">
                    完成
                  </el-button>
                  <el-button
                      size="small"
                      @click="viewProcessDetail(scope.row)"
                      type="info">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="三大件" name="main">
          <div class="module-content">
            <h3>三大件工序</h3>
            <!-- 三大件工序表格，结构类似模架工序 -->
            <el-table :data="mainPartsProcesses" border stripe>
              <el-table-column prop="name" label="工序名称" width="150"></el-table-column>
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
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button
                      size="small"
                      @click="startProcess(scope.row)"
                      :disabled="scope.row.status !== 'notStarted'"
                      type="primary">
                    开始
                  </el-button>
                  <el-button
                      size="small"
                      @click="completeProcess(scope.row)"
                      :disabled="scope.row.status !== 'inProgress'"
                      type="success">
                    完成
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="辅料" name="auxiliary">
          <div class="module-content">
            <h3>辅料管理</h3>
            <el-table :data="auxiliaryMaterials" border stripe>
              <el-table-column prop="name" label="辅料名称" width="150"></el-table-column>
              <el-table-column prop="specification" label="规格" width="150"></el-table-column>
              <el-table-column prop="required" label="需求数量" width="100"></el-table-column>
              <el-table-column prop="stock" label="库存数量" width="100">
                <template #default="scope">
                  <span :class="{ 'low-stock': scope.row.stock < scope.row.safeStock }">
                    {{ scope.row.stock }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="safeStock" label="安全库存" width="100"></el-table-column>
              <el-table-column label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.stock >= scope.row.required ? 'success' : 'danger'">
                    {{ scope.row.stock >= scope.row.required ? '库存充足' : '库存不足' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button
                      size="small"
                      type="primary"
                      @click="useMaterial(scope.row)"
                      :disabled="scope.row.stock < scope.row.required">
                    使用
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="返修记录" name="repair">
          <div class="module-content">
            <h3>返修记录</h3>
            <div class="action-bar">
              <el-button type="primary" @click="showAddRepairDialog">添加返修记录</el-button>
            </div>

            <el-table :data="repairRecords" border stripe>
              <el-table-column prop="repairDate" label="返修日期" width="150"></el-table-column>
              <el-table-column prop="partName" label="工件名称" width="150"></el-table-column>
              <el-table-column prop="reason" label="返修原因" width="200"></el-table-column>
              <el-table-column prop="responsible" label="责任人" width="120"></el-table-column>
              <el-table-column prop="repairHours" label="修复工时" width="100"></el-table-column>
              <el-table-column prop="cost" label="报废金额" width="120"></el-table-column>
              <el-table-column label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="getRepairStatusType(scope.row.status)">
                    {{ getRepairStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button
                      size="small"
                      type="primary"
                      @click="startRepair(scope.row)"
                      :disabled="scope.row.status !== 'waiting'">
                    开始返修
                  </el-button>
                  <el-button
                      size="small"
                      type="success"
                      @click="completeRepair(scope.row)"
                      :disabled="scope.row.status !== 'repairing'">
                    完成返修
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加返修记录对话框 -->
    <el-dialog v-model="addRepairVisible" title="添加返修记录" width="40%">
      <el-form :model="newRepairRecord" label-width="100px">
        <el-form-item label="工件名称" required>
          <el-input v-model="newRepairRecord.partName" placeholder="请输入返修工件名称"></el-input>
        </el-form-item>

        <el-form-item label="返修原因" required>
          <el-input v-model="newRepairRecord.reason" type="textarea" rows="2" placeholder="请输入返修原因"></el-input>
        </el-form-item>

        <el-form-item label="责任人">
          <el-input v-model="newRepairRecord.responsible" placeholder="请输入责任人姓名"></el-input>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="修复工时(h)">
              <el-input-number v-model="newRepairRecord.repairHours" :min="0" :precision="1" :step="0.5"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报废金额(元)">
              <el-input-number v-model="newRepairRecord.cost" :min="0" :precision="2" :step="100"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="优先级">
          <el-radio-group v-model="newRepairRecord.priority">
            <el-radio :label="'high'">高</el-radio>
            <el-radio :label="'medium'">中</el-radio>
            <el-radio :label="'low'">低</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="其他说明">
          <el-input v-model="newRepairRecord.description" type="textarea" rows="3" placeholder="其他补充说明"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
    <span>
      <el-button @click="addRepairVisible = false">取消</el-button>
      <el-button type="primary" @click="addRepairRecord">确定</el-button>
    </span>
      </template>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      moldId: null,
      moldCode: '',
      orderTime: '',
      startTime: '',
      endTime: '',
      completionRate: 0,
      progressStatus: 'exception',
      activeTab: 'frame',

      // 模架工序数据
      frameProcesses: [
        {
          id: 'design',
          name: '设计图纸',
          weight: 2,
          status: 'completed',
          startTime: '2023-09-03 10:00',
          endTime: '2023-09-03 17:00'
        },
        {
          id: 'material',
          name: '模料',
          weight: 7,
          status: 'inProgress',
          startTime: '2023-09-04 09:00',
          endTime: null
        },
        {
          id: 'rough',
          name: '粗加工',
          weight: 15,
          status: 'notStarted',
          startTime: null,
          endTime: null
        }
      ],

      // 三大件工序数据
      mainPartsProcesses: [
        {
          id: 'core',
          name: '模芯',
          weight: 1.5,
          status: 'notStarted',
          startTime: null,
          endTime: null
        },
        {
          id: 'cavity',
          name: '模腔',
          weight: 3,
          status: 'notStarted',
          startTime: null,
          endTime: null
        },
        {
          id: 'mount',
          name: '安装座',
          weight: 2,
          status: 'notStarted',
          startTime: null,
          endTime: null
        }
      ],

      // 辅料数据
      auxiliaryMaterials: [
        {
          id: '1',
          name: '阀针',
          specification: 'S-25',
          required: 20,
          stock: 100,
          safeStock: 50
        },
        {
          id: '2',
          name: '弹簧',
          specification: 'D-30',
          required: 15,
          stock: 30,
          safeStock: 40
        }
      ],

      // 返修记录数据
      repairRecords: [
        {
          id: '1',
          repairDate: '2023-09-10',
          partName: '模腔',
          reason: '尺寸不符',
          responsible: '张工',
          repairHours: 8,
          cost: 2000,
          status: 'completed'
        }
      ],
      // 返修记录相关
      addRepairVisible: false,
      newRepairRecord: {
        partName: '',
        reason: '',
        responsible: '',
        repairHours: 0,
        cost: 0,
        priority: 'medium',
        description: '',
        status: 'waiting'
      }
    }
  },
  mounted() {
    // 获取路由参数中的ID
    this.moldId = this.$route ? this.$route.params.id : '1';
    // 加载模具数据
    this.loadMoldData();
    // 计算初始完成率
    this.updateCompletionRate();
  },
  methods: {
    // 返回上一页
    goBack() {
      this.$router.push('/');
    },

    // 加载模具数据
    loadMoldData() {
      // 这里应该调用API获取数据
      // 现在使用模拟数据
      this.moldCode = 'SC25-01';
      this.orderTime = '2023-09-01 10:00';
      this.startTime = '2023-09-03 08:00';
      this.endTime = '';
      this.completionRate = 15;
      this.progressStatus = 'warning'; // 黄色表示进行中
    },

    // 获取状态对应的类型
    getStatusType(status) {
      if (status === 'notStarted') return 'danger';  // 红色
      if (status === 'inProgress') return 'warning'; // 黄色
      if (status === 'completed') return 'success';  // 绿色
      return 'info';
    },

    // 获取状态文本
    getStatusText(status) {
      if (status === 'notStarted') return '未开始';
      if (status === 'inProgress') return '进行中';
      if (status === 'completed') return '已完成';
      return '未知';
    },

    // 获取返修状态类型
    getRepairStatusType(status) {
      if (status === 'waiting') return 'danger';    // 红色
      if (status === 'repairing') return 'warning'; // 黄色
      if (status === 'completed') return 'success'; // 绿色
      return 'info';
    },

    // 获取返修状态文本
    getRepairStatusText(status) {
      if (status === 'waiting') return '等待中';
      if (status === 'repairing') return '返修中';
      if (status === 'completed') return '已完成';
      return '未知';
    },

    // 开始工序
    startProcess(process) {
      process.status = 'inProgress';
      process.startTime = this.formatDateTime(new Date());
      this.updateCompletionRate();
      // 这里应该调用API保存数据
    },

    // 完成工序
    completeProcess(process) {
      process.status = 'completed';
      process.endTime = this.formatDateTime(new Date());
      this.updateCompletionRate();
      // 这里应该调用API保存数据
    },

    // 查看工序详情
    viewProcessDetail(process) {
      this.$router.push(`/mold/${this.moldId}/process/${process.id}`);
    },

    // 使用辅料
    useMaterial(material) {
      if (material.stock >= material.required) {
        material.stock -= material.required;
        alert(`已使用${material.name} ${material.required}件，剩余库存: ${material.stock}件`);
        // 这里应该调用API保存数据
      }
    },

    // 显示添加返修记录对话框
    // 显示添加返修记录对话框
    showAddRepairDialog() {
      this.newRepairRecord = {
        partName: '',
        reason: '',
        responsible: '',
        repairHours: 0,
        cost: 0,
        priority: 'medium',
        description: '',
        status: 'waiting'
      };
      this.addRepairVisible = true;
    }
    ,

    // 开始返修
    startRepair(record) {
      record.status = 'repairing';
      // 这里应该调用API保存数据
    },

    // 完成返修
    completeRepair(record) {
      record.status = 'completed';
      // 这里应该调用API保存数据
    },

    // 更新完成率
    // 更新完成率
    // 更新完成率
    updateCompletionRate() {
      let totalWeight = 0;
      let completedWeight = 0;

      // 计算模架部分权重和完成度
      this.frameProcesses.forEach(process => {
        totalWeight += process.weight;
        if (process.status === 'completed') {
          completedWeight += process.weight;
        } else if (process.status === 'inProgress') {
          // 进行中的工序计算50%的权重
          completedWeight += (process.weight * 0.5);
        }
      });

      // 计算三大件部分权重和完成度
      this.mainPartsProcesses.forEach(process => {
        totalWeight += process.weight;
        if (process.status === 'completed') {
          completedWeight += process.weight;
        } else if (process.status === 'inProgress') {
          // 进行中的工序计算50%的权重
          completedWeight += (process.weight * 0.5);
        }
      });

      // 计算总完成率
      this.completionRate = Math.round((completedWeight / totalWeight) * 100);

      // 更新状态颜色
      if (this.completionRate === 0) {
        this.progressStatus = 'exception'; // 红色
      } else if (this.completionRate === 100) {
        this.progressStatus = 'success';  // 绿色
        if (!this.endTime) {
          this.endTime = this.formatDateTime(new Date());
        }
      } else {
        this.progressStatus = 'warning';  // 黄色
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
    },

    // 添加返修记录
    addRepairRecord() {
      // 验证必填字段
      if (!this.newRepairRecord.partName || !this.newRepairRecord.reason) {
        this.$message.warning('请填写工件名称和返修原因');
        return;
      }

      const record = {
        id: 'repair-' + Date.now(),
        repairDate: this.formatDateTime(new Date()),
        ...this.newRepairRecord
      };

      // 添加到返修记录列表
      this.repairRecords.push(record);

      // 关闭对话框
      this.addRepairVisible = false;

      // 提示成功
      this.$message.success('返修记录添加成功');
    }

  }
}
</script>

<style scoped>
.mold-detail {
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

.module-card {
  margin-bottom: 20px;
}

.module-content {
  padding: 10px 0;
}

.action-bar {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

.low-stock {
  color: #F56C6C;
  font-weight: bold;
}

/* 以下是新增的样式，解决操作按钮问题 */
.el-table .cell {
  white-space: nowrap;
  padding: 0 10px;
}

.el-button + .el-button {
  margin-left: 10px;
}

.el-table .el-button {
  min-width: 60px;
  margin: 2px;
}

/* 确保所有表格中的操作列有足够的空间 */
:deep(.el-table__cell.is-right) {
  text-align: center;
  min-width: 240px;
}

/* 按钮组样式 */
.button-group {
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
}
</style>

