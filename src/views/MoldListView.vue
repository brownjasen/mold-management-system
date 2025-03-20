<template>
  <div class="mold-list-container">
    <h1>模具管理系统</h1>

    <!-- 添加模具按钮 -->
    <!-- 添加模具按钮 -->
    <div class="action-bar">
      <el-button type="primary" @click="showAddDialog">添加模具</el-button>
      <el-button type="info" @click="goToMaterialStock">辅料库存管理</el-button>
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
export default {
  data() {
    return {
      moldList: [], // 模具列表
      addDialogVisible: false, // 添加对话框是否可见
      newMold: { // 新模具数据
        moldCode: '',
        orderTime: '',
        priority: 1
      }
    }
  },
  mounted() {
    // 页面加载时获取模具列表
    this.getMoldList();
  },
  methods: {
    // 获取模具列表（模拟数据）
    getMoldList() {
      // 这里应该是从API获取数据，现在用模拟数据
      this.moldList = [
        {
          id: '1',
          moldCode: 'SC25-01',
          orderTime: '2023-09-01 10:00',
          startTime: null,
          endTime: null,
          completionRate: 0,
          status: 'notStarted',
          priority: 1
        },
        {
          id: '2',
          moldCode: 'SC25-02',
          orderTime: '2023-09-02 09:30',
          startTime: '2023-09-03 08:00',
          endTime: null,
          completionRate: 15,
          status: 'inProgress',
          priority: 2
        }
      ];
    },

    // 跳转到辅料库存管理
    goToMaterialStock() {
      this.$router.push('/materials');
    },


    // 获取进度条状态
    getProgressStatus(status) {
      if (status === 'notStarted') return 'exception'; // 红色
      if (status === 'inProgress') return 'warning';   // 黄色
      if (status === 'completed') return 'success';    // 绿色
      return '';
    },

    // 显示添加对话框
    showAddDialog() {
      this.addDialogVisible = true;
    },

    // 添加新模具
    addMold() {
      // 创建新模具对象
      const newMoldItem = {
        id: Date.now().toString(), // 使用时间戳作为临时ID
        moldCode: this.newMold.moldCode,
        orderTime: this.formatDate(this.newMold.orderTime),
        startTime: null,
        endTime: null,
        completionRate: 0,
        status: 'notStarted',
        priority: this.moldList.length + 1
      };

      // 添加到模具列表
      this.moldList.push(newMoldItem);

      // 关闭对话框并重置表单
      this.addDialogVisible = false;
      this.newMold = {
        moldCode: '',
        orderTime: '',
        priority: 1
      };
    },

    // 开始设计
    startDesign(mold) {
      mold.startTime = this.formatDate(new Date());
      mold.status = 'inProgress';
      // 这里应该调用API更新数据
      alert(`已开始设计模具: ${mold.moldCode}`);
    },

    // 更新优先级
    updatePriority(mold) {
      // 这里应该调用API更新优先级
      // 简单实现：重新排序列表
      this.moldList.sort((a, b) => a.priority - b.priority);
    },

    // 查看详情
    viewDetail(id) {
      this.$router.push(`/mold/${id}`);
      // 这里应该跳转到详情页面
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

      return `${year}-${month}-${day} ${hours}:${minutes}`;
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
