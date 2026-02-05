<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('organization.deleteTitle')"
    width="600px"
    @close="handleClose"
  >
    <div v-loading="loading" class="delete-content">
      <el-alert
        :title="$t('organization.deleteWarning')"
        type="warning"
        :closable="false"
        show-icon
      />
      
      <div class="organization-info">
        <h4>{{ $t('organization.deleteTarget') }}</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item :label="$t('organization.name')">
            {{ organization?.name }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('organization.userCount')">
            {{ deletionInfo.userCount }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('organization.childCount')">
            {{ deletionInfo.childCount }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div v-if="deletionInfo.childCount > 0" class="child-handling">
        <h4>{{ $t('organization.childHandling') }}</h4>
        <el-radio-group v-model="childHandlingMode">
          <el-radio label="move">
            {{ $t('organization.moveToParent') }}
          </el-radio>
          <el-radio label="delete">
            {{ $t('organization.deleteWithChildren') }}
          </el-radio>
        </el-radio-group>
        
        <div v-if="childHandlingMode === 'move'" class="move-target">
          <el-form-item :label="$t('organization.moveTarget')">
            <el-tree-select
              v-model="moveTargetId"
              :data="availableParents"
              :props="{ label: 'name', value: 'id' }"
              :placeholder="$t('organization.selectMoveTarget')"
            />
          </el-form-item>
        </div>
      </div>

      <div v-if="deletionInfo.userCount > 0" class="user-handling">
        <h4>{{ $t('organization.userHandling') }}</h4>
        <el-radio-group v-model="userHandlingMode">
          <el-radio label="move">
            {{ $t('organization.moveUsersTo') }}
          </el-radio>
          <el-radio label="unassign">
            {{ $t('organization.unassignUsers') }}
          </el-radio>
        </el-radio-group>
        
        <div v-if="userHandlingMode === 'move'" class="user-move-target">
          <el-form-item :label="$t('organization.userMoveTarget')">
            <el-tree-select
              v-model="userMoveTargetId"
              :data="availableParents"
              :props="{ label: 'name', value: 'id' }"
              :placeholder="$t('organization.selectUserMoveTarget')"
            />
          </el-form-item>
        </div>
      </div>

      <div class="confirmation">
        <el-checkbox v-model="confirmed">
          {{ $t('organization.deleteConfirmation') }}
        </el-checkbox>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button 
        type="danger" 
        @click="handleDelete" 
        :loading="deleting"
        :disabled="!confirmed"
      >
        {{ $t('organization.confirmDelete') }}
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
  organization: Organization | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const { t } = useI18n()
const loading = ref(false)
const deleting = ref(false)
const confirmed = ref(false)
const childHandlingMode = ref<'move' | 'delete'>('move')
const userHandlingMode = ref<'move' | 'unassign'>('move')
const moveTargetId = ref<number | null>(null)
const userMoveTargetId = ref<number | null>(null)
const availableParents = ref<Organization[]>([])

const deletionInfo = reactive({
  userCount: 0,
  childCount: 0,
  deletable: false,
  reasons: [] as string[]
})

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loadDeletionInfo = async () => {
  if (!props.organization) return
  
  loading.value = true
  try {
    const info = await organizationApiService.checkOrganizationDeletable(props.organization.id)
    Object.assign(deletionInfo, info)
    
    // 加载可用的父级组织
    const tree = await organizationApiService.getOrganizationTree()
    availableParents.value = filterAvailableParents(tree, props.organization.id)
  } catch (error) {
    ElMessage.error('加载删除信息失败')
  } finally {
    loading.value = false
  }
}

const filterAvailableParents = (tree: Organization[], excludeId: number): Organization[] => {
  const result: Organization[] = []
  
  const traverse = (nodes: Organization[]) => {
    for (const node of nodes) {
      if (node.id !== excludeId) {
        result.push(node)
        if (node.children) {
          traverse(node.children)
        }
      }
    }
  }
  
  traverse(tree)
  return result
}

const handleDelete = async () => {
  if (!props.organization) return
  
  deleting.value = true
  try {
    // 构建删除参数
    const deleteParams: any = {
      childHandling: childHandlingMode.value,
      userHandling: userHandlingMode.value
    }
    
    if (childHandlingMode.value === 'move' && moveTargetId.value) {
      deleteParams.childMoveTargetId = moveTargetId.value
    }
    
    if (userHandlingMode.value === 'move' && userMoveTargetId.value) {
      deleteParams.userMoveTargetId = userMoveTargetId.value
    }
    
    // TODO: 实际的删除API调用
    // await organizationApiService.deleteOrganizationWithHandling(props.organization.id, deleteParams)
    
    ElMessage.success('删除成功')
    emit('success')
  } catch (error) {
    ElMessage.error('删除失败')
  } finally {
    deleting.value = false
  }
}

const handleClose = () => {
  confirmed.value = false
  childHandlingMode.value = 'move'
  userHandlingMode.value = 'move'
  moveTargetId.value = null
  userMoveTargetId.value = null
  dialogVisible.value = false
}

watch(() => props.modelValue, (visible) => {
  if (visible && props.organization) {
    loadDeletionInfo()
  }
})
</script>

<style scoped>
.delete-content {
  .organization-info,
  .child-handling,
  .user-handling,
  .confirmation {
    margin: 20px 0;
  }
  
  .move-target,
  .user-move-target {
    margin-top: 12px;
    padding-left: 24px;
  }
  
  h4 {
    margin: 0 0 12px 0;
    color: var(--el-text-color-primary);
  }
}
</style>