<template>
  <div class="role-assignment-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2>{{ $t('role.assignment') }}</h2>
        <p class="page-description">{{ $t('role.assignmentDescription') }}</p>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          :icon="Plus" 
          @click="handleBulkAssign"
          v-if="hasPermission('role:assign')"
        >
          {{ $t('role.bulkAssign') }}
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
          <el-form-item :label="$t('user.username')">
            <el-input
              v-model="searchForm.username"
              :placeholder="$t('user.usernamePlaceholder')"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item :label="$t('role.name')">
            <el-select 
              v-model="searchForm.roleId" 
              :placeholder="$t('role.selectRole')"
              clearable
              filterable
            >
              <el-option 
                v-for="role in allRoles"
                :key="role.id"
                :label="role.name" 
                :value="role.id" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item :label="$t('organization.name')">
            <el-select 
              v-model="searchForm.organizationId" 
              :placeholder="$t('organization.selectOrganization')"
              clearable
              filterable
            >
              <el-option 
                v-for="org in allOrganizations"
                :key="org.id"
                :label="org.name" 
                :value="org.id" 
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
    <div class="batch-actions" v-if="hasSelectedUsers">
      <el-alert
        :title="$t('user.selectedCount', { count: selectedUserCount })"
        type="info"
        show-icon
        :closable="false"
      >
        <template #default>
          <div class="batch-buttons">
            <el-button 
              size="small" 
              @click="handleBatchAssignRole"
              v-if="hasPermission('role:assign')"
            >
              {{ $t('role.batchAssignRole') }}
            </el-button>
            <el-button 
              size="small" 
              type="danger"
              @click="handleBatchRemoveRole"
              v-if="hasPermission('role:assign')"
            >
              {{ $t('role.batchRemoveRole') }}
            </el-button>
            <el-button size="small" @click="clearSelection">
              {{ $t('common.clearSelection') }}
            </el-button>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 用户角色分配表格 -->
    <div class="table-section">
      <el-card>
        <el-table
          ref="tableRef"
          :data="userRoleAssignments"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
          stripe
          border
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column 
            prop="id" 
            :label="$t('user.id')" 
            width="80"
            sortable="custom"
          />
          
          <el-table-column 
            :label="$t('user.info')" 
            min-width="200"
            sortable="custom"
            prop="username"
          >
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar :size="32" :src="row.avatar">
                  {{ row.username.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="user-details">
                  <div class="username">{{ row.username }}</div>
                  <div class="realname">{{ row.realName || '-' }}</div>
                  <div class="email">{{ row.email || '-' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column 
            :label="$t('organization.name')" 
            min-width="150"
            prop="organizationName"
          >
            <template #default="{ row }">
              <el-tag v-if="row.organizationName" type="info" size="small">
                {{ row.organizationName }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          
          <el-table-column 
            :label="$t('role.assignedRoles')" 
            min-width="300"
          >
            <template #default="{ row }">
              <div class="roles-display">
                <el-tag
                  v-for="role in row.roles"
                  :key="role.id"
                  :type="getRoleTagType(role)"
                  size="small"
                  class="role-tag"
                  closable
                  @close="handleRemoveRole(row, role)"
                  v-if="hasPermission('role:assign')"
                >
                  {{ role.name }}
                </el-tag>
                <el-tag
                  v-for="role in row.roles"
                  :key="role.id"
                  :type="getRoleTagType(role)"
                  size="small"
                  class="role-tag"
                  v-else
                >
                  {{ role.name }}
                </el-tag>
                <el-button
                  v-if="hasPermission('role:assign')"
                  size="small"
                  type="primary"
                  link
                  @click="handleAssignRole(row)"
                  class="add-role-btn"
                >
                  <el-icon><Plus /></el-icon>
                  {{ $t('role.assignRole') }}
                </el-button>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column 
            prop="status" 
            :label="$t('user.status')" 
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <el-tag 
                :type="row.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ row.status === 1 ? $t('user.statusActive') : $t('user.statusInactive') }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column 
            prop="createTime" 
            :label="$t('user.createTime')" 
            width="160"
            sortable="custom"
          >
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          
          <el-table-column 
            :label="$t('common.actions')" 
            width="200"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                size="small"
                type="primary"
                @click="handleManageRoles(row)"
                v-if="hasPermission('role:assign')"
              >
                {{ $t('role.manageRoles') }}
              </el-button>
              
              <el-dropdown 
                @command="(command) => handleDropdownCommand(command, row)"
                v-if="hasPermission('role:assign')"
              >
                <el-button size="small" type="info">
                  {{ $t('common.more') }}
                  <el-icon class="el-icon--right">
                    <ArrowDown />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="copyRoles">
                      {{ $t('role.copyRoles') }}
                    </el-dropdown-item>
                    <el-dropdown-item command="clearRoles" divided>
                      {{ $t('role.clearAllRoles') }}
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

    <!-- 角色分配对话框 -->
    <RoleAssignDialog
      v-model="assignDialogVisible"
      :user="selectedUser"
      @success="handleRefresh"
    />

    <!-- 批量角色分配对话框 -->
    <BatchRoleAssignDialog
      v-model="batchAssignDialogVisible"
      :users="selectedUsers"
      @success="handleBatchSuccess"
    />

    <!-- 角色复制对话框 -->
    <RoleCopyDialog
      v-model="copyDialogVisible"
      :source-user="selectedUser"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, ElTable } from 'element-plus'
import { Plus, Refresh, ArrowDown } from '@element-plus/icons-vue'

import { usePermission } from '@/composables/usePermission'
import { formatDate } from '@/utils/date'
import { roleApiService } from '@/api/services/role'
import type { User, Role, Organization } from '@/types'

import RoleAssignDialog from './components/RoleAssignDialog.vue'
import BatchRoleAssignDialog from './components/BatchRoleAssignDialog.vue'
import RoleCopyDialog from './components/RoleCopyDialog.vue'

// 用户角色分配接口
interface UserRoleAssignment extends User {
  roles: Role[]
  organizationName?: string
}

// 搜索参数接口
interface SearchParams {
  username?: string
  roleId?: number
  organizationId?: number
  page?: number
  size?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Composables
const { t } = useI18n()
const { hasPermission } = usePermission()

// Reactive data
const tableRef = ref<InstanceType<typeof ElTable>>()
const loading = ref(false)
const userRoleAssignments = ref<UserRoleAssignment[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const allRoles = ref<Role[]>([])
const allOrganizations = ref<Organization[]>([])

// Dialog states
const assignDialogVisible = ref(false)
const batchAssignDialogVisible = ref(false)
const copyDialogVisible = ref(false)
const selectedUser = ref<UserRoleAssignment | null>(null)

// Selection states
const selectedUsers = ref<UserRoleAssignment[]>([])
const selectedUserIds = ref<number[]>([])

// Search form
const searchForm = reactive<SearchParams>({
  username: '',
  roleId: undefined,
  organizationId: undefined
})

// Computed
const hasSelectedUsers = computed(() => selectedUsers.value.length > 0)
const selectedUserCount = computed(() => selectedUsers.value.length)

// Methods
const loadUserRoleAssignments = async () => {
  loading.value = true
  try {
    // TODO: 实际的API调用
    // const result = await userRoleApiService.getUserRoleAssignments({
    //   ...searchForm,
    //   page: currentPage.value,
    //   size: pageSize.value
    // })
    
    // 模拟数据
    const mockData: UserRoleAssignment[] = [
      {
        id: 1,
        username: 'admin',
        realName: '系统管理员',
        email: 'admin@example.com',
        status: 1,
        createTime: '2024-01-01 00:00:00',
        updateTime: '2024-01-01 00:00:00',
        organizationName: '总公司',
        roles: [
          { id: 1, name: '超级管理员', code: 'super_admin', status: 1, createTime: '2024-01-01', updateTime: '2024-01-01' },
          { id: 2, name: '系统管理员', code: 'system_admin', status: 1, createTime: '2024-01-01', updateTime: '2024-01-01' }
        ]
      },
      {
        id: 2,
        username: 'user1',
        realName: '普通用户1',
        email: 'user1@example.com',
        status: 1,
        createTime: '2024-01-02 00:00:00',
        updateTime: '2024-01-02 00:00:00',
        organizationName: '技术部',
        roles: [
          { id: 3, name: '普通用户', code: 'user', status: 1, createTime: '2024-01-01', updateTime: '2024-01-01' }
        ]
      }
    ]
    
    userRoleAssignments.value = mockData
    total.value = mockData.length
  } catch (error) {
    console.error('加载用户角色分配失败:', error)
    ElMessage.error('加载用户角色分配失败')
  } finally {
    loading.value = false
  }
}

const loadAllRoles = async () => {
  try {
    allRoles.value = await roleApiService.getAllRoles()
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

const loadAllOrganizations = async () => {
  try {
    // TODO: 实际的API调用
    // allOrganizations.value = await organizationApiService.getAllOrganizations()
    
    // 模拟数据
    allOrganizations.value = [
      { id: 1, name: '总公司', code: 'company', level: 1, sort: 1, status: 1, createTime: '2024-01-01', updateTime: '2024-01-01' },
      { id: 2, name: '技术部', code: 'tech', level: 2, sort: 1, status: 1, createTime: '2024-01-01', updateTime: '2024-01-01' }
    ]
  } catch (error) {
    console.error('加载组织机构列表失败:', error)
  }
}

const handleSearch = async () => {
  currentPage.value = 1
  await loadUserRoleAssignments()
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key as keyof SearchParams] = undefined
  })
  searchForm.username = ''
  handleSearch()
}

const handleRefresh = async () => {
  await loadUserRoleAssignments()
}

const handleSizeChange = async (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  await loadUserRoleAssignments()
}

const handleCurrentChange = async (page: number) => {
  currentPage.value = page
  await loadUserRoleAssignments()
}

const handleSortChange = async ({ prop, order }: { prop: string; order: string | null }) => {
  const sortBy = prop
  const sortOrder = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : undefined
  
  searchForm.sortBy = sortBy
  searchForm.sortOrder = sortOrder
  await loadUserRoleAssignments()
}

const handleSelectionChange = (selection: UserRoleAssignment[]) => {
  selectedUsers.value = selection
  selectedUserIds.value = selection.map(user => user.id)
}

const clearSelection = () => {
  selectedUsers.value = []
  selectedUserIds.value = []
  tableRef.value?.clearSelection()
}

const getRoleTagType = (role: Role) => {
  if (role.code === 'super_admin') return 'danger'
  if (role.code === 'system_admin') return 'warning'
  if (role.code === 'admin') return 'primary'
  return 'success'
}

const handleAssignRole = (user: UserRoleAssignment) => {
  selectedUser.value = user
  assignDialogVisible.value = true
}

const handleManageRoles = (user: UserRoleAssignment) => {
  selectedUser.value = user
  assignDialogVisible.value = true
}

const handleRemoveRole = async (user: UserRoleAssignment, role: Role) => {
  try {
    await ElMessageBox.confirm(
      t('role.removeRoleConfirm', { username: user.username, roleName: role.name }),
      t('common.confirm'),
      {
        type: 'warning'
      }
    )
    
    // TODO: 实际的API调用
    // await roleApiService.removeRolesFromUsers({
    //   userIds: [user.id],
    //   roleIds: [role.id],
    //   operation: 'remove'
    // })
    
    // 更新本地数据
    user.roles = user.roles.filter(r => r.id !== role.id)
    ElMessage.success(t('role.removeRoleSuccess'))
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除角色失败:', error)
      ElMessage.error('移除角色失败')
    }
  }
}

const handleBulkAssign = () => {
  batchAssignDialogVisible.value = true
}

const handleBatchAssignRole = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要分配角色的用户')
    return
  }
  batchAssignDialogVisible.value = true
}

const handleBatchRemoveRole = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要移除角色的用户')
    return
  }
  
  // TODO: 实现批量移除角色逻辑
  ElMessage.info('批量移除角色功能开发中')
}

