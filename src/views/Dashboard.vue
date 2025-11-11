<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>欢迎回来，{{ username }}</h1>
      <p>今天是 {{ today }}，祝您工作愉快！</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card card-shadow">
        <div class="stat-content">
          <div class="stat-icon primary">
            <el-icon><i-ep-user /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ userCount }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card card-shadow">
        <div class="stat-content">
          <div class="stat-icon success">
            <el-icon><i-ep-setting /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ roleCount }}</div>
            <div class="stat-label">角色总数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card card-shadow">
        <div class="stat-content">
          <div class="stat-icon warning">
            <el-icon><i-ep-lock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ permissionCount }}</div>
            <div class="stat-label">权限总数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card card-shadow">
        <div class="stat-content">
          <div class="stat-icon danger">
            <el-icon><i-ep-document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ logCount }}</div>
            <div class="stat-label">今日登录</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 最近操作日志 -->
    <div class="recent-logs card-shadow">
      <el-card header="最近操作日志">
        <el-table :data="recentLogs" stripe style="width: 100%">
          <el-table-column prop="username" label="操作用户" width="120" />
          <el-table-column prop="action" label="操作内容" />
          <el-table-column prop="time" label="操作时间" width="180" />
          <el-table-column prop="ip" label="IP地址" width="120" />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const username = ref('管理员')
const userCount = ref(0)
const roleCount = ref(0)
const permissionCount = ref(0)
const logCount = ref(0)
const recentLogs = ref([])

// 计算今天的日期
const today = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const fetchDashboardData = () => {
  // 模拟获取仪表盘数据
  // 实际项目中应该调用真实的API接口
  userCount.value = 156
  roleCount.value = 12
  permissionCount.value = 89
  logCount.value = 234
  
  // 模拟最近操作日志
  recentLogs.value = [
    {
      username: '张三',
      action: '修改了用户信息',
      time: '2025-11-11 15:30:22',
      ip: '192.168.1.100'
    },
    {
      username: '李四',
      action: '添加了新角色',
      time: '2025-11-11 14:25:10',
      ip: '192.168.1.101'
    },
    {
      username: '王五',
      action: '删除了权限配置',
      time: '2025-11-11 13:45:55',
      ip: '192.168.1.102'
    },
    {
      username: '赵六',
      action: '登录系统',
      time: '2025-11-11 10:15:30',
      ip: '192.168.1.103'
    }
  ]
}

onMounted(() => {
  // 获取用户信息
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      username.value = user.nickname || user.username || '管理员'
    } catch (e) {
      console.error('解析用户信息失败', e)
    }
  }
  
  // 获取仪表盘数据
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 10px 0;
}

.dashboard-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  border: none;
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #fff;
}

.stat-icon.primary {
  background-color: #409eff;
}

.stat-icon.success {
  background-color: #67c23a;
}

.stat-icon.warning {
  background-color: #e6a23c;
}

.stat-icon.danger {
  background-color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 最近操作日志样式 */
.recent-logs {
  border-radius: 8px;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>