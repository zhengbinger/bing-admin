import request from '@/utils/request'

// 登录记录管理API

export default {
  // 获取登录记录列表（分页）
  getLoginRecords(page = 1, size = 10, params = {}) {
    return request({
      url: '/login-records',
      method: 'get',
      params: { page, size, ...params }
    })
  },
  
  // 获取指定用户的登录记录
  getUserLoginRecords(userId, page = 1, size = 10) {
    return request({
      url: `/login-records/user/${userId}`,
      method: 'get',
      params: { page, size }
    })
  },
  
  // 获取最近的登录记录
  getRecentLoginRecords(limit = 10) {
    return request({
      url: '/login-records/recent',
      method: 'get',
      params: { limit }
    })
  },
  
  // 获取失败的登录记录
  getFailedLoginRecords(page = 1, size = 10) {
    return request({
      url: '/login-records/failed',
      method: 'get',
      params: { page, size }
    })
  },
  
  // 清理过期的登录记录
  cleanExpiredLoginRecords() {
    return request({
      url: '/login-records/clean',
      method: 'delete'
    })
  }
}