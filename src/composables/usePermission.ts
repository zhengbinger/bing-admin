/**
 * 权限检查组合式函数
 * 提供权限验证相关的功能
 */

import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

export function usePermission() {
  const userStore = useUserStore()

  // 获取当前用户权限列表
  const permissions = computed(() => {
    const user = userStore.userInfo
    if (!user) return []
    
    // 从用户角色中提取权限
    const rolePermissions = user.roles?.flatMap(role => role.permissions || []) || []
    
    // 如果用户信息中直接包含权限列表
    const userPermissions = (user as any).permissions || []
    
    // 合并去重
    return [...new Set([...rolePermissions, ...userPermissions])]
  })

  /**
   * 检查是否有指定权限
   * @param permission 权限代码
   * @returns 是否有权限
   */
  const hasPermission = (permission: string): boolean => {
    if (!userStore.isLogin) return false
    
    // 超级管理员拥有所有权限
    if (permissions.value.includes('*') || permissions.value.includes('admin:*')) {
      return true
    }
    
    return permissions.value.includes(permission)
  }

  /**
   * 检查是否有任意一个权限
   * @param permissionList 权限代码列表
   * @returns 是否有任意权限
   */
  const hasAnyPermission = (permissionList: string[]): boolean => {
    if (!userStore.isLogin) return false
    
    // 超级管理员拥有所有权限
    if (permissions.value.includes('*') || permissions.value.includes('admin:*')) {
      return true
    }
    
    return permissionList.some(permission => permissions.value.includes(permission))
  }

  /**
   * 检查是否有所有权限
   * @param permissionList 权限代码列表
   * @returns 是否有所有权限
   */
  const hasAllPermissions = (permissionList: string[]): boolean => {
    if (!userStore.isLogin) return false
    
    // 超级管理员拥有所有权限
    if (permissions.value.includes('*') || permissions.value.includes('admin:*')) {
      return true
    }
    
    return permissionList.every(permission => permissions.value.includes(permission))
  }

  /**
   * 检查是否有指定角色
   * @param role 角色代码
   * @returns 是否有角色
   */
  const hasRole = (role: string): boolean => {
    if (!userStore.isLogin) return false
    
    const user = userStore.userInfo
    if (!user || !user.roles) return false
    
    return user.roles.some(userRole => userRole.code === role)
  }

  /**
   * 检查是否有任意一个角色
   * @param roleList 角色代码列表
   * @returns 是否有任意角色
   */
  const hasAnyRole = (roleList: string[]): boolean => {
    if (!userStore.isLogin) return false
    
    const user = userStore.userInfo
    if (!user || !user.roles) return false
    
    return roleList.some(role => 
      user.roles!.some(userRole => userRole.code === role)
    )
  }

  /**
   * 检查是否有所有角色
   * @param roleList 角色代码列表
   * @returns 是否有所有角色
   */
  const hasAllRoles = (roleList: string[]): boolean => {
    if (!userStore.isLogin) return false
    
    const user = userStore.userInfo
    if (!user || !user.roles) return false
    
    return roleList.every(role => 
      user.roles!.some(userRole => userRole.code === role)
    )
  }

  /**
   * 检查是否是超级管理员
   * @returns 是否是超级管理员
   */
  const isSuperAdmin = computed(() => {
    return hasRole('super_admin') || hasPermission('*') || hasPermission('admin:*')
  })

  /**
   * 检查是否是管理员
   * @returns 是否是管理员
   */
  const isAdmin = computed(() => {
    return isSuperAdmin.value || hasRole('admin') || hasAnyRole(['super_admin', 'admin'])
  })

  /**
   * 获取用户角色列表
   * @returns 角色代码列表
   */
  const getUserRoles = computed(() => {
    const user = userStore.userInfo
    if (!user || !user.roles) return []
    
    return user.roles.map(role => role.code)
  })

  /**
   * 权限指令辅助函数
   * 用于 v-permission 指令
   * @param permission 权限代码或权限列表
   * @param mode 检查模式：'any' | 'all'
   * @returns 是否有权限
   */
  const checkPermission = (
    permission: string | string[], 
    mode: 'any' | 'all' = 'any'
  ): boolean => {
    if (typeof permission === 'string') {
      return hasPermission(permission)
    }
    
    if (Array.isArray(permission)) {
      return mode === 'any' 
        ? hasAnyPermission(permission)
        : hasAllPermissions(permission)
    }
    
    return false
  }

  /**
   * 角色指令辅助函数
   * 用于 v-role 指令
   * @param role 角色代码或角色列表
   * @param mode 检查模式：'any' | 'all'
   * @returns 是否有角色
   */
  const checkRole = (
    role: string | string[], 
    mode: 'any' | 'all' = 'any'
  ): boolean => {
    if (typeof role === 'string') {
      return hasRole(role)
    }
    
    if (Array.isArray(role)) {
      return mode === 'any' 
        ? hasAnyRole(role)
        : hasAllRoles(role)
    }
    
    return false
  }

  return {
    // 权限列表
    permissions,
    
    // 权限检查
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // 角色检查
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // 特殊角色
    isSuperAdmin,
    isAdmin,
    
    // 用户信息
    getUserRoles,
    
    // 指令辅助
    checkPermission,
    checkRole
  }
}

// 权限指令
export const permissionDirective = {
  mounted(el: HTMLElement, binding: any) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()
    
    const { value, modifiers } = binding
    let hasAuth = false
    
    if (typeof value === 'string') {
      hasAuth = hasPermission(value)
    } else if (Array.isArray(value)) {
      hasAuth = modifiers.all 
        ? hasAllPermissions(value)
        : hasAnyPermission(value)
    }
    
    if (!hasAuth) {
      el.style.display = 'none'
      // 或者移除元素
      // el.parentNode?.removeChild(el)
    }
  },
  
  updated(el: HTMLElement, binding: any) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()
    
    const { value, modifiers } = binding
    let hasAuth = false
    
    if (typeof value === 'string') {
      hasAuth = hasPermission(value)
    } else if (Array.isArray(value)) {
      hasAuth = modifiers.all 
        ? hasAllPermissions(value)
        : hasAnyPermission(value)
    }
    
    el.style.display = hasAuth ? '' : 'none'
  }
}

// 角色指令
export const roleDirective = {
  mounted(el: HTMLElement, binding: any) {
    const { hasRole, hasAnyRole, hasAllRoles } = usePermission()
    
    const { value, modifiers } = binding
    let hasAuth = false
    
    if (typeof value === 'string') {
      hasAuth = hasRole(value)
    } else if (Array.isArray(value)) {
      hasAuth = modifiers.all 
        ? hasAllRoles(value)
        : hasAnyRole(value)
    }
    
    if (!hasAuth) {
      el.style.display = 'none'
    }
  },
  
  updated(el: HTMLElement, binding: any) {
    const { hasRole, hasAnyRole, hasAllRoles } = usePermission()
    
    const { value, modifiers } = binding
    let hasAuth = false
    
    if (typeof value === 'string') {
      hasAuth = hasRole(value)
    } else if (Array.isArray(value)) {
      hasAuth = modifiers.all 
        ? hasAllRoles(value)
        : hasAnyRole(value)
    }
    
    el.style.display = hasAuth ? '' : 'none'
  }
}