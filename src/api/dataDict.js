import request from '@/utils/request'

// 数据字典管理API

export default {
  // 获取数据字典列表
  getDataDictList() {
    return request({
      url: '/data-dict/',
      method: 'get'
    })
  },
  
  // 获取数据字典详情
  getDataDictDetail(id) {
    return request({
      url: `/data-dict/${id}`,
      method: 'get'
    })
  },
  
  // 创建数据字典
  createDataDict(data) {
    return request({
      url: '/data-dict/',
      method: 'post',
      data
    })
  },
  
  // 更新数据字典
  updateDataDict(id, data) {
    return request({
      url: `/data-dict/${id}`,
      method: 'put',
      data
    })
  },
  
  // 删除数据字典
  deleteDataDict(id) {
    return request({
      url: `/data-dict/${id}`,
      method: 'delete'
    })
  },
  
  // 获取数据字典项列表
  getDataDictItems(dictCode) {
    return request({
      url: `/data-dict/${dictCode}/items`,
      method: 'get'
    })
  },
  
  // 创建数据字典项
  createDataDictItem(dictCode, data) {
    return request({
      url: `/data-dict/${dictCode}/items`,
      method: 'post',
      data
    })
  },
  
  // 更新数据字典项
  updateDataDictItem(dictCode, itemId, data) {
    return request({
      url: `/data-dict/${dictCode}/items/${itemId}`,
      method: 'put',
      data
    })
  },
  
  // 删除数据字典项
  deleteDataDictItem(dictCode, itemId) {
    return request({
      url: `/data-dict/${dictCode}/items/${itemId}`,
      method: 'delete'
    })
  }
}