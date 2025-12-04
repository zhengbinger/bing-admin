<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'sidebar-collapse': sidebarCollapsed }">
      <div class="sidebar-logo">
        <h1 class="logo-text">Bing Admin</h1>
        <h1 class="logo-text-short">BA</h1>
      </div>
      <nav class="sidebar-nav">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#409eff"
          router
          @open="handleMenuOpen"
          @close="handleMenuClose"
        >
          <!-- 动态生成菜单 -->
          <template v-for="menu in sidebarRoutes" :key="menu.id">
            <!-- 有子路由的菜单 -->
            <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.url || menu.code">
              <template #title>
                <el-icon>
                  <component :is="menu.icon || 'Menu'" />
                </el-icon>
                <span>{{ menu.name }}</span>
              </template>
              <template v-for="child in menu.children" :key="child.id">
                <el-menu-item v-if="child.type === 0" :index="child.url || child.code">
                  <el-icon>
                    <component :is="child.icon || 'CircleChecked'" />
                  </el-icon>
                  <span>{{ child.name }}</span>
                </el-menu-item>
              </template>
            </el-sub-menu>
            <!-- 无子路由的菜单 -->
            <el-menu-item v-else-if="menu.type === 0" :index="menu.url || menu.code">
              <el-icon>
                <component :is="menu.icon || 'CircleChecked'" />
              </el-icon>
              <span>{{ menu.name }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </nav>
    </aside>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <header class="main-header">
        <div class="header-left">
          <el-button
            :icon="sidebarCollapsed ? 'Menu' : 'MenuFold'"
            @click="toggleSidebar"
            circle
            size="small"
            link
            class="menu-toggle-btn"
          />
          <div class="breadcrumb" v-if="breadcrumbVisible">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
                {{ item.meta.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
        <div class="header-right">
          <!-- 主题切换 -->
          <el-button
            :icon="isDarkTheme ? 'Sunny' : 'Moon'"
            @click="toggleTheme"
            circle
            size="small"
            link
            class="theme-toggle-btn"
            title="切换主题"
          />
          <!-- 用户信息 -->
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" :src="userAvatar" />
              <span>{{ username }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-icon><Lock /></el-icon>
                  <span>修改密码</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <!-- 页面内容 -->
      <main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../store/modules/user'
import { useSystemStore } from '../store/modules/system'
import { asyncRoutes } from '../router'
import { ElMessage } from 'element-plus'
import { ArrowDown, User, Lock, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const systemStore = useSystemStore()

// 从store获取状态
const sidebarCollapsed = computed(() => systemStore.sidebarCollapsed)
const isDarkTheme = computed(() => systemStore.isDarkTheme)
const breadcrumbVisible = computed(() => systemStore.breadcrumb)

// 用户信息
const username = computed(() => userStore.userInfo?.username || '管理员')
const userAvatar = computed(() => userStore.userInfo?.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 侧边栏路由
const sidebarRoutes = computed(() => {
  // 使用从后端获取的菜单树
  return systemStore.menuTree
})

// 面包屑列表
const breadcrumbList = computed(() => {
  const matched = route.matched
  return matched.filter(item => item.meta && item.meta.title)
})

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  systemStore.toggleSidebar()
}

// 切换主题
const toggleTheme = () => {
  systemStore.toggleTheme()
}

// 退出登录
const handleLogout = async () => {
  try {
    await userStore.logout()
    router.push({ name: 'login' })
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// 处理菜单展开
const handleMenuOpen = (key, keyPath) => {
  console.log('菜单展开:', key, keyPath)
}

// 处理菜单收起
const handleMenuClose = (key, keyPath) => {
  console.log('菜单收起:', key, keyPath)
}

// 监听路由变化，设置页面标题
watch(route, (newRoute) => {
  if (newRoute.meta.title) {
    document.title = `${newRoute.meta.title} - Bing Admin`
  }
}, { immediate: true })

// 初始化主题和菜单
onMounted(async () => {
  // 应用主题
  systemStore.applyTheme()
  // 获取用户菜单树
  try {
    await systemStore.getUserMenuTree()
    // 调试菜单数据
    console.log('菜单数据:', systemStore.menuTree)
  } catch (error) {
    console.error('获取菜单失败:', error)
  }
})
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 240px;
  height: 100%;
  background-color: #001529;
  transition: width 0.3s ease;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
}

.sidebar.sidebar-collapse {
  width: 64px;
}

.sidebar-logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #1f2937;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
}

.logo-text {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  transition: opacity 0.3s ease;
}

.logo-text-short {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  opacity: 0;
  position: absolute;
  transition: opacity 0.3s ease;
}

.sidebar.sidebar-collapse .logo-text {
  opacity: 0;
}

.sidebar.sidebar-collapse .logo-text-short {
  opacity: 1;
}

.sidebar-nav {
  height: calc(100% - 60px);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  margin-left: 240px;
  transition: margin-left 0.3s ease;
  height: 100vh;
}

.main-content.sidebar-collapse {
  margin-left: 64px;
}

/* 顶部导航样式 */
.main-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 100;
  position: sticky;
  top: 0;
  left: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 菜单按钮 */
.menu-toggle-btn {
  transition: all 0.3s ease;
}

.menu-toggle-btn:hover {
  background-color: #f0f0f0;
}

/* 主题切换按钮 */
.theme-toggle-btn {
  transition: all 0.3s ease;
}

.theme-toggle-btn:hover {
  background-color: #f0f0f0;
}

/* 面包屑 */
.breadcrumb {
  font-size: 14px;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
  font-size: 14px;
}

.user-info:hover {
  background-color: #f5f7fa;
}

/* 页面内容样式 */
.page-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.sidebar-collapse {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .main-content.sidebar-collapse {
    margin-left: 0;
  }
  
  .breadcrumb {
    display: none;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>