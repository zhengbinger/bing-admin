<!--
  侧边栏菜单项组件
  递归渲染菜单项，支持多级菜单和权限控制
-->
<template>
  <template v-if="!menuItem.hidden">
    <!-- 有子菜单的情况 -->
    <el-sub-menu
      v-if="hasChildren"
      :index="menuItem.path"
      :popper-class="collapsed ? 'sidebar-submenu-popper' : ''"
    >
      <template #title>
        <el-icon v-if="menuItem.icon">
          <component :is="menuItem.icon" />
        </el-icon>
        <span>{{ menuItem.title }}</span>
        <el-badge
          v-if="menuItem.badge"
          :value="menuItem.badge"
          :type="menuItem.badgeType || 'primary'"
          class="menu-badge"
        />
      </template>
      
      <template v-for="child in visibleChildren" :key="child.path">
        <SidebarMenuItem
          :menu-item="child"
          :collapsed="collapsed"
          :base-path="resolvePath(child.path)"
        />
      </template>
    </el-sub-menu>

    <!-- 无子菜单的情况 -->
    <el-menu-item
      v-else
      :index="resolvePath(menuItem.path)"
      :disabled="menuItem.disabled"
      :class="{ 'is-new': menuItem.isNew }"
    >
      <el-icon v-if="menuItem.icon">
        <component :is="menuItem.icon" />
      </el-icon>
      <template #title>
        <span>{{ menuItem.title }}</span>
        <el-badge
          v-if="menuItem.badge"
          :value="menuItem.badge"
          :type="menuItem.badgeType || 'primary'"
          class="menu-badge"
        />
        <el-tag
          v-if="menuItem.isNew"
          type="success"
          size="small"
          class="menu-new-tag"
        >
          新
        </el-tag>
      </template>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuItem } from '../../types/menu'

interface Props {
  menuItem: MenuItem
  collapsed?: boolean
  basePath?: string
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  basePath: ''
})

// 是否有子菜单
const hasChildren = computed(() => {
  return props.menuItem.children && props.menuItem.children.length > 0
})

// 可见的子菜单
const visibleChildren = computed(() => {
  if (!props.menuItem.children) return []
  return props.menuItem.children.filter(child => !child.hidden)
})

// 解析路径
const resolvePath = (routePath: string): string => {
  if (routePath.startsWith('/')) {
    return routePath
  }
  
  if (props.basePath) {
    return `${props.basePath}/${routePath}`.replace(/\/+/g, '/')
  }
  
  return routePath
}
</script>

<style lang="scss" scoped>
.menu-badge {
  margin-left: 8px;
}

.menu-new-tag {
  margin-left: 8px;
  font-size: 10px;
  height: 16px;
  line-height: 14px;
  padding: 0 4px;
}

// 新功能菜单项样式
:deep(.el-menu-item.is-new) {
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 6px;
    height: 6px;
    background: var(--el-color-success);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// 折叠状态下的子菜单弹出层样式
:global(.sidebar-submenu-popper) {
  .el-menu {
    min-width: 200px;
  }

  .el-menu-item {
    padding-left: 20px !important;
  }
}
</style>