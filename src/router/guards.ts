/**
 * 路由守卫
 */

import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '../store/modules/auth'
import { ElMessage } from 'element-plus'

// 白名单路由（不需要认证）
const whiteList = ['/login', '/register', '/forgot-password', '/404', '/403']

/**
 * 认证守卫
 */
export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> => {
  const authStore = useAuthStore()

  // 白名单路由直接放行
  if (whiteList.includes(to.path)) {
    next()
    return
  }

  // 检查是否有token
  if (!authStore.token) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 检查token是否过期
  if (authStore.isTokenExpired) {
    try {
      // 尝试刷新token
      await authStore.refreshAuthToken()
    } catch (error) {
      // 刷新失败，清除认证数据并重定向到登录页
      authStore.clearAuthData()
      ElMessage.warning('会话已过期，请重新登录')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // 检查是否有用户信息
  if (!authStore.user) {
    try {
      await authStore.getCurrentUser()
    } catch (error) {
      // 获取用户信息失败，重定向到登录页
      authStore.clearAuthData()
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // 验证通过，允许访问
  next()
}

/**
 * 权限守卫
 */
export const permissionGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> => {
  const authStore = useAuthStore()

  // 检查路由是否需要特定权限
  const requiredPermissions = to.meta?.permissions as string[]
  const requiredRoles = to.meta?.roles as string[]

  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = authStore.checkAnyPermission(requiredPermissions)
    if (!hasPermission) {
      ElMessage.error('您没有访问该页面的权限')
      next('/403')
      return
    }
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = authStore.checkAnyRole(requiredRoles)
    if (!hasRole) {
      ElMessage.error('您没有访问该页面的权限')
      next('/403')
      return
    }
  }

  next()
}

/**
 * 设置路由守卫
 */
export const setupRouterGuards = (router: Router): void => {
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    // 先执行认证守卫
    await authGuard(to, from, (result) => {
      if (result === undefined) {
        // 认证通过，继续执行权限守卫
        permissionGuard(to, from, next)
      } else {
        // 认证失败，直接执行结果
        next(result)
      }
    })
  })

  // 全局后置钩子
  router.afterEach((to) => {
    // 设置页面标题
    document.title = (to.meta?.title as string) || 'Bing Admin'
  })
}