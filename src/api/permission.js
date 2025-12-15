import request from '../utils/request'

/**
 * 权限管理API模块
 * 提供权限CRUD操作、权限树等接口
 */

// 获取权限列表
const getList = (params) => {
  return request({
    url: '/api/permissions/list',
    method: 'get',
    params
  })
}

// 获取权限详情
const getDetail = (id) => {
  return request({
    url: `/api/permissions/${id}`,
    method: 'get'
  })
}

// 获取权限树
const getTree = () => {
  return request({
    url: '/api/permissions/tree',
    method: 'get'
  })
}

// 创建权限
const create = (data) => {
  return request({
    url: '/api/permissions',
    method: 'post',
    data
  })
}

// 更新权限
const update = (id, data) => {
  return request({
    url: `/api/permissions/${id}`,
    method: 'put',
    data
  })
}

// 删除权限
const deletePermission = (id) => {
  return request({
    url: `/api/permissions/${id}`,
    method: 'delete'
  })
}

// 批量删除权限
const batchDelete = (ids) => {
  return request({
    url: '/api/permissions/batch',
    method: 'delete',
    data: { ids }
  })
}

// 获取用户权限
const getUserPermissions = (userId) => {
  return request({
    url: `/api/permissions/user/${userId}`,
    method: 'get'
  })
}

// 获取角色权限
const getRolePermissions = (roleId) => {
  return request({
    url: `/api/permissions/role/${roleId}`,
    method: 'get'
  })
}

// 修改权限状态
const updateStatus = (id, status) => {
  return request({
    url: `/api/permissions/${id}/status`,
    method: 'put',
    data: { status }
  })
}

const permissionApi = {
  getList,
  getDetail,
  getTree,
  create,
  update,
  delete: deletePermission,
  batchDelete,
  getUserPermissions,
  getRolePermissions,
  updateStatus
}

export default permissionApi