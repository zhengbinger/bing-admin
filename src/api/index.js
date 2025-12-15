/**
 * API模块索引
 * 统一导出所有API模块
 */

import authApi from './auth'
import userApi from './user'
import roleApi from './role'
import permissionApi from './permission'
import organizationApi from './organization'
import systemConfigApi from './systemConfig'
import dataDictApi from './dataDict'
import loginRecordApi from './loginRecord'
import whiteListApi from './whiteList'
import captchaApi from './captcha'
import cacheApi from './cache'
import auditLogApi from './auditLog'
import wechatApi from './wechat'
import thirdPartyUserApi from './thirdPartyUser'
import userOrganizationApi from './userOrganization'

// 导出所有API
export default {
  auth: authApi,
  user: userApi,
  role: roleApi,
  permission: permissionApi,
  organization: organizationApi,
  systemConfig: systemConfigApi,
  dataDict: dataDictApi,
  loginRecord: loginRecordApi,
  whiteList: whiteListApi,
  captcha: captchaApi,
  cache: cacheApi,
  auditLog: auditLogApi,
  wechat: wechatApi,
  thirdPartyUser: thirdPartyUserApi,
  userOrganization: userOrganizationApi
}
