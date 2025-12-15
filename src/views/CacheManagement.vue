<template>
  <div class="cache-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>缓存管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="danger" @click="clearAllCache">
              <el-icon><Delete /></el-icon>
              清空所有缓存
            </el-button>
          </div>
        </div>
      </template>

      <!-- 缓存统计信息 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-statistic title="缓存命中率" :value="stats.hitRate" suffix="%" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="总请求数" :value="stats.totalRequests" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="命中次数" :value="stats.hits" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="未命中次数" :value="stats.misses" />
        </el-col>
      </el-row>

      <!-- 缓存操作区域 -->
      <el-divider />
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>缓存预热</span>
            </template>
            <el-form @submit.prevent="warmupCache">
              <el-form-item label="预热类型">
                <el-select v-model="warmupForm.type" placeholder="请选择预热类型">
                  <el-option label="用户数据" value="user" />
                  <el-option label="角色数据" value="role" />
                  <el-option label="权限数据" value="permission" />
                  <el-option label="组织数据" value="organization" />
                  <el-option label="数据字典" value="dataDict" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="warmupCache">开始预热</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>缓存查询</span>
            </template>
            <el-form @submit.prevent="searchCache">
              <el-form-item label="缓存键">
                <el-input v-model="searchForm.pattern" placeholder="输入缓存键模式，支持通配符*" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchCache">查询</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>

      <!-- 缓存键列表 -->
      <el-divider />
      
      <el-table :data="cacheKeys" style="width: 100%" v-loading="loading">
        <el-table-column prop="key" label="缓存键" min-width="200" />
        <el-table-column prop="type" label="数据类型" width="120" />
        <el-table-column prop="ttl" label="过期时间(秒)" width="120" />
        <el-table-column prop="size" label="大小" width="100" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewCacheValue(scope.row.key)">查看</el-button>
            <el-button size="small" type="danger" @click="deleteCacheKey(scope.row.key)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </el-card>

    <!-- 缓存值查看对话框 -->
    <el-dialog v-model="valueDialog.visible" title="缓存值详情" width="60%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="缓存键">{{ valueDialog.key }}</el-descriptions-item>
        <el-descriptions-item label="数据类型">{{ valueDialog.type }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ valueDialog.ttl }}秒</el-descriptions-item>
      </el-descriptions>
      <el-divider />
      <el-input
        v-model="valueDialog.value"
        type="textarea"
        :rows="10"
        readonly
        placeholder="缓存值内容"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Delete } from '@element-plus/icons-vue'
import api from '../api'

// 响应式数据
const loading = ref(false)
const stats = reactive({
  hitRate: 0,
  totalRequests: 0,
  hits: 0,
  misses: 0
})

const warmupForm = reactive({
  type: ''
})

const searchForm = reactive({
  pattern: ''
})

const cacheKeys = ref([])
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const valueDialog = reactive({
  visible: false,
  key: '',
  type: '',
  ttl: 0,
  value: ''
})

// 方法
const refreshData = async () => {
  await Promise.all([
    getCacheStats(),
    getCacheKeys()
  ])
}

const getCacheStats = async () => {
  try {
    const response = await api.cache.getStats()
    Object.assign(stats, response.data)
  } catch (error) {
    console.error('获取缓存统计失败:', error)
  }
}

const getCacheKeys = async () => {
  loading.value = true
  try {
    const response = await api.cache.getKeys(searchForm.pattern)
    cacheKeys.value = response.data || []
    pagination.total = cacheKeys.value.length
  } catch (error) {
    console.error('获取缓存键列表失败:', error)
  } finally {
    loading.value = false
  }
}

const clearAllCache = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有缓存吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.cache.clearAll()
    ElMessage.success('缓存清空成功')
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空缓存失败:', error)
    }
  }
}

const warmupCache = async () => {
  if (!warmupForm.type) {
    ElMessage.warning('请选择预热类型')
    return
  }
  
  try {
    await api.cache.warmup({ type: warmupForm.type })
    ElMessage.success('缓存预热成功')
    await refreshData()
  } catch (error) {
    console.error('缓存预热失败:', error)
  }
}

const searchCache = async () => {
  await getCacheKeys()
}

const viewCacheValue = async (key) => {
  try {
    const response = await api.cache.getValue(key)
    valueDialog.key = key
    valueDialog.type = response.data.type || 'string'
    valueDialog.ttl = response.data.ttl || -1
    valueDialog.value = JSON.stringify(response.data.value, null, 2)
    valueDialog.visible = true
  } catch (error) {
    console.error('获取缓存值失败:', error)
  }
}

const deleteCacheKey = async (key) => {
  try {
    await ElMessageBox.confirm(`确定要删除缓存键 "${key}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.cache.clearByKey(key)
    ElMessage.success('删除成功')
    await getCacheKeys()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除缓存键失败:', error)
    }
  }
}

const handleSizeChange = (val) => {
  pagination.size = val
  getCacheKeys()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  getCacheKeys()
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.cache-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-row {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>