<template>
  <div class="permission-tree-container">
    <!-- 搜索和操作栏 -->
    <div class="tree-header">
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          :placeholder="$t('permission.searchPlaceholder')"
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
          {{ $t('permission.expandAll') }}
        </el-button>
        <el-button
          size="small"
          @click="collapseAll"
          :icon="Minus"
        >
          {{ $t('permission.collapseAll') }}
        </el-button>
        <el-button
          size="small"
          @click="selectAll"
          :icon="Check"
        >
          {{ $t('permission.selectAll') }}
        </el-button>
        <el-button
          size="small"
          @click="clearAll"
          :icon="Close"
        >
          {{ $t('permission.clearAll') }}
        </el-button>
      </div>
    </div>

    <!-- 权限树 -->
    <div class="tree-content">
      <el-tree
        ref="treeRef"
        :data="filteredPermissions"
        :props="treeProps"
        :default-expand-all="defaultExpandAll"
        :expand-on-click-node="false"
        :check-on-click-node="checkOnClickNode"
        :show-checkbox="showCheckbox"
        :check-strictly="checkStrictly"
        :default-checked-keys="defaultCheckedKeys"
        :node-key="nodeKey"
        :filter-node-method="filterNode"
        :draggable="draggable"
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
        @check="handleCheck"
        @check-change="handleCheckChange"
        @node-click="handleNodeClick"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
        @node-drop="handleNodeDrop"
        class="permission-tree"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <div class="node-content">
              <!-- 权限图标 -->
              <el-icon class="permission-icon" :class="getPermissionIconClass(data.type)">
                <component :is="getPermissionIcon(data.type)" />
              </el-icon>
              
              <!-- 权限名称 -->
              <span class="permission-name" :title="data.name">
                {{ data.name }}
              </span>
              
              <!-- 权限代码 -->
              <el-tag
                size="small"
                :type="getPermissionTypeColor(data.type)"
                class="permission-code"
              >
                {{ data.code }}
              </el-tag>
              
              <!-- 权限类型 -->
              <el-tag
                size="small"
                :type="getPermissionTypeTagColor(data.type)"
                class="permission-type"
              >
                {{ $t(`permission.type.${data.type}`) }}
              </el-tag>
              
              <!-- 状态指示器 -->
              <el-tag
                v-if="data.status !== undefined"
                size="small"
                :type="data.status === 1 ? 'success' : 'danger'"
                class="permission-status"
              >
                {{ data.status === 1 ? $t('common.active') : $t('common.inactive') }}
              </el-tag>
            </div>
            
            <!-- 操作按钮 -->
            <div v-if="showActions" class="node-actions">
              <el-button
                size="small"
                type="primary"
                link
                @click.stop="handleEdit(data)"
                v-if="hasPermission('permission:update')"
              >
                {{ $t('common.edit') }}
              </el-button>
              <el-button
                size="small"
                type="success"
                link
                @click.stop="handleAddChild(data)"
                v-if="hasPermission('permission:create')"
              >
                {{ $t('permission.addChild') }}
              </el-button>
              <el-button
                size="small"
                type="danger"
                link
                @click.stop="handleDelete(data)"
                v-if="hasPermission('permission:delete') && !hasChildren(data)"
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
      v-if="filteredPermissions.length === 0"
      :description="searchKeyword ? $t('permission.noSearchResults') : $t('permission.noPermissions')"
      :image-size="120"
    />
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
  Check,
  Close,
  Menu,
  Operation,
  Key,
  Document,
  Folder,
  Setting
} from '@element-plus/icons-vue'

import { usePermission } from '@/composables/usePermission'
import type { Permission } from '@/types'

// Props
interface Props {
  permissions: Permission[]
  defaultExpandAll?: boolean
  showCheckbox?: boolean
  checkStrictly?: boolean
  checkOnClickNode?: boolean
  defaultCheckedKeys?: (string | number)[]
  nodeKey?: string
  draggable?: boolean
  showActions?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  permissions: () => [],
  defaultExpandAll: false,
  showCheckbox: true,
  checkStrictly: false,
  checkOnClickNode: false,
  defaultCheckedKeys: () => [],
  nodeKey: 'id',
  draggable: false,
  showActions: false,
  readonly: false
})

// Emits
interface Emits {
  (e: 'check', checkedKeys: (string | number)[], checkedNodes: Permission[]): void
  (e: 'check-change', data: Permission, checked: boolean, indeterminate: boolean): void
  (e: 'node-click', data: Permission, node: any, component: any): void
  (e: 'node-expand', data: Permission, node: any, component: any): void
  (e: 'node-collapse', data: Permission, node: any, component: any): void
  (e: 'node-drop', draggingNode: any, dropNode: any, dropType: string, event: DragEvent): void
  (e: 'edit', permission: Permission): void
  (e: 'add-child', parent: Permission): void
  (e: 'delete', permission: Permission): void
}

const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()
const { hasPermission } = usePermission()

// Refs
const treeRef = ref<InstanceType<typeof ElTree>>()
const searchKeyword = ref('')

// Tree props
const treeProps = {
  children: 'children',
  label: 'name',
  disabled: (data: Permission) => props.readonly || data.status === 0
}

// Computed
const filteredPermissions = computed(() => {
  if (!searchKeyword.value) {
    return props.permissions
  }
  return filterPermissions(props.permissions, searchKeyword.value)
})

