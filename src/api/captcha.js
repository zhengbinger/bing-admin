import request from '@/utils/request'

/**
 * 验证码API模块
 * 提供验证码配置查询、验证码生成、配置管理等接口
 */

// 获取验证码配置
const getCaptchaConfig = (channel) => {
  return request({
    url: '/api/captcha/config',
    method: 'get',
    params: { channel }
  })
}

// 生成验证码
const generateCaptcha = (channel) => {
  return request({
    url: '/api/captcha/generate/image',
    method: 'get',
    params: { channel }
  })
}

// 获取验证码配置列表
const getConfigList = (params) => {
  return request({
    url: '/api/captcha/config/list',
    method: 'get',
    params
  })
}

// 添加验证码配置
const addConfig = (data) => {
  return request({
    url: '/api/captcha/config',
    method: 'post',
    data
  })
}

// 更新验证码配置
const updateConfig = (data) => {
  return request({
    url: '/api/captcha/config',
    method: 'put',
    data
  })
}

// 删除验证码配置
const deleteConfig = (id) => {
  return request({
    url: `/api/captcha/config/${id}`,
    method: 'delete'
  })
}

export default {
  getCaptchaConfig,
  generateCaptcha,
  getConfigList,
  addConfig,
  updateConfig,
  deleteConfig
}
