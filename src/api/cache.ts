/**
 * 缓存管理API
 */
import request from '../utils/request'

const cacheApi = {
  // 获取缓存统计信息
  getStats() {
    return request({
      url: '/api/cache/stats',
      method: 'get'
    })
  },

  // 获取缓存详细信息
  getInfo() {
    return request({
      url: '/api/cache/info',
      method: 'get'
    })
  },

  // 清空所有缓存
  clearAll() {
    return request({
      url: '/api/cache/clear',
      method: 'delete'
    })
  },

  // 清空指定缓存
  clearByKey(key) {
    return request({
      url: `/api/cache/clear/${key}`,
      method: 'delete'
    })
  },

  // 预热缓存
  warmup(data) {
    return request({
      url: '/api/cache/warmup',
      method: 'post',
      data
    })
  },

  // 获取缓存键列表
  getKeys(pattern) {
    return request({
      url: '/api/cache/keys',
      method: 'get',
      params: { pattern }
    })
  },

  // 获取缓存值
  getValue(key) {
    return request({
      url: `/api/cache/value/${key}`,
      method: 'get'
    })
  },

  // 设置缓存值
  setValue(key, value, ttl) {
    return request({
      url: `/api/cache/value/${key}`,
      method: 'put',
      data: { value, ttl }
    })
  },

  // 获取缓存监控数据
  getMonitorData() {
    return request({
      url: '/api/cache/monitor',
      method: 'get'
    })
  }
}

export default cacheApi