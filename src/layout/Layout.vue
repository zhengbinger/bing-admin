<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'sidebar-collapse': collapsed }">
      <div class="sidebar-logo">
        <h1>Bing Admin</h1>
      </div>
      <nav class="sidebar-nav">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#409eff"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><i-ep-home /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/user">
            <el-icon><i-ep-user /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/role">
            <el-icon><i-ep-setting /></el-icon>
            <span>角色管理</span>
          </el-menu-item>
          <el-menu-item index="/permission">
            <el-icon><i-ep-lock /></el-icon>
            <span>权限管理</span>
          </el-menu-item>
        </el-menu>
      </nav>
    </aside>
    
    <!-- 主内容区 -->
    <div class="main-content" :class="{ 'sidebar-collapse': collapsed }">
      <!-- 顶部导航 -->
      <header class="main-header">
        <div class="header-left">
          <el-button
            icon="i-ep-menu-fold"
            @click="toggleSidebar"
            circle
            size="small"
            type="text"
          />
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentRoute.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span>{{ username }}</span>
              <el-icon class="el-icon--right"><i-ep-arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const username = ref('管理员')

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 获取当前路由信息
const currentRoute = computed(() => {
  return route
})

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}

// 退出登录
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  ElMessage.success('退出登录成功')
  router.push({ name: 'login' })
}

onMounted(() => {
  // 从localStorage中获取用户信息
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      username.value = user.username || '管理员'
    } catch (e) {
      console.error('解析用户信息失败', e)
    }
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
}

.sidebar.sidebar-collapse {
  width: 64px;
}

.sidebar-logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #1f2937;
}

.sidebar-logo h1 {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.sidebar.sidebar-collapse .sidebar-logo h1 {
  font-size: 14px;
}

.sidebar-nav {
  height: calc(100% - 70px);
  overflow-y: auto;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  transition: all 0.3s ease;
}

.main-content.sidebar-collapse {
  margin-left: 0;
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
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

/* 页面内容样式 */
.page-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>