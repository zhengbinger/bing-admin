/**
 * 菜单状态管理
 * 管理菜单数据、权限过滤、动态路由生成等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuItem, MenuConfig, MenuPermissionResult } from '../../types/menu'
import { MenuUtils } from '../../utils/menu'

// 默认菜单配置
const DEFAULT_MENUS: MenuItem[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    title: '仪表盘',
    icon: 'Dashboard',
    component: 'Dashboard',
    meta: {
      title: '仪表盘',
      icon: 'Dashboard',
      affix: true
    }
  },
  {
    path: '/system',
    name: 'System',
    title: '系统管理',
    icon: 'Setting',
    redirect: '/system/user',
    meta: {
      title: '系统管理',
      icon: 'Setting'
    },
    children: [
      {
        path: '/system/user',
        name: 'SystemUser',
        title: '用户管理',
        icon: 'User',
        component: 'system/User',
        meta: {
          title: '用户管理',
          icon: 'User'
        },
        permissions: ['system:user:list']
      },
      {
        path: '/system/role',
        name: 'SystemRole',
        title: '角色管理',
        icon: 'UserFilled',
        component: 'system/Role',
        meta: {
          title: '角色管理',
          icon: 'UserFilled'
        },
        permissions: ['system:role:list']
      },
      {
        path: '/system/organization',
        name: 'SystemOrganization',
        title: '组织管理',
        icon: 'OfficeBuilding',
        component: 'system/Organization',
        meta: {
          title: '组织管理',
          icon: 'OfficeBuilding'
        },
        permissions: ['system:organization:list']
      },
      {
        path: '/system/permission',
        name: 'SystemPermission',
        title: '权限管理',
        icon: 'Lock',
        component: 'system/Permission',
        meta: {
          title: '权限管理',
          icon: 'Lock'
        },
        permissions: ['system:permission:list']
      }
    ]
  },
  {
    path: '/config',
    name: 'Config',
    title: '系统配置',
    icon: 'Tools',
    redirect: '/config/system',
    meta: {
      title: '系统配置',
      icon: 'Tools'
    },
    children: [
      {
        path: '/config/system',
        name: 'ConfigSystem',
        title: '系统配置',
        icon: 'Setting',
        component: 'config/System',
        meta: {
          title: '系统配置',
          icon: 'Setting'
        },
        permissions: ['config:system:list']
      },
      {
        path: '/config/dictionary',
        name: 'ConfigDictionary',
        title: '数据字典',
        icon: 'Collection',
        component: 'config/Dictionary',
        meta: {
          title: '数据字典',
          icon: 'Collection'
        },
        permissions: ['config:dictionary:list']
      }
    ]
  },
  {
    path: '/monitor',
    name: 'Monitor',
    title: '系统监控',
    icon: 'Monitor',
    redirect: '/monitor/audit',
    meta: {
      title: '系统监控',
      icon: 'Monitor'
    },
    children: [
      {
        path: '/monitor/audit',
        name: 'MonitorAudit',
        title: '审计日志',
        icon: 'Document',
        component: 'monitor/Audit',
        meta: {
          title: '审计日志',
          icon: 'Document'
        },
        permissions: ['monitor:audit:list']
      },
      {
        path: '/monitor/login',
        name: 'MonitorLogin',
        title: '登录记录',
        icon: 'Key',
        component: 'monitor/Login',
        meta: {
          title: '登录记录',
          icon: 'Key'
        },
        permissions: ['monitor:login:list']
      },
      {
        path: '/monitor/cache',
        name: 'MonitorCache',
        title: '缓存管理',
        icon: 'Coin',
        component: 'monitor/Cache',
        meta: {
          title: '缓存管理',
          icon: 'Coin'
        },
        permissions: ['monitor:cache:list']
      }
    ]
  },
  {
    path: '/security',
    name: 'Security',
    title: '安全管理',
    icon: 'Lock',
    redirect: '/security/whitelist',
    meta: {
      title: '安全管理',
      icon: 'Lock'
    },
    children: [
      {
        path: '/security/whitelist',
        name: 'SecurityWhitelist',
        title: '白名单管理',
        icon: 'List',
        component: 'security/Whitelist',
        meta: {
          title: '白名单管理',
          icon: 'List'
        },
        permissions: ['security:whitelist:list']
      },
      {
        path: '/security/captcha',
        name: 'SecurityCaptcha',
        title: '验证码管理',
        icon: 'PictureRounded',
        component: 'security/Captcha',
        meta: {
          title: '验证码管理',
          icon: 'PictureRounded'
        },
        permissions: ['security:captcha:list']
      }
    ]
  },
  {
    path: '/integration',
    name: 'Integration',
    title: '第三方集成',
    icon: 'Connection',
    redirect: '/integration/wechat',
    meta: {
      title: '第三方集成',
      icon: 'Connection'
    },
    children: [
      {
        path: '/integration/wechat',
        name: 'IntegrationWechat',
        title: '微信管理',
        icon: 'ChatDotRound',
        component: 'integration/Wechat',
        meta: {
          title: '微信管理',
          icon: 'ChatDotRound'
        },
        permissions: ['integration:wechat:list']
      },
      {
        path: '/integration/third-party',
        name: 'IntegrationThirdParty',
        title: '第三方用户',
        icon: 'Avatar',
        component: 'integration/ThirdParty',
        meta: {
          title: '第三方用户',
          icon: 'Avatar'
        },
        permissions: ['integration:third-party:list']
      }
    ]
  }
]

/**
 * 菜单Store
 */
