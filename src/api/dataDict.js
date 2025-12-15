import request from '../utils/request'

/**
 * 数据字典管理API模块
 * 提供数据字典和字典项CRUD操作等接口
 */

// 获取数据字典列表
const getList = (params) => {
  return request({
    url: '/api/data-dict/list',
    method: 'get',
    params
  })
}

// 获取数据字典详情
const getDetail = (id) => {
  return request({
    url: `/api/data-dict/${id}`,
    method: 'get'
  })
}

// 创建数据字典
const create = (data) => {
  return request({
    url: '/api/data-dict',
    method: 'post',
    data
  })
}

// 更新数据字典
const update = (id, data) => {
  return request({
    url: `/api/data-dict/${id}`,
    method: 'put',
    data
  })
}

// 删除数据字典
const deleteDict = (id) => {
  return request({
    url: `/api/data-dict/${id}`,
    method: 'delete'
  })
}

// 批量删除数据字典
const batchDelete = (ids) => {
  return request({
    url: '/api/data-dict/batch',
    method: 'delete',
    data: { ids }
  })
}

// 根据字典编码获取字典项
const getItemsByCode = (dictCode) => {
  return request({
    url: `/api/data-dict/code/${dictCode}/items`,
    method: 'get'
  })
}

// 获取字典项列表
const getItems = (dictId) => {
  return request({
    url: `/api/data-dict-item/list`,
    method: 'get',
    params: { dictId }
  })
}

// 创建字典项
const createItem = (data) => {
  return request({
    url: '/api/data-dict-item',
    method: 'post',
    data
  })
}

// 更新字典项
const updateItem = (id, data) => {
  return request({
    url: `/api/data-dict-item/${id}`,
    method: 'put',
    data
  })
}

// 删除字典项
const deleteItem = (id) => {
  return request({
    url: `/api/data-dict-item/${id}`,
    method: 'delete'
  })
}

// 批量删除字典项
const batchDeleteItems = (ids) => {
  return request({
    url: '/api/data-dict-item/batch',
    method: 'delete',
    data: { ids }
  })
}

const dataDictApi = {
  getList,
  getDetail,
  create,
  update,
  delete: deleteDict,
  batchDelete,
  getItemsByCode,
  getItems,
  createItem,
  updateItem,
  deleteItem,
  batchDeleteItems
}

export default dataDictApi