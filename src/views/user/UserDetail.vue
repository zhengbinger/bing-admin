<template>
  <div class="user-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button 
          :icon="ArrowLeft" 
          @click="goBack"
          class="back-button"
        >
          {{ $t('common.back') }}
        </el-button>
        <div class="header-info">
          <h2>{{ $t('user.userDetail') }}</h2>
          <p class="page-description" v-if="user">
            {{ $t('user.userDetailDescription', { username: user.username }) }}
          </p>
        </div>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          :icon="Edit"
          @click="handleEdit"
          v-if="hasPermission('user:update')"
        >
          {{ $t('common.edit') }}
        </el-button>
        <el-button 
          :icon="Refresh" 
          @click="loadUserDetail"
        >
          {{ $t('common.refresh') }}
        </el-button>
      </div>
    </div>

    <!-- 用户详情内容 -->
    <div v-loading="loading" class="detail-content">
      <template v-if="user">
        <el-row :gutter="20">
          <!-- 左侧：基本信息 -->
          <el-col :span="16">
            <!-- 基本信息卡片 -->
            <el-card class="detail-card">
              <template #header>
                <div class="card-header">
                  <span>{{ $t('user.basicInfo') }}</span>
                  <el-tag 
                    :type="user.status === 1 ? 'success' : 'danger'"
                    size="small"
                  >
                    {{ user.status === 1 ? $t('user.statusActive') : $t('user.statusInactive') }}
                  </el-tag>
                </div>
              </template>
              
              <div class="info-grid">
                <div class="info-item">
                  <label>{{ $t('user.id') }}:</label>
                  <span>{{ user.id }}</span>
                </div>
                
                <div class="info-item">
                  <label>{{ $t('user.username') }}:</label>
                  <span>{{ user.username }}</span>
                </div>
                
                <div class="info-item">
                  <label>{{ $t('user.nickname') }}:</label>
                  <span>{{ user.nickname }}</span>
                </div>
                
                <div class="info-item">
                  <label>{{ $t('user.email') }}:</label>
                  <span>{{ user.email || '-' }}</span>
                </div>
                
                <div class="info-item">
                  <label>{{ $t('user.phone') }}:</label>
                  <span>{{ user.phone || '-' }}</span>
                </div>
                
                <div class="info-item">
                  <label>{{ $t('user.createTime') }}:</label>
                  <span>{{ formatDate(user.createTime) }}</span>
                </div>
                
                <div class="info-item">
                  <label>{{ $t('user.updateTime') }}:</label>
                  <span>{{ formatDate(user.updateTime) }}</span>
                </div>
              </div>
            </el-card>

            <!-- 角色信息卡片 -->
            <el-card class="detail-card">
              <template #header>
                <div class="card-header">
                  <span>{{ $t('user.roleInfo') }}</span>
                  <el-button 
                    size="small" 
                    type="primary" 
                    @click="handleAssignRoles"
                    v-if="hasPermission('user:update')"
                  >
                    {{ $t('user.assignRoles') }}
                  </el-button>
                </div>
              </template>
              
              <div class="role-list">
                <el-tag
                  v-for="role in user.roles"
                  :key="role.id"
                  size="default"
                  class="role-tag"
                >
                  <div class="tag-content">
                    <div class="tag-name">{{ role.name }}</div>
                    <div class="tag-description">{{ role.description }}</div>
                  </div>
                </el-tag>
                <el-empty 
                  v-if="!user.roles || user.roles.length === 0"
                  :description="$t('user.noRoles')"
                  :image-size="80"
                />
              </div>
            </el-card>

            <!-- 组织信息卡片 -->
            <el-card class="detail-card">
              <template #header>
                <div class="card-header">
                  <span>{{ $t('user.organizationInfo') }}</span>
                  <el-button 
                    size="small" 
                    type="primary" 
                    @click="handleAssignOrganizations"
                    v-if="hasPermission('user:update')"
                  >
                    {{ $t('user.assignOrganizations') }}
                  </el-button>
                </div>
              </template>
              
              <div class="org-list">
                <el-tag
                  v-for="org in user.organizations"
                  :key="org.id"
                  type="info"
                  size="default"
                  class="org-tag"
                >
                  <div class="tag-content">
                    <div class="tag-name">{{ org.name }}</div>
                    <div class="tag-description">{{ org.description }}</div>
                  </div>
                </el-tag>
                <el-empty 
                  v-if="!user.organizations || user.organizations.length === 0"
                  :description="$t('user.noOrganizations')"
                  :image-size="80"
                />
              </div>
            </el-card>

            <!-- 权限信息卡片 -->
            <el-card class="detail-card" v-if="permissions.length > 0">
              <template #header>
                <div class="card-header">
                  <span>{{ $t('user.permissions') }}</span>
                  <el-button 
                    size="small" 
                    @click="refreshPermissions"
                  >
                    {{ $t('common.refresh') }}
                  </el-button>
                </div>
              </template>
              
              <div class="permission-tree">
                <el-tree
                  :data="permissionTree"
                  :props="treeProps"
                  node-key="code"
                  :default-expand-all="false"
                  :expand-on-click-node="false"
                >
                  <template #default="{ node, data }">
                    <div class="permission-node">
                      <el-icon v-if="data.icon" class="permission-icon">
                        <component :is="data.icon" />
                      </el-icon>
                      <span class="permission-name">{{ data.name }}</span>
                      <el-tag size="small" class="permission-type">
                        {{ $t(`permission.type.${data.type}`) }}
                      </el-tag>
                    </div>
                  </template>
                </el-tree>
              </div>
            </el-card>
          </el-col>

          <!-- 右侧：操作和统计 -->
          <el-col :span="8">
            <!-- 用户头像卡片 -->
            <el-card class="detail-card avatar-card">
              <div class="avatar-section">
                <el-avatar :size="120" :src="user.avatar">
                  {{ user.nickname?.charAt(0) || user.username?.charAt(0) }}
                </el-avatar>
                <div class="avatar-info">
                  <h3>{{ user.nickname }}</h3>
                  <p>@{{ user.username }}</p>
                </div>
              </div>
            </el-card>

            <!-- 快速操作卡片 -->
            <el-card class="detail-card">
              <template #header>
                <span>{{ $t('user.quickActions') }}</span>
              </template>
              
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  :icon="Edit"
                  @click="handleEdit"
                  v-if="hasPermission('user:update')"
                  block
                >
                  {{ $t('common.edit') }}
                </el-button>
                
                <el-button 
                  :icon="Key"
                  @click="handleResetPassword"
                  v-if="hasPermission('user:update')"
                  block
                >
                  {{ $t('user.resetPassword') }}
                </el-button>
                
                <el-button 
                  :icon="RefreshRight"
                  @click="handleGeneratePassword"
                  v-if="hasPermission('user:update')"
                  block
                >
                  {{ $t('user.generatePassword') }}
                </el-button>
                
                <el-button 
                  :type="user.status === 1 ? 'warning' : 'success'"
                  :icon="user.status === 1 ? 'CircleClose' : 'CircleCheck'"
                  @click="handleToggleStatus"
                  v-if="hasPermission('user:update')"
                  block
                >
                  {{ user.status === 1 ? $t('user.disable') : $t('user.enable') }}
                </el-button>
                
                <el-button 
                  type="danger" 
                  :icon="Delete"
                  @click="handleDelete"
                  v-if="hasPermission('user:delete')"
                  block
                >
                  {{ $t('common.delete') }}
                </el-button>
              </div>
            </el-card>

            <!-- 登录渠道卡片 -->
            <el-card class="detail-card" v-if="user.channels && user.channels.length > 0">
              <template #header>
                <span>{{ $t('user.loginChannels') }}</span>
              </template>
              
              <div class="channel-list">
                <el-tag
                  v-for="channel in user.channels"
                  :key="channel"
                  type="warning"
                  size="default"
                >
                  {{ $t(`channel.${channel}`) }}
                </el-tag>
              </div>
            </el-card>

            <!-- 统计信息卡片 -->
            <el-card class="detail-card">
              <template #header>
                <span>{{ $t('user.statistics') }}</span>
              </template>
              
              <div class="stats-list">
                <div class="stat-item">
                  <span class="stat-label">{{ $t('user.roleCount') }}:</span>
                  <span class="stat-value">{{ user.roles?.length || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">{{ $t('user.organizationCount') }}:</span>
                  <span class="stat-value">{{ user.organizations?.length || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">{{ $t('user.permissionCount') }}:</span>
                  <span class="stat-value">{{ permissions.length }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
    </div>

    <!-- 角色分配对话框 -->
    <RoleAssignDialog
      v-model="roleAssignVisible"
      :user-id="userId"
      @success="handleAssignSuccess"
    />

    <!-- 组织分配对话框 -->
    <OrganizationAssignDialog
      v-model="orgAssignVisible"
      :user-id="userId"
      @success="handleAssignSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  Edit, 
  Refresh, 
  Key, 
  RefreshRight, 
  Delete,
  CircleClose,
  CircleCheck
} from '@element-plus/icons-vue'

import { useUserStore } from '@/store/modules/user'
import { usePermission } from '@/composables/usePermission'
import { formatDate } from '@/utils/date'
import { userApiService } from '@/api/services/user'
import type { User, Permission } from '@/types'

// 导入对话框组件（这些组件需要单独创建）
// import RoleAssignDialog from './components/RoleAssignDialog.vue'
// import OrganizationAssignDialog from './components/OrganizationAssignDialog.vue'

// 组合式API
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()
const { hasPermission } = usePermission()

// 响应式数据
const loading = ref(false)
const user = ref<User | null>(null)
const permissions = ref<string[]>([])
const permissionTree = ref<Permission[]>([])
const roleAssignVisible = ref(false)
const orgAssignVisible = ref(false)

// 计算属性
const userId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id) : null
})

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 方法
const loadUserDetail = async () => {
  if (!userId.value) return

  loading.value = true
  try {
    // 获取用户详情
    user.value = await userStore.getUserById(userId.value)
    
    // 获取用户权限
    await refreshPermissions()
  } catch (error) {
    console.error('加载用户详情失败:', error)
    ElMessage.error(t('user.loadDetailError'))
  } finally {
    loading.value = false
  }
}

const refreshPermissions = async () => {
  if (!userId.value) return

  try {
    permissions.value = await userApiService.getUserPermissions(userId.value)
    // TODO: 构建权限树
    // permissionTree.value = buildPermissionTree(permissions.value)
  } catch (error) {
    console.error('获取用户权限失败:', error)
  }
}

const goBack = () => {
  router.back()
}

const handleEdit = () => {
  if (userId.value) {
    router.push(`/system/user/edit/${userId.value}`)
  }
}

const handleResetPassword = async () => {
  if (!userId.value || !user.value) return

  try {
    const { value: newPassword } = await ElMessageBox.prompt(
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
    
    await userApiService.resetPassword(userId.value, { 
      newPassword: newPassword,
      sendNotification: true 
    })
    
    ElMessage.success(t('user.resetPasswordSuccess'))
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
      ElMessage.error(t('user.resetPasswordError'))
    }
  }
}

const handleGeneratePassword = async () => {
  if (!userId.value || !user.value) return

  try {
    await ElMessageBox.confirm(
      t('user.generatePasswordConfirm'),
      t('user.generatePassword'),
      {
        type: 'warning'
      }
    )
    
    const result = await userApiService.generateRandomPassword(userId.value)
    
    await ElMessageBox.alert(
      t('user.generatedPasswordMessage', { password: result.password }),
      t('user.generatePasswordSuccess'),
      {
        type: 'success',
        dangerouslyUseHTMLString: true,
        customClass: 'password-alert-dialog'
      }
    )
  } catch (error) {
    if (error !== 'cancel') {
      console.error('生成随机密码失败:', error)
      ElMessage.error(t('user.generatePasswordError'))
    }
  }
}

const handleToggleStatus = async () => {
  if (!userId.value || !user.value) return

  const newStatus = user.value.status === 1 ? 0 : 1
  const action = newStatus === 1 ? 'enable' : 'disable'

  try {
    await ElMessageBox.confirm(
      t(`user.${action}Confirm`, { username: user.value.username }),
      t('common.confirm'),
      {
        type: 'warning'
      }
    )
    
    await userApiService.updateUserStatus(userId.value, newStatus)
    user.value.status = newStatus
    
    ElMessage.success(t(`user.${action}Success`))
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新用户状态失败:', error)
      ElMessage.error(t('user.updateStatusError'))
    }
  }
}

