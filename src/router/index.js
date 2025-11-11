import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Layout from '../layout/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { title: '登录' }
    },
    {
      path: '/',
      name: 'layout',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: { title: '首页', requiresAuth: true }
        },
        {
          path: 'user',
          name: 'user',
          component: () => import('../views/User.vue'),
          meta: { title: '用户管理', requiresAuth: true }
        },
        {
          path: 'role',
          name: 'role',
          component: () => import('../views/Role.vue'),
          meta: { title: '角色管理', requiresAuth: true }
        },
        {
          path: 'permission',
          name: 'permission',
          component: () => import('../views/Permission.vue'),
          meta: { title: '权限管理', requiresAuth: true }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || 'Bing Admin'} - 后台管理系统`
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (token) {
      next()
    } else {
      next({ name: 'login' })
    }
  } else {
    next()
  }
})

export default router