<template>
  <div class="mold-list-container">
    <h1>模具管理系统</h1>

    <!-- 添加模具按钮 -->
    <!-- 添加模具按钮 -->
    <div class="action-bar">
      <el-button type="primary" @click="showAddDialog">添加模具</el-button>
    </div>


    <!-- 模具列表表格 -->
    <el-table :data="moldList" border style="width: 100%">
      <el-table-column prop="moldCode" label="模具编号" width="120"></el-table-column>
      <el-table-column prop="orderTime" label="下单时间" width="180"></el-table-column>
      <el-table-column prop="startTime" label="开始生产时间" width="180"></el-table-column>
      <el-table-column label="生产进度" min-width="220">
        <template #default="scope">
          <el-progress
              :percentage="scope.row.completionRate"
              :status="getProgressStatus(scope.row.status)">
          </el-progress>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="生产顺序" width="150">
        <template #default="scope">
          <el-input-number
              v-model="scope.row.priority"
              :min="1"
              @change="updatePriority(scope.row)"
              size="small">
          </el-input-number>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="200">
        <template #default="scope">
          <el-button size="small" @click="viewDetail(scope.row.id)">查看详情</el-button>
          <el-button
              type="primary"
              size="small"
              @click="startDesign(scope.row)"
              :disabled="scope.row.startTime">
            设计图纸
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加模具对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加模具" width="30%">
      <el-form :model="newMold" label-width="100px">
        <el-form-item label="模具编号">
          <el-input v-model="newMold.moldCode" placeholder="例如：SC25-01"></el-input>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
              v-model="newMold.orderTime"
              type="datetime"
              placeholder="选择日期时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addMold">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>


<script>
import moldAPI from '@/api/mold.js';
import { ElMessage } from 'element-plus';

export default {
  data() {
    return {
      moldList: [],
      addDialogVisible: false,
      newMold: {
        moldCode: '',
        orderTime: '',
        priority: 1
      },
      loading: false
    }
  },
  mounted() {
    // 页面加载时获取模具列表
    this.getMoldList();
  },
  methods: {
    // 获取模具列表
    async getMoldList() {
      this.loading = true;
      try {
        const response = await moldAPI.getAllMolds();
        this.moldList = response.data;
      } catch (error) {
        console.error('获取模具列表失败:', error);
        ElMessage.error('获取模具列表失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },

    // 获取进度条状态
    getProgressStatus(status) {
      if (status === 'notStarted') return 'exception';
      if (status === 'inProgress') return 'warning';
      if (status === 'completed') return 'success';
      return '';
    },

    // 显示添加对话框
    showAddDialog() {
      this.addDialogVisible = true;
    },

    // 添加新模具
    async addMold() {
      if (!this.newMold.moldCode) {
        ElMessage.warning('请输入模具编号');
        return;
      }

      try {
        const moldData = {
          moldCode: this.newMold.moldCode,
          orderTime: this.formatDate(this.newMold.orderTime),
          priority: this.moldList.length + 1
        };

        const response = await moldAPI.createMold(moldData);
        this.moldList.push(response.data);

        this.addDialogVisible = false;
        this.newMold = {
          moldCode: '',
          orderTime: '',
          priority: 1
        };

        ElMessage.success('模具添加成功');
      } catch (error) {
        console.error('添加模具失败:', error);
        ElMessage.error('添加模具失败');
      }
    },

    // 开始设计
    async startDesign(mold) {
      try {
        const response = await moldAPI.startDesign(mold.id);

        // 更新本地模具数据
        const index = this.moldList.findIndex(m => m.id === mold.id);
        if (index !== -1) {
          this.moldList[index] = response.data;
        }

        ElMessage.success(`已开始设计模具: ${mold.moldCode}`);
      } catch (error) {
        console.error('开始设计失败:', error);
        ElMessage.error('开始设计失败');
      }
    },

    // 更新优先级
    async updatePriority(mold) {
      try {
        await moldAPI.updateMold(mold.id, mold);

        // 重新排序
        this.moldList.sort((a, b) => a.priority - b.priority);
        ElMessage.success('生产顺序已更新');
      } catch (error) {
        console.error('更新优先级失败:', error);
        ElMessage.error('更新优先级失败');
      }
    },

    // 查看详情
    viewDetail(id) {
      this.$router.push(`/mold/${id}`);
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '';
      if (typeof date === 'string') return date;

      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
  }
}
</script>


<style scoped>
.mold-list-container {
  margin: 20px;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
