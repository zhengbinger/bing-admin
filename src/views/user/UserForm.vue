<template>
  <div class="user-form-page">
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
          <h2>{{ pageTitle }}</h2>
          <p class="page-description">{{ pageDescription }}</p>
        </div>
      </div>
      <div class="header-right">
        <el-button @click="handleReset" v-if="mode === 'create'">
          {{ $t('common.reset') }}
        </el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="submitting"
        >
          {{ $t('common.save') }}
        </el-button>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        v-loading="loading"
      >
        <el-row :gutter="20">
          <el-col :span="16">
            <!-- 基本信息卡片 -->
            <el-card class="form-card">
              <template #header>
                <span>{{ $t('user.basicInfo') }}</span>
              </template>
              
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
            </el-card>

            <!-- 角色分配卡片 -->
            <el-card class="form-card">
              <template #header>
                <div class="card-header">
                  <span>{{ $t('user.roleAssignment') }}</span>
                  <div class="header-actions">
                    <el-input
                      v-model="roleSearchKeyword"
                      :placeholder="$t('user.searchRoles')"
                      clearable
                      size="small"
                      style="width: 200px;"
                    />
                    <el-button size="small" @click="selectAllRoles">
                      {{ $t('common.selectAll') }}
                    </el-button>
                    <el-button size="small" @click="clearAllRoles">
                      {{ $t('common.clearAll') }}
                    </el-button>
                  </div>
                </div>
              </template>
              
              <el-form-item prop="roleIds">
                <div class="role-selection">
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
              </el-form-item>
            </el-card>

            <!-- 组织分配卡片 -->
            <el-card class="form-card">
              <template #header>
                <div class="card-header">
                  <span>{{ $t('user.organizationAssignment') }}</span>
                  <el-input
                    v-model="orgSearchKeyword"
                    :placeholder="$t('user.searchOrganizations')"
                    clearable
                    size="small"
                    style="width: 200px;"
                  />
                </div>
              </template>
              
              <el-form-item prop="organizationIds">
                <div class="organization-selection">
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
              </el-form-item>
            </el-card>
          </el-col>

          <el-col :span="8">
            <!-- 登录渠道卡片 -->
            <el-card class="form-card">
              <template #header>
                <span>{{ $t('user.loginChannels') }}</span>
              </template>
              
              <el-form-item prop="channels">
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
            </el-card>

            <!-- 操作提示卡片 -->
            <el-card class="form-card">
              <template #header>
                <span>{{ $t('common.tips') }}</span>
              </template>
              
              <div class="tips-content">
                <el-alert
                  :title="$t('user.formTips')"
                  type="info"
                  :closable="false"
                  show-icon
                >
                  <ul class="tips-list">
                    <li>{{ $t('user.tip1') }}</li>
                    <li>{{ $t('user.tip2') }}</li>
                    <li>{{ $t('user.tip3') }}</li>
                    <li v-if="mode === 'create'">{{ $t('user.tip4') }}</li>
                  </ul>
                </el-alert>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElTree, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

import { useUserStore } from '@/store/modules/user'
import type { User, Role, Organization } from '@/types'
import type { CreateUserRequest, UpdateUserRequest } from '@/api/services/user'

// 组合式API
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

// 响应式数据
const formRef = ref<FormInstance>()
const orgTreeRef = ref<InstanceType<typeof ElTree>>()
const loading = ref(false)
const submitting = ref(false)

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
const mode = computed(() => {
  return route.name === 'userCreate' ? 'create' : 'edit'
})

const userId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id) : null
})

const pageTitle = computed(() => {
  return mode.value === 'create' ? t('user.createUser') : t('user.editUser')
})

const pageDescription = computed(() => {
  return mode.value === 'create' 
    ? t('user.createUserDescription') 
    : t('user.editUserDescription')
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
  password: mode.value === 'create' ? [
    { required: true, message: t('user.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: t('user.passwordLengthError'), trigger: 'blur' }
  ] : [],
  confirmPassword: mode.value === 'create' ? [
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
    if (mode.value === 'edit' && userId.value) {
      const user = await userStore.getUserById(userId.value)
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
}

const goBack = () => {
  router.back()
}

const handleReset = () => {
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const submitData = { ...formData }
    delete submitData.confirmPassword

    if (mode.value === 'create') {
      await userStore.createUser(submitData)
      ElMessage.success(t('user.createSuccess'))
      router.push('/system/user')
    } else if (userId.value) {
      await userStore.updateUser(userId.value, submitData)
      ElMessage.success(t('user.updateSuccess'))
      router.push(`/system/user/detail/${userId.value}`)
    }
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

// 生命周期
onMounted(() => {
  loadFormData()
})

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
.user-form-page {
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
  
  .form-content {
    .form-card {
      margin-bottom: 20px;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
      
      .role-selection {
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
      
      .organization-selection {
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
      
      .channel-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        
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
      
      .tips-content {
        .tips-list {
          margin: 8px 0 0 0;
          padding-left: 16px;
          
          li {
            margin-bottom: 4px;
            font-size: 13px;
            color: var(--el-text-color-regular);
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-form-page {
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
    
    .form-content {
      .form-card {
        .card-header {
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
          
          .header-actions {
            justify-content: flex-start;
          }
        }
      }
    }
  }
}
</style>