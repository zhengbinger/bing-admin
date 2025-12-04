import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/modules/user'

/**
 * 路由配置
 * 实现路由懒加载、权限控制、路由守卫等功能
 */

// 路由懒加载优化：使用动态导入
const loadView = (viewPath) => {
  return () => import(/* webpackChunkName: "[request]" */ `../views/${viewPath}.vue`)
}

// 常量路由：不需要权限的路由
const constantRoutes = [
  {
    path: '/login',
    name: 'login',
    component: loadView('Login'),
    meta: {
      title: '登录',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/',
    name: 'layout',
    component: () => import('../layout/Layout.vue'),
    meta: {
      title: '首页',
      requiresAuth: true,
      icon: 'HomeFilled'
    },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: loadView('Dashboard'),
        meta: {
          title: '仪表盘',
          icon: 'Monitor',
          affix: true
        }
      }
    ]
  },
  {
    path: '/404',
    name: '404',
    component: loadView('404'),
    meta: {
      title: '404页面',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: {
      hidden: true
    }
  }
]

// 动态路由：需要权限的路由
const asyncRoutes = [
  {
    path: '/system',
    name: 'system',
    component: () => import('../layout/Layout.vue'),
    meta: {
      title: '系统管理',
      requiresAuth: true,
      icon: 'Setting',
      alwaysShow: true
    },
    children: [
      {
        path: 'user',
        name: 'user',
        component: loadView('User'),
        meta: {
          title: '用户管理',
          icon: 'User',
          permissions: ['system:user:list']
        }
      },
      {
        path: 'role',
        name: 'role',
        component: loadView('Role'),
        meta: {
          title: '角色管理',
          icon: 'Avatar',
          permissions: ['system:role:list']
        }
      },
      {
        path: 'permission',
        name: 'permission',
        component: loadView('Permission'),
        meta: {
          title: '权限管理',
          icon: 'Lock',
          permissions: ['system:permission:list']
        }
      }
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    // 路由切换时滚动到顶部
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - Bing Admin` : 'Bing Admin'
  
  // 获取token
  const token = userStore.token
  
  // 不需要登录的页面
  if (!to.meta.requiresAuth) {
    if (token && to.path === '/login') {
      // 已登录用户访问登录页，重定向到首页
      next({ path: '/' })
    } else {
      next()
    }
    return
  }
  
  // 需要登录的页面
  if (!token) {
    // 未登录，重定向到登录页
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  
  // 已登录，检查用户信息
  if (!userStore.userInfo) {
    try {
      await userStore.getCurrentUser()
      // 用户信息获取成功后，重新导航到目标路由
      next({ ...to, replace: true })
    } catch (error) {
      // 获取用户信息失败，清除token并跳转到登录页
      userStore.logout()
      next({ path: '/login', query: { redirect: to.fullPath } })
    }
  } else {
    // 检查权限
    if (to.meta.permissions && to.meta.permissions.length > 0) {
      const hasPermission = userStore.userInfo.permissions?.some(permission => 
        to.meta.permissions.includes(permission)
      )
      if (hasPermission) {
        next()
      } else {
        next({ path: '/404' })
      }
    } else {
      next()
    }
  }
})

export default router

export { constantRoutes, asyncRoutes }