export const useMenuStore = defineStore('menu', () => {
  // 状态
  const menus = ref<MenuItem[]>([])
  const accessibleMenus = ref<MenuItem[]>([])
  const flatMenus = ref<MenuItem[]>([])
  const isLoading = ref(false)

  // 计算属性
  const menuMap = computed(() => MenuUtils.buildMenuMap(accessibleMenus.value))

  // 菜单统计信息
  const menuStats = computed(() => ({
    ...MenuUtils.getMenuStats(menus.value),
    accessibleCount: accessibleMenus.value.length,
    flatCount: flatMenus.value.length,
    isLoading: isLoading.value
  }))

  // 初始化菜单
  const initializeMenus = (): void => {
    menus.value = MenuUtils.sortMenus(DEFAULT_MENUS)
  }

  // 生成可访问的菜单
  const generateMenus = async (permissions: string[], roles: string[]): Promise<void> => {
    try {
      isLoading.value = true
      
      // 过滤菜单权限
      const filteredMenus = MenuUtils.filterMenusByPermission(menus.value, permissions, roles)
      
      // 设置可访问菜单
      accessibleMenus.value = filteredMenus
      
      // 生成扁平化菜单
      flatMenus.value = MenuUtils.flattenMenus(filteredMenus)
      
    } catch (error) {
      console.error('生成菜单失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 根据权限过滤菜单
  const filterMenusByPermission = (
    menuList: MenuItem[],
    permissions: string[],
    roles: string[]
  ): MenuItem[] => {
    return MenuUtils.filterMenusByPermission(menuList, permissions, roles)
  }

  // 检查菜单权限
  const checkMenuPermission = (
    menu: MenuItem,
    permissions: string[],
    roles: string[]
  ): MenuPermissionResult => {
    return MenuUtils.checkMenuPermission(menu, permissions, roles)
  }

  // 扁平化菜单
  const flattenMenus = (menuList: MenuItem[]): MenuItem[] => {
    return MenuUtils.flattenMenus(menuList)
  }

  // 根据路径查找菜单
  const findMenuByPath = (path: string): MenuItem | undefined => {
    return menuMap.value.get(path)
  }

  // 根据名称查找菜单
  const findMenuByName = (name: string): MenuItem | undefined => {
    return flatMenus.value.find(menu => menu.name === name)
  }

  // 搜索菜单
  const searchMenus = (keyword: string): MenuItem[] => {
    return MenuUtils.searchMenus(accessibleMenus.value, keyword)
  }

  // 获取菜单路径
  const getMenuPath = (menuPath: string): MenuItem[] => {
    return MenuUtils.getMenuPath(accessibleMenus.value, menuPath)
  }

  // 获取活动菜单
  const getActiveMenu = (currentPath: string): string => {
    return MenuUtils.getActiveMenu(accessibleMenus.value, currentPath)
  }

  // 获取菜单面包屑
  const getMenuBreadcrumb = (path: string): MenuItem[] => {
    return MenuUtils.getMenuPath(accessibleMenus.value, path)
  }

  // 验证菜单结构
  const validateMenus = () => {
    return MenuUtils.validateMenuStructure(menus.value)
  }

  // 获取菜单统计信息
  const getMenuStats = () => menuStats.value

  // 重置菜单状态
  const resetMenus = (): void => {
    menus.value = []
    accessibleMenus.value = []
    flatMenus.value = []
    isLoading.value = false
  }

  // 初始化默认菜单
  initializeMenus()

  return {
    // 状态
    menus,
    accessibleMenus,
    flatMenus,
    isLoading,

    // 计算属性
    menuMap,
    menuStats,

    // 方法
    generateMenus,
    checkMenuPermission,
    findMenuByPath,
    findMenuByName,
    getMenuBreadcrumb,
    searchMenus,
    getMenuPath,
    getActiveMenu,
    validateMenus,
    getMenuStats,
    resetMenus
  }
})