// Methods
const filterPermissions = (permissions: Permission[], keyword: string): Permission[] => {
  const result: Permission[] = []
  
  for (const permission of permissions) {
    const matchesKeyword = 
      permission.name.toLowerCase().includes(keyword.toLowerCase()) ||
      permission.code.toLowerCase().includes(keyword.toLowerCase())
    
    const filteredChildren = permission.children 
      ? filterPermissions(permission.children, keyword)
      : []
    
    if (matchesKeyword || filteredChildren.length > 0) {
      result.push({
        ...permission,
        children: filteredChildren
      })
    }
  }
  
  return result
}

const filterNode = (value: string, data: Permission) => {
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

const selectAll = () => {
  if (treeRef.value && props.showCheckbox) {
    const allKeys = getAllPermissionKeys(props.permissions)
    treeRef.value.setCheckedKeys(allKeys)
  }
}

const clearAll = () => {
  if (treeRef.value && props.showCheckbox) {
    treeRef.value.setCheckedKeys([])
  }
}

const getAllPermissionKeys = (permissions: Permission[]): (string | number)[] => {
  const keys: (string | number)[] = []
  
  const traverse = (perms: Permission[]) => {
    for (const perm of perms) {
      keys.push(perm[props.nodeKey as keyof Permission] as string | number)
      if (perm.children && perm.children.length > 0) {
        traverse(perm.children)
      }
    }
  }
  
  traverse(permissions)
  return keys
}

const getPermissionIcon = (type: string) => {
  switch (type) {
    case 'menu':
      return Menu
    case 'button':
      return Operation
    case 'api':
      return Key
    case 'page':
      return Document
    case 'module':
      return Folder
    default:
      return Setting
  }
}

const getPermissionIconClass = (type: string) => {
  return `permission-icon--${type}`
}

const getPermissionTypeColor = (type: string) => {
  switch (type) {
    case 'menu':
      return 'primary'
    case 'button':
      return 'success'
    case 'api':
      return 'warning'
    case 'page':
      return 'info'
    case 'module':
      return 'danger'
    default:
      return ''
  }
}

const getPermissionTypeTagColor = (type: string) => {
  switch (type) {
    case 'menu':
      return 'primary'
    case 'button':
      return 'success'
    case 'api':
      return 'warning'
    case 'page':
      return 'info'
    case 'module':
      return 'danger'
    default:
      return ''
  }
}

const hasChildren = (data: Permission) => {
  return data.children && data.children.length > 0
}

const allowDrop = (draggingNode: any, dropNode: any, type: string) => {
  // 不允许拖拽到子节点
  if (type === 'inner') {
    return dropNode.data.type === 'module' || dropNode.data.type === 'menu'
  }
  return true
}

const allowDrag = (draggingNode: any) => {
  // 只读模式不允许拖拽
  if (props.readonly) return false
  
  // 根节点不允许拖拽
  return draggingNode.level > 1
}

// Event handlers
const handleCheck = (data: Permission, checkedInfo: any) => {
  if (props.readonly) return
  
  const checkedKeys = checkedInfo.checkedKeys
  const checkedNodes = checkedInfo.checkedNodes
  emit('check', checkedKeys, checkedNodes)
}

const handleCheckChange = (data: Permission, checked: boolean, indeterminate: boolean) => {
  if (props.readonly) return
  
  emit('check-change', data, checked, indeterminate)
}

const handleNodeClick = (data: Permission, node: any, component: any) => {
  emit('node-click', data, node, component)
}

const handleNodeExpand = (data: Permission, node: any, component: any) => {
  emit('node-expand', data, node, component)
}

const handleNodeCollapse = (data: Permission, node: any, component: any) => {
  emit('node-collapse', data, node, component)
}

const handleNodeDrop = (draggingNode: any, dropNode: any, dropType: string, event: DragEvent) => {
  if (props.readonly) return
  
  emit('node-drop', draggingNode, dropNode, dropType, event)
}

const handleEdit = (permission: Permission) => {
  if (props.readonly) return
  
  emit('edit', permission)
}

const handleAddChild = (parent: Permission) => {
  if (props.readonly) return
  
  emit('add-child', parent)
}

const handleDelete = (permission: Permission) => {
  if (props.readonly) return
  
  emit('delete', permission)
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

const setCheckedNodes = (nodes: Permission[]) => {
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
  selectAll,
  clearAll
})

// Watch
watch(
  () => props.permissions,
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
.permission-tree-container {
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
    .permission-tree {
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
      
      .permission-icon {
        font-size: 16px;
        
        &--menu {
          color: var(--el-color-primary);
        }
        
        &--button {
          color: var(--el-color-success);
        }
        
        &--api {
          color: var(--el-color-warning);
        }
        
        &--page {
          color: var(--el-color-info);
        }
        
        &--module {
          color: var(--el-color-danger);
        }
      }
      
      .permission-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
        flex-shrink: 0;
      }
      
      .permission-code {
        font-family: 'Courier New', monospace;
        font-size: 12px;
      }
      
      .permission-type {
        font-size: 12px;
      }
      
      .permission-status {
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
}

// 响应式设计
@media (max-width: 768px) {
  .permission-tree-container {
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
        
        .permission-name {
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