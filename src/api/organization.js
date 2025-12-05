import request from '@/utils/request'

// 组织管理API

export default {
  // 获取组织列表
  getOrganizationList() {
    return request({
      url: '/organization/',
      method: 'get'
    })
  },
  
  // 获取组织详情
  getOrganizationDetail(id) {
    return request({
      url: `/organization/${id}`,
      method: 'get'
    })
  },
  
  // 创建组织
  createOrganization(data) {
    return request({
      url: '/organization/',
      method: 'post',
      data
    })
  },
  
  // 更新组织
  updateOrganization(id, data) {
    return request({
      url: `/organization/${id}`,
      method: 'put',
      data
    })
  },
  
  // 删除组织
  deleteOrganization(id) {
    return request({
      url: `/organization/${id}`,
      method: 'delete'
    })
  },
  
  // 获取组织树形结构
  getOrganizationTree() {
    return request({
      url: '/organization/tree',
      method: 'get'
    })
  }
}