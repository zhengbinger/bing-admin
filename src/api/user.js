import request from '@/utils/request'

/**
 * 用户API模块
 * 提供用户登录、获取用户信息、用户管理等接口
 */

// 登录
const login = (data) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 退出登录
const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

// 获取当前用户信息
const getCurrentUser = () => {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// 获取用户列表
const getUserList = (params) => {
  return request({
    url: '/user/list',
    method: 'get',
    params
  })
}

// 创建用户
const createUser = (data) => {
  return request({
    url: '/user/create',
    method: 'post',
    data
  })
}

// 更新用户
const updateUser = (id, data) => {
  return request({
    url: `/user/`,
    method: 'put',
    data: { ...data, id }
  })
}

// 删除用户
const deleteUser = (id) => {
  return request({
    url: `/user/detail/${id}`,
    method: 'delete'
  })
}

// 批量删除用户
const batchDeleteUser = (ids) => {
  return request({
    url: '/user/batch',
    method: 'delete',
    data: ids
  })
}

// 获取用户菜单树
const getUserMenuTree = () => {
  return request({
    url: '/user/menu_tree',
    method: 'get'
  })
}

// 重置用户密码
const resetPassword = (id, data) => {
  return request({
    url: `/user/${id}/password`,
    method: 'put',
    data
  })
}

export default {
  login,
  logout,
  getCurrentUser,
  getUserMenuTree,
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  batchDeleteUser,
  resetPassword
}
