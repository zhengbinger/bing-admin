/**
 * API模块索引
 * 统一导出所有API模块
 */

import userApi from './user'
import roleApi from './role'
import permissionApi from './permission'
import organizationApi from './organization'
import systemConfigApi from './systemConfig'
import dataDictApi from './dataDict'
import loginRecordApi from './loginRecord'
import whiteListApi from './whiteList'

// 导出所有API
export default {
  user: userApi,
  role: roleApi,
  permission: permissionApi,
  organization: organizationApi,
  systemConfig: systemConfigApi,
  dataDict: dataDictApi,
  loginRecord: loginRecordApi,
  whiteList: whiteListApi
}
