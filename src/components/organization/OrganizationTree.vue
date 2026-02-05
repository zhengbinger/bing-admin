<template>
  <div class="organization-tree-container">
    <!-- 搜索和操作栏 -->
    <div class="tree-header">
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          :placeholder="$t('organization.searchPlaceholder')"
          :prefix-icon="Search"
          clearable
          @input="handleSearch"
          class="search-input"
        />
      </div>
      <div class="action-section">
        <el-button
          size="small"
          @click="expandAll"
          :icon="Plus"
        >
          {{ $t('organization.expandAll') }}
        </el-button>
        <el-button
          size="small"
          @click="collapseAll"
          :icon="Minus"
        >
          {{ $t('organization.collapseAll') }}
        </el-button>
        <el-button
          size="small"
          @click="refreshTree"
          :icon="Refresh"
        >
          {{ $t('common.refresh') }}
        </el-button>
      </div>
    </div>

    <!-- 组织机构树 -->
    <div class="tree-content">
      <el-tree
        ref="treeRef"
        :data="filteredOrganizations"
        :props="treeProps"
        :default-expand-all="defaultExpandAll"
        :expand-on-click-node="false"
        :show-checkbox="showCheckbox"
        :check-strictly="checkStrictly"
        :default-checked-keys="defaultCheckedKeys"
        :node-key="nodeKey"
        :filter-node-method="filterNode"
        :draggable="draggable && !readonly"
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
        @check="handleCheck"
        @check-change="handleCheckChange"
        @node-click="handleNodeClick"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
        @node-drop="handleNodeDrop"
        @node-contextmenu="handleNodeContextMenu"
        class="organization-tree"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <div class="node-content">
              <!-- 组织机构图标 -->
              <el-icon class="org-icon" :class="getOrganizationIconClass(data.level)">
                <component :is="getOrganizationIcon(data.level)" />
              </el-icon>
              
              <!-- 组织机构名称 -->
              <span class="org-name" :title="data.name">
                {{ data.name }}
              </span>
              
              <!-- 组织机构代码 -->
              <el-tag
                size="small"
                type="info"
                class="org-code"
              >
                {{ data.code }}
              </el-tag>
              
              <!-- 用户数量 -->
              <el-tag
                v-if="showUserCount && data.userCount !== undefined"
                size="small"
                :type="data.userCount > 0 ? 'primary' : 'info'"
                class="user-count"
              >
                <el-icon><User /></el-icon>
                {{ data.userCount }}
              </el-tag>
              
              <!-- 状态指示器 -->
              <el-tag
                v-if="data.status !== undefined"
                size="small"
                :type="data.status === 1 ? 'success' : 'danger'"
                class="org-status"
              >
                {{ data.status === 1 ? $t('common.active') : $t('common.inactive') }}
              </el-tag>
            </div>
            
            <!-- 操作按钮 -->
            <div v-if="showActions && !readonly" class="node-actions">
              <el-button
                size="small"
                type="primary"
                link
                @click.stop="handleEdit(data)"
                v-if="hasPermission('organization:update')"
              >
                {{ $t('common.edit') }}
              </el-button>
              <el-button
                size="small"
                type="success"
                link
                @click.stop="handleAddChild(data)"
                v-if="hasPermission('organization:create')"
              >
                {{ $t('organization.addChild') }}
              </el-button>
              <el-button
                size="small"
                type="danger"
                link
                @click.stop="handleDelete(data)"
                v-if="hasPermission('organization:delete') && !hasChildren(data)"
              >
                {{ $t('common.delete') }}
              </el-button>
            </div>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="filteredOrganizations.length === 0"
      :description="searchKeyword ? $t('organization.noSearchResults') : $t('organization.noOrganizations')"
      :image-size="120"
    />

    <!-- 右键菜单 -->
    <el-dropdown
      ref="contextMenuRef"
      :teleported="false"
      trigger="contextmenu"
      @command="handleContextMenuCommand"
      class="context-menu"
    >
      <span></span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item 
            command="view"
            :icon="View"
          >
            {{ $t('common.view') }}
          </el-dropdown-item>
          <el-dropdown-item 
            command="edit"
            :icon="Edit"
            v-if="hasPermission('organization:update')"
          >
            {{ $t('common.edit') }}
          </el-dropdown-item>
          <el-dropdown-item 
            command="addChild"
            :icon="Plus"
            v-if="hasPermission('organization:create')"
          >
            {{ $t('organization.addChild') }}
          </el-dropdown-item>
          <el-dropdown-item 
            command="move"
            :icon="Rank"
            v-if="hasPermission('organization:update')"
          >
            {{ $t('organization.move') }}
          </el-dropdown-item>
          <el-dropdown-item 
            command="delete"
            :icon="Delete"
            divided
            v-if="hasPermission('organization:delete')"
          >
            {{ $t('common.delete') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElTree, ElMessage } from 'element-plus'
import {
  Search,
  Plus,
  Minus,
  Refresh,
  User,
  OfficeBuilding,
  School,
  Shop,
  House,
  View,
  Edit,
  Delete,
  Rank
} from '@element-plus/icons-vue'

import { usePermission } from '@/composables/usePermission'
import type { Organization } from '@/api/services/organization'

// Props
interface Props {
  organizations: Organization[]
  defaultExpandAll?: boolean
  showCheckbox?: boolean
  checkStrictly?: boolean
  defaultCheckedKeys?: (string | number)[]
  nodeKey?: string
  draggable?: boolean
  showActions?: boolean
  showUserCount?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  organizations: () => [],
  defaultExpandAll: false,
  showCheckbox: false,
  checkStrictly: false,
  defaultCheckedKeys: () => [],
  nodeKey: 'id',
  draggable: false,
  showActions: false,
  showUserCount: true,
  readonly: false
})