const handleDropdownCommand = async (command: string, user: UserRoleAssignment) => {
  switch (command) {
    case 'copyRoles':
      selectedUser.value = user
      copyDialogVisible.value = true
      break
    case 'clearRoles':
      await handleClearAllRoles(user)
      break
  }
}

const handleClearAllRoles = async (user: UserRoleAssignment) => {
  try {
    await ElMessageBox.confirm(
      t('role.clearAllRolesConfirm', { username: user.username }),
      t('common.confirm'),
      {
        type: 'error',
        confirmButtonText: t('common.confirm'),
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    // TODO: 实际的API调用
    // await roleApiService.removeRolesFromUsers({
    //   userIds: [user.id],
    //   roleIds: user.roles.map(r => r.id),
    //   operation: 'remove'
    // })
    
    // 更新本地数据
    user.roles = []
    ElMessage.success(t('role.clearAllRolesSuccess'))
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清除所有角色失败:', error)
      ElMessage.error('清除所有角色失败')
    }
  }
}

const handleBatchSuccess = () => {
  batchAssignDialogVisible.value = false
  clearSelection()
  handleRefresh()
}

// 初始化数据
const initializeData = async () => {
  await Promise.all([
    loadUserRoleAssignments(),
    loadAllRoles(),
    loadAllOrganizations()
  ])
}

// 生命周期
onMounted(() => {
  initializeData()
})
</script>

<style scoped lang="scss">
.role-assignment-container {
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
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .user-details {
        .username {
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
        
        .realname {
          font-size: 12px;
          color: var(--el-text-color-regular);
          margin-top: 2px;
        }
        
        .email {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-top: 2px;
        }
      }
    }
    
    .roles-display {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
      
      .role-tag {
        margin-bottom: 2px;
      }
      
      .add-role-btn {
        margin-left: 8px;
        font-size: 12px;
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
  .role-assignment-container {
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