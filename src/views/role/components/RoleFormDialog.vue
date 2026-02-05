<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="900px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="loading"
    >
      <!-- 基本信息 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ $t('role.basicInfo') }}</span>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('role.name')" prop="name">
              <el-input
                v-model="formData.name"
                :placeholder="$t('role.namePlaceholder')"
                clearable
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item :label="$t('role.code')" prop="code">
              <el-input
                v-model="formData.code"
                :placeholder="$t('role.codePlaceholder')"
                clearable
                maxlength="50"
                show-word-limit
                :disabled="mode === 'edit'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item :label="$t('role.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">{{ $t('role.statusActive') }}</el-radio>
            <el-radio :label="0">{{ $t('role.statusInactive') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item :label="$t('role.description')" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :placeholder="$t('role.descriptionPlaceholder')"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-card>

      <!-- 权限配置 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <el-icon><Key /></el-icon>
            <span>{{ $t('role.permissionConfig') }}</span>
            <el-tag size="small" class="selected-count">
              {{ selectedPermissionCount }} {{ $t('role.permissionSelected') }}
            </el-tag>
          </div>
        </template>
        
        <div class="permission-section">
          <PermissionTree
            ref="permissionTreeRef"
            :permissions="allPermissions"
            :default-expand-all="false"
            :show-checkbox="true"
            :check-strictly="false"
            :default-checked-keys="formData.permissionIds"
            @check="handlePermissionCheck"
          />
        </div>
      </el-card>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
        >
          {{ $t('common.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElForm, ElMessage } from 'element-plus'
import { InfoFilled, Key } from '@element-plus/icons-vue'

import { useRoleStore } from '@/store/modules/role'
import { usePermissionStore } from '@/store/modules/permission'
import { roleApiService } from '@/api/services/role'
import type { CreateRoleRequest, UpdateRoleRequest } from '@/api/services/role'
import type { Permission } from '@/types'

import PermissionTree from '@/components/role/PermissionTree.vue'

// Props
interface Props {
  modelValue: boolean
  roleId?: number | null
  mode: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  roleId: null,
  mode: 'create'
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()
const roleStore = useRoleStore()
const permissionStore = usePermissionStore()

// Refs
const formRef = ref<InstanceType<typeof ElForm>>()
const permissionTreeRef = ref<InstanceType<typeof PermissionTree>>()

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const allPermissions = ref<Permission[]>([])

const formData = reactive<CreateRoleRequest & { id?: number }>({
  name: '',
  code: '',
  description: '',
  status: 1,
  permissionIds: []
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

const dialogTitle = computed(() => {
  return props.mode === 'create' ? t('role.create') : t('role.edit')
})

const selectedPermissionCount = computed(() => {
  return formData.permissionIds?.length || 0
})

// Validation functions
async function validateRoleName(rule: any, value: string, callback: any) {
  if (!value) {
    callback()
    return
  }
  
  try {
    const available = await roleApiService.checkRoleNameAvailable(value, formData.id)
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
    const available = await roleApiService.checkRoleCodeAvailable(value, formData.id)
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
const loadPermissions = async () => {
  try {
    allPermissions.value = await permissionStore.getAllPermissions()
  } catch (error) {
    console.error('加载权限列表失败:', error)
    ElMessage.error('加载权限列表失败')
  }
}

const loadRoleData = async () => {
  if (!props.roleId || props.mode !== 'edit') return

  loading.value = true
  try {
    const roleDetail = await roleStore.getRoleById(props.roleId)
    
    formData.id = roleDetail.id
    formData.name = roleDetail.name
    formData.code = roleDetail.code
    formData.description = roleDetail.description || ''
    formData.status = roleDetail.status
    formData.permissionIds = roleDetail.permissions?.map(p => p.id) || []
    
    // 设置权限树选中状态
    await nextTick()
    if (permissionTreeRef.value) {
      permissionTreeRef.value.setCheckedKeys(formData.permissionIds)
    }
  } catch (error) {
    console.error('加载角色数据失败:', error)
    ElMessage.error('加载角色数据失败')
  } finally {
    loading.value = false
  }
}

const handlePermissionCheck = (checkedKeys: (string | number)[]) => {
  formData.permissionIds = checkedKeys.map(key => Number(key))
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitting.value = true

    if (props.mode === 'create') {
      await roleStore.createRole(formData as CreateRoleRequest)
      ElMessage.success(t('role.createSuccess'))
    } else {
      await roleStore.updateRole(formData.id!, formData as UpdateRoleRequest)
      ElMessage.success(t('role.updateSuccess'))
    }

    emit('success')
  } catch (error) {
    console.error('保存角色失败:', error)
    ElMessage.error(props.mode === 'create' ? t('role.createFailed') : t('role.updateFailed'))
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
  
  formData.id = undefined
  formData.name = ''
  formData.code = ''
  formData.description = ''
  formData.status = 1
  formData.permissionIds = []
  
  if (permissionTreeRef.value) {
    permissionTreeRef.value.clearAll()
  }
}

// Watch
watch(
  () => props.modelValue,
  async (visible) => {
    if (visible) {
      await loadPermissions()
      if (props.mode === 'edit' && props.roleId) {
        await loadRoleData()
      }
    } else {
      resetForm()
    }
  }
)

watch(
  () => [props.roleId, props.mode],
  async () => {
    if (props.modelValue) {
      if (props.mode === 'edit' && props.roleId) {
        await loadRoleData()
      } else {
        resetForm()
      }
    }
  }
)
</script>

<style scoped lang="scss">
.form-section {
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .section-header {
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

.permission-section {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  .permission-section {
    max-height: 300px;
  }
}
</style>