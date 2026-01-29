/**
 * 菜单相关类型定义
 */

// 菜单项接口
export interface MenuItem {
  id?: number
  path: string
  name?: string
  title: string
  icon?: string
  component?: string
  redirect?: string
  hidden?: boolean
  disabled?: boolean
  alwaysShow?: boolean
  noCache?: boolean
  affix?: boolean
  badge?: string | number
  badgeType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  isNew?: boolean
  sort?: number
  children?: MenuItem[]
  meta?: MenuMeta
  permissions?: string[]
  roles?: string[]
}

// 菜单元信息
export interface MenuMeta {
  title: string
  icon?: string
  hidden?: boolean
  disabled?: boolean
  noCache?: boolean
  affix?: boolean
  activeMenu?: string
  breadcrumb?: boolean
  permissions?: string[]
  roles?: string[]
  [key: string]: any
}

// 菜单配置
export interface MenuConfig {
  id: number
  parentId: number | null
  name: string
  title: string
  path: string
  component?: string
  redirect?: string
  icon?: string
  type: 'menu' | 'button' | 'api'
  sort: number
  status: number
  hidden: boolean
  permissions?: string[]
  roles?: string[]
  createTime: Date
  updateTime: Date
  children?: MenuConfig[]
}

// 菜单树节点
export interface MenuTreeNode extends MenuConfig {
  children: MenuTreeNode[]
  level: number
  hasChildren: boolean
  expanded?: boolean
  selected?: boolean
  disabled?: boolean
}

// 菜单查询参数
export interface MenuQueryParams {
  name?: string
  title?: string
  type?: 'menu' | 'button' | 'api'
  status?: number
  parentId?: number | null
}

// 菜单创建请求
export interface CreateMenuRequest {
  parentId?: number | null
  name: string
  title: string
  path: string
  component?: string
  redirect?: string
  icon?: string
  type: 'menu' | 'button' | 'api'
  sort: number
  status: number
  hidden: boolean
  permissions?: string[]
  roles?: string[]
}

// 菜单更新请求
export interface UpdateMenuRequest {
  name?: string
  title?: string
  path?: string
  component?: string
  redirect?: string
  icon?: string
  type?: 'menu' | 'button' | 'api'
  sort?: number
  status?: number
  hidden?: boolean
  permissions?: string[]
  roles?: string[]
}

// 菜单权限检查结果
export interface MenuPermissionResult {
  hasPermission: boolean
  hasRole: boolean
  accessible: boolean
  reason?: string
}