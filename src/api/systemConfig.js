import request from '@/utils/request'

// 系统配置管理API

export default {
  // 获取配置列表
  getConfigList() {
    return request({
      url: '/system-config/',
      method: 'get'
    })
  },
  
  // 获取配置详情
  getConfigDetail(key) {
    return request({
      url: `/system-config/${key}`,
      method: 'get'
    })
  },
  
  // 创建配置
  createConfig(data) {
    return request({
      url: '/system-config/',
      method: 'post',
      data
    })
  },
  
  // 更新配置
  updateConfig(key, data) {
    return request({
      url: `/system-config/${key}`,
      method: 'put',
      data
    })
  },
  
  // 删除配置
  deleteConfig(key) {
    return request({
      url: `/system-config/${key}`,
      method: 'delete'
    })
  },
  
  // 刷新配置缓存
  refreshConfigCache() {
    return request({
      url: '/system-config/refresh-cache',
      method: 'post'
    })
  }
}