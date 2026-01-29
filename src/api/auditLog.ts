/**
 * 审计日志API
 */
import request from '../utils/request'

const auditLogApi = {
  // 获取审计日志列表
  getList(params) {
    return request({
      url: '/api/audit-log/config/list',
      method: 'get',
      params
    })
  },

  // 获取审计日志详情
  getDetail(id) {
    return request({
      url: `/api/audit-log/config/${id}`,
      method: 'get'
    })
  },

  // 创建审计日志配置
  create(data) {
    return request({
      url: '/api/audit-log/config',
      method: 'post',
      data
    })
  },

  // 更新审计日志配置
  update(id, data) {
    return request({
      url: `/api/audit-log/config/${id}`,
      method: 'put',
      data
    })
  },

  // 删除审计日志配置
  delete(id) {
    return request({
      url: `/api/audit-log/config/${id}`,
      method: 'delete'
    })
  },

  // 批量删除审计日志配置
  batchDelete(ids) {
    return request({
      url: '/api/audit-log/config/batch',
      method: 'delete',
      data: { ids }
    })
  },

  // 导出审计日志
  export(params) {
    return request({
      url: '/api/audit-log/config/export',
      method: 'get',
      params,
      responseType: 'blob'
    })
  }
}

export default auditLogApi