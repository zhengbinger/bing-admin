/**
 * API模块索引
 * 统一导出所有API模块
 */

import userApi from './user'
import roleApi from './role'
import permissionApi from './permission'

// 导出所有API
export default {
  user: userApi,
  role: roleApi,
  permission: permissionApi
}