const handleDelete = async () => {
  if (!userId.value || !user.value) return

  try {
    await ElMessageBox.confirm(
      t('user.deleteConfirmDetail', { username: user.value.username }),
      t('user.deleteUser'),
      {
        type: 'error',
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        confirmButtonClass: 'el-button--danger',
        dangerouslyUseHTMLString: true
      }
    )
    
    await userStore.deleteUser(userId.value)
    
    ElMessage.success(t('user.deleteSuccess'))
    router.push('/system/user')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error(t('user.deleteError'))
    }
  }
}

const handleAssignRoles = () => {
  roleAssignVisible.value = true
}

const handleAssignOrganizations = () => {
  orgAssignVisible.value = true
}

const handleAssignSuccess = () => {
  loadUserDetail()
}

// 生命周期
onMounted(() => {
  loadUserDetail()
})
</script>

<style scoped lang="scss">
.user-detail-page {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    
    .header-left {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      
      .back-button {
        margin-top: 4px;
      }
      
      .header-info {
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
    }
    
    .header-right {
      display: flex;
      gap: 12px;
    }
  }
  
  .detail-content {
    min-height: 400px;
    
    .detail-card {
      margin-bottom: 20px;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          
          label {
            font-weight: 500;
            color: var(--el-text-color-regular);
            min-width: 80px;
            flex-shrink: 0;
          }
          
          span {
            color: var(--el-text-color-primary);
            word-break: break-all;
          }
        }
      }
      
      .role-list,
      .org-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .role-tag,
        .org-tag {
          .tag-content {
            .tag-name {
              font-weight: 500;
            }
            
            .tag-description {
              font-size: 12px;
              color: var(--el-text-color-regular);
              margin-top: 2px;
            }
          }
        }
      }
      
      .permission-tree {
        .permission-node {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .permission-icon {
            color: var(--el-color-primary);
          }
          
          .permission-name {
            flex: 1;
          }
          
          .permission-type {
            margin-left: auto;
          }
        }
      }
      
      .channel-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
    
    .avatar-card {
      .avatar-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        
        .avatar-info {
          margin-top: 16px;
          
          h3 {
            margin: 0 0 4px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--el-text-color-primary);
          }
          
          p {
            margin: 0;
            color: var(--el-text-color-regular);
            font-size: 14px;
          }
        }
      }
    }
    
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .stats-list {
      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--el-border-color-lighter);
        
        &:last-child {
          border-bottom: none;
        }
        
        .stat-label {
          color: var(--el-text-color-regular);
        }
        
        .stat-value {
          font-weight: 600;
          color: var(--el-color-primary);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-detail-page {
    padding: 12px;
    
    .page-header {
      flex-direction: column;
      gap: 16px;
      
      .header-left {
        flex-direction: column;
        gap: 12px;
        
        .back-button {
          align-self: flex-start;
          margin-top: 0;
        }
      }
      
      .header-right {
        width: 100%;
        justify-content: flex-start;
      }
    }
    
    .detail-content {
      .info-grid {
        grid-template-columns: 1fr;
        
        .info-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          
          label {
            min-width: auto;
          }
        }
      }
    }
  }
}

// 密码提示对话框样式
:deep(.password-alert-dialog) {
  .el-message-box__message {
    text-align: center;
    
    strong {
      display: block;
      margin: 10px 0;
      padding: 10px;
      background-color: var(--el-color-primary-light-9);
      border-radius: 4px;
      border: 1px solid var(--el-color-primary-light-7);
    }
  }
}
</style>