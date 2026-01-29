import request from '../utils/request'

/**
 * 登录记录管理API模块
 * 提供登录记录查询、统计等接口
 */

// 获取登录记录列表
const getList = (params) => {
  return request({
    url: '/api/loginRecords/list',
    method: 'get',
    params
  })
}

// 获取登录记录详情
const getDetail = (id) => {
  return request({
    url: `/api/loginRecords/${id}`,
    method: 'get'
  })
}

// 获取指定用户的登录记录
const getUserRecords = (userId, params) => {
  return request({
    url: `/api/loginRecords/user/${userId}`,
    method: 'get',
    params
  })
}

// 获取最近的登录记录
const getRecent = (params) => {
  return request({
    url: '/api/loginRecords/recent',
    method: 'get',
    params
  })
}

// 获取失败的登录记录
const getFailedRecords = (params) => {
  return request({
    url: '/api/loginRecords/failed',
    method: 'get',
    params
  })
}

// 获取登录统计信息
const getStatistics = (params) => {
  return request({
    url: '/api/loginRecords/statistics',
    method: 'get',
    params
  })
}

// 清理过期的登录记录
const cleanExpired = () => {
  return request({
    url: '/api/loginRecords/clean',
    method: 'delete'
  })
}

// 导出登录记录
const exportRecords = (params) => {
  return request({
    url: '/api/loginRecords/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 删除登录记录
const deleteRecord = (id) => {
  return request({
    url: `/api/loginRecords/${id}`,
    method: 'delete'
  })
}

// 批量删除登录记录
const batchDelete = (ids) => {
  return request({
    url: '/api/loginRecords/batch',
    method: 'delete',
    data: { ids }
  })
}

const loginRecordApi = {
  getList,
  getDetail,
  getUserRecords,
  getRecent,
  getFailedRecords,
  getStatistics,
  cleanExpired,
  exportRecords,
  delete: deleteRecord,
  batchDelete
}

export default loginRecordApi