// Emits
interface Emits {
  (e: 'check', checkedKeys: (string | number)[], checkedNodes: Organization[]): void
  (e: 'check-change', data: Organization, checked: boolean, indeterminate: boolean): void
  (e: 'node-click', data: Organization, node: any, component: any): void
  (e: 'node-expand', data: Organization, node: any, component: any): void
  (e: 'node-collapse', data: Organization, node: any, component: any): void
  (e: 'node-drop', draggingNode: any, dropNode: any, dropType: string, event: DragEvent): void
  (e: 'view', organization: Organization): void
  (e: 'edit', organization: Organization): void
  (e: 'add-child', parent: Organization): void
  (e: 'delete', organization: Organization): void
  (e: 'move', organization: Organization): void
  (e: 'refresh'): void
}

const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()
const { hasPermission } = usePermission()

// Refs
const treeRef = ref<InstanceType<typeof ElTree>>()
const contextMenuRef = ref()
const searchKeyword = ref('')
const contextMenuData = ref<Organization | null>(null)

// Tree props
const treeProps = {
  children: 'children',
  label: 'name',
  disabled: (data: Organization) => props.readonly || data.status === 0
}

// Computed
const filteredOrganizations = computed(() => {
  if (!searchKeyword.value) {
    return props.organizations
  }
  return filterOrganizations(props.organizations, searchKeyword.value)
})

// Methods
const filterOrganizations = (organizations: Organization[], keyword: string): Organization[] => {
  const result: Organization[] = []
  
  for (const org of organizations) {
    const matchesKeyword = 
      org.name.toLowerCase().includes(keyword.toLowerCase()) ||
      org.code.toLowerCase().includes(keyword.toLowerCase())
    
    const filteredChildren = org.children 
      ? filterOrganizations(org.children, keyword)
      : []
    
    if (matchesKeyword || filteredChildren.length > 0) {
      result.push({
        ...org,
        children: filteredChildren
      })
    }
  }
  
  return result
}

const filterNode = (value: string, data: Organization) => {
  if (!value) return true
  return data.name.toLowerCase().includes(value.toLowerCase()) ||
         data.code.toLowerCase().includes(value.toLowerCase())
}

const handleSearch = () => {
  if (treeRef.value) {
    treeRef.value.filter(searchKeyword.value)
  }
}

