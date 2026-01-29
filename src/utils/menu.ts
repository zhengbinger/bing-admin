/**
 * 菜单工具函数
 * 提供菜单处理、权限检查、搜索等功能
 */

import type { MenuItem, MenuPermissionResult } from '../types/menu'

/**
 * 菜单工具类
 */
export class MenuUtils {
  /**
   * 根据权限过滤菜单
   */
  static filterMenusByPermission(
    menus: MenuItem[],
    permissions: string[],
    roles: string[]
  ): MenuItem[] {
    return menus.filter(menu => {
      // 检查菜单权限
      const permissionResult = this.checkMenuPermission(menu, permissions, roles)
      
      if (!permissionResult.accessible) {
        return false
      }

      // 递归过滤子菜单
      if (menu.children && menu.children.length > 0) {
        menu.children = this.filterMenusByPermission(menu.children, permissions, roles)
        
        // 如果子菜单全部被过滤掉，且当前菜单没有组件，则隐藏当前菜单
        if (menu.children.length === 0 && !menu.component && !menu.alwaysShow) {
          return false
        }
      }

      return true
    })
  }

  /**
   * 检查菜单权限
   */
  static checkMenuPermission(
    menu: MenuItem,
    permissions: string[],
    roles: string[]
  ): MenuPermissionResult {
    // 如果菜单被隐藏，直接返回无权限
    if (menu.hidden) {
      return {
        hasPermission: false,
        hasRole: false,
        accessible: false,
        reason: 'Menu is hidden'
      }
    }

    // 如果菜单被禁用，直接返回无权限
    if (menu.disabled) {
      return {
        hasPermission: false,
        hasRole: false,
        accessible: false,
        reason: 'Menu is disabled'
      }
    }

    // 检查权限
    let hasPermission = true
    if (menu.permissions && menu.permissions.length > 0) {
      hasPermission = menu.permissions.some(permission => 
        permissions.includes(permission) || permissions.includes('*')
      )
    }

    // 检查角色
    let hasRole = true
    if (menu.roles && menu.roles.length > 0) {
      hasRole = menu.roles.some(role => 
        roles.includes(role) || roles.includes('admin')
      )
    }

    const accessible = hasPermission && hasRole

    return {
      hasPermission,
      hasRole,
      accessible,
      reason: accessible ? undefined : 'Insufficient permissions or roles'
    }
  }

  /**
   * 搜索菜单
   */
  static searchMenus(menus: MenuItem[], keyword: string): MenuItem[] {
    if (!keyword.trim()) {
      return menus
    }

    const searchTerm = keyword.toLowerCase()
    const result: MenuItem[] = []
    
    for (const menu of menus) {
      const matchesTitle = menu.title.toLowerCase().includes(searchTerm)
      const matchesName = menu.name?.toLowerCase().includes(searchTerm)
      const matchesPath = menu.path.toLowerCase().includes(searchTerm)
      
      if (matchesTitle || matchesName || matchesPath) {
        // 如果当前菜单匹配，包含所有子菜单
        result.push(menu)
      } else if (menu.children && menu.children.length > 0) {
        // 递归搜索子菜单
        const filteredChildren = this.searchMenus(menu.children, keyword)
        if (filteredChildren.length > 0) {
          result.push({
            ...menu,
            children: filteredChildren
          })
        }
      }
    }
    
    return result
  }

  /**
   * 扁平化菜单
   */
  static flattenMenus(menus: MenuItem[]): MenuItem[] {
    const result: MenuItem[] = []
    
    const flatten = (items: MenuItem[]) => {
      items.forEach(item => {
        result.push(item)
        if (item.children && item.children.length > 0) {
          flatten(item.children)
        }
      })
    }
    
    flatten(menus)
    return result
  }

  /**
   * 构建菜单映射
   */
  static buildMenuMap(menus: MenuItem[]): Map<string, MenuItem> {
    const map = new Map<string, MenuItem>()
    
    const addToMap = (items: MenuItem[]) => {
      items.forEach(item => {
        map.set(item.path, item)
        if (item.name) {
          map.set(item.name, item)
        }
        if (item.children) {
          addToMap(item.children)
        }
      })
    }
    
    addToMap(menus)
    return map
  }

