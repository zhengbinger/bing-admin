/**
 * 权限检查工具
 * 提供各种权限检查和验证功能
 */

import { useAuthStore } from '../store/modules/auth'

/**
 * 权限检查类
 */
export class PermissionChecker {
  private authStore = useAuthStore()

  /**
   * 检查单个权限
   */
  hasPermission(permission: string): boolean {
    return this.authStore.checkPermission(permission)
  }

  /**
   * 检查多个权限（AND逻辑）
   */
  hasPermissions(permissions: string[]): boolean {
    return this.authStore.checkPermissions(permissions)
  }

  /**
   * 检查多个权限（OR逻辑）
   */
  hasAnyPermission(permissions: string[]): boolean {
    return this.authStore.checkAnyPermission(permissions)
  }

  /**
   * 检查单个角色
   */
  hasRole(role: string): boolean {
    return this.authStore.checkRole(role)
  }

  /**
   * 检查多个角色（AND逻辑）
   */
  hasRoles(roles: string[]): boolean {
    return this.authStore.checkRoles(roles)
  }

  /**
   * 检查多个角色（OR逻辑）
   */
  hasAnyRole(roles: string[]): boolean {
    return this.authStore.checkAnyRole(roles)
  }

  /**
   * 检查是否为管理员
   */
  isAdmin(): boolean {
    return this.hasRole('admin') || this.hasPermission('*')
  }

  /**
   * 检查是否为超级管理员
   */
  isSuperAdmin(): boolean {
    return this.hasRole('super_admin') || this.hasPermission('super_admin')
  }

  /**
   * 检查复合权限条件
   */
  checkComplexPermission(condition: {
    permissions?: string[]
    roles?: string[]
    permissionMode?: 'all' | 'any'
    roleMode?: 'all' | 'any'
    operator?: 'and' | 'or'
  }): boolean {
    const { permissions, roles, permissionMode = 'all', roleMode = 'all', operator = 'and' } = condition

    let permissionResult = true
    let roleResult = true

    // 检查权限
    if (permissions && permissions.length > 0) {
      permissionResult = permissionMode === 'any' 
        ? this.hasAnyPermission(permissions)
        : this.hasPermissions(permissions)
    }

    // 检查角色
    if (roles && roles.length > 0) {
      roleResult = roleMode === 'any'
        ? this.hasAnyRole(roles)
        : this.hasRoles(roles)
    }

    // 根据操作符返回结果
    return operator === 'or' ? (permissionResult || roleResult) : (permissionResult && roleResult)
  }

  /**
   * 检查资源权限
   */
  checkResourcePermission(resource: string, action: string): boolean {
    const permission = `${resource}:${action}`
    return this.hasPermission(permission)
  }

  /**
   * 检查菜单权限
   */
  checkMenuPermission(menuCode: string): boolean {
    return this.hasPermission(`menu:${menuCode}`) || this.hasPermission('menu:*')
  }

  /**
   * 检查按钮权限
   */
  checkButtonPermission(buttonCode: string): boolean {
    return this.hasPermission(`button:${buttonCode}`) || this.hasPermission('button:*')
  }

  /**
   * 检查API权限
   */
  checkApiPermission(apiPath: string, method: string = 'GET'): boolean {
    const permission = `api:${method.toUpperCase()}:${apiPath}`
    return this.hasPermission(permission) || this.hasPermission('api:*')
  }

  /**
   * 检查数据权限
   */
  checkDataPermission(dataType: string, operation: string): boolean {
    const permission = `data:${dataType}:${operation}`
    return this.hasPermission(permission)
  }

  /**
   * 检查组织权限
   */
  checkOrganizationPermission(orgId: number): boolean {
    const userOrgs = this.authStore.user?.organizations || []
    return userOrgs.some(org => org.id === orgId) || this.isAdmin()
  }

  /**
   * 获取用户权限列表
   */
  getUserPermissions(): string[] {
    return this.authStore.permissions
  }

  /**
   * 获取用户角色列表
   */
  getUserRoles(): string[] {
    return this.authStore.userRoles
  }

  /**
   * 检查权限是否过期
   */
  isPermissionExpired(): boolean {
    return this.authStore.isTokenExpired
  }
}

// 创建全局权限检查器实例
export const permissionChecker = new PermissionChecker()

/**
 * Vue组合式API权限检查
 */
