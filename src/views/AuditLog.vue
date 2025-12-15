<template>
  <div class="audit-log">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>审计日志</span>
          <div class="header-actions">
            <el-button type="primary" @click="exportLogs">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
            <el-button @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="操作模块">
          <el-select v-model="searchForm.module" placeholder="请选择模块" clearable>
            <el-option label="用户管理" value="用户管理" />
            <el-option label="角色管理" value="角色管理" />
            <el-option label="权限管理" value="权限管理" />
            <el-option label="组织管理" value="组织管理" />
            <el-option label="系统配置" value="系统配置" />
            <el-option label="认证管理" value="认证管理" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.operation" placeholder="请选择操作类型" clearable>
            <el-option label="创建" value="CREATE" />
            <el-option label="更新" value="UPDATE" />
            <el-option label="删除" value="DELETE" />
            <el-option label="查询" value="SELECT" />
            <el-option label="登录" value="LOGIN" />
            <el-option label="登出" value="LOGOUT" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="操作用户">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="searchLogs">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 审计日志表格 -->
      <el-table :data="auditLogs" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="module" label="操作模块" width="120" />
        <el-table-column prop="operation" label="操作类型" width="100">
          <template #default="scope">
            <el-tag :type="getOperationTagType(scope.row.operation)">
              {{ getOperationText(scope.row.operation) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="200" />
        <el-table-column prop="username" label="操作用户" width="120" />
        <el-table-column prop="ipAddress" label="IP地址" width="130" />
        <el-table-column prop="userAgent" label="用户代理" width="150" show-overflow-tooltip />
        <el-table-column prop="operationTime" label="操作时间" width="160" />
        <el-table-column prop="executionTime" label="执行时间(ms)" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'SUCCESS' ? 'success' : 'danger'">
              {{ scope.row.status === 'SUCCESS' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialog.visible" title="审计日志详情" width="60%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ detailDialog.data.id }}</el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ detailDialog.data.module }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ getOperationText(detailDialog.data.operation) }}</el-descriptions-item>
        <el-descriptions-item label="操作用户">{{ detailDialog.data.username }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailDialog.data.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detailDialog.data.operationTime }}</el-descriptions-item>
        <el-descriptions-item label="执行时间">{{ detailDialog.data.executionTime }}ms</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailDialog.data.status === 'SUCCESS' ? 'success' : 'danger'">
            {{ detailDialog.data.status === 'SUCCESS' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作描述" :span="2">{{ detailDialog.data.description }}</el-descriptions-item>
        <el-descriptions-item label="用户代理" :span="2">{{ detailDialog.data.userAgent }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider />
      
      <div v-if="detailDialog.data.requestParams">
        <h4>请求参数</h4>
        <el-input
          v-model="detailDialog.data.requestParams"
          type="textarea"
          :rows="5"
          readonly
        />
      </div>
      
      <div v-if="detailDialog.data.responseData" style="margin-top: 15px;">
        <h4>响应数据</h4>
        <el-input
          v-model="detailDialog.data.responseData"
          type="textarea"
          :rows="5"
          readonly
        />
      </div>
      
      <div v-if="detailDialog.data.errorMessage" style="margin-top: 15px;">
        <h4>错误信息</h4>
        <el-input
          v-model="detailDialog.data.errorMessage"
          type="textarea"
          :rows="3"
          readonly
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Refresh } from '@element-plus/icons-vue'
import api from '../api'

// 响应式数据
const loading = ref(false)
const auditLogs = ref([])

const searchForm = reactive({
  module: '',
  operation: '',
  username: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const detailDialog = reactive({
  visible: false,
  data: {}
})

// 方法
const refreshData = async () => {
  await getAuditLogs()
}

const getAuditLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      module: searchForm.module,
      operation: searchForm.operation,
      username: searchForm.username
    }
    
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startTime = searchForm.dateRange[0]
      params.endTime = searchForm.dateRange[1]
    }
    
    const response = await api.auditLog.getList(params)
    auditLogs.value = response.data.records || []
    pagination.total = response.data.total || 0
  } catch (error) {
    console.error('获取审计日志失败:', error)
  } finally {
    loading.value = false
  }
}

const searchLogs = async () => {
  pagination.page = 1
  await getAuditLogs()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    module: '',
    operation: '',
    username: '',
    dateRange: []
  })
  searchLogs()
}

const viewDetail = (row) => {
  detailDialog.data = { ...row }
  detailDialog.visible = true
}

const exportLogs = async () => {
  try {
    const params = {
      module: searchForm.module,
      operation: searchForm.operation,
      username: searchForm.username
    }
    
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startTime = searchForm.dateRange[0]
      params.endTime = searchForm.dateRange[1]
    }
    
    const response = await api.auditLog.export(params)
    
    // 创建下载链接
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit_logs_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出审计日志失败:', error)
  }
}

const getOperationTagType = (operation) => {
  const typeMap = {
    'CREATE': 'success',
    'UPDATE': 'warning',
    'DELETE': 'danger',
    'SELECT': 'info',
    'LOGIN': 'primary',
    'LOGOUT': 'info'
  }
  return typeMap[operation] || 'info'
}

const getOperationText = (operation) => {
  const textMap = {
    'CREATE': '创建',
    'UPDATE': '更新',
    'DELETE': '删除',
    'SELECT': '查询',
    'LOGIN': '登录',
    'LOGOUT': '登出'
  }
  return textMap[operation] || operation
}

const handleSizeChange = (val) => {
  pagination.size = val
  getAuditLogs()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  getAuditLogs()
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.audit-log {
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

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>