  /**
   * 获取菜单路径
   */
  static getMenuPath(menus: MenuItem[], targetPath: string): MenuItem[] {
    const path: MenuItem[] = []
    
    const findPath = (items: MenuItem[], target: string, currentPath: MenuItem[] = []): boolean => {
      for (const menu of items) {
        const newPath = [...currentPath, menu]
        
        if (menu.path === target) {
          path.push(...newPath)
          return true
        }
        
        if (menu.children && menu.children.length > 0) {
          if (findPath(menu.children, target, newPath)) {
            return true
          }
        }
      }
      return false
    }
    
    findPath(menus, targetPath)
    return path
  }

  /**
   * 获取活动菜单
   */
  static getActiveMenu(menus: MenuItem[], currentPath: string): string {
    const flatMenus = this.flattenMenus(menus)
    
    // 首先尝试精确匹配
    const exactMatch = flatMenus.find(menu => menu.path === currentPath)
    if (exactMatch) {
      return exactMatch.path
    }

    // 然后尝试前缀匹配（找到最长匹配的菜单）
    let bestMatch = ''
    let maxLength = 0
    
    for (const menu of flatMenus) {
      if (currentPath.startsWith(menu.path) && menu.path.length > maxLength) {
        bestMatch = menu.path
        maxLength = menu.path.length
      }
    }
    
    return bestMatch || currentPath
  }

  /**
   * 排序菜单
   */
  static sortMenus(menus: MenuItem[]): MenuItem[] {
    return menus.sort((a, b) => {
      const sortA = a.sort || 0
      const sortB = b.sort || 0
      
      if (sortA !== sortB) {
        return sortA - sortB
      }
      
      // 如果排序值相同，按标题排序
      return a.title.localeCompare(b.title)
    }).map(menu => ({
      ...menu,
      children: menu.children ? this.sortMenus(menu.children) : undefined
    }))
  }

  /**
   * 验证菜单结构
   */
  static validateMenuStructure(menus: MenuItem[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const paths = new Set<string>()
    
    const validate = (items: MenuItem[], level = 0) => {
      for (const menu of items) {
        // 检查必需字段
        if (!menu.path) {
          errors.push(`Menu at level ${level} missing path`)
        }
        if (!menu.title) {
          errors.push(`Menu "${menu.path}" missing title`)
        }
        
        // 检查路径唯一性
        if (menu.path && paths.has(menu.path)) {
          errors.push(`Duplicate path: ${menu.path}`)
        } else if (menu.path) {
          paths.add(menu.path)
        }
        
        // 检查路径格式
        if (menu.path && !menu.path.startsWith('/')) {
          errors.push(`Menu path "${menu.path}" should start with /`)
        }
        
        // 递归验证子菜单
        if (menu.children && menu.children.length > 0) {
          validate(menu.children, level + 1)
        }
      }
    }
    
    validate(menus)
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 获取菜单统计信息
   */
  static getMenuStats(menus: MenuItem[]) {
    let totalMenus = 0
    let visibleMenus = 0
    let hiddenMenus = 0
    let disabledMenus = 0
    let maxDepth = 0
    
    const analyze = (items: MenuItem[], depth = 1) => {
      maxDepth = Math.max(maxDepth, depth)
      
      for (const menu of items) {
        totalMenus++
        
        if (menu.hidden) {
          hiddenMenus++
        } else {
          visibleMenus++
        }
        
        if (menu.disabled) {
          disabledMenus++
        }
        
        if (menu.children && menu.children.length > 0) {
          analyze(menu.children, depth + 1)
        }
      }
    }
    
    analyze(menus)
    
    return {
      totalMenus,
      visibleMenus,
      hiddenMenus,
      disabledMenus,
      maxDepth
    }
  }
}

/**
 * 菜单常量
 */
export const MENU_CONSTANTS = {
  // 默认图标
  DEFAULT_ICON: 'Menu',
  
  // 菜单类型
  MENU_TYPES: {
    MENU: 'menu',
    BUTTON: 'button',
    API: 'api'
  } as const,
  
  // 徽章类型
  BADGE_TYPES: {
    PRIMARY: 'primary',
    SUCCESS: 'success',
    WARNING: 'warning',
    DANGER: 'danger',
    INFO: 'info'
  } as const,
  
  // 特殊路径
  SPECIAL_PATHS: {
    HOME: '/dashboard',
    LOGIN: '/login',
    NOT_FOUND: '/404',
    FORBIDDEN: '/403'
  } as const
}

/**
 * 导出默认实例
 */
export default MenuUtils