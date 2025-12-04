import request from '../utils/request'

/**
 * 权限API模块
 * 提供权限管理相关的接口
 */

// 获取权限列表
const getPermissions = () => {
  return request({
    url: '/permissions',
    method: 'get'
  })
}

// 获取权限树
const getPermissionTree = () => {
  return request({
    url: '/permissions/tree',
    method: 'get'
  })
}

// 根据角色ID获取权限列表
const getPermissionsByRoleId = (roleId) => {
  return request({
    url: `/permissions/by-role/${roleId}`,
    method: 'get'
  })
}

// 为角色分配权限
const assignPermissionsToRole = (roleId, permissionIds) => {
  return request({
    url: `/permissions/assign-to-role/${roleId}`,
    method: 'post',
    data: permissionIds
  })
}

export default {
  getPermissions,
  getPermissionTree,
  getPermissionsByRoleId,
  assignPermissionsToRole
}