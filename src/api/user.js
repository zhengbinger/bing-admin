import request from '../utils/request'

/**
 * 用户管理API模块
 * 提供用户CRUD操作、权限管理等接口
 * 注意：认证相关接口（登录、登出等）已移至 auth.js
 */

// 获取用户列表
const getList = (params) => {
  return request({
    url: '/api/user/list',
    method: 'get',
    params
  })
}

// 获取用户详情
const getDetail = (id) => {
  return request({
    url: `/api/user/${id}`,
    method: 'get'
  })
}

// 创建用户
const create = (data) => {
  return request({
    url: '/api/user',
    method: 'post',
    data
  })
}

// 更新用户
const update = (id, data) => {
  return request({
    url: `/api/user/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
const deleteUser = (id) => {
  return request({
    url: `/api/user/${id}`,
    method: 'delete'
  })
}

// 批量删除用户
const batchDelete = (ids) => {
  return request({
    url: '/api/user/batch',
    method: 'delete',
    data: { ids }
  })
}

// 获取用户菜单树
const getMenuTree = () => {
  return request({
    url: '/api/user/menu-tree',
    method: 'get'
  })
}

// 重置用户密码
const resetPassword = (id, data) => {
  return request({
    url: `/api/user/${id}/reset-password`,
    method: 'put',
    data
  })
}

// 修改用户状态
const updateStatus = (id, status) => {
  return request({
    url: `/api/user/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 获取用户权限
const getPermissions = (id) => {
  return request({
    url: `/api/user/${id}/permissions`,
    method: 'get'
  })
}

// 分配用户角色
const assignRoles = (id, roleIds) => {
  return request({
    url: `/api/user/${id}/roles`,
    method: 'put',
    data: { roleIds }
  })
}

const userApi = {
  getList,
  getDetail,
  create,
  update,
  delete: deleteUser,
  batchDelete,
  getMenuTree,
  resetPassword,
  updateStatus,
  getPermissions,
  assignRoles
}

export default userApi
