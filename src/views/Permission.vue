<template>
  <div class="permission-container">
    <el-card class="card-shadow">
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <div>
            <el-button type="primary" @click="handleAddPermission">
              <el-icon><Plus /></el-icon>
              添加权限
            </el-button>
            <el-button @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 权限树 -->
      <div class="permission-tree-container">
        <el-tree
          v-loading="loading"
          :data="permissionsData"
          node-key="id"
          ref="permissionTree"
          highlight-current
          default-expand-all
          :expand-on-click-node="false"
          :render-content="renderContent"
        >
        </el-tree>
      </div>
    </el-card>
    
    <!-- 添加/编辑权限对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionRules"
        label-width="100px"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限标识" prop="code" :disabled="dialogMode === 'edit'">
          <el-input v-model="permissionForm.code" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item label="父权限" prop="parentId">
          <el-select v-model="permissionForm.parentId" placeholder="请选择父权限">
            <el-option label="顶级权限" :value="0" />
            <el-option
              v-for="item in parentOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-select v-model="permissionForm.type" placeholder="请选择权限类型">
            <el-option label="菜单" :value="1" />
            <el-option label="按钮" :value="2" />
            <el-option label="API" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="permissionForm.sort" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="permissionForm.path" placeholder="请输入路径" />
        </el-form-item>
        <el-form-item label="组件" prop="component">
          <el-input v-model="permissionForm.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="permissionForm.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="权限描述" prop="description">
          <el-input v-model="permissionForm.description" type="textarea" placeholder="请输入权限描述" rows="3" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('add') // 'add' 或 'edit'
const dialogTitle = ref('添加权限')
const permissionFormRef = ref(null)
const permissionTree = ref(null)
const currentPermission = ref(null)

// 权限表单
const permissionForm = reactive({
  id: '',
  name: '',
  code: '',
  parentId: 0,
  type: 1,
  sort: 0,
  path: '',
  component: '',
  icon: '',
  description: ''
})

// 表单验证规则
const permissionRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 1, max: 50, message: '权限名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限标识', trigger: 'blur' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '权限标识只能包含字母、数字和下划线，且以字母或下划线开头', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ]
}

// 权限数据
const permissionsData = ref([])

// 父权限选项（用于下拉选择）
const parentOptions = computed(() => {
  const options = []
  const flattenTree = (tree, level = 0) => {
    tree.forEach(node => {
      const prefix = '—'.repeat(level * 2)
      options.push({
        id: node.id,
        name: `${prefix} ${node.name}`
      })
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, level + 1)
      }
    })
  }
  flattenTree(permissionsData.value)
  return options
})

// 获取权限树
const fetchPermissions = () => {
  loading.value = true
  // 模拟获取权限树数据
  // 实际项目中应该调用真实的API接口
  setTimeout(() => {
    permissionsData.value = [
      {
        id: 1,
        name: '系统管理',
        code: 'SYSTEM_MANAGE',
        parentId: 0,
        type: 1,
        sort: 1,
        path: '/system',
        component: 'Layout',
        icon: 'Setting',
        description: '系统管理模块',
        createTime: '2025-11-01 10:00:00',
        updateTime: '2025-11-01 10:00:00',
        children: [
          {
            id: 11,
            name: '用户管理',
            code: 'USER_MANAGE',
            parentId: 1,
            type: 1,
            sort: 1,
            path: '/user',
            component: 'User',
            icon: 'User',
            description: '用户管理功能',
            createTime: '2025-11-01 10:00:00',
            updateTime: '2025-11-01 10:00:00'
          },
          {
            id: 12,
            name: '角色管理',
            code: 'ROLE_MANAGE',
            parentId: 1,
            type: 1,
            sort: 2,
            path: '/role',
            component: 'Role',
            icon: 'UserFilled',
            description: '角色管理功能',
            createTime: '2025-11-01 10:00:00',
            updateTime: '2025-11-01 10:00:00'
          },
          {
            id: 13,
            name: '权限管理',
            code: 'PERMISSION_MANAGE',
            parentId: 1,
            type: 1,
            sort: 3,
            path: '/permission',
            component: 'Permission',
            icon: 'Lock',
            description: '权限管理功能',
            createTime: '2025-11-01 10:00:00',
            updateTime: '2025-11-01 10:00:00'
          }
        ]
      },
      {
        id: 2,
        name: '内容管理',
        code: 'CONTENT_MANAGE',
        parentId: 0,
        type: 1,
        sort: 2,
        path: '/content',
        component: 'Layout',
        icon: 'Document',
        description: '内容管理模块',
        createTime: '2025-11-01 10:00:00',
        updateTime: '2025-11-01 10:00:00',
        children: [
          {
            id: 21,
            name: '文章管理',
            code: 'ARTICLE_MANAGE',
            parentId: 2,
            type: 1,
            sort: 1,
            path: '/article',
            component: 'Article',
            icon: 'DocumentCopy',
            description: '文章管理功能',
            createTime: '2025-11-01 10:00:00',
            updateTime: '2025-11-01 10:00:00'
          },
          {
            id: 22,
            name: '分类管理',
            code: 'CATEGORY_MANAGE',
            parentId: 2,
            type: 1,
            sort: 2,
            path: '/category',
            component: 'Category',
            icon: 'DataLine',
            description: '分类管理功能',
            createTime: '2025-11-01 10:00:00',
            updateTime: '2025-11-01 10:00:00'
          }
        ]
      }
    ]
    loading.value = false
  }, 500)
}

