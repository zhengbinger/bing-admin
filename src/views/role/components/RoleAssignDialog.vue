<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('role.assignRoles')"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="assign-content">
      <!-- 用户信息 -->
      <el-card class="user-info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><User /></el-icon>
            <span>{{ $t('user.info') }}</span>
          </div>
        </template>
        
        <div v-if="user" class="user-info">
          <el-avatar :size="48" :src="user.avatar">
            {{ user.username.charAt(0).toUpperCase() }}
          </el-avatar>
          <div class="user-details">
            <div class="username">{{ user.username }}</div>
            <div class="realname">{{ user.realName || '-' }}</div>
            <div class="email">{{ user.email || '-' }}</div>
          </div>
        </div>
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
              :class="{ 'role-item--assigned': isRoleAssigned(role.id) }"
            >
              <el-checkbox 
                :label="role.id" 
                class="role-checkbox"
                :disabled="isRoleAssigned(role.id)"
              >
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
                  <div v-if="isRoleAssigned(role.id)" class="assigned-indicator">
                    <el-tag type="success" size="small">
                      {{ $t('role.alreadyAssigned') }}
                    </el-tag>
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

      <!-- 分配冲突检测 -->
      <el-card 
        v-if="conflictWarnings.length > 0"
        class="conflict-card" 
        shadow="never"
      >
        <template #header>
          <div class="card-header">
            <el-icon><Warning /></el-icon>
            <span>{{ $t('role.conflictWarning') }}</span>
          </div>
        </template>
        
        <div class="conflict-list">
          <el-alert
            v-for="warning in conflictWarnings"
            :key="warning.id"
            :title="warning.message"
            type="warning"
            :closable="false"
            show-icon
          />
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
          {{ $t('role.confirmAssign') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { User, UserFilled, Search, Warning } from '@element-plus/icons-vue'

import { roleApiService } from '@/api/services/role'
import type { Role } from '@/types'

// Props
interface Props {
  modelValue: boolean
  user: any | null
}

const props = defineProps<Props>()

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
const conflictWarnings = ref<{ id: number; message: string }[]>([])

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

const isRoleAssigned = (roleId: number) => {
  return props.user?.roles?.some((role: Role) => role.id === roleId) || false
}

const getRoleTagType = (role: Role) => {
  if (role.code === 'super_admin') return 'danger'
  if (role.code === 'system_admin') return 'warning'
  if (role.code === 'admin') return 'primary'
  return 'success'
}

const handleRoleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const validateRoleAssignment = () => {
  conflictWarnings.value = []
  
  // 检查角色冲突
  const selectedRoles = allRoles.value.filter(role => selectedRoleIds.value.includes(role.id))
  
  // 示例冲突检测逻辑
  const hasAdminRole = selectedRoles.some(role => role.code.includes('admin'))
  const hasUserRole = selectedRoles.some(role => role.code === 'user')
  
  if (hasAdminRole && hasUserRole) {
    conflictWarnings.value.push({
      id: 1,
      message: t('role.conflictAdminUser')
    })
  }
  
  // 检查权限冲突
  if (selectedRoles.length > 3) {
    conflictWarnings.value.push({
      id: 2,
      message: t('role.tooManyRoles')
    })
  }
}

const handleSubmit = async () => {
  if (!props.user || selectedRoleIds.value.length === 0) return

  submitting.value = true
  try {
    await roleApiService.assignRolesToUsers({
      userIds: [props.user.id],
      roleIds: selectedRoleIds.value,
      operation: 'assign'
    })

    ElMessage.success(t('role.assignSuccess'))
    emit('success')
  } catch (error) {
    console.error('分配角色失败:', error)
    ElMessage.error('分配角色失败')
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
  conflictWarnings.value = []
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

watch(
  () => selectedRoleIds.value,
  () => {
    validateRoleAssignment()
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.assign-content {
  .user-info-card,
  .role-selection-card,
  .conflict-card {
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
      
      .selected-count {
        margin-left: auto;
      }
    }
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .user-details {
      .username {
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
      
      .realname {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin-top: 4px;
      }
      
      .email {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-top: 2px;
      }
    }
  }
  
  .search-section {
    margin-bottom: 16px;
  }
  
  .role-list {
    max-height: 300px;
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
      
      &--assigned {
        background-color: var(--el-color-success-light-9);
        border-color: var(--el-color-success-light-7);
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
        
        .assigned-indicator {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
  
  .conflict-list {
    .el-alert {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
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
  .assign-content {
    .role-list {
      max-height: 250px;
    }
  }
}
</style>