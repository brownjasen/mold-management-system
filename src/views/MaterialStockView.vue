<template>
  <div class="material-stock">
    <div class="header">
      <h2>辅料库存管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddMaterialDialog">添加辅料</el-button>
        <el-button @click="goToMoldList">返回模具列表</el-button>
      </div>
    </div>

    <!-- 库存统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ totalMaterials }}</div>
            <div class="stat-label">辅料种类数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ lowStockCount }}</div>
            <div class="stat-label">低库存预警</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ stockOutCount }}</div>
            <div class="stat-label">库存不足</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ recentTransactions }}</div>
            <div class="stat-label">近期出入库记录</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 辅料库存表格 -->
    <el-card class="stock-table-card">
      <template #header>
        <div class="card-header">
          <span>辅料库存列表</span>
          <div>
            <el-input
                v-model="searchQuery"
                placeholder="搜索辅料名称或规格"
                style="width: 250px"
                clearable
                @clear="handleSearchClear">
              <template #append>
                <el-button :icon="Search" @click="handleSearch"></el-button>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table :data="filteredMaterials" border stripe>
        <el-table-column prop="name" label="辅料名称" width="150" sortable></el-table-column>
        <el-table-column prop="specification" label="规格" width="150" sortable></el-table-column>
        <el-table-column prop="stock" label="当前库存" width="100" sortable>
          <template #default="scope">
            <span :class="{ 'low-stock': scope.row.stock < scope.row.safeStock, 'out-of-stock': scope.row.stock === 0 }">
              {{ scope.row.stock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="safeStock" label="安全库存" width="100" sortable></el-table-column>
        <el-table-column prop="unit" label="单位" width="80"></el-table-column>
        <el-table-column prop="supplier" label="供应商" width="180"></el-table-column>
        <el-table-column prop="lastUpdate" label="最后更新时间" width="180" sortable></el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag
                :type="getStockStatusType(scope.row.stock, scope.row.safeStock)">
              {{ getStockStatusText(scope.row.stock, scope.row.safeStock) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="240">
          <template #default="scope">
            <div class="button-group">
              <el-button
                  size="small"
                  @click="showStockInDialog(scope.row)"
                  type="primary">
                入库
              </el-button>
              <el-button
                  size="small"
                  @click="showStockOutDialog(scope.row)"
                  type="warning"
                  :disabled="scope.row.stock <= 0">
                出库
              </el-button>
              <el-button
                  size="small"
                  @click="showEditMaterialDialog(scope.row)"
                  type="info">
                编辑
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加辅料对话框 -->
    <el-dialog v-model="addMaterialVisible" title="添加辅料" width="30%">
      <el-form :model="newMaterial" label-width="100px">
        <el-form-item label="辅料名称">
          <el-input v-model="newMaterial.name"></el-input>
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="newMaterial.specification"></el-input>
        </el-form-item>
        <el-form-item label="初始库存">
          <el-input-number v-model="newMaterial.stock" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="安全库存">
          <el-input-number v-model="newMaterial.safeStock" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="newMaterial.unit"></el-input>
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="newMaterial.supplier"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="addMaterialVisible = false">取消</el-button>
          <el-button type="primary" @click="addMaterial">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 入库对话框 -->
    <el-dialog v-model="stockInVisible" title="辅料入库" width="30%">
      <el-form :model="stockInForm" label-width="100px">
        <el-form-item label="辅料名称">
          <span>{{ currentMaterial.name }}</span>
        </el-form-item>
        <el-form-item label="规格">
          <span>{{ currentMaterial.specification }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <span>{{ currentMaterial.stock }}</span>
        </el-form-item>
        <el-form-item label="入库数量">
          <el-input-number v-model="stockInForm.quantity" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="批次号">
          <el-input v-model="stockInForm.batchNo"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="stockInForm.remark" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="stockInVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmStockIn">确定入库</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 出库对话框 -->
    <el-dialog v-model="stockOutVisible" title="辅料出库" width="30%">
      <el-form :model="stockOutForm" label-width="100px">
        <el-form-item label="辅料名称">
          <span>{{ currentMaterial.name }}</span>
        </el-form-item>
        <el-form-item label="规格">
          <span>{{ currentMaterial.specification }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <span>{{ currentMaterial.stock }}</span>
        </el-form-item>
        <el-form-item label="出库数量">
          <el-input-number v-model="stockOutForm.quantity" :min="1" :max="currentMaterial.stock"></el-input-number>
        </el-form-item>
        <el-form-item label="使用模具">
          <el-select v-model="stockOutForm.moldCode" placeholder="请选择模具">
            <el-option
                v-for="mold in moldList"
                :key="mold.id"
                :label="mold.moldCode"
                :value="mold.moldCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="stockOutForm.remark" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="stockOutVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmStockOut">确定出库</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 辅料列表
      materialsList: [
        {
          id: '1',
          name: '阀针',
          specification: 'S-25',
          stock: 100,
          safeStock: 50,
          unit: '件',
          supplier: '上海精密器件有限公司',
          lastUpdate: '2023-09-15 10:30'
        },
        {
          id: '2',
          name: '弹簧',
          specification: 'D-30',
          stock: 30,
          safeStock: 40,
          unit: '件',
          supplier: '上海弹簧制造厂',
          lastUpdate: '2023-09-14 16:45'
        },
        {
          id: '3',
          name: '导向柱',
          specification: 'Z-40',
          stock: 60,
          safeStock: 30,
          unit: '根',
          supplier: '精密模具配件有限公司',
          lastUpdate: '2023-09-13 14:20'
        },
        {
          id: '4',
          name: '顶针',
          specification: 'T-15',
          stock: 0,
          safeStock: 20,
          unit: '件',
          supplier: '华南模具配件厂',
          lastUpdate: '2023-09-12 09:15'
        }
      ],

      // 模具列表（用于出库选择）
      moldList: [
        { id: '1', moldCode: 'SC25-01' },
        { id: '2', moldCode: 'SC25-02' }
      ],

      // 搜索相关
      searchQuery: '',
      filteredMaterials: [],

      // 对话框控制
      addMaterialVisible: false,
      stockInVisible: false,
      stockOutVisible: false,

      // 表单数据
      newMaterial: {
        name: '',
        specification: '',
        stock: 0,
        safeStock: 0,
        unit: '件',
        supplier: ''
      },

      currentMaterial: {},

      stockInForm: {
        quantity: 1,
        batchNo: '',
        remark: ''
      },

      stockOutForm: {
        quantity: 1,
        moldCode: '',
        remark: ''
      }
    }
  },
  computed: {
    // 统计数据
    totalMaterials() {
      return this.materialsList.length;
    },
    lowStockCount() {
      return this.materialsList.filter(m => m.stock < m.safeStock && m.stock > 0).length;
    },
    stockOutCount() {
      return this.materialsList.filter(m => m.stock === 0).length;
    },
    recentTransactions() {
      // 假设我们有10条最近的交易记录
      return 10;
    }
  },
  mounted() {
    this.filteredMaterials = [...this.materialsList];
  },
  methods: {
    // 返回模具列表页
    goToMoldList() {
      this.$router.push('/');
    },

    // 处理搜索
    handleSearch() {
      if (!this.searchQuery) {
        this.filteredMaterials = [...this.materialsList];
        return;
      }

      const query = this.searchQuery.toLowerCase();
      this.filteredMaterials = this.materialsList.filter(material => {
        return material.name.toLowerCase().includes(query) ||
            material.specification.toLowerCase().includes(query);
      });
    },

    // 清除搜索
    handleSearchClear() {
      this.filteredMaterials = [...this.materialsList];
    },

    // 获取库存状态类型
    getStockStatusType(stock, safeStock) {
      if (stock === 0) return 'danger';
      if (stock < safeStock) return 'warning';
      return 'success';
    },

    // 获取库存状态文本
    getStockStatusText(stock, safeStock) {
      if (stock === 0) return '无库存';
      if (stock < safeStock) return '库存不足';
      return '库存充足';
    },

    // 显示添加辅料对话框
    showAddMaterialDialog() {
      this.newMaterial = {
        name: '',
        specification: '',
        stock: 0,
        safeStock: 0,
        unit: '件',
        supplier: ''
      };
      this.addMaterialVisible = true;
    },

    // 添加辅料
    addMaterial() {
      const material = {
        id: Date.now().toString(),
        ...this.newMaterial,
        lastUpdate: this.formatDateTime(new Date())
      };

      this.materialsList.push(material);
      this.filteredMaterials = [...this.materialsList];
      this.addMaterialVisible = false;
    },

    // 显示入库对话框
    showStockInDialog(material) {
      this.currentMaterial = {...material};
      this.stockInForm = {
        quantity: 1,
        batchNo: '',
        remark: ''
      };
      this.stockInVisible = true;
    },

    // 确认入库
    confirmStockIn() {
      // 找到材料并更新库存
      const material = this.materialsList.find(m => m.id === this.currentMaterial.id);
      if (material) {
        material.stock += this.stockInForm.quantity;
        material.lastUpdate = this.formatDateTime(new Date());

        // 更新过滤后的列表
        this.filteredMaterials = [...this.materialsList];
      }

      this.stockInVisible = false;
      this.$message.success(`成功入库 ${this.stockInForm.quantity} ${this.currentMaterial.unit} ${this.currentMaterial.name}`);
    },

    // 显示出库对话框
    showStockOutDialog(material) {
      this.currentMaterial = {...material};
      this.stockOutForm = {
        quantity: 1,
        moldCode: this.moldList[0]?.moldCode || '',
        remark: ''
      };
      this.stockOutVisible = true;
    },

    // 确认出库
    confirmStockOut() {
      // 找到材料并更新库存
      const material = this.materialsList.find(m => m.id === this.currentMaterial.id);
      if (material) {
        if (material.stock < this.stockOutForm.quantity) {
          this.$message.error('库存不足');
          return;
        }

        material.stock -= this.stockOutForm.quantity;
        material.lastUpdate = this.formatDateTime(new Date());

        // 更新过滤后的列表
        this.filteredMaterials = [...this.materialsList];
      }

      this.stockOutVisible = false;
      this.$message.success(`成功出库 ${this.stockOutForm.quantity} ${this.currentMaterial.unit} ${this.currentMaterial.name} 用于模具 ${this.stockOutForm.moldCode}`);
    },

    // 显示编辑辅料对话框
    showEditMaterialDialog(material) {
      // 暂未实现，可以复用添加对话框
      this.$message.info('编辑功能待实现');
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
.material-stock {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}

.stock-table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-group {
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
}

.el-button + .el-button {
  margin-left: 10px;
}

.low-stock {
  color: #E6A23C;
  font-weight: bold;
}

.out-of-stock {
  color: #F56C6C;
  font-weight: bold;
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
