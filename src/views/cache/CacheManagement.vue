<template>
  <div class="cache-management-container">
    <div class="page-header">
      <h2>{{ $t('cache.management') }}</h2>
      <div class="header-actions">
        <el-button :icon="Refresh" @click="refreshStats">
          {{ $t('common.refresh') }}
        </el-button>
        <el-button type="danger" @click="handleClearAll" :loading="clearingAll">
          {{ $t('cache.clearAll') }}
        </el-button>
      </div>
    </div>

    <!-- 缓存统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ stats.totalKeys }}</div>
            <div class="stat-label">{{ $t('cache.totalKeys') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card success">
          <div class="stat-item">
            <div class="stat-value">{{ formatBytes(stats.usedMemory) }}</div>
            <div class="stat-label">{{ $t('cache.usedMemory') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card warning">
          <div class="stat-item">
            <div class="stat-value">{{ stats.hitRate }}%</div>
            <div class="stat-label">{{ $t('cache.hitRate') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card info">
          <div class="stat-item">
            <div class="stat-value">{{ stats.expiredKeys }}</div>
            <div class="stat-label">{{ $t('cache.expiredKeys') }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能指标图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>{{ $t('cache.hitRateTrend') }}</span>
          </template>
          <div ref="hitRateChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>{{ $t('cache.memoryUsageTrend') }}</span>
          </template>
          <div ref="memoryChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 缓存操作区域 -->
    <el-card class="operations-card">
      <template #header>
        <span>{{ $t('cache.operations') }}</span>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form :model="searchForm" @submit.prevent="handleSearch">
            <el-form-item :label="$t('cache.searchKey')">
              <el-input
                v-model="searchForm.pattern"
                :placeholder="$t('cache.enterPattern')"
                clearable
              >
                <template #append>
                  <el-button type="primary" @click="handleSearch" :loading="searching">
                    {{ $t('common.search') }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('cache.cacheType')">
            <el-select
              v-model="selectedType"
              :placeholder="$t('cache.selectType')"
              @change="handleTypeChange"
              style="width: 100%"
            >
              <el-option
                v-for="type in cacheTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('cache.batchOperations')">
            <el-button-group>
              <el-button @click="handleRefreshSelected" :disabled="selectedKeys.length === 0">
                {{ $t('cache.refreshSelected') }}
              </el-button>
              <el-button type="danger" @click="handleDeleteSelected" :disabled="selectedKeys.length === 0">
                {{ $t('cache.deleteSelected') }}
              </el-button>
            </el-button-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 缓存键列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span>{{ $t('cache.cacheKeys') }}</span>
          <el-tag v-if="searchForm.pattern" type="info">
            {{ $t('cache.searchResults', { pattern: searchForm.pattern }) }}
          </el-tag>
        </div>
      </template>
      
      <el-table
        :data="cacheKeys"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="key" :label="$t('cache.key')" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewValue(row)">
              {{ row.key }}
            </el-button>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" :label="$t('cache.type')" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="size" :label="$t('cache.size')" width="100">
          <template #default="{ row }">
            {{ formatBytes(row.size) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="ttl" :label="$t('cache.ttl')" width="120">
          <template #default="{ row }">
            <span v-if="row.ttl > 0">{{ formatTTL(row.ttl) }}</span>
            <el-tag v-else type="info" size="small">{{ $t('cache.permanent') }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="lastAccessed" :label="$t('cache.lastAccessed')" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.lastAccessed) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="hitCount" :label="$t('cache.hitCount')" width="100" />
        
        <el-table-column :label="$t('common.actions')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleViewValue(row)">
              {{ $t('cache.viewValue') }}
            </el-button>
            <el-button size="small" type="success" link @click="handleRefreshKey(row)">
              {{ $t('cache.refresh') }}
            </el-button>
            <el-button size="small" type="warning" link @click="handleEditTTL(row)">
              {{ $t('cache.editTTL') }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDeleteKey(row)">
              {{ $t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 缓存值查看对话框 -->
    <el-dialog
      v-model="valueDialogVisible"
      :title="$t('cache.cacheValue')"
      width="800px"
      destroy-on-close
    >
      <div v-if="currentCacheItem">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('cache.key')">
            {{ currentCacheItem.key }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('cache.type')">
            <el-tag :type="getTypeColor(currentCacheItem.type)">
              {{ currentCacheItem.type }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('cache.size')">
            {{ formatBytes(currentCacheItem.size) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('cache.ttl')">
            <span v-if="currentCacheItem.ttl > 0">{{ formatTTL(currentCacheItem.ttl) }}</span>
            <el-tag v-else type="info" size="small">{{ $t('cache.permanent') }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('cache.lastAccessed')" :span="2">
            {{ formatDateTime(currentCacheItem.lastAccessed) }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="value-section">
          <h4>{{ $t('cache.value') }}</h4>
          <el-input
            :model-value="formatValue(currentCacheItem.value)"
            type="textarea"
            :rows="10"
            readonly
          />
        </div>
      </div>
    </el-dialog>

    <!-- TTL编辑对话框 -->
    <el-dialog
      v-model="ttlDialogVisible"
      :title="$t('cache.editTTL')"
      width="400px"
    >
      <el-form :model="ttlForm" label-width="100px">
        <el-form-item :label="$t('cache.key')">
          <el-input :model-value="ttlForm.key" readonly />
        </el-form-item>
        <el-form-item :label="$t('cache.currentTTL')">
          <span v-if="ttlForm.currentTTL > 0">{{ formatTTL(ttlForm.currentTTL) }}</span>
          <el-tag v-else type="info" size="small">{{ $t('cache.permanent') }}</el-tag>
        </el-form-item>
        <el-form-item :label="$t('cache.newTTL')">
          <el-input-number
            v-model="ttlForm.newTTL"
            :min="0"
            :max="86400"
            style="width: 100%"
          />
          <div class="ttl-help">
            {{ $t('cache.ttlHelp') }}
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="ttlDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmUpdateTTL" :loading="updatingTTL">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/date'

const { t } = useI18n()

// 缓存项接口
interface CacheItem {
  key: string
  type: string
  size: number
  ttl: number
  lastAccessed: string
  hitCount: number
  value: any
}

// 缓存统计接口
interface CacheStats {
  totalKeys: number
  usedMemory: number
  hitRate: number
  expiredKeys: number
  hitRateTrend: Array<{ time: string; rate: number }>
  memoryTrend: Array<{ time: string; memory: number }>
}

// 响应式数据
const cacheKeys = ref<CacheItem[]>([])
const loading = ref(false)
const searching = ref(false)
const clearingAll = ref(false)
const updatingTTL = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const selectedKeys = ref<CacheItem[]>([])

// 搜索表单
const searchForm = reactive({
  pattern: ''
})

// 缓存类型
const cacheTypes = ref([
  { label: t('cache.allTypes'), value: '' },
  { label: 'String', value: 'string' },
  { label: 'Hash', value: 'hash' },
  { label: 'List', value: 'list' },
  { label: 'Set', value: 'set' },
  { label: 'ZSet', value: 'zset' }
])

const selectedType = ref('')

// 统计数据
const stats = ref<CacheStats>({
  totalKeys: 0,
  usedMemory: 0,
  hitRate: 0,
  expiredKeys: 0,
  hitRateTrend: [],
  memoryTrend: []
})

// 对话框状态
const valueDialogVisible = ref(false)
const ttlDialogVisible = ref(false)
const currentCacheItem = ref<CacheItem | null>(null)

// TTL表单
const ttlForm = reactive({
  key: '',
  currentTTL: 0,
  newTTL: 0
})

// 图表引用
const hitRateChartRef = ref()
const memoryChartRef = ref()

// 模拟API调用
const mockApiCall = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

// 方法
const loadCacheKeys = async () => {
  loading.value = true
  try {
    // 模拟缓存键数据
    const mockKeys: CacheItem[] = Array.from({ length: pageSize.value }, (_, index) => ({
      key: `cache:key:${index + 1}`,
      type: ['string', 'hash', 'list', 'set', 'zset'][Math.floor(Math.random() * 5)],
      size: Math.floor(Math.random() * 10000) + 100,
      ttl: Math.random() > 0.3 ? Math.floor(Math.random() * 3600) : -1,
      lastAccessed: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      hitCount: Math.floor(Math.random() * 1000),
      value: `Mock value for key ${index + 1}`
    }))
    
    await mockApiCall(mockKeys)
    cacheKeys.value = mockKeys
    total.value = 500
  } catch (error) {
    ElMessage.error(t('cache.loadKeysFailed'))
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const mockStats: CacheStats = {
      totalKeys: 500,
      usedMemory: 1024 * 1024 * 50, // 50MB
      hitRate: 85.6,
      expiredKeys: 25,
      hitRateTrend: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        rate: Math.random() * 20 + 80
      })),
      memoryTrend: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        memory: Math.random() * 1024 * 1024 * 20 + 1024 * 1024 * 40
      }))
    }
    
    await mockApiCall(mockStats)
    stats.value = mockStats
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const handleSearch = async () => {
  if (!searchForm.pattern.trim()) {
    ElMessage.warning(t('cache.enterSearchPattern'))
    return
  }
  
  searching.value = true
  try {
    // 模拟搜索
    await mockApiCall(null, 1000)
    currentPage.value = 1
    await loadCacheKeys()
    ElMessage.success(t('cache.searchSuccess'))
  } catch (error) {
    ElMessage.error(t('cache.searchFailed'))
  } finally {
    searching.value = false
  }
}

const handleTypeChange = () => {
  currentPage.value = 1
  loadCacheKeys()
}

const refreshStats = () => {
  loadStats()
  loadCacheKeys()
  nextTick(() => {
    initCharts()
  })
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadCacheKeys()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadCacheKeys()
}

const handleSelectionChange = (selection: CacheItem[]) => {
  selectedKeys.value = selection
}

const handleViewValue = async (item: CacheItem) => {
  try {
    // 模拟获取缓存值
    const mockValue = {
      ...item,
      value: JSON.stringify({
        data: `Mock detailed value for ${item.key}`,
        timestamp: new Date().toISOString(),
        metadata: {
          created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          accessed: item.lastAccessed
        }
      }, null, 2)
    }
    
    await mockApiCall(mockValue)
    currentCacheItem.value = mockValue
    valueDialogVisible.value = true
  } catch (error) {
    ElMessage.error(t('cache.loadValueFailed'))
  }
}

const handleRefreshKey = async (item: CacheItem) => {
  try {
    await mockApiCall(null, 500)
    ElMessage.success(t('cache.refreshKeySuccess', { key: item.key }))
    loadCacheKeys()
  } catch (error) {
    ElMessage.error(t('cache.refreshKeyFailed'))
  }
}

const handleEditTTL = (item: CacheItem) => {
  ttlForm.key = item.key
  ttlForm.currentTTL = item.ttl
  ttlForm.newTTL = item.ttl > 0 ? item.ttl : 3600
  ttlDialogVisible.value = true
}

const confirmUpdateTTL = async () => {
  updatingTTL.value = true
  try {
    await mockApiCall(null, 500)
    ElMessage.success(t('cache.updateTTLSuccess'))
    ttlDialogVisible.value = false
    loadCacheKeys()
  } catch (error) {
    ElMessage.error(t('cache.updateTTLFailed'))
  } finally {
    updatingTTL.value = false
  }
}

const handleDeleteKey = async (item: CacheItem) => {
  try {
    await ElMessageBox.confirm(
      t('cache.deleteKeyConfirm', { key: item.key }),
      t('common.warning'),
      {
        type: 'warning',
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel')
      }
    )
    
    await mockApiCall(null, 500)
    ElMessage.success(t('cache.deleteKeySuccess'))
    loadCacheKeys()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('cache.deleteKeyFailed'))
    }
  }
}

const handleRefreshSelected = async () => {
  try {
    await mockApiCall(null, 1000)
    ElMessage.success(t('cache.refreshSelectedSuccess', { count: selectedKeys.value.length }))
    selectedKeys.value = []
    loadCacheKeys()
  } catch (error) {
    ElMessage.error(t('cache.refreshSelectedFailed'))
  }
}

const handleDeleteSelected = async () => {
  try {
    await ElMessageBox.confirm(
      t('cache.deleteSelectedConfirm', { count: selectedKeys.value.length }),
      t('common.warning'),
      {
        type: 'warning',
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel')
      }
    )
    
    await mockApiCall(null, 1000)
    ElMessage.success(t('cache.deleteSelectedSuccess', { count: selectedKeys.value.length }))
    selectedKeys.value = []
    loadCacheKeys()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('cache.deleteSelectedFailed'))
    }
  }
}

const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      t('cache.clearAllConfirm'),
      t('common.danger'),
      {
        type: 'error',
        confirmButtonText: t('cache.confirmClear'),
        cancelButtonText: t('common.cancel')
      }
    )
    
    clearingAll.value = true
    await mockApiCall(null, 2000)
    ElMessage.success(t('cache.clearAllSuccess'))
    loadCacheKeys()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('cache.clearAllFailed'))
    }
  } finally {
    clearingAll.value = false
  }
}

const initCharts = () => {
  // 这里可以使用 ECharts 初始化图表
  console.log('Initialize charts with data:', stats.value)
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTTL = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

const formatValue = (value: any): string => {
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }
  return JSON.stringify(value, null, 2)
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'string':
      return 'primary'
    case 'hash':
      return 'success'
    case 'list':
      return 'warning'
    case 'set':
      return 'info'
    case 'zset':
      return 'danger'
    default:
      return ''
  }
}

// 生命周期
onMounted(() => {
  loadCacheKeys()
  loadStats()
  nextTick(() => {
    initCharts()
  })
})
</script>

<style scoped>
.cache-management-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  
  &.success {
    border-color: var(--el-color-success);
    
    .stat-value {
      color: var(--el-color-success);
    }
  }
  
  &.warning {
    border-color: var(--el-color-warning);
    
    .stat-value {
      color: var(--el-color-warning);
    }
  }
  
  &.info {
    border-color: var(--el-color-info);
    
    .stat-value {
      color: var(--el-color-info);
    }
  }
}

.stat-item {
  padding: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.charts-row {
  margin-bottom: 20px;
}

.chart {
  height: 300px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
}

.operations-card {
  margin-bottom: 20px;
}

.table-card {
  position: relative;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.value-section {
  margin-top: 20px;
  
  h4 {
    margin-bottom: 8px;
    color: var(--el-text-color-primary);
  }
}

.ttl-help {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>