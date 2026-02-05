<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('role.batchAssignRoles')"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="batch-assign-content">
      <!-- 用户列表 -->
      <el-card class="users-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><User /></el-icon>
            <span>{{ $t('user.selectedUsers') }}</span>
            <el-tag size="small" class="user-count">
              {{ users.length }} {{ $t('user.users') }}
            </el-tag>
          </div>
        </template>
        
        <div class="users-list">
          <div
            v-for="user in users"
            :key="user.id"
            class="user-item"
          >
            <el-avatar :size="32" :src="user.avatar">
              {{ user.username.charAt(0).toUpperCase() }}
            </el-avatar>
            <div class="user-details">
              <div class="username">{{ user.username }}</div>
              <div class="realname">{{ user.realName || '-' }}</div>
            </div>
            <div class="current-roles">
              <el-tag
                v-for="role in user.roles"
                :key="role.id"
                size="small"
                :type="getRoleTagType(role)"
              >
                {{ role.name }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 操作选择 -->
      <el-card class="operation-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Operation /></el-icon>
            <span>{{ $t('role.operationType') }}</span>
          </div>
        </template>
        
        <el-radio-group v-model="operationType" class="operation-options">
          <el-radio label="assign">
            <div class="operation-option">
              <div class="option-title">{{ $t('role.assignRoles') }}</div>
              <div class="option-description">{{ $t('role.assignRolesDescription') }}</div>
            </div>
          </el-radio>
          <el-radio label="replace">
            <div class="operation-option">
              <div class="option-title">{{ $t('role.replaceRoles') }}</div>
              <div class="option-description">{{ $t('role.replaceRolesDescription') }}</div>
            </div>
          </el-radio>
          <el-radio label="remove">
            <div class="operation-option">
              <div class="option-title">{{ $t('role.removeRoles') }}</div>
              <div class="option-description">{{ $t('role.removeRolesDescription') }}</div>
            </div>
          </el-radio>
        </el-radio-group>
      </el-card>

      <!-- 角色选择 -->
      <el-card class="role-selection-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><UserFilled /></el-icon>
            <span>{{ $t('role.selectRoles') }}</span>
            <el-tag size="small" class="selected-count">
              {{ selectedRoleCount }} {{ $t('role.selected') }}
            </el-tag>
          </div>
        </template>
        
        <!-- 快速选择 -->
        <div class="quick-actions">
          <el-button size="small" @click="selectAllRoles">
            {{ $t('role.selectAll') }}
          </el-button>
          <el-button size="small" @click="clearRoleSelection">
            {{ $t('role.clearSelection') }}
          </el-button>
          <el-button size="small" @click="selectCommonRoles">
            {{ $t('role.selectCommon') }}
          </el-button>
        </div>
        
        <!-- 搜索框 -->
        <div class="search-section">
          <el-input
            v-model="roleSearchKeyword"
            :placeholder="$t('role.searchPlaceholder')"
            :prefix-icon="Search"
            clearable
            @input="handleRoleSearch"
          />
        </div>
        
        <!-- 角色列表 -->
        <div class="role-list">
          <el-checkbox-group v-model="selectedRoleIds">
            <div
              v-for="role in filteredRoles"
              :key="role.id"
              class="role-item"
            >
              <el-checkbox :label="role.id" class="role-checkbox">
                <div class="role-info">
                  <div class="role-main">
                    <div class="role-name">{{ role.name }}</div>
                    <el-tag
                      size="small"
                      :type="getRoleTagType(role)"
                      class="role-code"
                    >
                      {{ role.code }}
                    </el-tag>
                  </div>
                  <div class="role-description">
                    {{ role.description || $t('common.none') }}
                  </div>
                  <div class="role-stats">
                    <span class="affected-users">
                      {{ getAffectedUserCount(role.id) }} {{ $t('user.usersWillBeAffected') }}
                    </span>
                  </div>
                </div>
              </el-checkbox>
            </div>
          </el-checkbox-group>
          
          <el-empty
            v-if="filteredRoles.length === 0"
            :description="roleSearchKeyword ? $t('role.noSearchResults') : $t('role.noRoles')"
            :image-size="80"
          />
        </div>
      </el-card>

      <!-- 操作预览 -->
      <el-card 
        v-if="selectedRoleIds.length > 0"
        class="preview-card" 
        shadow="never"
      >
        <template #header>
          <div class="card-header">
            <el-icon><View /></el-icon>
            <span>{{ $t('role.operationPreview') }}</span>
          </div>
        </template>
        
        <div class="preview-content">
          <el-alert
            :title="getPreviewMessage()"
            :type="getPreviewType()"
            :closable="false"
            show-icon
          />
          
          <div class="preview-details">
            <div class="detail-item">
              <span class="label">{{ $t('user.affectedUsers') }}:</span>
              <span class="value">{{ users.length }}</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ $t('role.selectedRoles') }}:</span>
              <span class="value">{{ selectedRoleCount }}</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ $t('role.operationType') }}:</span>
              <span class="value">{{ $t(`role.${operationType}`) }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          :disabled="selectedRoleIds.length === 0"
        >
          {{ $t('role.confirmBatchAssign') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, UserFilled, Search, Operation, View } from '@element-plus/icons-vue'

import { roleApiService } from '@/api/services/role'
import type { Role } from '@/types'

// Props
interface Props {
  modelValue: boolean
  users: any[]
}

const props = withDefaults(defineProps<Props>(), {
  users: () => []
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const allRoles = ref<Role[]>([])
const selectedRoleIds = ref<number[]>([])
const roleSearchKeyword = ref('')
const operationType = ref<'assign' | 'replace' | 'remove'>('assign')

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const filteredRoles = computed(() => {
  if (!roleSearchKeyword.value) {
    return allRoles.value
  }
  
  const keyword = roleSearchKeyword.value.toLowerCase()
  return allRoles.value.filter(role => 
    role.name.toLowerCase().includes(keyword) ||
    role.code.toLowerCase().includes(keyword) ||
    (role.description && role.description.toLowerCase().includes(keyword))
  )
})

const selectedRoleCount = computed(() => selectedRoleIds.value.length)

// Methods
const loadRoles = async () => {
  loading.value = true
  try {
    allRoles.value = await roleApiService.getAllRoles()
  } catch (error) {
    console.error('加载角色列表失败:', error)
    ElMessage.error('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

const getRoleTagType = (role: Role) => {
  if (role.code === 'super_admin') return 'danger'
  if (role.code === 'system_admin') return 'warning'
  if (role.code === 'admin') return 'primary'
  return 'success'
}

const getAffectedUserCount = (roleId: number) => {
  if (operationType.value === 'assign') {
    // 计算没有该角色的用户数量
    return props.users.filter(user => 
      !user.roles?.some((role: Role) => role.id === roleId)
    ).length
  } else if (operationType.value === 'remove') {
    // 计算有该角色的用户数量
    return props.users.filter(user => 
      user.roles?.some((role: Role) => role.id === roleId)
    ).length
  } else {
    // replace 操作影响所有用户
    return props.users.length
  }
}

const getPreviewMessage = () => {
  const userCount = props.users.length
  const roleCount = selectedRoleCount.value
  
  switch (operationType.value) {
    case 'assign':
      return t('role.previewAssign', { userCount, roleCount })
    case 'replace':
      return t('role.previewReplace', { userCount, roleCount })
    case 'remove':
      return t('role.previewRemove', { userCount, roleCount })
    default:
      return ''
  }
}

const getPreviewType = () => {
  switch (operationType.value) {
    case 'assign':
      return 'success'
    case 'replace':
      return 'warning'
    case 'remove':
      return 'error'
    default:
      return 'info'
  }
}

const selectAllRoles = () => {
  selectedRoleIds.value = filteredRoles.value.map(role => role.id)
}

const clearRoleSelection = () => {
  selectedRoleIds.value = []
}

const selectCommonRoles = () => {
  // 选择常用角色（非管理员角色）
  const commonRoles = filteredRoles.value.filter(role => 
    !role.code.includes('admin') && !role.code.includes('super')
  )
  selectedRoleIds.value = commonRoles.map(role => role.id)
}

const handleRoleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleSubmit = async () => {
  if (props.users.length === 0 || selectedRoleIds.value.length === 0) return

  try {
    const confirmMessage = getPreviewMessage()
    await ElMessageBox.confirm(
      confirmMessage,
      t('common.confirm'),
      {
        type: getPreviewType() as any,
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel')
      }
    )

    submitting.value = true

    const userIds = props.users.map(user => user.id)
    
    if (operationType.value === 'assign') {
      await roleApiService.assignRolesToUsers({
        userIds,
        roleIds: selectedRoleIds.value,
        operation: 'assign'
      })
    } else if (operationType.value === 'remove') {
      await roleApiService.removeRolesFromUsers({
        userIds,
        roleIds: selectedRoleIds.value,
        operation: 'remove'
      })
    } else {
      // replace 操作：先移除所有角色，再分配新角色
      // TODO: 实现替换逻辑
      ElMessage.info('替换角色功能开发中')
      return
    }

    ElMessage.success(t('role.batchAssignSuccess'))
    emit('success')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量分配角色失败:', error)
      ElMessage.error('批量分配角色失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  resetData()
  dialogVisible.value = false
}

const resetData = () => {
  selectedRoleIds.value = []
  roleSearchKeyword.value = ''
  operationType.value = 'assign'
}

// Watch
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      loadRoles()
    } else {
      resetData()
    }
  }
)
</script>

<style scoped lang="scss">
.batch-assign-content {
  .users-card,
  .operation-card,
  .role-selection-card,
  .preview-card {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-icon {
        color: var(--el-color-primary);
      }
      
      .user-count,
      .selected-count {
        margin-left: auto;
      }
    }
  }
  
  .users-list {
    max-height: 150px;
    overflow-y: auto;
    
    .user-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      &:last-child {
        border-bottom: none;
      }
      
      .user-details {
        flex: 1;
        
        .username {
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
        
        .realname {
          font-size: 12px;
          color: var(--el-text-color-regular);
          margin-top: 2px;
        }
      }
      
      .current-roles {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
    }
  }
  
  .operation-options {
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .el-radio {
      margin-right: 0;
      
      .operation-option {
        margin-left: 8px;
        
        .option-title {
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
        
        .option-description {
          font-size: 12px;
          color: var(--el-text-color-regular);
          margin-top: 2px;
        }
      }
    }
  }
  
  .quick-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .search-section {
    margin-bottom: 16px;
  }
  
  .role-list {
    max-height: 250px;
    overflow-y: auto;
    
    .role-item {
      margin-bottom: 8px;
      padding: 12px;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 6px;
      transition: all 0.2s;
      
      &:hover {
        border-color: var(--el-color-primary-light-7);
        background-color: var(--el-color-primary-light-9);
      }
      
      .role-checkbox {
        width: 100%;
        
        :deep(.el-checkbox__label) {
          width: 100%;
        }
      }
      
      .role-info {
        width: 100%;
        
        .role-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
          
          .role-name {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
          
          .role-code {
            font-family: 'Courier New', monospace;
            font-size: 12px;
          }
        }
        
        .role-description {
          font-size: 12px;
          color: var(--el-text-color-regular);
          margin-bottom: 4px;
        }
        
        .role-stats {
          display: flex;
          justify-content: flex-end;
          
          .affected-users {
            font-size: 11px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }
  
  .preview-content {
    .preview-details {
      margin-top: 16px;
      
      .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--el-border-color-lighter);
        
        &:last-child {
          border-bottom: none;
        }
        
        .label {
          color: var(--el-text-color-regular);
        }
        
        .value {
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  .batch-assign-content {
    .operation-options {
      gap: 12px;
    }
    
    .role-list {
      max-height: 200px;
    }
  }
}
</style>