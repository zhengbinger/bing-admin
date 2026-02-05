<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('role.assignUsers')"
    width="1000px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="assign-content">
      <!-- 角色信息 -->
      <el-card class="role-info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><UserFilled /></el-icon>
            <span>{{ $t('role.targetRole') }}</span>
          </div>
        </template>
        
        <div v-if="roleInfo" class="role-info">
          <el-tag type="primary" size="large">
            <el-icon><UserFilled /></el-icon>
            {{ roleInfo.name }}
          </el-tag>
          <span class="role-description">{{ roleInfo.description || $t('common.none') }}</span>
        </div>
      </el-card>

      <!-- 用户分配区域 -->
      <div class="assign-section">
        <el-row :gutter="20">
          <!-- 可分配用户列表 -->
          <el-col :span="11">
            <el-card class="user-list-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <el-icon><User /></el-icon>
                  <span>{{ $t('role.availableUsers') }}</span>
                  <el-tag size="small" class="user-count">
                    {{ availableUsers.length }}
                  </el-tag>
                </div>
              </template>
              
              <!-- 搜索框 -->
              <div class="search-section">
                <el-input
                  v-model="availableSearchKeyword"
                  :placeholder="$t('user.searchPlaceholder')"
                  :prefix-icon="Search"
                  clearable
                  @input="handleAvailableSearch"
                />
              </div>
              
              <!-- 用户列表 -->
              <div class="user-list">
                <el-checkbox-group v-model="selectedAvailableUsers">
                  <div
                    v-for="user in filteredAvailableUsers"
                    :key="user.id"
                    class="user-item"
                  >
                    <el-checkbox :label="user.id" class="user-checkbox">
                      <div class="user-info">
                        <el-avatar :size="32" :src="user.avatar">
                          {{ user.username.charAt(0).toUpperCase() }}
                        </el-avatar>
                        <div class="user-details">
                          <div class="username">{{ user.username }}</div>
                          <div class="realname">{{ user.realName || '-' }}</div>
                        </div>
                        <el-tag
                          :type="user.status === 1 ? 'success' : 'danger'"
                          size="small"
                          class="user-status"
                        >
                          {{ user.status === 1 ? $t('user.statusActive') : $t('user.statusInactive') }}
                        </el-tag>
                      </div>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
                
                <el-empty
                  v-if="filteredAvailableUsers.length === 0"
                  :description="availableSearchKeyword ? $t('user.noSearchResults') : $t('role.noAvailableUsers')"
                  :image-size="80"
                />
              </div>
            </el-card>
          </el-col>

          <!-- 操作按钮 -->
          <el-col :span="2">
            <div class="action-buttons">
              <el-button
                type="primary"
                :icon="Right"
                @click="handleAssign"
                :disabled="selectedAvailableUsers.length === 0"
                class="action-btn"
              >
                {{ $t('role.assign') }}
              </el-button>
              
              <el-button
                type="danger"
                :icon="Left"
                @click="handleUnassign"
                :disabled="selectedAssignedUsers.length === 0"
                class="action-btn"
              >
                {{ $t('role.unassign') }}
              </el-button>
              
              <el-button
                :icon="Right"
                @click="handleAssignAll"
                :disabled="filteredAvailableUsers.length === 0"
                class="action-btn"
              >
                {{ $t('role.assignAll') }}
              </el-button>
              
              <el-button
                :icon="Left"
                @click="handleUnassignAll"
                :disabled="filteredAssignedUsers.length === 0"
                class="action-btn"
              >
                {{ $t('role.unassignAll') }}
              </el-button>
            </div>
          </el-col>

          <!-- 已分配用户列表 -->
          <el-col :span="11">
            <el-card class="user-list-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <el-icon><UserFilled /></el-icon>
                  <span>{{ $t('role.assignedUsers') }}</span>
                  <el-tag size="small" class="user-count">
                    {{ assignedUsers.length }}
                  </el-tag>
                </div>
              </template>
              
              <!-- 搜索框 -->
              <div class="search-section">
                <el-input
                  v-model="assignedSearchKeyword"
                  :placeholder="$t('user.searchPlaceholder')"
                  :prefix-icon="Search"
                  clearable
                  @input="handleAssignedSearch"
                />
              </div>
              
              <!-- 用户列表 -->
              <div class="user-list">
                <el-checkbox-group v-model="selectedAssignedUsers">
                  <div
                    v-for="user in filteredAssignedUsers"
                    :key="user.id"
                    class="user-item"
                  >
                    <el-checkbox :label="user.id" class="user-checkbox">
                      <div class="user-info">
                        <el-avatar :size="32" :src="user.avatar">
                          {{ user.username.charAt(0).toUpperCase() }}
                        </el-avatar>
                        <div class="user-details">
                          <div class="username">{{ user.username }}</div>
                          <div class="realname">{{ user.realName || '-' }}</div>
                        </div>
                        <el-tag
                          :type="user.status === 1 ? 'success' : 'danger'"
                          size="small"
                          class="user-status"
                        >
                          {{ user.status === 1 ? $t('user.statusActive') : $t('user.statusInactive') }}
                        </el-tag>
                      </div>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
                
                <el-empty
                  v-if="filteredAssignedUsers.length === 0"
                  :description="assignedSearchKeyword ? $t('user.noSearchResults') : $t('role.noAssignedUsers')"
                  :image-size="80"
                />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="handleSave"
          :loading="saving"
        >
          {{ $t('common.save') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  UserFilled, 
  User, 
  Search, 
  Right, 
  Left 
} from '@element-plus/icons-vue'

import { useRoleStore } from '@/store/modules/role'
import { useUserStore } from '@/store/modules/user'
import { roleApiService } from '@/api/services/role'
import type { Role, User as UserType } from '@/types'

// Props
interface Props {
  modelValue: boolean
  roleId: number | null
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
const roleStore = useRoleStore()
const userStore = useUserStore()

// Reactive data
const loading = ref(false)
const saving = ref(false)
const roleInfo = ref<Role | null>(null)
const availableUsers = ref<UserType[]>([])
const assignedUsers = ref<UserType[]>([])
const selectedAvailableUsers = ref<number[]>([])
const selectedAssignedUsers = ref<number[]>([])
const availableSearchKeyword = ref('')
const assignedSearchKeyword = ref('')

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const filteredAvailableUsers = computed(() => {
  if (!availableSearchKeyword.value) {
    return availableUsers.value
  }
  
  const keyword = availableSearchKeyword.value.toLowerCase()
  return availableUsers.value.filter(user => 
    user.username.toLowerCase().includes(keyword) ||
    (user.realName && user.realName.toLowerCase().includes(keyword)) ||
    (user.email && user.email.toLowerCase().includes(keyword))
  )
})

const filteredAssignedUsers = computed(() => {
  if (!assignedSearchKeyword.value) {
    return assignedUsers.value
  }
  
  const keyword = assignedSearchKeyword.value.toLowerCase()
  return assignedUsers.value.filter(user => 
    user.username.toLowerCase().includes(keyword) ||
    (user.realName && user.realName.toLowerCase().includes(keyword)) ||
    (user.email && user.email.toLowerCase().includes(keyword))
  )
})

// Methods
const loadData = async () => {
  if (!props.roleId) return

  loading.value = true
  try {
    // 加载角色信息
    roleInfo.value = await roleStore.getRoleById(props.roleId)
    
    // 加载所有用户
    const allUsers = await userStore.getAllUsers()
    
    // 加载已分配的用户
    const assignedResult = await roleApiService.getRoleUsers(props.roleId, { size: 1000 })
    const assignedUserIds = assignedResult.records.map(user => user.id)
    
    // 分离可分配和已分配的用户
    assignedUsers.value = assignedResult.records
    availableUsers.value = allUsers.filter(user => !assignedUserIds.includes(user.id))
    
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleAvailableSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleAssignedSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleAssign = () => {
  if (selectedAvailableUsers.value.length === 0) return
  
  // 移动选中的用户到已分配列表
  const usersToMove = availableUsers.value.filter(user => 
    selectedAvailableUsers.value.includes(user.id)
  )
  
  assignedUsers.value.push(...usersToMove)
  availableUsers.value = availableUsers.value.filter(user => 
    !selectedAvailableUsers.value.includes(user.id)
  )
  
  selectedAvailableUsers.value = []
}

const handleUnassign = () => {
  if (selectedAssignedUsers.value.length === 0) return
  
  // 移动选中的用户到可分配列表
  const usersToMove = assignedUsers.value.filter(user => 
    selectedAssignedUsers.value.includes(user.id)
  )
  
  availableUsers.value.push(...usersToMove)
  assignedUsers.value = assignedUsers.value.filter(user => 
    !selectedAssignedUsers.value.includes(user.id)
  )
  
  selectedAssignedUsers.value = []
}

const handleAssignAll = () => {
  if (filteredAvailableUsers.value.length === 0) return
  
  assignedUsers.value.push(...filteredAvailableUsers.value)
  availableUsers.value = availableUsers.value.filter(user => 
    !filteredAvailableUsers.value.some(filtered => filtered.id === user.id)
  )
  
  selectedAvailableUsers.value = []
}

const handleUnassignAll = () => {
  if (filteredAssignedUsers.value.length === 0) return
  
  availableUsers.value.push(...filteredAssignedUsers.value)
  assignedUsers.value = assignedUsers.value.filter(user => 
    !filteredAssignedUsers.value.some(filtered => filtered.id === user.id)
  )
  
  selectedAssignedUsers.value = []
}

const handleSave = async () => {
  if (!props.roleId) return

  try {
    await ElMessageBox.confirm(
      t('role.saveAssignmentConfirm'),
      t('common.confirm'),
      {
        type: 'warning'
      }
    )

    saving.value = true

    // 获取当前已分配的用户ID列表
    const currentAssignedUserIds = assignedUsers.value.map(user => user.id)
    
    // 执行角色分配
    await roleApiService.assignRolesToUsers({
      userIds: currentAssignedUserIds,
      roleIds: [props.roleId],
      operation: 'assign'
    })

    ElMessage.success(t('role.assignmentSaved'))
    emit('success')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存分配失败:', error)
      ElMessage.error('保存分配失败')
    }
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  resetData()
  dialogVisible.value = false
}

const resetData = () => {
  roleInfo.value = null
  availableUsers.value = []
  assignedUsers.value = []
  selectedAvailableUsers.value = []
  selectedAssignedUsers.value = []
  availableSearchKeyword.value = ''
  assignedSearchKeyword.value = ''
}

// Watch
watch(
  () => props.modelValue,
  (visible) => {
    if (visible && props.roleId) {
      loadData()
    } else {
      resetData()
    }
  }
)

watch(
  () => props.roleId,
  (newRoleId) => {
    if (newRoleId && props.modelValue) {
      loadData()
    }
  }
)
</script>

<style scoped lang="scss">
.assign-content {
  .role-info-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-icon {
        color: var(--el-color-primary);
      }
    }
    
    .role-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .role-description {
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }
  }
  
  .assign-section {
    .user-list-card {
      height: 500px;
      
      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .el-icon {
          color: var(--el-color-primary);
        }
        
        .user-count {
          margin-left: auto;
        }
      }
      
      .search-section {
        margin-bottom: 16px;
      }
      
      .user-list {
        height: 380px;
        overflow-y: auto;
        
        .user-item {
          margin-bottom: 8px;
          padding: 8px;
          border: 1px solid var(--el-border-color-lighter);
          border-radius: 6px;
          transition: all 0.2s;
          
          &:hover {
            border-color: var(--el-color-primary-light-7);
            background-color: var(--el-color-primary-light-9);
          }
          
          .user-checkbox {
            width: 100%;
            
            :deep(.el-checkbox__label) {
              width: 100%;
            }
          }
          
          .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            
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
            
            .user-status {
              flex-shrink: 0;
            }
          }
        }
      }
    }
    
    .action-buttons {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 500px;
      gap: 12px;
      
      .action-btn {
        width: 80px;
        height: 40px;
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
@media (max-width: 1200px) {
  .assign-content {
    .assign-section {
      .user-list-card {
        height: 400px;
        
        .user-list {
          height: 280px;
        }
      }
      
      .action-buttons {
        height: 400px;
        
        .action-btn {
          width: 60px;
          height: 32px;
          font-size: 12px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .assign-content {
    .assign-section {
      .el-row {
        flex-direction: column;
      }
      
      .action-buttons {
        flex-direction: row;
        height: auto;
        padding: 12px 0;
        
        .action-btn {
          width: auto;
          height: 32px;
        }
      }
    }
  }
}
</style>