<template>
  <div class="role-list-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2>{{ $t('role.title') }}</h2>
        <p class="page-description">{{ $t('role.description') }}</p>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          :icon="Plus" 
          @click="handleCreate"
          v-if="hasPermission('role:create')"
        >
          {{ $t('role.create') }}
        </el-button>
        <el-button 
          :icon="Refresh" 
          @click="handleRefresh"
        >
          {{ $t('common.refresh') }}
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <el-card>
        <el-form 
          :model="searchForm" 
          :inline="true" 
          label-width="80px"
          @submit.prevent="handleSearch"
        >
          <el-form-item :label="$t('role.name')">
            <el-input
              v-model="searchForm.name"
              :placeholder="$t('role.namePlaceholder')"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item :label="$t('role.code')">
            <el-input
              v-model="searchForm.code"
              :placeholder="$t('role.codePlaceholder')"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item :label="$t('role.status')">
            <el-select 
              v-model="searchForm.status" 
              :placeholder="$t('role.statusPlaceholder')"
              clearable
            >
              <el-option 
                :label="$t('role.statusActive')" 
                :value="1" 
              />
              <el-option 
                :label="$t('role.statusInactive')" 
                :value="0" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              {{ $t('common.search') }}
            </el-button>
            <el-button @click="handleReset">
              {{ $t('common.reset') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 批量操作栏 -->
    <div class="batch-actions" v-if="hasSelectedRoles">
      <el-alert
        :title="$t('role.selectedCount', { count: selectedRoleCount })"
        type="info"
        show-icon
        :closable="false"
      >
        <template #default>
          <div class="batch-buttons">
            <el-button 
              size="small" 
              @click="handleBatchEnable"
              v-if="hasPermission('role:update')"
            >
              {{ $t('role.batchEnable') }}
            </el-button>
            <el-button 
              size="small" 
              @click="handleBatchDisable"
              v-if="hasPermission('role:update')"
            >
              {{ $t('role.batchDisable') }}
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleBatchDelete"
              v-if="hasPermission('role:delete')"
            >
              {{ $t('role.batchDelete') }}
            </el-button>
            <el-button size="small" @click="clearSelection">
              {{ $t('common.clearSelection') }}
            </el-button>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 角色表格 -->
    <div class="table-section">
      <el-card>
        <el-table
          ref="tableRef"
          :data="roles"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
          stripe
          border
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column 
            prop="id" 
            :label="$t('role.id')" 
            width="80"
            sortable="custom"
          />
          
          <el-table-column 
            prop="name" 
            :label="$t('role.name')" 
            min-width="150"
            sortable="custom"
          >
            <template #default="{ row }">
              <div class="role-info">
                <el-icon class="role-icon">
                  <UserFilled />
                </el-icon>
                <div class="role-details">
                  <div class="role-name">{{ row.name }}</div>
                  <div class="role-code">{{ row.code }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column 
            prop="description" 
            :label="$t('role.description')" 
            min-width="200"
            show-overflow-tooltip
          />
          
          <el-table-column 
            prop="status" 
            :label="$t('role.status')" 
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <el-tag 
                :type="row.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ row.status === 1 ? $t('role.statusActive') : $t('role.statusInactive') }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column 
            :label="$t('role.permissions')" 
            min-width="200"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div class="permission-preview">
                <el-tag
                  v-for="(permission, index) in getPermissionPreview(row.permissions)"
                  :key="permission.id"
                  size="small"
                  class="permission-tag"
                >
                  {{ permission.name }}
                </el-tag>
                <span 
                  v-if="row.permissions && row.permissions.length > 3"
                  class="more-permissions"
                >
                  +{{ row.permissions.length - 3 }}
                </span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column 
            prop="createTime" 
            :label="$t('role.createTime')" 
            width="160"
            sortable="custom"
          >
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          
          <el-table-column 
            :label="$t('common.actions')" 
            width="250"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                size="small"
                @click="handleView(row)"
                v-if="hasPermission('role:view')"
              >
                {{ $t('common.view') }}
              </el-button>
              
              <el-button
                size="small"
                type="primary"
                @click="handleEdit(row)"
                v-if="hasPermission('role:update')"
              >
                {{ $t('common.edit') }}
              </el-button>
              
              <el-dropdown 
                @command="(command) => handleDropdownCommand(command, row)"
                v-if="hasAnyPermission(['role:update', 'role:delete'])"
              >
                <el-button size="small" type="info">
                  {{ $t('common.more') }}
                  <el-icon class="el-icon--right">
                    <ArrowDown />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item 
                      command="duplicate"
                      v-if="hasPermission('role:create')"
                    >
                      {{ $t('role.duplicate') }}
                    </el-dropdown-item>
                    <el-dropdown-item 
                      command="assignUsers"
                      v-if="hasPermission('role:assign')"
                    >
                      {{ $t('role.assignUsers') }}
                    </el-dropdown-item>
                    <el-dropdown-item 
                      :command="row.status === 1 ? 'disable' : 'enable'"
                      v-if="hasPermission('role:update')"
                    >
                      {{ row.status === 1 ? $t('role.disable') : $t('role.enable') }}
                    </el-dropdown-item>
                    <el-dropdown-item 
                      command="delete"
                      divided
                      v-if="hasPermission('role:delete')"
                    >
                      {{ $t('common.delete') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
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
    </div>

    <!-- 角色详情对话框 -->
    <RoleDetailDialog
      v-model="detailDialogVisible"
      :role-id="selectedRoleId"
      @refresh="handleRefresh"
    />

    <!-- 角色编辑对话框 -->
    <RoleFormDialog
      v-model="formDialogVisible"
      :role-id="selectedRoleId"
      :mode="formMode"
      @success="handleFormSuccess"
    />

    <!-- 角色复制对话框 -->
    <RoleDuplicateDialog
      v-model="duplicateDialogVisible"
      :source-role="selectedRole"
      @success="handleFormSuccess"
    />

    <!-- 用户分配对话框 -->
    <UserAssignDialog
      v-model="assignDialogVisible"
      :role-id="selectedRoleId"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, ElTable } from 'element-plus'
import { Plus, Refresh, ArrowDown, UserFilled } from '@element-plus/icons-vue'

import { useRoleStore } from '@/store/modules/role'
import { usePermission } from '@/composables/usePermission'
import { formatDate } from '@/utils/date'
import type { Role, Permission } from '@/types'
import type { RoleQueryParams } from '@/api/services/role'

import RoleDetailDialog from './components/RoleDetailDialog.vue'
import RoleFormDialog from './components/RoleFormDialog.vue'
import RoleDuplicateDialog from './components/RoleDuplicateDialog.vue'
import UserAssignDialog from './components/UserAssignDialog.vue'

// 组合式API
const router = useRouter()
const { t } = useI18n()
const roleStore = useRoleStore()
const { hasPermission, hasAnyPermission } = usePermission()

// 响应式数据
const tableRef = ref<InstanceType<typeof ElTable>>()
const detailDialogVisible = ref(false)
const formDialogVisible = ref(false)
const duplicateDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const selectedRoleId = ref<number | null>(null)
const selectedRole = ref<Role | null>(null)
const formMode = ref<'create' | 'edit'>('create')

// 搜索表单
const searchForm = reactive<RoleQueryParams>({
  name: '',
  code: '',
  status: undefined
})

// 计算属性
const roles = computed(() => roleStore.roles)
const total = computed(() => roleStore.total)
const loading = computed(() => roleStore.loading)
const currentPage = computed({
  get: () => roleStore.currentPage,
  set: (value) => roleStore.currentPage = value
})
const pageSize = computed({
  get: () => roleStore.pageSize,
  set: (value) => roleStore.pageSize = value
})
const hasSelectedRoles = computed(() => roleStore.hasSelectedRoles)
const selectedRoleCount = computed(() => roleStore.selectedRoleCount)

// 方法
const handleSearch = async () => {
  await roleStore.searchRoles(searchForm)
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key as keyof RoleQueryParams] = undefined
  })
  searchForm.name = ''
  searchForm.code = ''
  handleSearch()
}

const handleRefresh = async () => {
  await roleStore.refreshRoles()
}

const handleCreate = () => {
  selectedRoleId.value = null
  formMode.value = 'create'
  formDialogVisible.value = true
}

const handleView = (role: Role) => {
  selectedRoleId.value = role.id
  detailDialogVisible.value = true
}

const handleEdit = (role: Role) => {
  selectedRoleId.value = role.id
  formMode.value = 'edit'
  formDialogVisible.value = true
}

const handleSizeChange = async (size: number) => {
  await roleStore.changePageSize(size)
}

const handleCurrentChange = async (page: number) => {
  await roleStore.changePage(page)
}

const handleSortChange = async ({ prop, order }: { prop: string; order: string | null }) => {
  const sortBy = prop
  const sortOrder = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : undefined
  
  await roleStore.searchRoles({
    ...searchForm,
    sortBy,
    sortOrder,
    page: currentPage.value,
    size: pageSize.value
  })
}

const handleSelectionChange = (selection: Role[]) => {
  roleStore.clearSelection()
  selection.forEach(role => roleStore.selectRole(role))
}

const clearSelection = () => {
  roleStore.clearSelection()
  tableRef.value?.clearSelection()
}

const handleBatchEnable = async () => {
  try {
    await ElMessageBox.confirm(
      t('role.batchEnableConfirm', { count: selectedRoleCount.value }),
      t('common.confirm'),
      {
        type: 'warning'
      }
    )
    
    await roleStore.batchUpdateRoleStatus(1)
    clearSelection()
  } catch (error) {
    // 用户取消操作
  }
}

const handleBatchDisable = async () => {
  try {
    await ElMessageBox.confirm(
      t('role.batchDisableConfirm', { count: selectedRoleCount.value }),
      t('common.confirm'),
      {
        type: 'warning'
      }
    )
    
    await roleStore.batchUpdateRoleStatus(0)
    clearSelection()
  } catch (error) {
    // 用户取消操作
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('role.batchDeleteConfirm', { count: selectedRoleCount.value }),
      t('common.confirm'),
      {
        type: 'error',
        confirmButtonText: t('common.delete'),
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await roleStore.batchDeleteRoles()
    clearSelection()
  } catch (error) {
    // 用户取消操作
  }
}

const handleDropdownCommand = async (command: string, role: Role) => {
  switch (command) {
    case 'duplicate':
      await handleDuplicate(role)
      break
    case 'assignUsers':
      await handleAssignUsers(role)
      break
    case 'enable':
      await handleToggleStatus(role, 1)
      break
    case 'disable':
      await handleToggleStatus(role, 0)
      break
    case 'delete':
      await handleDelete(role)
      break
  }
}

const handleDuplicate = async (role: Role) => {
  selectedRole.value = role
  duplicateDialogVisible.value = true
}

const handleAssignUsers = async (role: Role) => {
  selectedRoleId.value = role.id
  assignDialogVisible.value = true
}

const handleToggleStatus = async (role: Role, status: number) => {
  try {
    const action = status === 1 ? 'enable' : 'disable'
    await ElMessageBox.confirm(
      t(`role.${action}Confirm`, { name: role.name }),
      t('common.confirm'),
      {
        type: 'warning'
      }
    )
    
    await roleStore.updateRole(role.id, { status })
  } catch (error) {
    // 用户取消操作
  }
}

const handleDelete = async (role: Role) => {
  try {
    // 检查角色是否可以删除
    const checkResult = await roleStore.checkRoleDeletable(role.id)
    
    if (!checkResult.deletable) {
      ElMessage.warning(
        t('role.deleteWarning', { 
          name: role.name, 
          userCount: checkResult.userCount 
        })
      )
      return
    }
    
    await ElMessageBox.confirm(
      t('role.deleteConfirm', { name: role.name }),
      t('common.confirm'),
      {
        type: 'error',
        confirmButtonText: t('common.delete'),
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await roleStore.deleteRole(role.id)
  } catch (error) {
    // 用户取消操作
  }
}

const handleFormSuccess = () => {
  formDialogVisible.value = false
  duplicateDialogVisible.value = false
  handleRefresh()
}

const getPermissionPreview = (permissions: Permission[] | undefined) => {
  if (!permissions || permissions.length === 0) return []
  return permissions.slice(0, 3)
}

// 加载初始数据
const loadInitialData = async () => {
  try {
    await roleStore.fetchRoles()
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadInitialData()
})
</script>

<style scoped lang="scss">
.role-list-container {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    
    .header-left {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
      
      .page-description {
        margin: 0;
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }
    
    .header-right {
      display: flex;
      gap: 12px;
    }
  }
  
  .search-section {
    margin-bottom: 20px;
    
    .el-form {
      .el-form-item {
        margin-bottom: 16px;
      }
    }
  }
  
  .batch-actions {
    margin-bottom: 20px;
    
    .batch-buttons {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
  }
  
  .table-section {
    .role-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .role-icon {
        color: var(--el-color-primary);
        font-size: 18px;
      }
      
      .role-details {
        .role-name {
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
        
        .role-code {
          font-size: 12px;
          color: var(--el-text-color-regular);
          font-family: 'Courier New', monospace;
          margin-top: 2px;
        }
      }
    }
    
    .permission-preview {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
      
      .permission-tag {
        margin-bottom: 2px;
      }
      
      .more-permissions {
        font-size: 12px;
        color: var(--el-text-color-regular);
        font-style: italic;
      }
    }
    
    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .role-list-container {
    padding: 12px;
    
    .page-header {
      flex-direction: column;
      gap: 16px;
      
      .header-right {
        width: 100%;
        justify-content: flex-start;
      }
    }
    
    .search-section {
      .el-form {
        .el-form-item {
          width: 100%;
          margin-right: 0;
        }
      }
    }
  }
}
</style>