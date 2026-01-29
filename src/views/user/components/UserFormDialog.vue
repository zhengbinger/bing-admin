<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="800px"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="loading"
    >
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本信息 -->
        <el-tab-pane :label="$t('user.basicInfo')" name="basic">
          <div class="form-section">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item :label="$t('user.username')" prop="username">
                  <el-input
                    v-model="formData.username"
                    :placeholder="$t('user.usernamePlaceholder')"
                    :disabled="mode === 'edit'"
                    clearable
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item :label="$t('user.nickname')" prop="nickname">
                  <el-input
                    v-model="formData.nickname"
                    :placeholder="$t('user.nicknamePlaceholder')"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item :label="$t('user.email')" prop="email">
                  <el-input
                    v-model="formData.email"
                    :placeholder="$t('user.emailPlaceholder')"
                    type="email"
                    clearable
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item :label="$t('user.phone')" prop="phone">
                  <el-input
                    v-model="formData.phone"
                    :placeholder="$t('user.phonePlaceholder')"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20" v-if="mode === 'create'">
              <el-col :span="12">
                <el-form-item :label="$t('user.password')" prop="password">
                  <el-input
                    v-model="formData.password"
                    :placeholder="$t('user.passwordPlaceholder')"
                    type="password"
                    show-password
                    clearable
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item :label="$t('user.confirmPassword')" prop="confirmPassword">
                  <el-input
                    v-model="formData.confirmPassword"
                    :placeholder="$t('user.confirmPasswordPlaceholder')"
                    type="password"
                    show-password
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item :label="$t('user.status')" prop="status">
                  <el-radio-group v-model="formData.status">
                    <el-radio :label="1">{{ $t('user.statusActive') }}</el-radio>
                    <el-radio :label="0">{{ $t('user.statusInactive') }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 角色分配 -->
        <el-tab-pane :label="$t('user.roleAssignment')" name="roles">
          <div class="form-section">
            <el-form-item :label="$t('user.roles')" prop="roleIds">
              <div class="role-selection">
                <div class="selection-header">
                  <el-input
                    v-model="roleSearchKeyword"
                    :placeholder="$t('user.searchRoles')"
                    clearable
                    class="search-input"
                  />
                  <div class="selection-actions">
                    <el-button size="small" @click="selectAllRoles">
                      {{ $t('common.selectAll') }}
                    </el-button>
                    <el-button size="small" @click="clearAllRoles">
                      {{ $t('common.clearAll') }}
                    </el-button>
                  </div>
                </div>
                
                <div class="role-list">
                  <el-checkbox-group v-model="formData.roleIds">
                    <div
                      v-for="role in filteredRoles"
                      :key="role.id"
                      class="role-item"
                    >
                      <el-checkbox :label="role.id" class="role-checkbox">
                        <div class="role-info">
                          <div class="role-name">{{ role.name }}</div>
                          <div class="role-description">{{ role.description }}</div>
                        </div>
                      </el-checkbox>
                    </div>
                  </el-checkbox-group>
                </div>
              </div>
            </el-form-item>
          </div>
        </el-tab-pane>

        <!-- 组织分配 -->
        <el-tab-pane :label="$t('user.organizationAssignment')" name="organizations">
          <div class="form-section">
            <el-form-item :label="$t('user.organizations')" prop="organizationIds">
              <div class="organization-selection">
                <div class="selection-header">
                  <el-input
                    v-model="orgSearchKeyword"
                    :placeholder="$t('user.searchOrganizations')"
                    clearable
                    class="search-input"
                  />
                </div>
                
                <div class="organization-tree">
                  <el-tree
                    ref="orgTreeRef"
                    :data="organizationTree"
                    :props="treeProps"
                    node-key="id"
                    show-checkbox
                    :default-expand-all="false"
                    :check-strictly="false"
                    :filter-node-method="filterOrgNode"
                    @check="handleOrgCheck"
                  >
                    <template #default="{ node, data }">
                      <div class="org-node">
                        <span class="org-name">{{ data.name }}</span>
                        <span class="org-description">{{ data.description }}</span>
                      </div>
                    </template>
                  </el-tree>
                </div>
              </div>
            </el-form-item>
          </div>
        </el-tab-pane>

        <!-- 登录渠道 -->
        <el-tab-pane :label="$t('user.loginChannels')" name="channels">
          <div class="form-section">
            <el-form-item :label="$t('user.availableChannels')" prop="channels">
              <el-checkbox-group v-model="formData.channels">
                <div class="channel-list">
                  <div
                    v-for="channel in availableChannels"
                    :key="channel.code"
                    class="channel-item"
                  >
                    <el-checkbox :label="channel.code" class="channel-checkbox">
                      <div class="channel-info">
                        <div class="channel-name">{{ channel.name }}</div>
                        <div class="channel-description">{{ channel.description }}</div>
                      </div>
                    </el-checkbox>
                  </div>
                </div>
              </el-checkbox-group>
            </el-form-item>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ $t('common.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElTree, type FormInstance, type FormRules } from 'element-plus'

import { useUserStore } from '@/store/modules/user'
import { userApiService } from '@/api/services/user'
import type { User, Role, Organization } from '@/types'
import type { CreateUserRequest, UpdateUserRequest } from '@/api/services/user'

// Props
interface Props {
  modelValue: boolean
  userId: number | null
  mode: 'create' | 'edit'
}

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 组合式API
const { t } = useI18n()
const userStore = useUserStore()

// 响应式数据
const formRef = ref<FormInstance>()
const orgTreeRef = ref<InstanceType<typeof ElTree>>()
const loading = ref(false)
const submitting = ref(false)
const activeTab = ref('basic')

// 搜索关键词
const roleSearchKeyword = ref('')
const orgSearchKeyword = ref('')

// 选项数据
const roles = ref<Role[]>([])
const organizations = ref<Organization[]>([])
const organizationTree = ref<Organization[]>([])
const availableChannels = ref([
  { code: 'web', name: 'Web端', description: 'PC网页端登录' },
  { code: 'mobile', name: '移动端', description: '手机APP登录' },
  { code: 'wechat', name: '微信', description: '微信小程序登录' },
  { code: 'api', name: 'API', description: 'API接口调用' }
])

// 表单数据
const formData = reactive<CreateUserRequest & UpdateUserRequest & { confirmPassword?: string }>({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  status: 1,
  roleIds: [],
  organizationIds: [],
  channels: ['web']
})

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => {
  return props.mode === 'create' ? t('user.createUser') : t('user.editUser')
})

const filteredRoles = computed(() => {
  if (!roleSearchKeyword.value) return roles.value
  return roles.value.filter(role => 
    role.name.toLowerCase().includes(roleSearchKeyword.value.toLowerCase()) ||
    role.description.toLowerCase().includes(roleSearchKeyword.value.toLowerCase())
  )
})

// 表单验证规则
const formRules = computed<FormRules>(() => ({
  username: [
    { required: true, message: t('user.usernameRequired'), trigger: 'blur' },
    { min: 3, max: 20, message: t('user.usernameLengthError'), trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: t('user.usernameFormatError'), trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: t('user.nicknameRequired'), trigger: 'blur' },
    { min: 2, max: 20, message: t('user.nicknameLengthError'), trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: t('user.emailFormatError'), trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: t('user.phoneFormatError'), trigger: 'blur' }
  ],
  password: props.mode === 'create' ? [
    { required: true, message: t('user.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: t('user.passwordLengthError'), trigger: 'blur' }
  ] : [],
  confirmPassword: props.mode === 'create' ? [
    { required: true, message: t('user.confirmPasswordRequired'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error(t('user.passwordMismatch')))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ] : []
}))

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 方法
const loadFormData = async () => {
  loading.value = true
  try {
    // 加载角色和组织选项
    // TODO: 实现角色和组织API调用
    // roles.value = await roleApiService.getRoles()
    // organizations.value = await organizationApiService.getOrganizations()
    // organizationTree.value = buildOrganizationTree(organizations.value)

    // 如果是编辑模式，加载用户数据
    if (props.mode === 'edit' && props.userId) {
      const user = await userStore.getUserById(props.userId)
      Object.assign(formData, {
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roleIds: user.roles.map(role => role.id),
        organizationIds: user.organizations.map(org => org.id),
        channels: user.channels || ['web']
      })

      // 设置组织树选中状态
      await nextTick()
      if (orgTreeRef.value) {
        orgTreeRef.value.setCheckedKeys(formData.organizationIds || [])
      }
    }
  } catch (error) {
    console.error('加载表单数据失败:', error)
    ElMessage.error(t('user.loadFormDataError'))
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(formData, {
    username: '',
    nickname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    status: 1,
    roleIds: [],
    organizationIds: [],
    channels: ['web']
  })
  formRef.value?.resetFields()
  activeTab.value = 'basic'
}

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const submitData = { ...formData }
    delete submitData.confirmPassword

    if (props.mode === 'create') {
      await userStore.createUser(submitData)
      ElMessage.success(t('user.createSuccess'))
    } else if (props.userId) {
      await userStore.updateUser(props.userId, submitData)
      ElMessage.success(t('user.updateSuccess'))
    }

    emit('success')
  } catch (error) {
    console.error('提交表单失败:', error)
  } finally {
    submitting.value = false
  }
}

const selectAllRoles = () => {
  formData.roleIds = filteredRoles.value.map(role => role.id)
}

const clearAllRoles = () => {
  formData.roleIds = []
}

const handleOrgCheck = (data: Organization, checked: { checkedKeys: number[] }) => {
  formData.organizationIds = checked.checkedKeys
}

const filterOrgNode = (value: string, data: Organization) => {
  if (!value) return true
  return data.name.toLowerCase().includes(value.toLowerCase()) ||
         data.description.toLowerCase().includes(value.toLowerCase())
}

// 监听对话框显示状态
watch(
  () => visible.value,
  (newVisible) => {
    if (newVisible) {
      loadFormData()
    }
  }
)

// 监听组织搜索关键词
watch(
  () => orgSearchKeyword.value,
  (keyword) => {
    if (orgTreeRef.value) {
      orgTreeRef.value.filter(keyword)
    }
  }
)
</script>

<style scoped lang="scss">
.form-section {
  padding: 20px 0;
}

.role-selection,
.organization-selection {
  .selection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 16px;
    
    .search-input {
      flex: 1;
      max-width: 300px;
    }
    
    .selection-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .role-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    padding: 12px;
    
    .role-item {
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .role-checkbox {
        width: 100%;
        
        .role-info {
          margin-left: 8px;
          
          .role-name {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
          
          .role-description {
            font-size: 12px;
            color: var(--el-text-color-regular);
            margin-top: 2px;
          }
        }
      }
    }
  }
  
  .organization-tree {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    padding: 12px;
    
    .org-node {
      display: flex;
      flex-direction: column;
      
      .org-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
      
      .org-description {
        font-size: 12px;
        color: var(--el-text-color-regular);
        margin-top: 2px;
      }
    }
  }
}

.channel-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  
  .channel-item {
    .channel-checkbox {
      width: 100%;
      
      .channel-info {
        margin-left: 8px;
        
        .channel-name {
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
        
        .channel-description {
          font-size: 12px;
          color: var(--el-text-color-regular);
          margin-top: 2px;
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
  .role-selection,
  .organization-selection {
    .selection-header {
      flex-direction: column;
      align-items: stretch;
      
      .search-input {
        max-width: none;
      }
    }
  }
  
  .channel-list {
    grid-template-columns: 1fr;
  }
}
</style>