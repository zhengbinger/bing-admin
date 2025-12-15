/**
 * 用户组织关联API
 */
import request from '../utils/request'

const userOrganizationApi = {
  // 获取用户组织关联列表
  getList(params) {
    return request({
      url: '/api/user-organization/list',
      method: 'get',
      params
    })
  },

  // 获取用户的组织列表
  getUserOrganizations(userId) {
    return request({
      url: `/api/user-organization/user/${userId}`,
      method: 'get'
    })
  },

  // 获取组织的用户列表
  getOrganizationUsers(organizationId) {
    return request({
      url: `/api/user-organization/organization/${organizationId}`,
      method: 'get'
    })
  },

  // 添加用户到组织
  addUserToOrganization(data) {
    return request({
      url: '/api/user-organization',
      method: 'post',
      data
    })
  },

  // 从组织移除用户
  removeUserFromOrganization(userId, organizationId) {
    return request({
      url: `/api/user-organization/${userId}/${organizationId}`,
      method: 'delete'
    })
  },

  // 批量添加用户到组织
  batchAddUsersToOrganization(organizationId, userIds) {
    return request({
      url: `/api/user-organization/batch/add`,
      method: 'post',
      data: { organizationId, userIds }
    })
  },

  // 批量从组织移除用户
  batchRemoveUsersFromOrganization(organizationId, userIds) {
    return request({
      url: `/api/user-organization/batch/remove`,
      method: 'post',
      data: { organizationId, userIds }
    })
  }
}

export default userOrganizationApi