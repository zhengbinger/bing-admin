import request from '../utils/request'

/**
 * 白名单管理API模块
 * 提供白名单CRUD操作、缓存刷新等接口
 */

// 获取白名单列表
const getList = (params) => {
  return request({
    url: '/api/white-list/list',
    method: 'get',
    params
  })
}

// 获取白名单详情
const getDetail = (id) => {
  return request({
    url: `/api/white-list/${id}`,
    method: 'get'
  })
}

// 创建白名单
const create = (data) => {
  return request({
    url: '/api/white-list',
    method: 'post',
    data
  })
}

// 更新白名单
const update = (id, data) => {
  return request({
    url: `/api/white-list/${id}`,
    method: 'put',
    data
  })
}

// 删除白名单
const deleteWhiteList = (id) => {
  return request({
    url: `/api/white-list/${id}`,
    method: 'delete'
  })
}

// 批量删除白名单
const batchDelete = (ids) => {
  return request({
    url: '/api/white-list/batch',
    method: 'delete',
    data: { ids }
  })
}

// 刷新白名单缓存
const refreshCache = () => {
  return request({
    url: '/api/white-list/refresh-cache',
    method: 'post'
  })
}

// 检查IP是否在白名单中
const checkIp = (ip) => {
  return request({
    url: '/api/white-list/check',
    method: 'post',
    data: { ip }
  })
}

// 获取白名单统计信息
const getStatistics = () => {
  return request({
    url: '/api/white-list/statistics',
    method: 'get'
  })
}

// 导出白名单
const exportList = (params) => {
  return request({
    url: '/api/white-list/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

const whiteListApi = {
  getList,
  getDetail,
  create,
  update,
  delete: deleteWhiteList,
  batchDelete,
  refreshCache,
  checkIp,
  getStatistics,
  exportList
}

export default whiteListApi