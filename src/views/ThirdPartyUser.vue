<template>
  <div class="third-party-user">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>第三方用户管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="showCreateDialog">
              <el-icon><Plus /></el-icon>
              新增
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
        <el-form-item label="第三方平台">
          <el-select v-model="searchForm.platform" placeholder="请选择平台" clearable>
            <el-option label="微信" value="wechat" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="QQ" value="qq" />
            <el-option label="微博" value="weibo" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="用户昵称">
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

      <!-- 用户表格 -->
      <el-table :data="thirdPartyUsers" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="platform" label="第三方平台" width="120">
          <template #default="scope">
            <el-tag :type="getPlatformTagType(scope.row.platform)">
              {{ getPlatformText(scope.row.platform) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="thirdPartyId" label="第三方ID" width="150" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar" />
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
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
            <el-button size="small" type="danger" @click="deleteUser(scope.row)">删除</el-button>
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

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="formDialog.visible" :title="formDialog.title" width="50%">
      <el-form :model="formDialog.data" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="第三方平台" prop="platform">
          <el-select v-model="formDialog.data.platform" placeholder="请选择平台">
            <el-option label="微信" value="wechat" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="QQ" value="qq" />
            <el-option label="微博" value="weibo" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="第三方ID" prop="thirdPartyId">
          <el-input v-model="formDialog.data.thirdPartyId" placeholder="请输入第三方用户ID" />
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formDialog.data.nickname" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="头像URL">
          <el-input v-model="formDialog.data.avatar" placeholder="请输入头像URL" />
        </el-form-item>
        
        <el-form-item label="邮箱">
          <el-input v-model="formDialog.data.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="手机号">
          <el-input v-model="formDialog.data.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="formDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 绑定用户对话框 -->
    <el-dialog v-model="bindDialog.visible" title="绑定系统用户" width="40%">
      <el-form :model="bindDialog.data" label-width="120px">
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialog.visible" title="第三方用户详情" width="50%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ detailDialog.data.id }}</el-descriptions-item>
        <el-descriptions-item label="第三方平台">{{ getPlatformText(detailDialog.data.platform) }}</el-descriptions-item>
        <el-descriptions-item label="第三方ID">{{ detailDialog.data.thirdPartyId }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ detailDialog.data.nickname }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ detailDialog.data.email }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detailDialog.data.phone }}</el-descriptions-item>
        <el-descriptions-item label="绑定用户ID">{{ detailDialog.data.systemUserId || '未绑定' }}</el-descriptions-item>
        <el-descriptions-item label="绑定用户名">{{ detailDialog.data.systemUsername || '未绑定' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailDialog.data.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailDialog.data.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="头像" :span="2">
          <el-avatar :size="80" :src="detailDialog.data.avatar" />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import api from '../api'

// 响应式数据
const loading = ref(false)
const thirdPartyUsers = ref([])
const systemUsers = ref([])

const searchForm = reactive({
  platform: '',
  nickname: '',
  bindStatus: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const formDialog = reactive({
  visible: false,
  title: '',
  data: {}
})

const bindDialog = reactive({
  visible: false,
  loading: false,
  data: {
    thirdPartyUserId: null,
    systemUserId: null
  }
})

const detailDialog = reactive({
  visible: false,
  data: {}
})

const formRef = ref()

// 表单验证规则
const formRules = {
  platform: [{ required: true, message: '请选择第三方平台', trigger: 'change' }],
  thirdPartyId: [{ required: true, message: '请输入第三方用户ID', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
}

// 方法
const refreshData = async () => {
  await getThirdPartyUsers()
}

const getThirdPartyUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      platform: searchForm.platform,
      nickname: searchForm.nickname,
      bindStatus: searchForm.bindStatus
    }
    
    const response = await api.thirdPartyUser.getList(params)
    thirdPartyUsers.value = response.data.records || []
    pagination.total = response.data.total || 0
  } catch (error) {
    console.error('获取第三方用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const searchUsers = async () => {
  pagination.page = 1
  await getThirdPartyUsers()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    platform: '',
    nickname: '',
    bindStatus: ''
  })
  searchUsers()
}

const showCreateDialog = () => {
  formDialog.title = '新增第三方用户'
  formDialog.data = {}
  formDialog.visible = true
}

const viewDetail = (row) => {
  detailDialog.data = { ...row }
  detailDialog.visible = true
}

const showBindDialog = (row) => {
  bindDialog.data.thirdPartyUserId = row.id
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
    await api.thirdPartyUser.bindSystemUser(bindDialog.data.thirdPartyUserId, bindDialog.data.systemUserId)
    ElMessage.success('绑定成功')
    bindDialog.visible = false
    await getThirdPartyUsers()
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
    
    await api.thirdPartyUser.unbindSystemUser(row.id)
    ElMessage.success('解绑成功')
    await getThirdPartyUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('解绑用户失败:', error)
    }
  }
}

const deleteUser = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除第三方用户 "${row.nickname}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.thirdPartyUser.delete(row.id)
    ElMessage.success('删除成功')
    await getThirdPartyUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
    }
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (formDialog.data.id) {
      await api.thirdPartyUser.update(formDialog.data.id, formDialog.data)
      ElMessage.success('更新成功')
    } else {
      await api.thirdPartyUser.create(formDialog.data)
      ElMessage.success('创建成功')
    }
    
    formDialog.visible = false
    await getThirdPartyUsers()
  } catch (error) {
    console.error('提交表单失败:', error)
  }
}

const getPlatformTagType = (platform) => {
  const typeMap = {
    'wechat': 'success',
    'alipay': 'primary',
    'qq': 'warning',
    'weibo': 'danger'
  }
  return typeMap[platform] || 'info'
}

const getPlatformText = (platform) => {
  const textMap = {
    'wechat': '微信',
    'alipay': '支付宝',
    'qq': 'QQ',
    'weibo': '微博'
  }
  return textMap[platform] || platform
}

const handleSizeChange = (val) => {
  pagination.size = val
  getThirdPartyUsers()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  getThirdPartyUsers()
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.third-party-user {
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