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
      <span :class="{ 'low-stock': scope.row.stock < scope.row.safeStock, 'out-of-stock': scope.row.stock === 0 }">
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

              <!-- 添加空状态模板 -->
              <template #empty>
                <el-empty
                    description="暂无辅料数据"
                    :image-size="100"
                >
                  <template #description>
                    <p>该模具暂未关联任何辅料</p>
                  </template>
                  <el-button type="primary" @click="addMaterial">添加辅料</el-button>
                </el-empty>
              </template>
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
              <el-table-column label="操作" min-width="240">
                <template #default="scope">
                  <div class="button-group">
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
                  </div>
                </template>
              </el-table-column>

              <!-- 添加空状态模板 -->
              <template #empty>
                <el-empty
                    description="暂无返修记录"
                    :image-size="100"
                >
                  <template #description>
                    <p>该模具暂无返修记录</p>
                  </template>
                  <el-button type="primary" @click="showAddRepairDialog">添加返修记录</el-button>
                </el-empty>
              </template>
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
import moldAPI from '@/api/mold.js';
import processAPI from '@/api/process.js';
import repairAPI from '@/api/repair.js';
import { ElMessage } from 'element-plus';

export default {
  data() {
    return {
      moldId: null,
      mold: {
        id: '',
        moldCode: '',
        orderTime: '',
        startTime: '',
        endTime: '',
        completionRate: 0,
        status: ''
      },
      // 工序数据
      frameProcesses: [],
      mainPartsProcesses: [],
      auxiliaryMaterials: [],
      repairRecords: [],

      activeTab: 'frame',
      loading: {
        mold: false,
        processes: false,
        materials: false,
        repairs: false
      },

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
  computed: {
    progressStatus() {
      if (this.mold.status === 'notStarted') return 'exception';
      if (this.mold.status === 'inProgress') return 'warning';
      if (this.mold.status === 'completed') return 'success';
      return '';
    }
  },
  mounted() {
    // 获取路由参数中的ID
    this.moldId = this.$route.params.id;

    // 加载模具数据
    this.loadMoldData();

    // 加载工序数据
    this.loadProcessData('frame');
    this.loadProcessData('main_parts');

    // 加载返修记录
    this.loadRepairRecords();
  },
  methods: {
    // 返回列表页
    goBack() {
      this.$router.push('/');
    },
    // 添加辅料方法
    addMaterial() {
      // 你可以打开对话框或导航到辅料添加页面
      this.$message.info('添加辅料功能待实现');
      // 如果有对话框:
      // this.addMaterialVisible = true;
    },


    // 加载模具数据
    async loadMoldData() {
      this.loading.mold = true;
      try {
        const response = await moldAPI.getMoldById(this.moldId);
        this.mold = response.data;
      } catch (error) {
        console.error('加载模具数据失败:', error);
        ElMessage.error('加载模具数据失败');
      } finally {
        this.loading.mold = false;
      }
    },

    // 加载工序数据
    async loadProcessData(moduleType) {
      this.loading.processes = true;
      try {
        const response = await processAPI.getProcessesByMoldAndType(this.moldId, moduleType);

        if (moduleType === 'frame') {
          this.frameProcesses = response.data;
        } else if (moduleType === 'main_parts') {
          this.mainPartsProcesses = response.data;
        }
      } catch (error) {
        console.error(`加载${moduleType}工序数据失败:`, error);
        ElMessage.error(`加载${moduleType}工序数据失败`);
      } finally {
        this.loading.processes = false;
      }
    },

    // 加载返修记录
    async loadRepairRecords() {
      this.loading.repairs = true;
      try {
        const response = await repairAPI.getRepairRecordsByMoldId(this.moldId);
        this.repairRecords = response.data;
      } catch (error) {
        console.error('加载返修记录失败:', error);
        ElMessage.error('加载返修记录失败');
      } finally {
        this.loading.repairs = false;
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

    // 获取返修状态类型
    getRepairStatusType(status) {
      if (status === 'waiting') return 'danger';
      if (status === 'repairing') return 'warning';
      if (status === 'completed') return 'success';
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
    async startProcess(process) {
      try {
        const response = await processAPI.startProcess(process.id);

        // 更新本地数据
        const updatedProcess = response.data;
        const moduleType = process.moduleType;

        if (moduleType === 'frame') {
          const index = this.frameProcesses.findIndex(p => p.id === process.id);
          if (index !== -1) {
            this.frameProcesses[index] = updatedProcess;
          }
        } else if (moduleType === 'main_parts') {
          const index = this.mainPartsProcesses.findIndex(p => p.id === process.id);
          if (index !== -1) {
            this.mainPartsProcesses[index] = updatedProcess;
          }
        }

        // 刷新模具数据
        this.loadMoldData();

        ElMessage.success('工序已开始');
      } catch (error) {
        console.error('开始工序失败:', error);
        ElMessage.error('开始工序失败');
      }
    },

    // 完成工序
    async completeProcess(process) {
      try {
        const response = await processAPI.completeProcess(process.id);

        // 更新本地数据
        const updatedProcess = response.data;
        const moduleType = process.moduleType;

        if (moduleType === 'frame') {
          const index = this.frameProcesses.findIndex(p => p.id === process.id);
          if (index !== -1) {
            this.frameProcesses[index] = updatedProcess;
          }
        } else if (moduleType === 'main_parts') {
          const index = this.mainPartsProcesses.findIndex(p => p.id === process.id);
          if (index !== -1) {
            this.mainPartsProcesses[index] = updatedProcess;
          }
        }

        // 刷新模具数据
        this.loadMoldData();

        ElMessage.success('工序已完成');
      } catch (error) {
        console.error('完成工序失败:', error);
        ElMessage.error('完成工序失败');
      }
    },

    // 查看工序详情
    viewProcessDetail(process) {
      this.$router.push(`/mold/${this.moldId}/process/${process.id}`);
    },

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
    },

    // 添加返修记录
    async addRepairRecord() {
      if (!this.newRepairRecord.partName || !this.newRepairRecord.reason) {
        ElMessage.warning('请填写工件名称和返修原因');
        return;
      }

      try {
        const response = await repairAPI.createRepairRecord(
            this.moldId,
            this.newRepairRecord
        );

        // 更新本地数据
        this.repairRecords.push(response.data);

        // 关闭对话框
        this.addRepairVisible = false;

        ElMessage.success('返修记录添加成功');
      } catch (error) {
        console.error('添加返修记录失败:', error);
        ElMessage.error('添加返修记录失败');
      }
    },

    // 开始返修
    async startRepair(repairRecord) {
      try {
        const response = await repairAPI.startRepair(repairRecord.id);

        // 更新本地数据
        const index = this.repairRecords.findIndex(r => r.id === repairRecord.id);
        if (index !== -1) {
          this.repairRecords[index] = response.data;
        }

        ElMessage.success('返修已开始');
      } catch (error) {
        console.error('开始返修失败:', error);
        ElMessage.error('开始返修失败');
      }
    },

    // 完成返修
    async completeRepair(repairRecord) {
      try {
        const response = await repairAPI.completeRepair(repairRecord.id);

        // 更新本地数据
        const index = this.repairRecords.findIndex(r => r.id === repairRecord.id);
        if (index !== -1) {
          this.repairRecords[index] = response.data;
        }

        ElMessage.success('返修已完成');
      } catch (error) {
        console.error('完成返修失败:', error);
        ElMessage.error('完成返修失败');
      }
    },

    // 格式化日期时间
    formatDateTime(date) {
      if (!date) return '';

      try {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
      } catch (error) {
        return date; // 如果解析失败，返回原始字符串
      }
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

