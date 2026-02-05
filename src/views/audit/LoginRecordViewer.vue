<template>
  <div class="login-record-container">
    <div class="page-header">
      <h2>{{ $t('login.recordViewer') }}</h2>
      <div class="header-actions">
        <el-button :icon="Download" @click="handleExport" :loading="exporting">
          {{ $t('login.export') }}
        </el-button>
        <el-button :icon="Refresh" @click="refreshRecords">
          {{ $t('common.refresh') }}
        </el-button>
        <el-button :icon="TrendCharts" @click="showStatistics">
          {{ $t('login.statistics') }}
        </el-button>
      </div>
    </div>

    <!-- 搜索过滤器 -->
    <el-card class="filter-card">
      <el-form :model="searchForm" inline>
        <el-form-item :label="$t('login.username')">
          <el-input
            v-model="searchForm.username"
            :placeholder="$t('login.enterUsername')"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        
        <el-form-item :label="$t('login.status')">
          <el-select
            v-model="searchForm.status"
            :placeholder="$t('login.selectStatus')"
            clearable
            style="width: 120px"
          >
            <el-option :label="$t('login.success')" :value="1" />
            <el-option :label="$t('login.failed')" :value="0" />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('login.channel')">
          <el-select
            v-model="searchForm.channel"
            :placeholder="$t('login.selectChannel')"
            clearable
            style="width: 120px"
          >
            <el-option label="Web" value="web" />
            <el-option label="Mobile" value="mobile" />
            <el-option label="API" value="api" />
            <el-option label="WeChat" value="wechat" />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('login.ipAddress')">
          <el-input
            v-model="searchForm.ipAddress"
            :placeholder="$t('login.enterIpAddress')"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        
        <el-form-item :label="$t('login.timeRange')">
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            :range-separator="$t('common.to')"
            :start-placeholder="$t('login.startTime')"
            :end-placeholder="$t('login.endTime')"
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

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ stats.totalLogins }}</div>
            <div class="stat-label">{{ $t('login.totalLogins') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card success">
          <div class="stat-item">
            <div class="stat-value">{{ stats.successLogins }}</div>
            <div class="stat-label">{{ $t('login.successLogins') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card danger">
          <div class="stat-item">
            <div class="stat-value">{{ stats.failedLogins }}</div>
            <div class="stat-label">{{ $t('login.failedLogins') }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card warning">
          <div class="stat-item">
            <div class="stat-value">{{ stats.suspiciousLogins }}</div>
            <div class="stat-label">{{ $t('login.suspiciousLogins') }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 登录记录表格 -->
    <el-card class="table-card">
      <el-table
        :data="records"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="loginTime" :label="$t('login.time')" width="180" sortable>
          <template #default="{ row }">
            {{ formatDateTime(row.loginTime) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="username" :label="$t('login.user')" width="120" />
        
        <el-table-column prop="status" :label="$t('login.status')" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? $t('login.success') : $t('login.failed') }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="channel" :label="$t('login.channel')" width="100">
          <template #default="{ row }">
            <el-tag :type="getChannelType(row.channel)" size="small">
              {{ row.channel }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="ipAddress" :label="$t('login.ipAddress')" width="130">
          <template #default="{ row }">
            <span class="ip-address" @click="handleIpClick(row.ipAddress)">
              {{ row.ipAddress }}
            </span>
            <el-tag
              v-if="row.location"
              size="small"
              type="info"
              class="location-tag"
            >
              {{ row.location }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="deviceInfo" :label="$t('login.device')" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="device-info">
              <div>{{ row.deviceInfo }}</div>
              <div v-if="row.deviceId" class="device-id">ID: {{ row.deviceId }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="message" :label="$t('login.message')" min-width="150" show-overflow-tooltip />
        
        <el-table-column :label="$t('login.risk')" width="100">
          <template #default="{ row }">
            <el-tag
              v-if="row.riskLevel"
              :type="getRiskType(row.riskLevel)"
              size="small"
            >
              {{ $t(`login.risk.${row.riskLevel}`) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column :label="$t('common.actions')" width="150" fixed="right">
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
              @click.stop="handleViewUserHistory(row)"
            >
              {{ $t('login.userHistory') }}
            </el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="warning"
              link
              @click.stop="handleAnalyzeFailed(row)"
            >
              {{ $t('login.analyze') }}
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

    <!-- 登录详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="$t('login.loginDetail')"
      width="800px"
      destroy-on-close
    >
      <div v-if="currentRecord" class="login-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('login.time')">
            {{ formatDateTime(currentRecord.loginTime) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('login.user')">
            {{ currentRecord.username }} (ID: {{ currentRecord.userId }})
          </el-descriptions-item>
          <el-descriptions-item :label="$t('login.status')">
            <el-tag :type="currentRecord.status === 1 ? 'success' : 'danger'">
              {{ currentRecord.status === 1 ? $t('login.success') : $t('login.failed') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('login.channel')">
            <el-tag :type="getChannelType(currentRecord.channel)">
              {{ currentRecord.channel }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('login.ipAddress')">
            {{ currentRecord.ipAddress }}
            <el-tag v-if="currentRecord.location" size="small" type="info">
              {{ currentRecord.location }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('login.userAgent')" :span="2">
            {{ currentRecord.userAgent }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('login.deviceInfo')" :span="2">
            {{ currentRecord.deviceInfo }}
            <div v-if="currentRecord.deviceId">设备ID: {{ currentRecord.deviceId }}</div>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('login.message')" :span="2">
            {{ currentRecord.message }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.clientVersion" :label="$t('login.clientVersion')">
            {{ currentRecord.clientVersion }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.riskLevel" :label="$t('login.riskLevel')">
            <el-tag :type="getRiskType(currentRecord.riskLevel)">
              {{ $t(`login.risk.${currentRecord.riskLevel}`) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 风险分析 -->
        <div v-if="currentRecord.riskFactors && currentRecord.riskFactors.length > 0" class="risk-section">
          <h4>{{ $t('login.riskFactors') }}</h4>
          <el-tag
            v-for="factor in currentRecord.riskFactors"
            :key="factor"
            type="warning"
            size="small"
            class="risk-factor"
          >
            {{ $t(`login.riskFactors.${factor}`) }}
          </el-tag>
        </div>
      </div>
    </el-dialog>

    <!-- 用户登录历史对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      :title="$t('login.userLoginHistory')"
      width="1000px"
      destroy-on-close
    >
      <el-table :data="userHistory" v-loading="loadingHistory" stripe>
        <el-table-column prop="loginTime" :label="$t('login.time')" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.loginTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('login.status')" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? $t('login.success') : $t('login.failed') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channel" :label="$t('login.channel')" width="100" />
        <el-table-column prop="ipAddress" :label="$t('login.ipAddress')" width="130" />
        <el-table-column prop="deviceInfo" :label="$t('login.device')" min-width="200" />
        <el-table-column prop="message" :label="$t('login.message')" min-width="150" />
      </el-table>
    </el-dialog>

    <!-- 统计图表对话框 -->
    <el-dialog
      v-model="statisticsDialogVisible"
      :title="$t('login.loginStatistics')"
      width="1200px"
      destroy-on-close
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-container">
            <h4>{{ $t('login.loginTrend') }}</h4>
            <div ref="trendChartRef" class="chart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <h4>{{ $t('login.channelDistribution') }}</h4>
            <div ref="channelChartRef" class="chart"></div>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <div class="chart-container">
            <h4>{{ $t('login.geographicDistribution') }}</h4>
            <div ref="geoChartRef" class="chart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <h4>{{ $t('login.hourlyDistribution') }}</h4>
            <div ref="hourlyChartRef" class="chart"></div>
          </div>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- IP地址历史对话框 -->
    <el-dialog
      v-model="ipHistoryDialogVisible"
      :title="$t('login.ipHistory')"
      width="800px"
      destroy-on-close
    >
      <div v-if="currentIp" class="ip-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('login.ipAddress')">
            {{ currentIp }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('login.location')">
            {{ ipInfo.location || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('login.isp')">
            {{ ipInfo.isp || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('login.riskLevel')">
            <el-tag :type="getRiskType(ipInfo.riskLevel || 'low')">
              {{ $t(`login.risk.${ipInfo.riskLevel || 'low'}`) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <el-table :data="ipHistory" v-loading="loadingIpHistory" stripe style="margin-top: 20px;">
        <el-table-column prop="loginTime" :label="$t('login.time')" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.loginTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="username" :label="$t('login.user')" width="120" />
        <el-table-column prop="status" :label="$t('login.status')" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? $t('login.success') : $t('login.failed') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channel" :label="$t('login.channel')" width="100" />
        <el-table-column prop="deviceInfo" :label="$t('login.device')" min-width="200" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Download, Refresh, TrendCharts } from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/date'

const { t } = useI18n()

// 登录记录接口
interface LoginRecord {
  id: number
  userId: number
  username: string
  status: number
  message: string
  ipAddress: string
  userAgent: string
  channel: string
  deviceId?: string
  deviceInfo?: string
  clientVersion?: string
  location?: string
  riskLevel?: 'low' | 'medium' | 'high'
  riskFactors?: string[]
  loginTime: string
}

// 登录统计接口
interface LoginStats {
  totalLogins: number
  successLogins: number
  failedLogins: number
  suspiciousLogins: number
  trendData: Array<{ date: string; success: number; failed: number }>
  channelData: Array<{ channel: string; count: number }>
  geoData: Array<{ location: string; count: number }>
  hourlyData: Array<{ hour: number; count: number }>
}

// IP信息接口
interface IpInfo {
  location?: string
  isp?: string
  riskLevel?: 'low' | 'medium' | 'high'
}

// 响应式数据
const records = ref<LoginRecord[]>([])
const loading = ref(false)
const exporting = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const selectedRecords = ref<LoginRecord[]>([])

// 搜索表单
const searchForm = reactive({
  username: '',
  status: undefined as number | undefined,
  channel: '',
  ipAddress: ''
})

const timeRange = ref<[string, string] | null>(null)

// 统计数据
const stats = ref<LoginStats>({
  totalLogins: 0,
  successLogins: 0,
  failedLogins: 0,
  suspiciousLogins: 0,
  trendData: [],
  channelData: [],
  geoData: [],
  hourlyData: []
})

// 对话框状态
const detailDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const statisticsDialogVisible = ref(false)
const ipHistoryDialogVisible = ref(false)
const currentRecord = ref<LoginRecord | null>(null)
const userHistory = ref<LoginRecord[]>([])
const loadingHistory = ref(false)
const ipHistory = ref<LoginRecord[]>([])
const loadingIpHistory = ref(false)
const currentIp = ref('')
const ipInfo = ref<IpInfo>({})

// 图表引用
const trendChartRef = ref()
const channelChartRef = ref()
const geoChartRef = ref()
const hourlyChartRef = ref()

// 计算属性
const queryParams = computed(() => {
  const params: any = {
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

// 模拟API调用
const mockApiCall = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

// 方法
const loadRecords = async () => {
  loading.value = true
  try {
    // 模拟API调用
    const mockRecords: LoginRecord[] = Array.from({ length: pageSize.value }, (_, index) => ({
      id: index + 1,
      userId: Math.floor(Math.random() * 1000) + 1,
      username: `user${Math.floor(Math.random() * 100) + 1}`,
      status: Math.random() > 0.2 ? 1 : 0,
      message: Math.random() > 0.2 ? '登录成功' : '密码错误',
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      channel: ['web', 'mobile', 'api', 'wechat'][Math.floor(Math.random() * 4)],
      deviceInfo: 'Windows 10, Chrome 91.0',
      location: ['北京', '上海', '广州', '深圳'][Math.floor(Math.random() * 4)],
      riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      loginTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }))
    
    await mockApiCall(mockRecords)
    records.value = mockRecords
    total.value = 1000
  } catch (error) {
    ElMessage.error(t('login.loadRecordsFailed'))
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const mockStats: LoginStats = {
      totalLogins: 1000,
      successLogins: 850,
      failedLogins: 120,
      suspiciousLogins: 30,
      trendData: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        success: Math.floor(Math.random() * 100) + 50,
        failed: Math.floor(Math.random() * 20) + 5
      })),
      channelData: [
        { channel: 'web', count: 500 },
        { channel: 'mobile', count: 300 },
        { channel: 'api', count: 150 },
        { channel: 'wechat', count: 50 }
      ],
      geoData: [
        { location: '北京', count: 300 },
        { location: '上海', count: 250 },
        { location: '广州', count: 200 },
        { location: '深圳', count: 150 },
        { location: '其他', count: 100 }
      ],
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.floor(Math.random() * 50) + 10
      }))
    }
    
    await mockApiCall(mockStats)
    stats.value = mockStats
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadRecords()
}

const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    status: undefined,
    channel: '',
    ipAddress: ''
  })
  timeRange.value = null
  currentPage.value = 1
  loadRecords()
}

const refreshRecords = () => {
  loadRecords()
  loadStats()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadRecords()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadRecords()
}

const handleSelectionChange = (selection: LoginRecord[]) => {
  selectedRecords.value = selection
}

const handleRowClick = (row: LoginRecord) => {
  handleViewDetail(row)
}

const handleViewDetail = (record: LoginRecord) => {
  currentRecord.value = record
  detailDialogVisible.value = true
}

const handleViewUserHistory = async (record: LoginRecord) => {
  loadingHistory.value = true
  historyDialogVisible.value = true
  try {
    // 模拟API调用
    const mockHistory: LoginRecord[] = Array.from({ length: 10 }, (_, index) => ({
      ...record,
      id: index + 1,
      loginTime: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString()
    }))
    
    await mockApiCall(mockHistory)
    userHistory.value = mockHistory
  } catch (error) {
    ElMessage.error(t('login.loadHistoryFailed'))
  } finally {
    loadingHistory.value = false
  }
}

const handleIpClick = async (ipAddress: string) => {
  currentIp.value = ipAddress
  loadingIpHistory.value = true
  ipHistoryDialogVisible.value = true
  
  try {
    // 模拟IP信息和历史记录
    const mockIpInfo: IpInfo = {
      location: '北京市',
      isp: '中国电信',
      riskLevel: 'low'
    }
    
    const mockIpHistory: LoginRecord[] = Array.from({ length: 5 }, (_, index) => ({
      id: index + 1,
      userId: Math.floor(Math.random() * 1000) + 1,
      username: `user${Math.floor(Math.random() * 100) + 1}`,
      status: Math.random() > 0.3 ? 1 : 0,
      message: Math.random() > 0.3 ? '登录成功' : '密码错误',
      ipAddress,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      channel: ['web', 'mobile', 'api'][Math.floor(Math.random() * 3)],
      deviceInfo: 'Windows 10, Chrome 91.0',
      loginTime: new Date(Date.now() - index * 60 * 60 * 1000).toISOString()
    }))
    
    await mockApiCall({ info: mockIpInfo, history: mockIpHistory })
    ipInfo.value = mockIpInfo
    ipHistory.value = mockIpHistory
  } catch (error) {
    ElMessage.error(t('login.loadIpHistoryFailed'))
  } finally {
    loadingIpHistory.value = false
  }
}

const handleAnalyzeFailed = (record: LoginRecord) => {
  ElMessage.info(`分析失败登录: ${record.username} - ${record.message}`)
}

const handleExport = async () => {
  exporting.value = true
  try {
    // 模拟导出
    await mockApiCall(null, 1000)
    ElMessage.success(t('login.exportSuccess'))
  } catch (error) {
    ElMessage.error(t('login.exportFailed'))
  } finally {
    exporting.value = false
  }
}

const showStatistics = () => {
  statisticsDialogVisible.value = true
  nextTick(() => {
    // 这里可以初始化图表
    initCharts()
  })
}

const initCharts = () => {
  // 这里可以使用 ECharts 或其他图表库初始化图表
  console.log('Initialize charts with data:', stats.value)
}

const getChannelType = (channel: string) => {
  switch (channel) {
    case 'web':
      return 'primary'
    case 'mobile':
      return 'success'
    case 'api':
      return 'warning'
    case 'wechat':
      return 'info'
    default:
      return ''
  }
}

const getRiskType = (riskLevel: string) => {
  switch (riskLevel) {
    case 'low':
      return 'success'
    case 'medium':
      return 'warning'
    case 'high':
      return 'danger'
    default:
      return 'info'
  }
}

// 生命周期
onMounted(() => {
  loadRecords()
  loadStats()
})
</script>

<style scoped>
.login-record-container {
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

.ip-address {
  cursor: pointer;
  color: var(--el-color-primary);
  
  &:hover {
    text-decoration: underline;
  }
}

.location-tag {
  margin-left: 4px;
}

.device-info {
  .device-id {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.login-detail {
  .risk-section {
    margin-top: 20px;
    
    h4 {
      margin-bottom: 8px;
      color: var(--el-text-color-primary);
    }
    
    .risk-factor {
      margin-right: 8px;
      margin-bottom: 4px;
    }
  }
}

.chart-container {
  h4 {
    margin-bottom: 12px;
    color: var(--el-text-color-primary);
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
}

.ip-info {
  margin-bottom: 20px;
}
</style>