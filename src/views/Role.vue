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
const fetchRoles = () => {
  loading.value = true
  // 模拟获取角色列表数据
  // 实际项目中应该调用真实的API接口
  setTimeout(() => {
    rolesData.value = [
      {
        id: 1,
        name: '超级管理员',
        code: 'SUPER_ADMIN',
        description: '系统最高权限管理员',
        createTime: '2025-11-01 10:00:00',
        updateTime: '2025-11-01 10:00:00'
      },
      {
        id: 2,
        name: '普通管理员',
        code: 'ADMIN',
        description: '普通管理员，具有部分管理权限',
        createTime: '2025-11-01 10:00:00',
        updateTime: '2025-11-05 14:30:00'
      },
      {
        id: 3,
        name: '操作员',
        code: 'OPERATOR',
        description: '普通操作员，仅具有基础操作权限',
        createTime: '2025-11-01 10:00:00',
        updateTime: '2025-11-08 09:15:00'
      }
    ]
    pagination.total = rolesData.value.length
    loading.value = false
  }, 500)
}

// 获取权限树
const fetchPermissions = (roleId) => {
  permissionLoading.value = true
  // 模拟获取权限树数据
  // 实际项目中应该调用真实的API接口
  setTimeout(() => {
    permissionsData.value = [
      {
        id: 1,
        label: '系统管理',
        children: [
          { id: 11, label: '用户管理' },
          { id: 12, label: '角色管理' },
          { id: 13, label: '权限管理' }
        ]
      },
      {
        id: 2,
        label: '内容管理',
        children: [
          { id: 21, label: '文章管理' },
          { id: 22, label: '分类管理' }
        ]
      },
      {
        id: 3,
        label: '统计分析',
        children: [
          { id: 31, label: '数据统计' },
          { id: 32, label: '日志查询' }
        ]
      }
    ]
    
    // 模拟根据角色ID设置选中的权限
    if (roleId) {
      let checkedKeys = []
      if (roleId === 1) {
        // 超级管理员拥有所有权限
        checkedKeys = [1, 11, 12, 13, 2, 21, 22, 3, 31, 32]
      } else if (roleId === 2) {
        // 普通管理员拥有部分权限
        checkedKeys = [2, 21, 22, 3, 31]
      } else if (roleId === 3) {
        // 操作员只有基础权限
        checkedKeys = [21, 22]
      }
      setTimeout(() => {
        permissionTree.value.setCheckedKeys(checkedKeys)
        permissionLoading.value = false
      }, 100)
    } else {
      permissionLoading.value = false
    }
  }, 500)
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
const handleDeleteRole = (id) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际项目中应该调用API删除角色
    rolesData.value = rolesData.value.filter(role => role.id !== id)
    pagination.total = rolesData.value.length
    ElMessage.success('删除成功')
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
const handleAssignPermissionSubmit = () => {
  const checkedKeys = permissionTree.value.getCheckedKeys(true)
  // 实际项目中应该调用API保存权限分配
  ElMessage.success('权限分配成功')
  permissionDialogVisible.value = false
}

// 提交表单
const handleSubmit = async () => {
  try {
    await roleFormRef.value.validate()
    // 实际项目中应该调用API保存角色
    if (dialogMode.value === 'add') {
      // 添加角色
      const newRole = {
        ...roleForm,
        id: Date.now(),
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString()
      }
      rolesData.value.push(newRole)
      pagination.total = rolesData.value.length
      ElMessage.success('添加成功')
    } else {
      // 编辑角色
      const index = rolesData.value.findIndex(role => role.id === roleForm.id)
      if (index !== -1) {
        rolesData.value[index] = {
          ...rolesData.value[index],
          ...roleForm,
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