<template>
  <div class="role-container">
    <el-card class="card-shadow">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAddRole">
            <el-icon><i-ep-plus /></el-icon>
            添加角色
          </el-button>
        </div>
      </template>
      
      <!-- 搜索 -->
      <div class="search-filter">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="角色名称">
            <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
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
      
      <!-- 角色列表 -->
      <el-table
        v-loading="loading"
        :data="rolesData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="180" />
        <el-table-column prop="code" label="角色代码" width="180" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEditRole(scope.row)">
              <el-icon><i-ep-edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" @click="handleAssignPermission(scope.row)">
              <el-icon><i-ep-lock /></el-icon>
              分配权限
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteRole(scope.row.id)">
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
    
    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色代码" prop="code" :disabled="dialogMode === 'edit'">
          <el-input v-model="roleForm.code" placeholder="请输入角色代码" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" placeholder="请输入角色描述" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 分配权限对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="分配权限"
      width="600px"
    >
      <el-tree
        v-loading="permissionLoading"
        :data="permissionsData"
        show-checkbox
        node-key="id"
        ref="permissionTree"
        highlight-current
        default-expand-all
      >
      </el-tree>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignPermissionSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const loading = ref(false)
const permissionLoading = ref(false)
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const dialogMode = ref('add') // 'add' 或 'edit'
const dialogTitle = ref('添加角色')
const roleFormRef = ref(null)
const permissionTree = ref(null)
const selectedRows = ref([])
const currentRoleId = ref(null)

// 搜索表单
const searchForm = reactive({
  name: ''
})

// 角色表单
const roleForm = reactive({
  id: '',
  name: '',
  code: '',
  description: ''
})

// 表单验证规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '角色代码只能包含字母、数字和下划线，且以字母或下划线开头', trigger: 'blur' }
  ]
}

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 角色数据
const rolesData = ref([])
// 权限数据
const permissionsData = ref([])

// 获取角色列表
const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await api.role.getRoleList()
    rolesData.value = response.data
    pagination.total = rolesData.value.length
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 获取权限树
const fetchPermissions = async (roleId) => {
  permissionLoading.value = true
  try {
    // 获取所有权限
    const permissionsResponse = await api.permission.getPermissionTree()
    permissionsData.value = permissionsResponse.data
    
    // 如果有角色ID，获取该角色已分配的权限
    if (roleId) {
      const rolePermissionsResponse = await api.role.getPermissionsByRoleId(roleId)
      const checkedKeys = rolePermissionsResponse.data.map(permission => permission.id)
      
      setTimeout(() => {
        permissionTree.value.setCheckedKeys(checkedKeys)
        permissionLoading.value = false
      }, 100)
    } else {
      permissionLoading.value = false
    }
  } catch (error) {
    console.error('获取权限列表失败:', error)
    ElMessage.error('获取权限列表失败')
    permissionLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchRoles()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  pagination.currentPage = 1
  fetchRoles()
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 添加角色
const handleAddRole = () => {
  dialogMode.value = 'add'
  dialogTitle.value = '添加角色'
  // 重置表单
  if (roleFormRef.value) {
    roleFormRef.value.resetFields()
  }
  Object.keys(roleForm).forEach(key => {
    roleForm[key] = ''
  })
  dialogVisible.value = true
}

// 编辑角色
const handleEditRole = (row) => {
  dialogMode.value = 'edit'
  dialogTitle.value = '编辑角色'
  // 填充表单数据
  Object.assign(roleForm, row)
  dialogVisible.value = true
}

// 删除角色
const handleDeleteRole = async (id) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await api.role.deleteRole(id)
      rolesData.value = rolesData.value.filter(role => role.id !== id)
      pagination.total = rolesData.value.length
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除角色失败:', error)
      // API请求失败，已经在拦截器中处理了错误提示
    }
  }).catch(() => {
    // 取消删除
  })
}

// 分配权限
const handleAssignPermission = (row) => {
  currentRoleId.value = row.id
  fetchPermissions(row.id)
  permissionDialogVisible.value = true
}

// 提交分配权限
const handleAssignPermissionSubmit = async () => {
  const checkedKeys = permissionTree.value.getCheckedKeys(true)
  try {
    await api.permission.assignPermissionsToRole(currentRoleId.value, checkedKeys)
    ElMessage.success('权限分配成功')
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('权限分配失败:', error)
    // API请求失败，已经在拦截器中处理了错误提示
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await roleFormRef.value.validate()
    
    if (dialogMode.value === 'add') {
      // 添加角色
      await api.role.createRole(roleForm)
      ElMessage.success('添加成功')
    } else {
      // 编辑角色
      await api.role.updateRole(roleForm.id, roleForm)
      ElMessage.success('编辑成功')
    }
    
    dialogVisible.value = false
    fetchRoles() // 重新获取角色列表
  } catch (error) {
    console.error('保存角色失败:', error)
    // 表单验证失败或API请求失败
  }
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
  if (roleFormRef.value) {
    roleFormRef.value.resetFields()
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchRoles()
}

const handleCurrentChange = (current) => {
  pagination.currentPage = current
  fetchRoles()
}

onMounted(() => {
  fetchRoles()
})
</script>

<style scoped>
.role-container {
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