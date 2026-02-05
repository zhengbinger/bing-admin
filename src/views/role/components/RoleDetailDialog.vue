<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('role.detail')"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="role-detail-content">
      <template v-if="roleDetail">
        <!-- 基本信息 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><InfoFilled /></el-icon>
              <span>{{ $t('role.basicInfo') }}</span>
            </div>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('role.id')">
              {{ roleDetail.id }}
            </el-descriptions-item>
            
            <el-descriptions-item :label="$t('role.name')">
              <div class="role-name-display">
                <el-icon class="role-icon">
                  <UserFilled />
                </el-icon>
                {{ roleDetail.name }}
              </div>
            </el-descriptions-item>
            
            <el-descriptions-item :label="$t('role.code')">
              <el-tag type="info" size="small">
                {{ roleDetail.code }}
              </el-tag>
            </el-descriptions-item>
            
            <el-descriptions-item :label="$t('role.status')">
              <el-tag 
                :type="roleDetail.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ roleDetail.status === 1 ? $t('role.statusActive') : $t('role.statusInactive') }}
              </el-tag>
            </el-descriptions-item>
            
            <el-descriptions-item :label="$t('role.description')" :span="2">
              {{ roleDetail.description || $t('common.none') }}
            </el-descriptions-item>
            
            <el-descriptions-item :label="$t('role.createTime')">
              {{ formatDate(roleDetail.createTime) }}
            </el-descriptions-item>
            
            <el-descriptions-item :label="$t('role.updateTime')">
              {{ formatDate(roleDetail.updateTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 权限信息 -->
        <el-card class="permissions-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Key /></el-icon>
              <span>{{ $t('role.permissions') }}</span>
              <el-tag size="small" class="permission-count">
                {{ roleDetail.permissions?.length || 0 }} {{ $t('role.permissionCount') }}
              </el-tag>
            </div>
          </template>
          
          <div v-if="roleDetail.permissions && roleDetail.permissions.length > 0" class="permissions-content">
            <PermissionTree
              :permissions="roleDetail.permissions"
              :default-expand-all="false"
              :show-checkbox="false"
              :readonly="true"
              :show-actions="false"
            />
          </div>
          
          <el-empty
            v-else
            :description="$t('role.noPermissions')"
            :image-size="100"
          />
        </el-card>

        <!-- 关联用户 -->
        <el-card class="users-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><User /></el-icon>
              <span>{{ $t('role.associatedUsers') }}</span>
              <el-tag size="small" class="user-count">
                {{ userTotal }} {{ $t('role.userCount') }}
              </el-tag>
              <div class="header-actions">
                <el-button
                  size="small"
                  @click="refreshUsers"
                  :icon="Refresh"
                >
                  {{ $t('common.refresh') }}
                </el-button>
              </div>
            </div>
          </template>
          
          <div v-if="users.length > 0" class="users-content">
            <el-table
              :data="users"
              v-loading="usersLoading"
              stripe
              size="small"
            >
              <el-table-column prop="id" :label="$t('user.id')" width="80" />
              
              <el-table-column :label="$t('user.info')" min-width="200">
                <template #default="{ row }">
                  <div class="user-info">
                    <el-avatar :size="32" :src="row.avatar">
                      {{ row.username.charAt(0).toUpperCase() }}
                    </el-avatar>
                    <div class="user-details">
                      <div class="username">{{ row.username }}</div>
                      <div class="realname">{{ row.realName || '-' }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column prop="email" :label="$t('user.email')" min-width="180" />
              
              <el-table-column prop="status" :label="$t('user.status')" width="100" align="center">
                <template #default="{ row }">
                  <el-tag 
                    :type="row.status === 1 ? 'success' : 'danger'"
                    size="small"
                  >
                    {{ row.status === 1 ? $t('user.statusActive') : $t('user.statusInactive') }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column prop="createTime" :label="$t('user.createTime')" width="160">
                <template #default="{ row }">
                  {{ formatDate(row.createTime) }}
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 用户分页 -->
            <div class="users-pagination">
              <el-pagination
                v-model:current-page="userCurrentPage"
                v-model:page-size="userPageSize"
                :total="userTotal"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                @size-change="handleUserSizeChange"
                @current-change="handleUserCurrentChange"
                small
              />
            </div>
          </div>
          
          <el-empty
            v-else
            :description="$t('role.noUsers')"
            :image-size="100"
          />
        </el-card>
      </template>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          {{ $t('common.close') }}
        </el-button>
        <el-button
          type="primary"
          @click="handleEdit"
          v-if="hasPermission('role:update')"
        >
          {{ $t('common.edit') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { InfoFilled, UserFilled, Key, User, Refresh } from '@element-plus/icons-vue'

import { useRoleStore } from '@/store/modules/role'
import { usePermission } from '@/composables/usePermission'
import { formatDate } from '@/utils/date'
import { roleApiService } from '@/api/services/role'
import type { RoleDetail } from '@/api/services/role'
import type { User as UserType, PageResult } from '@/types'

import PermissionTree from '@/components/role/PermissionTree.vue'

// Props
interface Props {
  modelValue: boolean
  roleId: number | null
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'refresh'): void
  (e: 'edit', roleId: number): void
}

const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()
const roleStore = useRoleStore()
const { hasPermission } = usePermission()

// Reactive data
const loading = ref(false)
const roleDetail = ref<RoleDetail | null>(null)
const users = ref<UserType[]>([])
const usersLoading = ref(false)
const userTotal = ref(0)
const userCurrentPage = ref(1)
const userPageSize = ref(10)

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const loadRoleDetail = async () => {
  if (!props.roleId) return

  loading.value = true
  try {
    roleDetail.value = await roleStore.getRoleById(props.roleId)
    await loadRoleUsers()
  } catch (error) {
    console.error('加载角色详情失败:', error)
    ElMessage.error('加载角色详情失败')
  } finally {
    loading.value = false
  }
}

const loadRoleUsers = async () => {
  if (!props.roleId) return

  usersLoading.value = true
  try {
    const result: PageResult<UserType> = await roleApiService.getRoleUsers(props.roleId, {
      page: userCurrentPage.value,
      size: userPageSize.value
    })
    
    users.value = result.records
    userTotal.value = result.total
  } catch (error) {
    console.error('加载角色用户失败:', error)
    users.value = []
    userTotal.value = 0
  } finally {
    usersLoading.value = false
  }
}

const refreshUsers = async () => {
  await loadRoleUsers()
}

const handleUserSizeChange = async (size: number) => {
  userPageSize.value = size
  userCurrentPage.value = 1
  await loadRoleUsers()
}

const handleUserCurrentChange = async (page: number) => {
  userCurrentPage.value = page
  await loadRoleUsers()
}

const handleClose = () => {
  dialogVisible.value = false
  roleDetail.value = null
  users.value = []
  userTotal.value = 0
  userCurrentPage.value = 1
  userPageSize.value = 10
}

const handleEdit = () => {
  if (props.roleId) {
    emit('edit', props.roleId)
    handleClose()
  }
}

// Watch
watch(
  () => props.roleId,
  (newRoleId) => {
    if (newRoleId && props.modelValue) {
      loadRoleDetail()
    }
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  (visible) => {
    if (visible && props.roleId) {
      loadRoleDetail()
    }
  }
)
</script>

<style scoped lang="scss">
.role-detail-content {
  .info-card,
  .permissions-card,
  .users-card {
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
      
      .permission-count,
      .user-count {
        margin-left: auto;
      }
      
      .header-actions {
        margin-left: auto;
      }
    }
  }
  
  .role-name-display {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .role-icon {
      color: var(--el-color-primary);
    }
  }
  
  .permissions-content {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .users-content {
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
      }
    }
    
    .users-pagination {
      display: flex;
      justify-content: center;
      margin-top: 16px;
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
  .role-detail-content {
    .users-content {
      .users-pagination {
        :deep(.el-pagination) {
          .el-pagination__sizes,
          .el-pagination__jump {
            display: none;
          }
        }
      }
    }
  }
}
</style>