const expandAll = () => {
  if (treeRef.value) {
    const nodes = treeRef.value.store.nodesMap
    for (const nodeId in nodes) {
      nodes[nodeId].expanded = true
    }
  }
}

const collapseAll = () => {
  if (treeRef.value) {
    const nodes = treeRef.value.store.nodesMap
    for (const nodeId in nodes) {
      nodes[nodeId].expanded = false
    }
  }
}

const refreshTree = () => {
  emit('refresh')
}

const getOrganizationIcon = (level: number) => {
  switch (level) {
    case 1:
      return OfficeBuilding // 总公司
    case 2:
      return School // 分公司/事业部
    case 3:
      return Shop // 部门
    case 4:
      return House // 小组/团队
    default:
      return OfficeBuilding
  }
}

const getOrganizationIconClass = (level: number) => {
  return `org-icon--level-${level}`
}

const hasChildren = (data: Organization) => {
  return data.children && data.children.length > 0
}

const allowDrop = (draggingNode: any, dropNode: any, type: string) => {
  // 不允许拖拽到自己的子节点
  if (type === 'inner') {
    return !isDescendant(draggingNode.data, dropNode.data)
  }
  
  // 不允许拖拽到同级的第一个位置（保持根节点顺序）
  if (type === 'prev' && dropNode.level === 1) {
    return false
  }
  
  return true
}

const allowDrag = (draggingNode: any) => {
  // 只读模式不允许拖拽
  if (props.readonly) return false
  
  // 根节点不允许拖拽
  return draggingNode.level > 1
}

const isDescendant = (ancestor: Organization, descendant: Organization): boolean => {
  if (!descendant.children) return false
  
  for (const child of descendant.children) {
    if (child.id === ancestor.id || isDescendant(ancestor, child)) {
      return true
    }
  }
  
  return false
}

// Event handlers
const handleCheck = (data: Organization, checkedInfo: any) => {
  if (props.readonly) return
  
  const checkedKeys = checkedInfo.checkedKeys
  const checkedNodes = checkedInfo.checkedNodes
  emit('check', checkedKeys, checkedNodes)
}

const handleCheckChange = (data: Organization, checked: boolean, indeterminate: boolean) => {
  if (props.readonly) return
  
  emit('check-change', data, checked, indeterminate)
}

const handleNodeClick = (data: Organization, node: any, component: any) => {
  emit('node-click', data, node, component)
}

const handleNodeExpand = (data: Organization, node: any, component: any) => {
  emit('node-expand', data, node, component)
}

const handleNodeCollapse = (data: Organization, node: any, component: any) => {
  emit('node-collapse', data, node, component)
}

const handleNodeDrop = (draggingNode: any, dropNode: any, dropType: string, event: DragEvent) => {
  if (props.readonly) return
  
  emit('node-drop', draggingNode, dropNode, dropType, event)
}

const handleNodeContextMenu = (event: MouseEvent, data: Organization, node: any, component: any) => {
  if (props.readonly) return
  
  event.preventDefault()
  contextMenuData.value = data
  
  // 显示右键菜单
  nextTick(() => {
    if (contextMenuRef.value) {
      contextMenuRef.value.handleOpen()
    }
  })
}

const handleView = (organization: Organization) => {
  if (props.readonly) return
  
  emit('view', organization)
}

const handleEdit = (organization: Organization) => {
  if (props.readonly) return
  
  emit('edit', organization)
}

const handleAddChild = (parent: Organization) => {
  if (props.readonly) return
  
  emit('add-child', parent)
}

const handleDelete = (organization: Organization) => {
  if (props.readonly) return
  
  emit('delete', organization)
}

const handleMove = (organization: Organization) => {
  if (props.readonly) return
  
  emit('move', organization)
}

const handleContextMenuCommand = (command: string) => {
  if (!contextMenuData.value) return
  
  switch (command) {
    case 'view':
      handleView(contextMenuData.value)
      break
    case 'edit':
      handleEdit(contextMenuData.value)
      break
    case 'addChild':
      handleAddChild(contextMenuData.value)
      break
    case 'move':
      handleMove(contextMenuData.value)
      break
    case 'delete':
      handleDelete(contextMenuData.value)
      break
  }
  
  contextMenuData.value = null
}

