import request from '../utils/request'

/**
 * 角色API模块
 * 提供角色管理相关的接口
 */

// 获取角色列表
const getRoleList = () => {
  return request({
    url: '/roles',
    method: 'get'
  })
}

// 获取角色详情
const getRoleById = (id) => {
  return request({
    url: `/roles/detail/${id}`,
    method: 'get'
  })
}

// 创建角色
const createRole = (data) => {
  return request({
    url: '/roles',
    method: 'post',
    data
  })
}

// 更新角色
const updateRole = (id, data) => {
  return request({
    url: `/roles/${id}`,
    method: 'put',
    data
  })
}

// 删除角色
const deleteRole = (id) => {
  return request({
    url: `/roles/detail/${id}`,
    method: 'delete'
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
  getRoleList,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getPermissionsByRoleId,
  assignPermissionsToRole
}