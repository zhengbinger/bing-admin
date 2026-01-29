<template>
  <div class="user-list-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2>{{ $t('user.title') }}</h2>
        <p class="page-description">{{ $t('user.description') }}</p>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          :icon="Plus" 
          @click="handleCreate"
          v-if="hasPermission('user:create')"
        >
          {{ $t('user.create') }}
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
          
          <el-form-item :label="$t('user.nickname')">
            <el-input
              v-model="searchForm.nickname"
              :placeholder="$t('user.nicknamePlaceholder')"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item :label="$t('user.email')">
            <el-input
              v-model="searchForm.email"
              :placeholder="$t('user.emailPlaceholder')"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item :label="$t('user.phone')">
            <el-input
              v-model="searchForm.phone"
              :placeholder="$t('user.phonePlaceholder')"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item :label="$t('user.status')">
            <el-select 
              v-model="searchForm.status" 
              :placeholder="$t('user.statusPlaceholder')"
              clearable
            >
              <el-option 
                :label="$t('user.statusActive')" 
                :value="1" 
              />
              <el-option 
                :label="$t('user.statusInactive')" 
                :value="0" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item :label="$t('user.role')">
            <el-select 
              v-model="searchForm.roleId" 
              :placeholder="$t('user.rolePlaceholder')"
              clearable
            >
              <el-option
                v-for="role in roles"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item :label="$t('user.organization')">
            <el-select 
              v-model="searchForm.organizationId" 
              :placeholder="$t('user.organizationPlaceholder')"
              clearable
            >
              <el-option
                v-for="org in organizations"
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
              @click="handleBatchEnable"
              v-if="hasPermission('user:update')"
            >
              {{ $t('user.batchEnable') }}
            </el-button>
            <el-button 
              size="small" 
              @click="handleBatchDisable"
              v-if="hasPermission('user:update')"
            >
              {{ $t('user.batchDisable') }}
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleBatchDelete"
              v-if="hasPermission('user:delete')"
            >
              {{ $t('user.batchDelete') }}
            </el-button>
            <el-button size="small" @click="clearSelection">
              {{ $t('common.clearSelection') }}
            </el-button>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 用户表格 -->
    <div class="table-section">
      <el-card>
        <el-table
          ref="tableRef"
          :data="users"
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
            prop="username" 
            :label="$t('user.username')" 
            min-width="120"
            sortable="custom"
          >
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar 
                  :size="32" 
                  :src="row.avatar" 
                  :alt="row.nickname"
                >
                  {{ row.nickname?.charAt(0) || row.username?.charAt(0) }}
                </el-avatar>
                <div class="user-details">
                  <div class="username">{{ row.username }}</div>
                  <div class="nickname">{{ row.nickname }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column 
            prop="email" 
            :label="$t('user.email')" 
            min-width="180"
            show-overflow-tooltip
          />
          
          <el-table-column 
            prop="phone" 
            :label="$t('user.phone')" 
            width="130"
          />
          
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
            :label="$t('user.roles')" 
            min-width="150"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <el-tag
                v-for="role in row.roles"
                :key="role.id"
                size="small"
                class="role-tag"
              >
                {{ role.name }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column 
            :label="$t('user.organizations')" 
            min-width="150"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <el-tag
                v-for="org in row.organizations"
                :key="org.id"
                size="small"
                type="info"
                class="org-tag"
              >
                {{ org.name }}
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
                @click="handleView(row)"
                v-if="hasPermission('user:view')"
              >
                {{ $t('common.view') }}
              </el-button>
              
              <el-button
                size="small"
                type="primary"
                @click="handleEdit(row)"
                v-if="hasPermission('user:update')"
              >
                {{ $t('common.edit') }}
              </el-button>
              
              <el-dropdown 
                @command="(command) => handleDropdownCommand(command, row)"
                v-if="hasAnyPermission(['user:update', 'user:delete'])"
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
                      command="resetPassword"
                      v-if="hasPermission('user:update')"
                    >
                      {{ $t('user.resetPassword') }}
                    </el-dropdown-item>
                    <el-dropdown-item 
                      command="generatePassword"
                      v-if="hasPermission('user:update')"
                    >
                      {{ $t('user.generatePassword') }}
                    </el-dropdown-item>
                    <el-dropdown-item 
                      :command="row.status === 1 ? 'disable' : 'enable'"
                      v-if="hasPermission('user:update')"
                    >
                      {{ row.status === 1 ? $t('user.disable') : $t('user.enable') }}
                    </el-dropdown-item>
                    <el-dropdown-item 
                      command="delete"
                      divided
                      v-if="hasPermission('user:delete')"
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

    <!-- 用户详情对话框 -->
    <UserDetailDialog
      v-model="detailDialogVisible"
      :user-id="selectedUserId"
      @refresh="handleRefresh"
    />

    <!-- 用户编辑对话框 -->
    <UserFormDialog
      v-model="formDialogVisible"
      :user-id="selectedUserId"
      :mode="formMode"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, ElTable } from 'element-plus'
import { Plus, Refresh, ArrowDown } from '@element-plus/icons-vue'

import { useUserStore } from '@/store/modules/user'
import { usePermission } from '@/composables/usePermission'
import { formatDate } from '@/utils/date'
import type { User, Role, Organization } from '@/types'
import type { UserQueryParams } from '@/api/services/user'

import UserDetailDialog from './components/UserDetailDialog.vue'
import UserFormDialog from './components/UserFormDialog.vue'

// 组合式API
const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()
const { hasPermission, hasAnyPermission } = usePermission()

// 响应式数据
const tableRef = ref<InstanceType<typeof ElTable>>()
const detailDialogVisible = ref(false)
const formDialogVisible = ref(false)
const selectedUserId = ref<number | null>(null)
const formMode = ref<'create' | 'edit'>('create')

// 搜索表单
const searchForm = reactive<UserQueryParams>({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  status: undefined,
  roleId: undefined,
  organizationId: undefined
})

// 角色和组织选项
const roles = ref<Role[]>([])
const organizations = ref<Organization[]>([])

// 计算属性
const users = computed(() => userStore.users)
const total = computed(() => userStore.total)
const loading = computed(() => userStore.loading)
const currentPage = computed({
  get: () => userStore.currentPage,
  set: (value) => userStore.currentPage = value
})
const pageSize = computed({
  get: () => userStore.pageSize,
  set: (value) => userStore.pageSize = value
})
const hasSelectedUsers = computed(() => userStore.hasSelectedUsers)
const selectedUserCount = computed(() => userStore.selectedUserCount)

// 方法
const handleSearch = async () => {
  await userStore.searchUsers(searchForm)
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key as keyof UserQueryParams] = undefined
  })
  searchForm.username = ''
  searchForm.nickname = ''
  searchForm.email = ''
  searchForm.phone = ''
  handleSearch()
}