// Public methods
const getCheckedKeys = () => {
  return treeRef.value?.getCheckedKeys() || []
}

const getCheckedNodes = () => {
  return treeRef.value?.getCheckedNodes() || []
}

const setCheckedKeys = (keys: (string | number)[]) => {
  treeRef.value?.setCheckedKeys(keys)
}

const setCheckedNodes = (nodes: Organization[]) => {
  treeRef.value?.setCheckedNodes(nodes)
}

const getCurrentNode = () => {
  return treeRef.value?.getCurrentNode()
}

const setCurrentKey = (key: string | number) => {
  treeRef.value?.setCurrentKey(key)
}

// Expose methods
defineExpose({
  getCheckedKeys,
  getCheckedNodes,
  setCheckedKeys,
  setCheckedNodes,
  getCurrentNode,
  setCurrentKey,
  expandAll,
  collapseAll,
  refreshTree
})

// Watch
watch(
  () => props.organizations,
  () => {
    nextTick(() => {
      if (treeRef.value && props.defaultCheckedKeys.length > 0) {
        treeRef.value.setCheckedKeys(props.defaultCheckedKeys)
      }
    })
  },
  { immediate: true }
)

// Lifecycle
onMounted(() => {
  if (props.defaultCheckedKeys.length > 0) {
    nextTick(() => {
      treeRef.value?.setCheckedKeys(props.defaultCheckedKeys)
    })
  }
})
</script>

<style scoped lang="scss">
.organization-tree-container {
  .tree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px;
    background-color: var(--el-bg-color-page);
    border-radius: 6px;
    
    .search-section {
      flex: 1;
      max-width: 300px;
      
      .search-input {
        width: 100%;
      }
    }
    
    .action-section {
      display: flex;
      gap: 8px;
      margin-left: 16px;
    }
  }
  
  .tree-content {
    .organization-tree {
      background-color: var(--el-bg-color);
      border: 1px solid var(--el-border-color-light);
      border-radius: 6px;
      padding: 8px;
      
      :deep(.el-tree-node) {
        .el-tree-node__content {
          height: auto;
          min-height: 40px;
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 2px;
          
          &:hover {
            background-color: var(--el-color-primary-light-9);
          }
          
          .el-tree-node__expand-icon {
            color: var(--el-color-primary);
          }
          
          .el-checkbox {
            margin-right: 8px;
          }
        }
        
        &.is-current > .el-tree-node__content {
          background-color: var(--el-color-primary-light-8);
          color: var(--el-color-primary);
        }
      }
    }
  }
  
  .tree-node {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    
    .node-content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      
      .org-icon {
        font-size: 16px;
        
        &--level-1 {
          color: var(--el-color-primary);
        }
        
        &--level-2 {
          color: var(--el-color-success);
        }
        
        &--level-3 {
          color: var(--el-color-warning);
        }
        
        &--level-4 {
          color: var(--el-color-info);
        }
      }
      
      .org-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
        flex-shrink: 0;
      }
      
      .org-code {
        font-family: 'Courier New', monospace;
        font-size: 12px;
      }
      
      .user-count {
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 2px;
      }
      
      .org-status {
        font-size: 12px;
      }
    }
    
    .node-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    &:hover .node-actions {
      opacity: 1;
    }
  }
  
  .context-menu {
    position: absolute;
    z-index: 9999;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .organization-tree-container {
    .tree-header {
      flex-direction: column;
      gap: 12px;
      
      .search-section {
        max-width: none;
        width: 100%;
      }
      
      .action-section {
        margin-left: 0;
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
    
    .tree-node {
      .node-content {
        flex-wrap: wrap;
        gap: 4px;
        
        .org-name {
          flex-basis: 100%;
          margin-bottom: 4px;
        }
      }
      
      .node-actions {
        opacity: 1;
        flex-direction: column;
      }
    }
  }
}
</style>