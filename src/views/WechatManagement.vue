<template>
  <div class="wechat-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>微信小程序管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="showConfigDialog">
              <el-icon><Setting /></el-icon>
              配置管理
            </el-button>
            <el-button @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 微信配置信息 -->
      <el-row :gutter="20" class="config-row">
        <el-col :span="8">
          <el-card>
            <el-statistic title="AppID" :value="config.appId || '未配置'" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <el-statistic title="AppSecret" :value="config.appSecret ? '已配置' : '未配置'" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <el-statistic title="配置状态" :value="config.enabled ? '已启用' : '已禁用'" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 微信用户列表 -->
      <el-divider />
      
      <div class="table-header">
        <h3>微信用户列表</h3>
        <el-form :model="searchForm" :inline="true">
          <el-form-item label="昵称">
            <el-input v-model="searchForm.nickname" placeholder="请输入昵称" clearable />
          </el-form-item>
          <el-form-item label="绑定状态">
            <el-select v-model="searchForm.bindStatus" placeholder="请选择状态" clearable>
              <el-option label="已绑定" value="bound" />
              <el-option label="未绑定" value="unbound" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchUsers">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="wechatUsers" style="width: 100%" v-loading="loading">
        <el-table-column prop="openId" label="OpenID" width="200" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.gender === 1 ? 'primary' : scope.row.gender === 2 ? 'danger' : 'info'">
              {{ scope.row.gender === 1 ? '男' : scope.row.gender === 2 ? '女' : '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="province" label="省份" width="100" />
        <el-table-column prop="country" label="国家" width="100" />
        <el-table-column prop="systemUserId" label="绑定用户ID" width="120" />
        <el-table-column prop="systemUsername" label="绑定用户名" width="120" />
        <el-table-column prop="bindStatus" label="绑定状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.systemUserId ? 'success' : 'warning'">
              {{ scope.row.systemUserId ? '已绑定' : '未绑定' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              v-if="!scope.row.systemUserId"
              @click="showBindDialog(scope.row)"
            >
              绑定
            </el-button>
            <el-button 
              size="small" 
              type="warning" 
              v-if="scope.row.systemUserId"
              @click="unbindUser(scope.row)"
            >
              解绑
            </el-button>
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

    <!-- 配置对话框 -->
    <el-dialog v-model="configDialog.visible" title="微信配置管理" width="50%">
      <el-form :model="configDialog.data" :rules="configRules" ref="configFormRef" label-width="120px">
        <el-form-item label="AppID" prop="appId">
          <el-input v-model="configDialog.data.appId" placeholder="请输入微信小程序AppID" />
        </el-form-item>
        
        <el-form-item label="AppSecret" prop="appSecret">
          <el-input 
            v-model="configDialog.data.appSecret" 
            type="password" 
            placeholder="请输入微信小程序AppSecret"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="启用状态">
          <el-switch v-model="configDialog.data.enabled" />
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input 
            v-model="configDialog.data.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入配置描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="configDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="saveConfig">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 绑定用户对话框 -->
    <el-dialog v-model="bindDialog.visible" title="绑定系统用户" width="40%">
      <el-form :model="bindDialog.data" label-width="120px">
        <el-form-item label="微信用户">
          <el-input :value="bindDialog.data.nickname" readonly />
        </el-form-item>
        <el-form-item label="选择用户">
          <el-select 
            v-model="bindDialog.data.systemUserId" 
            placeholder="请选择要绑定的系统用户"
            filterable
            remote
            :remote-method="searchSystemUsers"
            :loading="bindDialog.loading"
          >
            <el-option
              v-for="user in systemUsers"
              :key="user.id"
              :label="`${user.username} (${user.realName})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bindDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="confirmBind">确定绑定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, Refresh } from '@element-plus/icons-vue'
import api from '../api'

// 响应式数据
const loading = ref(false)
const wechatUsers = ref([])
const systemUsers = ref([])
const config = reactive({
  appId: '',
  appSecret: '',
  enabled: false,
  description: ''
})

const searchForm = reactive({
  nickname: '',
  bindStatus: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const configDialog = reactive({
  visible: false,
  data: {}
})

const bindDialog = reactive({
  visible: false,
  loading: false,
  data: {
    openId: '',
    nickname: '',
    systemUserId: null
  }
})

const configFormRef = ref()

// 表单验证规则
const configRules = {
  appId: [{ required: true, message: '请输入AppID', trigger: 'blur' }],
  appSecret: [{ required: true, message: '请输入AppSecret', trigger: 'blur' }]
}

// 方法
const refreshData = async () => {
  await Promise.all([
    getWechatConfig(),
    getWechatUsers()
  ])
}

const getWechatConfig = async () => {
  try {
    const response = await api.wechat.getConfig()
    Object.assign(config, response.data)
  } catch (error) {
    console.error('获取微信配置失败:', error)
  }
}

const getWechatUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      nickname: searchForm.nickname,
      bindStatus: searchForm.bindStatus
    }
    
    const response = await api.thirdPartyUser.getList({ ...params, platform: 'wechat' })
    wechatUsers.value = response.data.records || []
    pagination.total = response.data.total || 0
  } catch (error) {
    console.error('获取微信用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const searchUsers = async () => {
  pagination.page = 1
  await getWechatUsers()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    nickname: '',
    bindStatus: ''
  })
  searchUsers()
}

const showConfigDialog = () => {
  configDialog.data = { ...config }
  configDialog.visible = true
}

const saveConfig = async () => {
  if (!configFormRef.value) return
  
  try {
    await configFormRef.value.validate()
    
    await api.wechat.updateConfig(configDialog.data)
    ElMessage.success('配置保存成功')
    configDialog.visible = false
    await getWechatConfig()
  } catch (error) {
    console.error('保存配置失败:', error)
  }
}

const showBindDialog = (row) => {
  bindDialog.data.openId = row.openId
  bindDialog.data.nickname = row.nickname
  bindDialog.data.systemUserId = null
  bindDialog.visible = true
  searchSystemUsers('')
}

const searchSystemUsers = async (query) => {
  bindDialog.loading = true
  try {
    const response = await api.user.getList({ username: query, page: 1, size: 20 })
    systemUsers.value = response.data.records || []
  } catch (error) {
    console.error('搜索系统用户失败:', error)
  } finally {
    bindDialog.loading = false
  }
}

const confirmBind = async () => {
  if (!bindDialog.data.systemUserId) {
    ElMessage.warning('请选择要绑定的系统用户')
    return
  }
  
  try {
    await api.wechat.bindUser({
      openId: bindDialog.data.openId,
      systemUserId: bindDialog.data.systemUserId
    })
    ElMessage.success('绑定成功')
    bindDialog.visible = false
    await getWechatUsers()
  } catch (error) {
    console.error('绑定用户失败:', error)
  }
}

const unbindUser = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要解绑用户 "${row.nickname}" 吗？`, '确认解绑', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.wechat.unbindUser(row.systemUserId)
    ElMessage.success('解绑成功')
    await getWechatUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('解绑用户失败:', error)
    }
  }
}

const handleSizeChange = (val) => {
  pagination.size = val
  getWechatUsers()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  getWechatUsers()
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.wechat-management {
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

.config-row {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>