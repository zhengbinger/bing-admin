/**
 * 第三方用户管理API
 */
import request from '../utils/request'

const thirdPartyUserApi = {
  // 获取第三方用户列表
  getList(params) {
    return request({
      url: '/api/third-party-user/list',
      method: 'get',
      params
    })
  },

  // 获取第三方用户详情
  getDetail(id) {
    return request({
      url: `/api/third-party-user/${id}`,
      method: 'get'
    })
  },

  // 创建第三方用户
  create(data) {
    return request({
      url: '/api/third-party-user',
      method: 'post',
      data
    })
  },

  // 更新第三方用户
  update(id, data) {
    return request({
      url: `/api/third-party-user/${id}`,
      method: 'put',
      data
    })
  },

  // 删除第三方用户
  delete(id) {
    return request({
      url: `/api/third-party-user/${id}`,
      method: 'delete'
    })
  },

  // 批量删除第三方用户
  batchDelete(ids) {
    return request({
      url: '/api/third-party-user/batch',
      method: 'delete',
      data: { ids }
    })
  },

  // 绑定系统用户
  bindSystemUser(thirdPartyUserId, systemUserId) {
    return request({
      url: `/api/third-party-user/${thirdPartyUserId}/bind/${systemUserId}`,
      method: 'post'
    })
  },

  // 解绑系统用户
  unbindSystemUser(thirdPartyUserId) {
    return request({
      url: `/api/third-party-user/${thirdPartyUserId}/unbind`,
      method: 'delete'
    })
  }
}

export default thirdPartyUserApi