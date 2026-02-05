<template>
  <div class="organization-container">
    <div class="page-header">
      <h2>{{ $t('organization.management') }}</h2>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          {{ $t('organization.create') }}
        </el-button>
        <el-button :icon="Refresh" @click="handleRefresh">
          {{ $t('common.refresh') }}
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 组织树 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>{{ $t('organization.tree') }}</span>
          </template>
          <OrganizationTree
            :organizations="organizationTree"
            :draggable="true"
            :show-actions="true"
            :show-user-count="true"
            @node-click="handleNodeClick"
            @edit="handleEdit"
            @add-child="handleAddChild"
            @delete="handleDelete"
            @node-drop="handleNodeDrop"
            @refresh="handleRefresh"
          />
        </el-card>
      </el-col>

      <!-- 组织详情/表单 -->
      <el-col :span="16">
        <el-card v-if="selectedOrganization">
          <template #header>
            <div class="detail-header">
              <span>{{ selectedOrganization.name }}</span>
              <div class="header-actions">
                <el-button size="small" @click="handleEdit(selectedOrganization)">
                  {{ $t('common.edit') }}
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(selectedOrganization)">
                  {{ $t('common.delete') }}
                </el-button>
              </div>
            </div>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('organization.name')">
              {{ selectedOrganization.name }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('organization.code')">
              {{ selectedOrganization.code }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('organization.level')">
              {{ selectedOrganization.level }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('organization.userCount')">
              {{ selectedOrganization.userCount || 0 }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('organization.status')">
              <el-tag :type="selectedOrganization.status === 1 ? 'success' : 'danger'">
                {{ selectedOrganization.status === 1 ? $t('common.active') : $t('common.inactive') }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('organization.description')" :span="2">
              {{ selectedOrganization.description || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <el-card v-else>
          <el-empty :description="$t('organization.selectToView')" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 组织表单对话框 -->
    <OrganizationFormDialog
      v-model="formDialogVisible"
      :organization="editingOrganization"
      :parent-id="parentId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'

import OrganizationTree from '@/components/organization/OrganizationTree.vue'
import OrganizationFormDialog from './components/OrganizationFormDialog.vue'
import { organizationApiService, type Organization } from '@/api/services/organization'

const { t } = useI18n()

const organizationTree = ref<Organization[]>([])
const selectedOrganization = ref<Organization | null>(null)
const formDialogVisible = ref(false)
const editingOrganization = ref<Organization | null>(null)
const parentId = ref<number | null>(null)

const loadOrganizations = async () => {
  try {
    organizationTree.value = await organizationApiService.getOrganizationTree()
  } catch (error) {
    ElMessage.error('加载组织架构失败')
  }
}

const handleNodeClick = (org: Organization) => {
  selectedOrganization.value = org
}

const handleCreate = () => {
  editingOrganization.value = null
  parentId.value = null
  formDialogVisible.value = true
}

const handleEdit = (org: Organization) => {
  editingOrganization.value = org
  parentId.value = null
  formDialogVisible.value = true
}

const handleAddChild = (parent: Organization) => {
  editingOrganization.value = null
  parentId.value = parent.id
  formDialogVisible.value = true
}

const handleDelete = async (org: Organization) => {
  try {
    await ElMessageBox.confirm(
      t('organization.deleteConfirm', { name: org.name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    
    await organizationApiService.deleteOrganization(org.id)
    ElMessage.success('删除成功')
    await loadOrganizations()
    
    if (selectedOrganization.value?.id === org.id) {
      selectedOrganization.value = null
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleNodeDrop = async (draggingNode: any, dropNode: any, dropType: string) => {
  try {
    const targetParentId = dropType === 'inner' ? dropNode.data.id : dropNode.data.parentId
    await organizationApiService.moveOrganization(draggingNode.data.id, {
      targetParentId
    })
    ElMessage.success('移动成功')
  } catch (error) {
    ElMessage.error('移动失败')
    await loadOrganizations()
  }
}

const handleRefresh = () => {
  loadOrganizations()
}

const handleFormSuccess = () => {
  formDialogVisible.value = false
  loadOrganizations()
}

onMounted(() => {
  loadOrganizations()
})
</script>

<style scoped>
.organization-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>