export function usePermission() {
  const authStore = useAuthStore()

  return {
    hasPermission: (permission: string) => authStore.checkPermission(permission),
    hasPermissions: (permissions: string[]) => authStore.checkPermissions(permissions),
    hasAnyPermission: (permissions: string[]) => authStore.checkAnyPermission(permissions),
    hasRole: (role: string) => authStore.checkRole(role),
    hasRoles: (roles: string[]) => authStore.checkRoles(roles),
    hasAnyRole: (roles: string[]) => authStore.checkAnyRole(roles),
    isAdmin: () => permissionChecker.isAdmin(),
    isSuperAdmin: () => permissionChecker.isSuperAdmin(),
    checkComplexPermission: (condition: Parameters<typeof permissionChecker.checkComplexPermission>[0]) => 
      permissionChecker.checkComplexPermission(condition),
    checkResourcePermission: (resource: string, action: string) => 
      permissionChecker.checkResourcePermission(resource, action),
    checkMenuPermission: (menuCode: string) => permissionChecker.checkMenuPermission(menuCode),
    checkButtonPermission: (buttonCode: string) => permissionChecker.checkButtonPermission(buttonCode),
    checkApiPermission: (apiPath: string, method?: string) => 
      permissionChecker.checkApiPermission(apiPath, method),
    checkDataPermission: (dataType: string, operation: string) => 
      permissionChecker.checkDataPermission(dataType, operation),
    checkOrganizationPermission: (orgId: number) => permissionChecker.checkOrganizationPermission(orgId),
    getUserPermissions: () => permissionChecker.getUserPermissions(),
    getUserRoles: () => permissionChecker.getUserRoles(),
    isPermissionExpired: () => permissionChecker.isPermissionExpired()
  }
}

/**
 * 权限指令工具
 */
export const createPermissionDirective = () => {
  return {
    mounted(el: HTMLElement, binding: any) {
      const { value, modifiers } = binding
      
      if (!value) return

      let hasPermission = false

      if (typeof value === 'string') {
        // 单个权限
        hasPermission = permissionChecker.hasPermission(value)
      } else if (Array.isArray(value)) {
        // 多个权限
        hasPermission = modifiers.any 
          ? permissionChecker.hasAnyPermission(value)
          : permissionChecker.hasPermissions(value)
      } else if (typeof value === 'object') {
        // 复合权限条件
        hasPermission = permissionChecker.checkComplexPermission(value)
      }

      if (!hasPermission) {
        // 移除元素或隐藏元素
        if (modifiers.hide) {
          el.style.display = 'none'
        } else {
          el.parentNode?.removeChild(el)
        }
      }
    },

    updated(el: HTMLElement, binding: any) {
      // 权限变化时重新检查
      this.mounted(el, binding)
    }
  }
}

/**
 * 权限验证装饰器（用于类方法）
 */
export function RequirePermission(permission: string | string[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const hasPermission = Array.isArray(permission)
        ? permissionChecker.hasPermissions(permission)
        : permissionChecker.hasPermission(permission)

      if (!hasPermission) {
        throw new Error(`权限不足: 需要权限 ${Array.isArray(permission) ? permission.join(', ') : permission}`)
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 角色验证装饰器（用于类方法）
 */
export function RequireRole(role: string | string[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const hasRole = Array.isArray(role)
        ? permissionChecker.hasRoles(role)
        : permissionChecker.hasRole(role)

      if (!hasRole) {
        throw new Error(`角色不足: 需要角色 ${Array.isArray(role) ? role.join(', ') : role}`)
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 权限常量
 */
export const PERMISSIONS = {
  // 用户管理
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_EXPORT: 'user:export',
  USER_IMPORT: 'user:import',

  // 角色管理
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_ASSIGN: 'role:assign',

  // 权限管理
  PERMISSION_VIEW: 'permission:view',
  PERMISSION_CREATE: 'permission:create',
  PERMISSION_UPDATE: 'permission:update',
  PERMISSION_DELETE: 'permission:delete',

  // 组织管理
  ORG_VIEW: 'organization:view',
  ORG_CREATE: 'organization:create',
  ORG_UPDATE: 'organization:update',
  ORG_DELETE: 'organization:delete',

  // 系统配置
  CONFIG_VIEW: 'config:view',
  CONFIG_UPDATE: 'config:update',

  // 审计日志
  AUDIT_VIEW: 'audit:view',
  AUDIT_EXPORT: 'audit:export',

  // 系统管理
  SYSTEM_MONITOR: 'system:monitor',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_RESTORE: 'system:restore'
} as const

/**
 * 角色常量
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest'
} as const