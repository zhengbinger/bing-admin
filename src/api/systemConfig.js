import request from '../utils/request'

/**
 * 系统配置管理API模块
 * 提供系统配置CRUD操作、缓存刷新等接口
 */

// 获取配置列表
const getList = (params) => {
  return request({
    url: '/api/system-config/list',
    method: 'get',
    params
  })
}

// 获取配置详情
const getDetail = (key) => {
  return request({
    url: `/api/system-config/${key}`,
    method: 'get'
  })
}

// 创建配置
const create = (data) => {
  return request({
    url: '/api/system-config',
    method: 'post',
    data
  })
}

// 更新配置
const update = (key, data) => {
  return request({
    url: `/api/system-config/${key}`,
    method: 'put',
    data
  })
}

// 删除配置
const deleteConfig = (key) => {
  return request({
    url: `/api/system-config/${key}`,
    method: 'delete'
  })
}

// 批量删除配置
const batchDelete = (keys) => {
  return request({
    url: '/api/system-config/batch',
    method: 'delete',
    data: { keys }
  })
}

// 刷新配置缓存
const refreshCache = () => {
  return request({
    url: '/api/system-config/refresh-cache',
    method: 'post'
  })
}

// 获取配置分组
const getGroups = () => {
  return request({
    url: '/api/system-config/groups',
    method: 'get'
  })
}

// 按分组获取配置
const getByGroup = (group) => {
  return request({
    url: `/api/system-config/group/${group}`,
    method: 'get'
  })
}

const systemConfigApi = {
  getList,
  getDetail,
  create,
  update,
  delete: deleteConfig,
  batchDelete,
  refreshCache,
  getGroups,
  getByGroup
}

export default systemConfigApi