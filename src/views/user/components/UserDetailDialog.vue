<template>
  <el-dialog
    v-model="visible"
    :title="$t('user.userDetail')"
    width="800px"
    :before-close="handleClose"
  >
    <div v-loading="loading" class="user-detail-content">
      <template v-if="user">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3 class="section-title">{{ $t('user.basicInfo') }}</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-avatar">
                <el-avatar :size="80" :src="user.avatar">
                  {{ user.nickname?.charAt(0) || user.username?.charAt(0) }}
                </el-avatar>
              </div>
            </div>
            
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
              <label>{{ $t('user.status') }}:</label>
              <el-tag :type="user.status === 1 ? 'success' : 'danger'" size="small">
                {{ user.status === 1 ? $t('user.statusActive') : $t('user.statusInactive') }}
              </el-tag>
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
        </div>

        <!-- 角色信息 -->
        <div class="detail-section">
          <h3 class="section-title">{{ $t('user.roleInfo') }}</h3>
          <div class="tag-list">
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
              :image-size="60"
            />
          </div>
        </div>

        <!-- 组织信息 -->
        <div class="detail-section">
          <h3 class="section-title">{{ $t('user.organizationInfo') }}</h3>
          <div class="tag-list">
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
              :image-size="60"
            />
          </div>
        </div>

        <!-- 权限信息 -->
        <div class="detail-section" v-if="permissions.length > 0">
          <h3 class="section-title">{{ $t('user.permissions') }}</h3>
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
        </div>

        <!-- 登录渠道信息 -->
        <div class="detail-section" v-if="user.channels && user.channels.length > 0">
          <h3 class="section-title">{{ $t('user.loginChannels') }}</h3>
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
        </div>
      </template>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ $t('common.close') }}</el-button>
        <el-dropdown 
          @command="handleDropdownCommand"
          v-if="hasAnyPermission(['user:update', 'user:delete'])"
        >
          <el-button type="primary">
            {{ $t('common.actions') }}
            <el-icon class="el-icon--right">
              <ArrowDown />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                command="edit"
                v-if="hasPermission('user:update')"
              >
                {{ $t('common.edit') }}
              </el-dropdown-item>
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
                :command="user?.status === 1 ? 'disable' : 'enable'"
                v-if="hasPermission('user:update') && user"
              >
                {{ user.status === 1 ? $t('user.disable') : $t('user.enable') }}
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
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

import { useUserStore } from '@/store/modules/user'
import { usePermission } from '@/composables/usePermission'
import { formatDate } from '@/utils/date'
import { userApiService } from '@/api/services/user'
import type { User, Permission } from '@/types'

// Props
interface Props {
  modelValue: boolean
  userId: number | null
}

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'refresh'): void
  (e: 'edit', userId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 组合式API
const { t } = useI18n()
const userStore = useUserStore()
const { hasPermission, hasAnyPermission } = usePermission()

// 响应式数据
const loading = ref(false)
const user = ref<User | null>(null)
const permissions = ref<string[]>([])
const permissionTree = ref<Permission[]>([])

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 方法
const loadUserDetail = async () => {
  if (!props.userId) return

  loading.value = true
  try {
    // 获取用户详情
    user.value = await userStore.getUserById(props.userId)
    
    // 获取用户权限
    permissions.value = await userApiService.getUserPermissions(props.userId)
    
    // TODO: 构建权限树
    // permissionTree.value = buildPermissionTree(permissions.value)
  } catch (error) {
    console.error('加载用户详情失败:', error)
    ElMessage.error(t('user.loadDetailError'))
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  visible.value = false
  user.value = null
  permissions.value = []
  permissionTree.value = []
}

const handleEdit = () => {
  if (props.userId) {
    emit('edit', props.userId)
    handleClose()
  }
}

const handleDropdownCommand = async (command: string) => {
  if (!props.userId || !user.value) return

  switch (command) {
    case 'edit':
      handleEdit()
      break
    case 'resetPassword':
      await handleResetPassword()
      break
    case 'generatePassword':
      await handleGeneratePassword()
      break
    case 'enable':
      await handleToggleStatus(1)
      break
    case 'disable':
      await handleToggleStatus(0)
      break
    case 'delete':
      await handleDelete()
      break
  }
}

const handleResetPassword = async () => {
  if (!props.userId || !user.value) return

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
    
    await userApiService.resetPassword(props.userId, { 
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
  if (!props.userId || !user.value) return

  try {
    await ElMessageBox.confirm(
      t('user.generatePasswordConfirm'),
      t('user.generatePassword'),
      {
        type: 'warning'
      }
    )
    
    const result = await userApiService.generateRandomPassword(props.userId)
    
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

const handleToggleStatus = async (newStatus: number) => {
  if (!props.userId || !user.value) return

  const action = newStatus === 1 ? 'enable' : 'disable'

  try {
    await ElMessageBox.confirm(
      t(`user.${action}Confirm`, { username: user.value.username }),
      t('common.confirm'),
      {
        type: 'warning'
      }
    )
    
    await userApiService.updateUserStatus(props.userId, newStatus)
    user.value.status = newStatus
    
    ElMessage.success(t(`user.${action}Success`))
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新用户状态失败:', error)
      ElMessage.error(t('user.updateStatusError'))
    }
  }
}

const handleDelete = async () => {
  if (!props.userId || !user.value) return

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
    
    await userStore.deleteUser(props.userId)
    
    ElMessage.success(t('user.deleteSuccess'))
    handleClose()
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error(t('user.deleteError'))
    }
  }
}

// 监听用户ID变化
watch(
  () => props.userId,
  (newUserId) => {
    if (newUserId && visible.value) {
      loadUserDetail()
    }
  },
  { immediate: true }
)

// 监听对话框显示状态
watch(
  () => visible.value,
  (newVisible) => {
    if (newVisible && props.userId) {
      loadUserDetail()
    }
  }
)
</script>

<style scoped lang="scss">
.user-detail-content {
  min-height: 200px;
  
  .detail-section {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .section-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-light);
      padding-bottom: 8px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        
        &:has(.info-avatar) {
          grid-column: 1 / -1;
          justify-content: center;
          margin-bottom: 16px;
        }
        
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
    
    .tag-list {
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
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  .user-detail-content {
    .detail-section {
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