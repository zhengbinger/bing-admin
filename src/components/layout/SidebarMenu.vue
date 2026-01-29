<!--
  侧边栏菜单组件
  提供动态菜单生成、权限控制、搜索过滤等功能
-->
<template>
  <div class="sidebar-menu">
    <!-- 菜单搜索 -->
    <div v-if="!collapsed && showSearch" class="menu-search">
      <el-input
        v-model="searchKeyword"
        :placeholder="$t('menu.search')"
        :prefix-icon="Search"
        size="small"
        clearable
        @input="handleSearch"
      />
    </div>

    <!-- 菜单列表 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :unique-opened="uniqueOpened"
      :collapse-transition="false"
      class="sidebar-menu-list"
      @select="handleMenuSelect"
    >
      <template v-for="item in filteredMenus" :key="item.path">
        <SidebarMenuItem
          :menu-item="item"
          :collapsed="collapsed"
          :base-path="item.path"
        />
      </template>
    </el-menu>

    <!-- 无搜索结果提示 -->
    <div v-if="searchKeyword && filteredMenus.length === 0" class="no-results">
      <el-empty
        :description="$t('menu.noResults')"
        :image-size="60"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useAuthStore } from '../../store/modules/auth'
import { useMenuStore } from '../../store/modules/menu'
import SidebarMenuItem from './SidebarMenuItem.vue'
import type { MenuItem } from '../../types/menu'

interface Props {
  collapsed?: boolean
  showSearch?: boolean
  uniqueOpened?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  showSearch: true,
  uniqueOpened: true
})

// 路由和状态
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const menuStore = useMenuStore()

// 搜索关键词
const searchKeyword = ref('')

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta?.activeMenu) {
    return meta.activeMenu as string
  }
  return menuStore.getActiveMenu(path)
})

// 过滤后的菜单
const filteredMenus = computed(() => {
  if (!searchKeyword.value) {
    return menuStore.accessibleMenus
  }
  return menuStore.searchMenus(searchKeyword.value)
})

// 根据关键词过滤菜单（已移至store中，保留作为备用）
const filterMenusByKeyword = (menus: MenuItem[], keyword: string): MenuItem[] => {
  return menuStore.searchMenus(keyword)
}

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  const menuItem = findMenuByPath(menuStore.accessibleMenus, index)
  if (menuItem && !menuItem.children?.length) {
    router.push(index)
  }
}

// 根据路径查找菜单项
const findMenuByPath = (menus: MenuItem[], path: string): MenuItem | null => {
  for (const menu of menus) {
    if (menu.path === path) {
      return menu
    }
    if (menu.children && menu.children.length > 0) {
      const found = findMenuByPath(menu.children, path)
      if (found) return found
    }
  }
  return null
}

// 处理搜索
const handleSearch = (value: string) => {
  searchKeyword.value = value
}

// 监听路由变化，更新菜单状态
watch(
  () => route.path,
  () => {
    // 可以在这里添加菜单状态更新逻辑
  }
)

// 组件挂载时初始化菜单
onMounted(async () => {
  try {
    await menuStore.generateMenus(authStore.permissions, authStore.userRoles)
  } catch (error) {
    console.error('初始化菜单失败:', error)
  }
})
</script>

<style lang="scss" scoped>
.sidebar-menu {
  height: 100%;
  display: flex;
  flex-direction: column;

  .menu-search {
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .sidebar-menu-list {
    flex: 1;
    border: none;
    background: transparent;

    :deep(.el-menu-item) {
      height: 48px;
      line-height: 48px;
      padding: 0 20px;
      margin: 0 8px;
      border-radius: 6px;
      transition: all 0.3s;

      &:hover {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      &.is-active {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        font-weight: 500;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: var(--el-color-primary);
          border-radius: 0 2px 2px 0;
        }
      }

      .el-icon {
        margin-right: 8px;
        font-size: 16px;
      }
    }

    :deep(.el-sub-menu) {
      .el-sub-menu__title {
        height: 48px;
        line-height: 48px;
        padding: 0 20px;
        margin: 0 8px;
        border-radius: 6px;
        transition: all 0.3s;

        &:hover {
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }

        .el-icon {
          margin-right: 8px;
          font-size: 16px;
        }

        .el-sub-menu__icon-arrow {
          margin-top: -3px;
        }
      }

      &.is-opened {
        .el-sub-menu__title {
          color: var(--el-color-primary);
        }
      }

      .el-menu {
        background: transparent;

        .el-menu-item {
          padding-left: 40px;
          height: 40px;
          line-height: 40px;
          font-size: 13px;

          &::before {
            left: 8px;
          }
        }

        .el-sub-menu {
          .el-sub-menu__title {
            padding-left: 40px;
            height: 40px;
            line-height: 40px;
            font-size: 13px;
          }

          .el-menu-item {
            padding-left: 60px;
          }
        }
      }
    }

    // 折叠状态样式
    &.el-menu--collapse {
      width: 64px;

      :deep(.el-menu-item),
      :deep(.el-sub-menu__title) {
        padding: 0;
        text-align: center;
        margin: 0 4px;

        .el-icon {
          margin-right: 0;
          font-size: 18px;
        }

        span {
          display: none;
        }
      }

      :deep(.el-sub-menu) {
        .el-sub-menu__icon-arrow {
          display: none;
        }
      }

      :deep(.el-tooltip__trigger) {
        padding: 0 !important;
      }
    }
  }

  .no-results {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .sidebar-menu {
    .sidebar-menu-list {
      :deep(.el-menu-item) {
        &:hover {
          background: var(--el-color-primary-dark-2);
        }

        &.is-active {
          background: var(--el-color-primary-dark-2);
        }
      }

      :deep(.el-sub-menu__title) {
        &:hover {
          background: var(--el-color-primary-dark-2);
        }
      }
    }
  }
}
</style>