const handleRefresh = async () => {
  await userStore.refreshUsers()
}

const handleCreate = () => {
  selectedUserId.value = null
  formMode.value = 'create'
  formDialogVisible.value = true
}

const handleView = (user: User) => {
  selectedUserId.value = user.id
  detailDialogVisible.value = true
}

const handleEdit = (user: User) => {
  selectedUserId.value = user.id
  formMode.value = 'edit'
  formDialogVisible.value = true
}

const handleSizeChange = async (size: number) => {
  await userStore.changePageSize(size)
}

const handleCurrentChange = async (page: number) => {
  await userStore.changePage(page)
}

const handleSortChange = async ({ prop, order }: { prop: string; order: string | null }) => {
  const sortBy = prop
  const sortOrder = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : undefined
  
  await userStore.searchUsers({
    ...searchForm,
    sortBy,
    sortOrder,
    page: currentPage.value,
    size: pageSize.value
  })
}

const handleSelectionChange = (selection: User[]) => {
  userStore.clearSelection()
  selection.forEach(user => userStore.selectUser(user))
}

const clearSelection = () => {
  userStore.clearSelection()
  tableRef.value?.clearSelection()
}

const handleBatchEnable = async () => {
  try {
    await ElMessageBox.confirm(
      t('user.batchEnableConfirm', { count: selectedUserCount.value }),
      t('common.confirm'),
      {
        type: 'warning'
      }
    )
    
    await userStore.batchUpdateUserStatus(1)
    clearSelection()
  } catch (error) {
    // 用户取消操作
  }
}

