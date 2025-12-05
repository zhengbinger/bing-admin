import request from '@/utils/request'

// 白名单管理API

export default {
  // 获取白名单列表（分页）
  getWhiteList(page = 1, size = 10, params = {}) {
    return request({
      url: '/white-list/',
      method: 'get',
      params: { page, size, ...params }
    })
  },
  
  // 获取白名单详情
  getWhiteListDetail(id) {
    return request({
      url: `/white-list/${id}`,
      method: 'get'
    })
  },
  
  // 创建白名单
  createWhiteList(data) {
    return request({
      url: '/white-list/',
      method: 'post',
      data
    })
  },
  
  // 更新白名单
  updateWhiteList(id, data) {
    return request({
      url: `/white-list/${id}`,
      method: 'put',
      data
    })
  },
  
  // 删除白名单
  deleteWhiteList(id) {
    return request({
      url: `/white-list/${id}`,
      method: 'delete'
    })
  },
  
  // 批量删除白名单
  batchDeleteWhiteList(ids) {
    return request({
      url: '/white-list/batch-delete',
      method: 'delete',
      data: ids
    })
  },
  
  // 刷新白名单缓存
  refreshWhiteListCache() {
    return request({
      url: '/white-list/refresh-cache',
      method: 'post'
    })
  }
}