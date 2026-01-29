import request from '../utils/request'

/**
 * 角色管理API模块
 * 提供角色CRUD操作、权限分配等接口
 */

// 获取角色列表
const getList = (params) => {
  return request({
    url: '/api/roles/list',
    method: 'get',
    params
  })
}

// 获取角色详情
const getDetail = (id) => {
  return request({
    url: `/api/roles/${id}`,
    method: 'get'
  })
}

// 创建角色
const create = (data) => {
  return request({
    url: '/api/roles',
    method: 'post',
    data
  })
}

// 更新角色
const update = (id, data) => {
  return request({
    url: `/api/roles/${id}`,
    method: 'put',
    data
  })
}

// 删除角色
const deleteRole = (id) => {
  return request({
    url: `/api/roles/${id}`,
    method: 'delete'
  })
}

// 批量删除角色
const batchDelete = (ids) => {
  return request({
    url: '/api/roles/batch',
    method: 'delete',
    data: { ids }
  })
}

// 获取角色权限
const getPermissions = (roleId) => {
  return request({
    url: `/api/roles/${roleId}/permissions`,
    method: 'get'
  })
}

// 分配角色权限
const assignPermissions = (roleId, permissionIds) => {
  return request({
    url: `/api/roles/${roleId}/permissions`,
    method: 'put',
    data: { permissionIds }
  })
}

// 获取角色用户列表
const getUsers = (roleId) => {
  return request({
    url: `/api/roles/${roleId}/users`,
    method: 'get'
  })
}

// 修改角色状态
const updateStatus = (id, status) => {
  return request({
    url: `/api/roles/${id}/status`,
    method: 'put',
    data: { status }
  })
}

const roleApi = {
  getList,
  getDetail,
  create,
  update,
  delete: deleteRole,
  batchDelete,
  getPermissions,
  assignPermissions,
  getUsers,
  updateStatus
}

export default roleApi