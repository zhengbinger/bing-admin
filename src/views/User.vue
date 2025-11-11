<template>
  <div class="user-container">
    <el-card class="card-shadow">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAddUser">
            <el-icon><i-ep-plus /></el-icon>
            添加用户
          </el-button>
        </div>
      </template>
      
      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><i-ep-search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><i-ep-refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 用户列表 -->
      <el-table
        v-loading="loading"
        :data="usersData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="roleName" label="角色" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="1"
              inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEditUser(scope.row)">
              <el-icon><i-ep-edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteUser(scope.row.id)">
              <el-icon><i-ep-delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username" :disabled="dialogMode === 'edit'">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" type="email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="userForm.roleId" placeholder="请选择角色">
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogMode === 'add'" label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('add') // 'add' 或 'edit'
const dialogTitle = ref('添加用户')
const userFormRef = ref(null)
const selectedRows = ref([])

// 搜索表单
const searchForm = reactive({
  username: '',
  status: ''
})

// 用户表单
const userForm = reactive({
  id: '',
  username: '',
  nickname: '',
  email: '',
  phone: '',
  roleId: '',
  password: ''
})

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' }
  ]
}

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 用户数据
const usersData = ref([])
const roles = ref([
  { id: 1, name: '超级管理员' },
  { id: 2, name: '普通管理员' },
  { id: 3, name: '操作员' }
])

// 获取用户列表
const fetchUsers = () => {
  loading.value = true
  // 模拟获取用户列表数据
  // 实际项目中应该调用真实的API接口
  setTimeout(() => {
    usersData.value = [
      {
        id: 1,
        username: 'admin',
        nickname: '超级管理员',
        email: 'admin@example.com',
        phone: '13800138000',
        roleId: 1,
        roleName: '超级管理员',
        status: '1',
        createTime: '2025-11-01 10:00:00',
        updateTime: '2025-11-10 15:30:00'
      },
      {
        id: 2,
        username: 'manager',
        nickname: '普通管理员',
        email: 'manager@example.com',
        phone: '13800138001',
        roleId: 2,
        roleName: '普通管理员',
        status: '1',
        createTime: '2025-11-02 11:00:00',
        updateTime: '2025-11-09 14:20:00'
      },
      {
        id: 3,
        username: 'operator',
        nickname: '操作员',
        email: 'operator@example.com',
        phone: '13800138002',
        roleId: 3,
        roleName: '操作员',
        status: '1',
        createTime: '2025-11-03 12:00:00',
        updateTime: '2025-11-08 13:10:00'
      }
    ]
    pagination.total = usersData.value.length
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchUsers()
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pagination.currentPage = 1
  fetchUsers()
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 处理状态变化
const handleStatusChange = (row) => {
  // 实际项目中应该调用API更新状态
  ElMessage.success('状态更新成功')
}

// 添加用户
const handleAddUser = () => {
  dialogMode.value = 'add'
  dialogTitle.value = '添加用户'
  // 重置表单
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
  Object.keys(userForm).forEach(key => {
    userForm[key] = ''
  })
  dialogVisible.value = true
}

// 编辑用户
const handleEditUser = (row) => {
  dialogMode.value = 'edit'
  dialogTitle.value = '编辑用户'
  // 填充表单数据
  Object.assign(userForm, row)
  dialogVisible.value = true
}

// 删除用户
const handleDeleteUser = (id) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际项目中应该调用API删除用户
    usersData.value = usersData.value.filter(user => user.id !== id)
    pagination.total = usersData.value.length
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    await userFormRef.value.validate()
    // 实际项目中应该调用API保存用户
    if (dialogMode.value === 'add') {
      // 添加用户
      const newUser = {
        ...userForm,
        id: Date.now(),
        roleName: roles.value.find(r => r.id === userForm.roleId)?.name || '',
        status: '1',
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString()
      }
      usersData.value.push(newUser)
      pagination.total = usersData.value.length
      ElMessage.success('添加成功')
    } else {
      // 编辑用户
      const index = usersData.value.findIndex(user => user.id === userForm.id)
      if (index !== -1) {
        usersData.value[index] = {
          ...usersData.value[index],
          ...userForm,
          roleName: roles.value.find(r => r.id === userForm.roleId)?.name || '',
          updateTime: new Date().toLocaleString()
        }
        ElMessage.success('编辑成功')
      }
    }
    dialogVisible.value = false
  } catch (error) {
    // 表单验证失败
  }
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchUsers()
}

const handleCurrentChange = (current) => {
  pagination.currentPage = current
  fetchUsers()
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-container {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-filter {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: flex-end;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>