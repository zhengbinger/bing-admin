<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('role.duplicate')"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="duplicate-content">
      <!-- 源角色信息 -->
      <el-card class="source-role-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><CopyDocument /></el-icon>
            <span>{{ $t('role.sourceRole') }}</span>
          </div>
        </template>
        
        <div v-if="sourceRole" class="source-role-info">
          <el-descriptions :column="1" size="small">
            <el-descriptions-item :label="$t('role.name')">
              <div class="role-name-display">
                <el-icon class="role-icon">
                  <UserFilled />
                </el-icon>
                {{ sourceRole.name }}
              </div>
            </el-descriptions-item>
            
            <el-descriptions-item :label="$t('role.code')">
              <el-tag type="info" size="small">
                {{ sourceRole.code }}
              </el-tag>
            </el-descriptions-item>
            
            <el-descriptions-item :label="$t('role.description')">
              {{ sourceRole.description || $t('common.none') }}
            </el-descriptions-item>
            
            <el-descriptions-item :label="$t('role.permissions')">
              <el-tag size="small" type="primary">
                {{ sourceRole.permissions?.length || 0 }} {{ $t('role.permissionCount') }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <!-- 新角色配置 -->
      <el-card class="new-role-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Plus /></el-icon>
            <span>{{ $t('role.newRole') }}</span>
          </div>
        </template>
        
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
        >
          <el-form-item :label="$t('role.name')" prop="name">
            <el-input
              v-model="formData.name"
              :placeholder="$t('role.duplicateNamePlaceholder')"
              clearable
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item :label="$t('role.code')" prop="code">
            <el-input
              v-model="formData.code"
              :placeholder="$t('role.duplicateCodePlaceholder')"
              clearable
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item :label="$t('role.description')" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :placeholder="$t('role.duplicateDescriptionPlaceholder')"
              :rows="3"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item :label="$t('role.status')" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :label="1">{{ $t('role.statusActive') }}</el-radio>
              <el-radio :label="0">{{ $t('role.statusInactive') }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 复制选项 -->
      <el-card class="options-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Setting /></el-icon>
            <span>{{ $t('role.duplicateOptions') }}</span>
          </div>
        </template>
        
        <div class="duplicate-options">
          <el-checkbox v-model="copyOptions.permissions" :disabled="true">
            {{ $t('role.copyPermissions') }}
            <el-tooltip :content="$t('role.copyPermissionsTooltip')" placement="top">
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </el-tooltip>
          </el-checkbox>
          
          <el-checkbox v-model="copyOptions.users">
            {{ $t('role.copyUsers') }}
            <el-tooltip :content="$t('role.copyUsersTooltip')" placement="top">
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </el-tooltip>
          </el-checkbox>
          
          <el-checkbox v-model="copyOptions.settings">
            {{ $t('role.copySettings') }}
            <el-tooltip :content="$t('role.copySettingsTooltip')" placement="top">
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </el-tooltip>
          </el-checkbox>
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
          :icon="CopyDocument"
        >
          {{ $t('role.confirmDuplicate') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElForm, ElMessage } from 'element-plus'
import { 
  CopyDocument, 
  UserFilled, 
  Plus, 
  Setting, 
  InfoFilled 
} from '@element-plus/icons-vue'

import { useRoleStore } from '@/store/modules/role'
import { roleApiService } from '@/api/services/role'
import type { Role } from '@/types'

// Props
interface Props {
  modelValue: boolean
  sourceRole: Role | null
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

// Refs
const formRef = ref<InstanceType<typeof ElForm>>()

// Reactive data
const loading = ref(false)
const submitting = ref(false)

const formData = reactive({
  name: '',
  code: '',
  description: '',
  status: 1
})

const copyOptions = reactive({
  permissions: true, // 权限默认复制且不可取消
  users: false,      // 用户默认不复制
  settings: true     // 设置默认复制
})

// Form validation rules
const formRules = {
  name: [
    { required: true, message: t('role.nameRequired'), trigger: 'blur' },
    { min: 2, max: 50, message: t('role.nameLength'), trigger: 'blur' },
    { validator: validateRoleName, trigger: 'blur' }
  ],
  code: [
    { required: true, message: t('role.codeRequired'), trigger: 'blur' },
    { min: 2, max: 50, message: t('role.codeLength'), trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: t('role.codeFormat'), trigger: 'blur' },
    { validator: validateRoleCode, trigger: 'blur' }
  ],
  status: [
    { required: true, message: t('role.statusRequired'), trigger: 'change' }
  ]
}

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Validation functions
async function validateRoleName(rule: any, value: string, callback: any) {
  if (!value) {
    callback()
    return
  }
  
  try {
    const available = await roleApiService.checkRoleNameAvailable(value)
    if (!available) {
      callback(new Error(t('role.nameExists')))
    } else {
      callback()
    }
  } catch (error) {
    callback()
  }
}

async function validateRoleCode(rule: any, value: string, callback: any) {
  if (!value) {
    callback()
    return
  }
  
  try {
    const available = await roleApiService.checkRoleCodeAvailable(value)
    if (!available) {
      callback(new Error(t('role.codeExists')))
    } else {
      callback()
    }
  } catch (error) {
    callback()
  }
}

// Methods
const initializeForm = () => {
  if (!props.sourceRole) return

  // 生成默认的新角色名称和代码
  const timestamp = Date.now().toString().slice(-6)
  formData.name = `${props.sourceRole.name}_copy_${timestamp}`
  formData.code = `${props.sourceRole.code}_copy_${timestamp}`
  formData.description = props.sourceRole.description ? 
    `${props.sourceRole.description} (${t('role.duplicatedFrom')} ${props.sourceRole.name})` : 
    `${t('role.duplicatedFrom')} ${props.sourceRole.name}`
  formData.status = props.sourceRole.status
}

const handleSubmit = async () => {
  if (!formRef.value || !props.sourceRole) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitting.value = true

    // 执行角色复制
    await roleStore.duplicateRole(props.sourceRole.id, formData.name)
    
    ElMessage.success(t('role.duplicateSuccess'))
    emit('success')
  } catch (error) {
    console.error('复制角色失败:', error)
    ElMessage.error(t('role.duplicateFailed'))
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  resetForm()
  dialogVisible.value = false
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  formData.name = ''
  formData.code = ''
  formData.description = ''
  formData.status = 1
  
  copyOptions.permissions = true
  copyOptions.users = false
  copyOptions.settings = true
}

// Watch
watch(
  () => props.modelValue,
  (visible) => {
    if (visible && props.sourceRole) {
      initializeForm()
    } else {
      resetForm()
    }
  }
)

watch(
  () => props.sourceRole,
  (newSourceRole) => {
    if (newSourceRole && props.modelValue) {
      initializeForm()
    }
  }
)
</script>

<style scoped lang="scss">
.duplicate-content {
  .source-role-card,
  .new-role-card,
  .options-card {
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
    }
  }
  
  .source-role-info {
    .role-name-display {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .role-icon {
        color: var(--el-color-primary);
      }
    }
  }
  
  .duplicate-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .el-checkbox {
      display: flex;
      align-items: center;
      
      .info-icon {
        margin-left: 8px;
        color: var(--el-color-info);
        cursor: help;
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
  .duplicate-content {
    .duplicate-options {
      gap: 8px;
    }
  }
}
</style>