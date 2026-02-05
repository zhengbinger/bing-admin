<template>
  <div class="audit-log-container">
    <div class="page-header">
      <h2>{{ $t('audit.logViewer') }}</h2>
      <div class="header-actions">
        <el-button :icon="Download" @click="handleExport" :loading="exporting">
          {{ $t('audit.export') }}
        </el-button>
        <el-button :icon="Refresh" @click="refreshLogs">
          {{ $t('common.refresh') }}
        </el-button>
        <el-switch
          v-model="realTimeMode"
          :active-text="$t('audit.realTime')"
          @change="toggleRealTime"
        />
      </div>
    </div>

    <!-- 搜索过滤器 -->
    <el-card class="filter-card">
      <el-form :model="searchForm" inline>
        <el-form-item :label="$t('audit.username')">
          <el-input
            v-model="searchForm.username"
            :placeholder="$t('audit.enterUsername')"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        
        <el-form-item :label="$t('audit.action')">
          <el-select
            v-model="searchForm.action"
            :placeholder="$t('audit.selectAction')"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="action in actionOptions"
              :key="action"
              :label="action"
              :value="action"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('audit.module')">
          <el-select
            v-model="searchForm.module"
            :placeholder="$t('audit.selectModule')"
            clearable
            style="width: 150px"
            @change="handleModuleChange"
          >
            <el-option
              v-for="module in moduleOptions"
              :key="module"
              :label="module"
              :value="module"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('audit.status')">
          <el-select
            v-model="searchForm.status"
            :placeholder="$t('audit.selectStatus')"
            clearable
            style="width: 120px"
          >
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="警告" value="warning" />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('audit.ipAddress')">
          <el-input
            v-model="searchForm.ipAddress"
            :placeholder="$t('audit.enterIpAddress')"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        
        <el-form-item :label="$t('audit.timeRange')">
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            :range-separator="$t('common.to')"
            :start-placeholder="$t('audit.startTime')"
            :end-placeholder="$t('audit.endTime')"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 350px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            {{ $t('common.search') }}
          </el-button>
          <el-button @click="handleReset">
            {{ $t('common.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">{{ $t('audit.totalLogs') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card success">
          <div class="stat-item">
            <div class="stat-value">{{ stats.successCount }}</div>
            <div class="stat-label">{{ $t('audit.successLogs') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card warning">
          <div class="stat-item">
            <div class="stat-value">{{ stats.warningCount }}</div>
            <div class="stat-label">{{ $t('audit.warningLogs') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card danger">
          <div class="stat-item">
            <div class="stat-value">{{ stats.failedCount }}</div>
            <div class="stat-label">{{ $t('audit.failedLogs') }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 日志表格 -->
    <el-card class="table-card">
      <el-table
        :data="logs"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="createTime" :label="$t('audit.time')" width="180" sortable>
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="username" :label="$t('audit.user')" width="120" />
        
        <el-table-column prop="module" :label="$t('audit.module')" width="100" />
        
        <el-table-column prop="action" :label="$t('audit.action')" width="120" />
        
        <el-table-column prop="status" :label="$t('audit.status')" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ $t(`audit.status.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="ipAddress" :label="$t('audit.ipAddress')" width="130" />
        
        <el-table-column prop="description" :label="$t('audit.description')" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="duration" :label="$t('audit.duration')" width="100">
          <template #default="{ row }">
            <span v-if="row.duration">{{ row.duration }}ms</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <el-table-column :label="$t('common.actions')" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              link
              @click.stop="handleViewDetail(row)"
            >
              {{ $t('common.detail') }}
            </el-button>
            <el-button
              size="small"
              type="info"
              link
              @click.stop="handleViewUserTrail(row)"
            >
              {{ $t('audit.userTrail') }}
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
      
      <!-- 批量操作 -->
      <div v-if="selectedLogs.length > 0" class="batch-actions">
        <el-button type="danger" @click="handleBatchDelete" :loading="batchDeleting">
          {{ $t('audit.batchDelete') }} ({{ selectedLogs.length }})
        </el-button>
        <el-button @click="handleBatchExport" :loading="exporting">
          {{ $t('audit.batchExport') }} ({{ selectedLogs.length }})
        </el-button>
      </div>
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="$t('audit.logDetail')"
      width="800px"
      destroy-on-close
    >
      <div v-if="currentLog" class="log-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('audit.time')">
            {{ formatDateTime(currentLog.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('audit.user')">
            {{ currentLog.username }} (ID: {{ currentLog.userId }})
          </el-descriptions-item>
          <el-descriptions-item :label="$t('audit.module')">
            {{ currentLog.module }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('audit.action')">
            {{ currentLog.action }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('audit.status')">
            <el-tag :type="getStatusType(currentLog.status)">
              {{ $t(`audit.status.${currentLog.status}`) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('audit.duration')">
            {{ currentLog.duration ? `${currentLog.duration}ms` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('audit.ipAddress')">
            {{ currentLog.ipAddress }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('audit.userAgent')" :span="2">
            {{ currentLog.userAgent }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('audit.description')" :span="2">
            {{ currentLog.description }}
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 请求数据 -->
        <div v-if="currentLog.requestData" class="data-section">
          <h4>{{ $t('audit.requestData') }}</h4>
          <el-input
            :model-value="JSON.stringify(currentLog.requestData, null, 2)"
            type="textarea"
            :rows="6"
            readonly
          />
        </div>
        
        <!-- 响应数据 -->
        <div v-if="currentLog.responseData" class="data-section">
          <h4>{{ $t('audit.responseData') }}</h4>
          <el-input
            :model-value="JSON.stringify(currentLog.responseData, null, 2)"
            type="textarea"
            :rows="6"
            readonly
          />
        </div>
      </div>
    </el-dialog>

    <!-- 用户轨迹对话框 -->
    <el-dialog
      v-model="trailDialogVisible"
      :title="$t('audit.userActionTrail')"
      width="1000px"
      destroy-on-close
    >
      <el-table :data="userTrail" v-loading="loadingTrail" stripe>
        <el-table-column prop="createTime" :label="$t('audit.time')" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="module" :label="$t('audit.module')" width="100" />
        <el-table-column prop="action" :label="$t('audit.action')" width="120" />
        <el-table-column prop="status" :label="$t('audit.status')" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ $t(`audit.status.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ipAddress" :label="$t('audit.ipAddress')" width="130" />
        <el-table-column prop="description" :label="$t('audit.description')" min-width="200" />
      </el-table>
    </el-dialog>

    <!-- 导出对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      :title="$t('audit.exportLogs')"
      width="500px"
    >
      <el-form :model="exportForm" label-width="100px">
        <el-form-item :label="$t('audit.exportFormat')">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="csv">CSV</el-radio>
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="json">JSON</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item :label="$t('audit.exportFields')">
          <el-checkbox-group v-model="exportForm.fields">
            <el-checkbox label="createTime">{{ $t('audit.time') }}</el-checkbox>
            <el-checkbox label="username">{{ $t('audit.user') }}</el-checkbox>
            <el-checkbox label="module">{{ $t('audit.module') }}</el-checkbox>
            <el-checkbox label="action">{{ $t('audit.action') }}</el-checkbox>
            <el-checkbox label="status">{{ $t('audit.status') }}</el-checkbox>
            <el-checkbox label="ipAddress">{{ $t('audit.ipAddress') }}</el-checkbox>
            <el-checkbox label="description">{{ $t('audit.description') }}</el-checkbox>
            <el-checkbox label="duration">{{ $t('audit.duration') }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="exportDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmExport" :loading="exporting">
          {{ $t('audit.confirmExport') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Refresh } from '@element-plus/icons-vue'
import { auditLogApiService, type AuditLog, type AuditLogQueryParams, type AuditLogStats } from '@/api/services/audit'
import { formatDateTime } from '@/utils/date'

const { t } = useI18n()

// 响应式数据
const logs = ref<AuditLog[]>([])
const loading = ref(false)
const exporting = ref(false)
const batchDeleting = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const selectedLogs = ref<AuditLog[]>([])
const realTimeMode = ref(false)
const realTimeWs = ref<WebSocket | null>(null)

// 搜索表单
const searchForm = reactive<AuditLogQueryParams>({
  username: '',
  action: '',
  module: '',
  status: undefined,
  ipAddress: ''
})

const timeRange = ref<[string, string] | null>(null)

// 选项数据
const moduleOptions = ref<string[]>([])
const actionOptions = ref<string[]>([])

// 统计数据
const stats = ref<AuditLogStats>({
  total: 0,
  todayCount: 0,
  successCount: 0,
  failedCount: 0,
  warningCount: 0,
  topModules: [],
  topActions: [],
  topUsers: [],
  hourlyStats: []
})

// 对话框状态
const detailDialogVisible = ref(false)
const trailDialogVisible = ref(false)
const exportDialogVisible = ref(false)
const currentLog = ref<AuditLog | null>(null)
const userTrail = ref<AuditLog[]>([])
const loadingTrail = ref(false)

// 导出表单
const exportForm = reactive({
  format: 'csv' as 'csv' | 'excel' | 'json',
  fields: ['createTime', 'username', 'module', 'action', 'status', 'ipAddress', 'description']
})

// 计算属性
const queryParams = computed(() => {
  const params: AuditLogQueryParams = {
    page: currentPage.value,
    size: pageSize.value,
    ...searchForm
  }
  
  if (timeRange.value) {
    params.startTime = timeRange.value[0]
    params.endTime = timeRange.value[1]
  }
  
  return params
})

// 方法
const loadLogs = async () => {
  loading.value = true
  try {
    const result = await auditLogApiService.getAuditLogs(queryParams.value)
    logs.value = result.records
    total.value = result.total
  } catch (error) {
    ElMessage.error(t('audit.loadLogsFailed'))
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const params = timeRange.value ? {
      startTime: timeRange.value[0],
      endTime: timeRange.value[1]
    } : undefined
    stats.value = await auditLogApiService.getAuditLogStats(params)
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const loadOptions = async () => {
  try {
    const [modules, actions] = await Promise.all([
      auditLogApiService.getModules(),
      auditLogApiService.getActions()
    ])
    moduleOptions.value = modules
    actionOptions.value = actions
  } catch (error) {
    console.error('Failed to load options:', error)
  }
}

const handleModuleChange = async () => {
  if (searchForm.module) {
    try {
      actionOptions.value = await auditLogApiService.getActions(searchForm.module)
    } catch (error) {
      console.error('Failed to load actions for module:', error)
    }
  } else {
    loadOptions()
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadLogs()
  loadStats()
}

const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    action: '',
    module: '',
    status: undefined,
    ipAddress: ''
  })
  timeRange.value = null
  currentPage.value = 1
  loadLogs()
  loadStats()
}

const refreshLogs = () => {
  loadLogs()
  loadStats()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadLogs()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadLogs()
}

const handleSelectionChange = (selection: AuditLog[]) => {
  selectedLogs.value = selection
}

const handleRowClick = (row: AuditLog) => {
  handleViewDetail(row)
}

const handleViewDetail = (log: AuditLog) => {
  currentLog.value = log
  detailDialogVisible.value = true
}

const handleViewUserTrail = async (log: AuditLog) => {
  loadingTrail.value = true
  trailDialogVisible.value = true
  try {
    const result = await auditLogApiService.getUserActionTrail(log.userId, {
      startTime: timeRange.value?.[0],
      endTime: timeRange.value?.[1],
      page: 1,
      size: 50
    })
    userTrail.value = result.records
  } catch (error) {
    ElMessage.error(t('audit.loadTrailFailed'))
  } finally {
    loadingTrail.value = false
  }
}

const handleExport = () => {
  exportDialogVisible.value = true
}

const handleBatchExport = () => {
  exportForm.fields = ['createTime', 'username', 'module', 'action', 'status', 'ipAddress', 'description']
  exportDialogVisible.value = true
}

const confirmExport = async () => {
  exporting.value = true
  try {
    const params = {
      ...queryParams.value,
      format: exportForm.format,
      fields: exportForm.fields
    }
    
    if (selectedLogs.value.length > 0) {
      // 导出选中的日志
      params.ids = selectedLogs.value.map(log => log.id)
    }
    
    const blob = await auditLogApiService.exportAuditLogs(params)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${exportForm.format}`
    a.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success(t('audit.exportSuccess'))
    exportDialogVisible.value = false
  } catch (error) {
    ElMessage.error(t('audit.exportFailed'))
  } finally {
    exporting.value = false
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('audit.batchDeleteConfirm', { count: selectedLogs.value.length }),
      t('common.warning'),
      {
        type: 'warning',
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel')
      }
    )
    
    batchDeleting.value = true
    const ids = selectedLogs.value.map(log => log.id)
    await auditLogApiService.batchDeleteLogs(ids)
    
    ElMessage.success(t('audit.batchDeleteSuccess'))
    selectedLogs.value = []
    loadLogs()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('audit.batchDeleteFailed'))
    }
  } finally {
    batchDeleting.value = false
  }
}

const toggleRealTime = (enabled: boolean) => {
  if (enabled) {
    startRealTimeMode()
  } else {
    stopRealTimeMode()
  }
}

const startRealTimeMode = () => {
  realTimeWs.value = auditLogApiService.connectRealTimeLogs(
    (newLog: AuditLog) => {
      // 将新日志添加到列表顶部
      logs.value.unshift(newLog)
      // 保持列表长度不超过当前页面大小
      if (logs.value.length > pageSize.value) {
        logs.value = logs.value.slice(0, pageSize.value)
      }
      // 更新统计
      stats.value.total++
      if (newLog.status === 'success') stats.value.successCount++
      else if (newLog.status === 'failed') stats.value.failedCount++
      else if (newLog.status === 'warning') stats.value.warningCount++
    },
    (error) => {
      console.error('Real-time log error:', error)
      ElMessage.error(t('audit.realTimeError'))
      realTimeMode.value = false
    }
  )
}

const stopRealTimeMode = () => {
  if (realTimeWs.value) {
    realTimeWs.value.close()
    realTimeWs.value = null
  }
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'danger'
    case 'warning':
      return 'warning'
    default:
      return 'info'
  }
}

// 生命周期
onMounted(() => {
  loadLogs()
  loadStats()
  loadOptions()
})

onUnmounted(() => {
  stopRealTimeMode()
})
</script>

<style scoped>
.audit-log-container {
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
  align-items: center;
  gap: 12px;
}

.filter-card {
  margin-bottom: 20px;
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
  
  &.danger {
    border-color: var(--el-color-danger);
    
    .stat-value {
      color: var(--el-color-danger);
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

.table-card {
  position: relative;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.batch-actions {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 8px;
  background: var(--el-bg-color);
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: var(--el-box-shadow-light);
}

.log-detail {
  .data-section {
    margin-top: 20px;
    
    h4 {
      margin-bottom: 8px;
      color: var(--el-text-color-primary);
    }
  }
}
</style>