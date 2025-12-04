<template>
  <div class="user-management-container">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h1>用户管理</h1>
      <el-button type="primary" @click="showAddUserDialog">
        <el-icon><Plus /></el-icon>
        添加用户
      </el-button>
    </div>
    
    <!-- 搜索和筛选区域 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 用户列表 -->
    <div class="user-list-container">
      <el-table :data="userList" stripe border v-loading="loading" style="width: 100%">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="1" inactive-value="0" @change="(value) => handleStatusChange(scope.row, value)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="showEditUserDialog(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="showDeleteUserDialog(scope.row.id)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentPageChange"
        />
      </div>
    </div>
    
    <!-- 添加用户对话框 -->
    <el-dialog v-model="addUserDialogVisible" title="添加用户" width="600px">
      <el-form :model="addUserForm" :rules="userFormRules" ref="addUserFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="addUserForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="addUserForm.confirmPassword" type="password" placeholder="请再次输入密码" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addUserForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="addUserForm.status" placeholder="请选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addUserDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddUser">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑用户对话框 -->
    <el-dialog v-model="editUserDialogVisible" title="编辑用户" width="600px">
      <el-form :model="editUserForm" :rules="editUserFormRules" ref="editUserFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editUserForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editUserForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editUserForm.status" placeholder="请选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editUserDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateUser">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 删除用户确认对话框 -->
    <el-dialog v-model="deleteUserDialogVisible" title="确认删除" width="400px">
      <p>确定要删除该用户吗？此操作不可撤销。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteUserDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleDeleteUser">确定删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search, RefreshRight } from '@element-plus/icons-vue'
import api from '../api'

// 用户列表数据
const userList = ref([])
// 加载状态
const loading = ref(false)
// 用于跟踪初始化状态，防止el-switch自动触发更新
const initialized = ref(false)

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 添加用户对话框
const addUserDialogVisible = ref(false)
const addUserFormRef = ref(null)
const addUserForm = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  status: 1
})

// 编辑用户对话框
const editUserDialogVisible = ref(false)
const editUserFormRef = ref(null)
const editUserForm = reactive({
  id: null,
  username: '',
  nickname: '',
  email: '',
  phone: '',
  status: 1
})

// 删除用户对话框
const deleteUserDialogVisible = ref(false)
const deleteUserId = ref(null)

// 用户表单验证规则
const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度在 6 到 32 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value !== addUserForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
}

// 编辑用户表单验证规则（密码可选）
const editUserFormRules = computed(() => {
  const rules = { ...userFormRules }
  delete rules.password
  delete rules.confirmPassword
  return rules
})

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.currentPage,
      size: pagination.pageSize
    }
    const response = await api.user.getUserList(params)
    userList.value = response.data.records
    pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('获取用户列表失败：' + (error.message || '未知错误'))
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索用户
const handleSearch = () => {
  pagination.currentPage = 1
  getUserList()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pagination.currentPage = 1
  getUserList()
}

// 分页大小变化
const handlePageSizeChange = (size) => {
  pagination.pageSize = size
  getUserList()
}

// 当前页变化
const handleCurrentPageChange = (page) => {
  pagination.currentPage = page
  getUserList()
}

// 显示添加用户对话框
const showAddUserDialog = () => {
  // 重置表单
  Object.keys(addUserForm).forEach(key => {
    addUserForm[key] = ''
  })
  addUserForm.status = 1
  nextTick(() => {
    if (addUserFormRef.value) {
      addUserFormRef.value.resetFields()
    }
  })
  addUserDialogVisible.value = true
}

// 显示编辑用户对话框
const showEditUserDialog = (user) => {
  // 填充表单
  Object.assign(editUserForm, user)
  editUserDialogVisible.value = true
}

// 显示删除用户对话框
const showDeleteUserDialog = (id) => {
  deleteUserId.value = id
  deleteUserDialogVisible.value = true
}

// 添加用户
const handleAddUser = async () => {
  if (!addUserFormRef.value) return
  
  try {
    await addUserFormRef.value.validate()
    const response = await api.user.createUser(addUserForm)
    ElMessage.success('添加用户成功')
    addUserDialogVisible.value = false
    getUserList()
  } catch (error) {
    if (error.name !== 'ElFormValidationError') {
      ElMessage.error('添加用户失败：' + (error.message || '未知错误'))
      console.error('添加用户失败:', error)
    }
  }
}

// 更新用户
const handleUpdateUser = async () => {
  if (!editUserFormRef.value) return
  
  try {
    await editUserFormRef.value.validate()
    const response = await api.user.updateUser(editUserForm.id, editUserForm)
    ElMessage.success('更新用户成功')
    editUserDialogVisible.value = false
    getUserList()
  } catch (error) {
    if (error.name !== 'ElFormValidationError') {
      ElMessage.error('更新用户失败：' + (error.message || '未知错误'))
      console.error('更新用户失败:', error)
    }
  }
}

// 删除用户
const handleDeleteUser = async () => {
  try {
    await api.user.deleteUser(deleteUserId.value)
    ElMessage.success('删除用户成功')
    deleteUserDialogVisible.value = false
    getUserList()
  } catch (error) {
    ElMessage.error('删除用户失败：' + (error.message || '未知错误'))
    console.error('删除用户失败:', error)
  }
}

// 切换用户状态
const handleStatusChange = async (user, newStatus) => {
  // 只有在初始化完成后才处理状态变化
  if (!initialized.value) {
    return
  }
  
  try {
    await api.user.updateUser(user.id, { status: newStatus })
    ElMessage.success(`用户状态已${newStatus === 1 ? '启用' : '禁用'}`)
  } catch (error) {
    // 状态切换失败，恢复原状态
    user.status = newStatus === 1 ? 0 : 1
    ElMessage.error('更新用户状态失败：' + (error.message || '未知错误'))
    console.error('更新用户状态失败:', error)
  }
}

// 初始化数据
const initData = async () => {
  await getUserList()
  // 数据加载完成后设置初始化标志
  nextTick(() => {
    initialized.value = true
  })
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.user-management-container {
  width: 100%;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.search-filter {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.search-form {
  width: 100%;
}

.user-list-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>