// 渲染树节点内容
const renderContent = (h, { node, data }) => {
  return h('span', { class: 'permission-node' }, [
    h('span', [
      data.icon ? h('i', { class: data.icon }) : null,
      h('span', { style: { marginLeft: '8px' } }, data.name)
    ]),
    h('span', { class: 'permission-actions' }, [
      h('el-button', {
        size: 'small',
        type: 'primary',
        text: true,
        onClick: () => handleEditPermission(data)
      }, '编辑'),
      h('el-button', {
        size: 'small',
        type: 'danger',
        text: true,
        onClick: () => handleDeletePermission(data.id)
      }, '删除')
    ])
  ])
}

// 添加权限
const handleAddPermission = () => {
  dialogMode.value = 'add'
  dialogTitle.value = '添加权限'
  // 重置表单
  if (permissionFormRef.value) {
    permissionFormRef.value.resetFields()
  }
  Object.keys(permissionForm).forEach(key => {
    if (key === 'parentId' || key === 'type' || key === 'sort') {
      permissionForm[key] = 0
    } else {
      permissionForm[key] = ''
    }
  })
  permissionForm.type = 1
  dialogVisible.value = true
}

// 编辑权限
const handleEditPermission = (data) => {
  dialogMode.value = 'edit'
  dialogTitle.value = '编辑权限'
  currentPermission.value = data
  // 填充表单数据
  Object.assign(permissionForm, data)
  dialogVisible.value = true
}

// 删除权限
const handleDeletePermission = (id) => {
  ElMessageBox.confirm('确定要删除该权限吗？删除后相关的子权限也会被删除。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际项目中应该调用API删除权限
    const deleteNode = (tree, id) => {
      return tree.filter(node => {
        if (node.id === id) {
          return false
        }
        if (node.children && node.children.length > 0) {
          node.children = deleteNode(node.children, id)
        }
        return true
      })
    }
    permissionsData.value = deleteNode(permissionsData.value, id)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    await permissionFormRef.value.validate()
    // 实际项目中应该调用API保存权限
    if (dialogMode.value === 'add') {
      // 添加权限
      const newPermission = {
        ...permissionForm,
        id: Date.now(),
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString(),
        children: []
      }
      
      // 将新权限添加到树中
      if (newPermission.parentId === 0) {
        // 顶级权限
        permissionsData.value.push(newPermission)
      } else {
        // 子权限
        const addChild = (tree, parentId, child) => {
          tree.forEach(node => {
            if (node.id === parentId) {
              if (!node.children) {
                node.children = []
              }
              node.children.push(child)
            } else if (node.children && node.children.length > 0) {
              addChild(node.children, parentId, child)
            }
          })
        }
        addChild(permissionsData.value, newPermission.parentId, newPermission)
      }
      
      ElMessage.success('添加成功')
    } else {
      // 编辑权限
      const updateNode = (tree, id, updates) => {
        tree.forEach(node => {
          if (node.id === id) {
            Object.assign(node, updates, { updateTime: new Date().toLocaleString() })
          } else if (node.children && node.children.length > 0) {
            updateNode(node.children, id, updates)
          }
        })
      }
      updateNode(permissionsData.value, permissionForm.id, { ...permissionForm })
      ElMessage.success('编辑成功')
    }
    dialogVisible.value = false
  } catch (error) {
    // 表单验证失败
  }
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
  if (permissionFormRef.value) {
    permissionFormRef.value.resetFields()
  }
}

// 刷新
const handleRefresh = () => {
  fetchPermissions()
}

onMounted(() => {
  fetchPermissions()
})
</script>

<style scoped>
.permission-container {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.permission-tree-container {
  padding: 20px 0;
}

.permission-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 36px;
  line-height: 36px;
}

.permission-actions {
  visibility: hidden;
}

.permission-node:hover .permission-actions {
  visibility: visible;
}

:deep(.el-tree-node__content) {
  height: 36px;
  padding-right: 10px;
}
</style>