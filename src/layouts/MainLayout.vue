<!--
  主布局组件
  提供响应式侧边栏、头部、面包屑导航、主题切换和语言选择功能
-->
<template>
  <div class="main-layout" :class="{ 'is-collapsed': isCollapsed, 'is-mobile': isMobile }">
    <!-- 侧边栏 -->
    <aside class="main-sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div class="sidebar-header">
        <div class="logo" @click="handleLogoClick">
          <div v-if="!isCollapsed" class="logo-image">🏢</div>
          <div v-else class="logo-mini">B</div>
          <span v-if="!isCollapsed" class="logo-text">Bing Admin</span>
        </div>
        <el-button
          v-if="!isMobile"
          class="collapse-btn"
          :icon="isCollapsed ? Expand : Fold"
          @click="toggleSidebar"
          text
        />
      </div>
      
      <div class="sidebar-content">
        <SidebarMenu :collapsed="isCollapsed" />
      </div>
    </aside>

    <!-- 移动端遮罩 -->
    <div
      v-if="isMobile && !isCollapsed"
      class="mobile-overlay"
      @click="closeSidebar"
    />

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 头部 -->
      <header class="main-header">
        <div class="header-left">
          <el-button
            v-if="isMobile"
            class="mobile-menu-btn"
            :icon="Menu"
            @click="toggleSidebar"
            text
          />
          <Breadcrumb />
        </div>
        
        <div class="header-right">
          <HeaderActions />
        </div>
      </header>

      <!-- 内容区域 -->
      <main class="main-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </main>

      <!-- 页脚 -->
      <footer class="main-footer">
        <div class="footer-content">
          <span>&copy; 2025 Bing Admin. All rights reserved.</span>
          <span>Version {{ version }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Expand, Fold, Menu } from '@element-plus/icons-vue'
import { useLayoutStore } from '../store/modules/layout'
import SidebarMenu from '../components/layout/SidebarMenu.vue'
import Breadcrumb from '../components/layout/Breadcrumb.vue'
import HeaderActions from '../components/layout/HeaderActions.vue'

// 版本信息
const version = import.meta.env.VITE_APP_VERSION || '1.0.0'

// 路由
const router = useRouter()

// 布局状态
const layoutStore = useLayoutStore()

// 响应式状态
const isCollapsed = computed(() => layoutStore.isCollapsed)
const isMobile = computed(() => layoutStore.isMobile)
const cachedViews = computed(() => layoutStore.cachedViews)

// 切换侧边栏
const toggleSidebar = () => {
  layoutStore.toggleSidebar()
}

// 关闭侧边栏（移动端）
const closeSidebar = () => {
  if (isMobile.value) {
    layoutStore.closeSidebar()
  }
}

// Logo点击处理
const handleLogoClick = () => {
  router.push('/dashboard')
}

// 窗口大小变化处理
const handleResize = () => {
  layoutStore.checkMobile()
}

// 生命周期
onMounted(() => {
  // 初始化检查移动端
  layoutStore.checkMobile()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;

  // 侧边栏样式
  .main-sidebar {
    width: 260px;
    background: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color-light);
    transition: width 0.3s ease;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1001;

    &.is-collapsed {
      width: 64px;
    }

    .sidebar-header {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      .logo {
        display: flex;
        align-items: center;
        cursor: pointer;
        flex: 1;

        .logo-image,
        .logo-mini {
          height: 32px;
          width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          background: var(--el-color-primary-light-9);
          border-radius: 6px;
        }

        .logo-text {
          margin-left: 12px;
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .collapse-btn {
        padding: 8px;
        margin-left: 8px;
      }
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color);
        border-radius: 3px;
      }
    }
  }

  // 移动端遮罩
  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1000;
  }

  // 主容器
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    // 头部样式
    .main-header {
      height: 60px;
      background: var(--el-bg-color);
      border-bottom: 1px solid var(--el-border-color-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      position: relative;
      z-index: 999;

      .header-left {
        display: flex;
        align-items: center;
        flex: 1;

        .mobile-menu-btn {
          margin-right: 16px;
          padding: 8px;
        }
      }

      .header-right {
        display: flex;
        align-items: center;
      }
    }

    // 内容区域
    .main-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: var(--el-bg-color-page);

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color);
        border-radius: 4px;
      }
    }

    // 页脚样式
    .main-footer {
      height: 50px;
      background: var(--el-bg-color);
      border-top: 1px solid var(--el-border-color-light);
      display: flex;
      align-items: center;
      padding: 0 20px;

      .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  // 移动端适配
  &.is-mobile {
    .main-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: 1001;
      transform: translateX(-100%);
      transition: transform 0.3s ease;

      &:not(.is-collapsed) {
        transform: translateX(0);
      }
    }

    .main-container {
      width: 100%;
      margin-left: 0;
    }
  }

  // 折叠状态
  &.is-collapsed:not(.is-mobile) {
    .main-sidebar {
      .sidebar-header {
        .logo {
          justify-content: center;
        }
      }
    }
  }
}

// 页面切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// 响应式断点
@media (max-width: 768px) {
  .main-layout {
    .main-container {
      .main-header {
        padding: 0 16px;
      }

      .main-content {
        padding: 16px;
      }

      .main-footer {
        padding: 0 16px;

        .footer-content {
          font-size: 11px;
        }
      }
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .main-layout {
    .main-sidebar {
      background: var(--el-bg-color);
    }

    .main-container {
      .main-header {
        background: var(--el-bg-color);
      }

      .main-content {
        background: var(--el-bg-color-page);
      }

      .main-footer {
        background: var(--el-bg-color);
      }
    }
  }
}
</style>