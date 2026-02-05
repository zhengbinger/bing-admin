<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="$t('organization.name')" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      
      <el-form-item :label="$t('organization.code')" prop="code">
        <el-input v-model="form.code" />
      </el-form-item>
      
      <el-form-item :label="$t('organization.parent')" prop="parentId">
        <el-tree-select
          v-model="form.parentId"
          :data="organizationTree"
          :props="{ label: 'name', value: 'id' }"
          :placeholder="$t('organization.selectParent')"
          clearable
        />
      </el-form-item>
      
      <el-form-item :label="$t('organization.sort')" prop="sort">
        <el-input-number v-model="form.sort" :min="0" />
      </el-form-item>
      
      <el-form-item :label="$t('organization.status')" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">{{ $t('common.active') }}</el-radio>
          <el-radio :label="0">{{ $t('common.inactive') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item :label="$t('organization.description')" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ $t('common.confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { organizationApiService, type Organization } from '@/api/services/organization'

const props = defineProps<{
  modelValue: boolean
  organization?: Organization | null
  parentId?: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const { t } = useI18n()
const formRef = ref()
const submitting = ref(false)
const organizationTree = ref<Organization[]>([])

const form = reactive({
  name: '',
  code: '',
  parentId: null as number | null,
  sort: 0,
  status: 1,
  description: ''
})

const rules = {
  name: [{ required: true, message: t('organization.nameRequired'), trigger: 'blur' }],
  code: [{ required: true, message: t('organization.codeRequired'), trigger: 'blur' }]
}

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => 
  props.organization ? t('organization.edit') : t('organization.create')
)

const loadOrganizationTree = async () => {
  try {
    organizationTree.value = await organizationApiService.getOrganizationTree()
  } catch (error) {
    console.error('加载组织树失败:', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    if (props.organization) {
      await organizationApiService.updateOrganization(props.organization.id, form)
    } else {
      await organizationApiService.createOrganization(form)
    }
    
    ElMessage.success(props.organization ? '更新成功' : '创建成功')
    emit('success')
  } catch (error) {
    ElMessage.error(props.organization ? '更新失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

watch(() => props.modelValue, (visible) => {
  if (visible) {
    loadOrganizationTree()
    if (props.organization) {
      Object.assign(form, props.organization)
    } else {
      form.parentId = props.parentId
    }
  }
})
</script>