const handleBatchDisable = async () => {
  try {
    await ElMessageBox.confirm(
      t('user.batchDisableConfirm', { count: selectedUserCount.value }),
      t('common.confirm'),
      {
        type: 'warning'
      }
    )
    
    await userStore.batchUpdateUserStatus(0)
    clearSelection()
  } catch (error) {
    // 用户取消操作
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('user.batchDeleteConfirm', { count: selectedUserCount.value }),
      t('common.confirm'),
      {
        type: 'error',
        confirmButtonText: t('common.delete'),
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await userStore.batchDeleteUsers()
    clearSelection()
  } catch (error) {
    // 用户取消操作
  }
}

const handleDropdownCommand = async (command: string, user: User) => {
  switch (command) {
    case 'resetPassword':
      await handleResetPassword(user)
      break
    case 'generatePassword':
      await handleGeneratePassword(user)
      break
    case 'enable':
      await handleToggleStatus(user, 1)
      break
    case 'disable':
      await handleToggleStatus(user, 0)
      break
    case 'delete':
      await handleDelete(user)
      break
  }
}

const handleResetPassword = async (user: User) => {
  try {
    await ElMessageBox.prompt(
      t('user.resetPasswordPrompt'),
      t('user.resetPassword'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        inputType: 'password',
        inputValidator: (value) => {
          if (!value || value.length < 6) {
            return t('user.passwordLengthError')
          }
          return true
        }
      }
    )
    
    // TODO: 调用重置密码API
    ElMessage.success(t('user.resetPasswordSuccess'))
  } catch (error) {
    // 用户取消操作
  }
}

const handleGeneratePassword = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      t('user.generatePasswordConfirm'),
      t('user.generatePassword'),
      {
        type: 'warning'
      }
    )
    
    // TODO: 调用生成随机密码API
    ElMessage.success(t('user.generatePasswordSuccess'))
  } catch (error) {
    // 用户取消操作
  }
}

const handleToggleStatus = async (user: User, status: number) => {
  try {
    const action = status === 1 ? 'enable' : 'disable'
    await ElMessageBox.confirm(
      t(`user.${action}Confirm`),
      t('common.confirm'),
      {
        type: 'warning'
      }
    )
    
    await userStore.updateUser(user.id, { status })
  } catch (error) {
    // 用户取消操作
  }
}

const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      t('user.deleteConfirm', { username: user.username }),
      t('common.confirm'),
      {
        type: 'error',
        confirmButtonText: t('common.delete'),
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await userStore.deleteUser(user.id)
  } catch (error) {
    // 用户取消操作
  }
}

const handleFormSuccess = () => {
  formDialogVisible.value = false
  handleRefresh()
}

// 加载初始数据
const loadInitialData = async () => {
  try {
    // 加载用户列表
    await userStore.fetchUsers()
    
    // TODO: 加载角色和组织选项
    // roles.value = await roleApiService.getRoles()
    // organizations.value = await organizationApiService.getOrganizations()
  } catch (error) {
    console.error('加载初始数据失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadInitialData()
})

// 监听搜索参数变化
watch(
  () => searchForm,
  () => {
    // 防抖搜索
    // TODO: 实现防抖逻辑
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.user-list-container {
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
        
        .nickname {
          font-size: 12px;
          color: var(--el-text-color-regular);
          margin-top: 2px;
        }
      }
    }
    
    .role-tag,
    .org-tag {
      margin-right: 4px;
      margin-bottom: 2px;
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
  .user-list-container {
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