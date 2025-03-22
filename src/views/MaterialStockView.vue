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
import materialAPI from '@/api/material';
import { ElMessage } from 'element-plus';
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const materialsList = ref([]);
    const filteredMaterials = ref([]);
    const searchQuery = ref('');
    const loading = ref(false);

    // 对话框控制
    const addMaterialVisible = ref(false);
    const stockInVisible = ref(false);
    const stockOutVisible = ref(false);

    // 模具列表（用于出库选择）
    const moldList = ref([]);

    // 当前操作的辅料
    const currentMaterial = ref({});

    // 统计数据（计算属性）
    const totalMaterials = computed(() => materialsList.value.length);
    const lowStockCount = computed(() =>
        materialsList.value.filter(m => m.stock < m.safeStock && m.stock > 0).length
    );
    const stockOutCount = computed(() =>
        materialsList.value.filter(m => m.stock === 0).length
    );

    // 表单数据
    const newMaterial = ref({
      name: '',
      specification: '',
      stock: 0,
      safeStock: 0,
      unit: '件',
      supplier: ''
    });

    const stockInForm = ref({
      quantity: 1,
      batchNo: '',
      remark: ''
    });

    const stockOutForm = ref({
      quantity: 1,
      moldCode: '',
      remark: ''
    });

    // 加载辅料数据
    const loadMaterials = async () => {
      loading.value = true;
      try {
        const response = await materialAPI.getAllMaterials();
        materialsList.value = response.data;
        filteredMaterials.value = [...materialsList.value];
      } catch (error) {
        console.error('加载辅料数据失败:', error);
        ElMessage.error('加载辅料数据失败');
      } finally {
        loading.value = false;
      }
    };

    // 处理搜索
    const handleSearch = () => {
      if (!searchQuery.value.trim()) {
        filteredMaterials.value = [...materialsList.value];
        return;
      }

      const query = searchQuery.value.toLowerCase();
      filteredMaterials.value = materialsList.value.filter(material => {
        return material.name.toLowerCase().includes(query) ||
            material.specification.toLowerCase().includes(query);
      });
    };

    // 清除搜索
    const handleSearchClear = () => {
      searchQuery.value = '';
      filteredMaterials.value = [...materialsList.value];
    };

    // 获取库存状态类型
    const getStockStatusType = (stock, safeStock) => {
      if (stock === 0) return 'danger';
      if (stock < safeStock) return 'warning';
      return 'success';
    };

    // 获取库存状态文本
    const getStockStatusText = (stock, safeStock) => {
      if (stock === 0) return '无库存';
      if (stock < safeStock) return '库存不足';
      return '库存充足';
    };

    // 显示添加辅料对话框
    const showAddMaterialDialog = () => {
      newMaterial.value = {
        name: '',
        specification: '',
        stock: 0,
        safeStock: 0,
        unit: '件',
        supplier: ''
      };
      addMaterialVisible.value = true;
    };

    // 添加辅料
    const addMaterial = async () => {
      if (!newMaterial.value.name) {
        ElMessage.warning('请输入辅料名称');
        return;
      }

      try {
        const response = await materialAPI.createMaterial(newMaterial.value);
        materialsList.value.push(response.data);
        filteredMaterials.value = [...materialsList.value];
        addMaterialVisible.value = false;
        ElMessage.success('辅料添加成功');
      } catch (error) {
        console.error('添加辅料失败:', error);
        ElMessage.error('添加辅料失败');
      }
    };

    // 显示入库对话框
    const showStockInDialog = (material) => {
      currentMaterial.value = {...material};
      stockInForm.value = {
        quantity: 1,
        batchNo: '',
        remark: ''
      };
      stockInVisible.value = true;
    };

    // 确认入库
    const confirmStockIn = async () => {
      if (stockInForm.value.quantity <= 0) {
        ElMessage.warning('入库数量必须大于0');
        return;
      }

      try {
        const response = await materialAPI.stockIn(
            currentMaterial.value.id,
            stockInForm.value.quantity
        );

        // 更新本地数据
        const index = materialsList.value.findIndex(m => m.id === currentMaterial.value.id);
        if (index !== -1) {
          materialsList.value[index] = response.data;
          filteredMaterials.value = [...materialsList.value];
        }

        stockInVisible.value = false;
        ElMessage.success(`成功入库 ${stockInForm.value.quantity} ${currentMaterial.value.unit} ${currentMaterial.value.name}`);
      } catch (error) {
        console.error('入库操作失败:', error);
        ElMessage.error('入库操作失败');
      }
    };

    // 显示出库对话框
    const showStockOutDialog = (material) => {
      if (material.stock <= 0) {
        ElMessage.warning('当前无库存，无法出库');
        return;
      }

      currentMaterial.value = {...material};
      stockOutForm.value = {
        quantity: 1,
        moldCode: moldList.value[0]?.moldCode || '',
        remark: ''
      };
      stockOutVisible.value = true;
    };

    // 确认出库
    const confirmStockOut = async () => {
      if (stockOutForm.value.quantity <= 0) {
        ElMessage.warning('出库数量必须大于0');
        return;
      }

      if (stockOutForm.value.quantity > currentMaterial.value.stock) {
        ElMessage.warning('出库数量不能大于库存数量');
        return;
      }

      try {
        const response = await materialAPI.stockOut(
            currentMaterial.value.id,
            stockOutForm.value.quantity
        );

        // 更新本地数据
        const index = materialsList.value.findIndex(m => m.id === currentMaterial.value.id);
        if (index !== -1) {
          materialsList.value[index] = response.data;
          filteredMaterials.value = [...materialsList.value];
        }

        stockOutVisible.value = false;
        ElMessage.success(`成功出库 ${stockOutForm.value.quantity} ${currentMaterial.value.unit} ${currentMaterial.value.name}`);
      } catch (error) {
        console.error('出库操作失败:', error);
        ElMessage.error('出库操作失败');
      }
    };

    // 返回模具列表页
    const goToMoldList = () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    };

    // 生命周期钩子
    onMounted(() => {
      loadMaterials();

      // 这里应该调用API获取模具列表，用于出库选择
      // 暂时使用模拟数据
      moldList.value = [
        { id: '1', moldCode: 'SC25-01' },
        { id: '2', moldCode: 'SC25-02' }
      ];
    });

    return {
      materialsList,
      filteredMaterials,
      searchQuery,
      loading,
      addMaterialVisible,
      stockInVisible,
      stockOutVisible,
      moldList,
      currentMaterial,
      newMaterial,
      stockInForm,
      stockOutForm,
      totalMaterials,
      lowStockCount,
      stockOutCount,
      recentTransactions: 10, // 假设最近有10条交易记录
      handleSearch,
      handleSearchClear,
      getStockStatusType,
      getStockStatusText,
      showAddMaterialDialog,
      addMaterial,
      showStockInDialog,
      confirmStockIn,
      showStockOutDialog,
      confirmStockOut,
      goToMoldList
    };
  }
};
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
