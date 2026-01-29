import request from '../utils/request'

/**
 * 组织管理API模块
 * 提供组织CRUD操作、组织树等接口
 */

// 获取组织列表
const getList = (params) => {
  return request({
    url: '/api/organization/list',
    method: 'get',
    params
  })
}

// 获取组织详情
const getDetail = (id) => {
  return request({
    url: `/api/organization/${id}`,
    method: 'get'
  })
}

// 获取组织树
const getTree = () => {
  return request({
    url: '/api/organization/tree',
    method: 'get'
  })
}

// 创建组织
const create = (data) => {
  return request({
    url: '/api/organization',
    method: 'post',
    data
  })
}

// 更新组织
const update = (id, data) => {
  return request({
    url: `/api/organization/${id}`,
    method: 'put',
    data
  })
}

// 删除组织
const deleteOrganization = (id) => {
  return request({
    url: `/api/organization/${id}`,
    method: 'delete'
  })
}

// 批量删除组织
const batchDelete = (ids) => {
  return request({
    url: '/api/organization/batch',
    method: 'delete',
    data: { ids }
  })
}

// 获取组织用户列表
const getUsers = (organizationId) => {
  return request({
    url: `/api/organization/${organizationId}/users`,
    method: 'get'
  })
}

// 添加用户到组织
const addUser = (organizationId, userId) => {
  return request({
    url: `/api/organization/${organizationId}/users`,
    method: 'post',
    data: { userId }
  })
}

// 从组织移除用户
const removeUser = (organizationId, userId) => {
  return request({
    url: `/api/organization/${organizationId}/users/${userId}`,
    method: 'delete'
  })
}

// 修改组织状态
const updateStatus = (id, status) => {
  return request({
    url: `/api/organization/${id}/status`,
    method: 'put',
    data: { status }
  })
}

const organizationApi = {
  getList,
  getDetail,
  getTree,
  create,
  update,
  delete: deleteOrganization,
  batchDelete,
  getUsers,
  addUser,
  removeUser,
  updateStatus
}

export default organizationApi