import request from '../utils/request'

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
const generateCaptcha = (channel, captchaType = 'image') => {
  return request({
    url: `/api/captcha/generate/${captchaType.toLowerCase()}`,
    method: 'get',
    params: { channel }
  })
}

// 刷新验证码
const refreshCaptcha = (channel, captchaType = 'image') => {
  return request({
    url: `/api/captcha/refresh/${captchaType.toLowerCase()}`,
    method: 'get',
    params: { channel }
  })
}

// 验证验证码
const validateCaptcha = (key, code, captchaType = 'image', channel) => {
  return request({
    url: '/api/captcha/validate',
    method: 'post',
    data: {
      key,
      code,
      type: captchaType,
      channel
    }
  })
}

// 清理验证码
const cleanCaptcha = (key, captchaType = 'image') => {
  return request({
    url: '/api/captcha/clean',
    method: 'post',
    data: {
      key,
      type: captchaType
    }
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

const captchaApi = {
  getCaptchaConfig,
  generateCaptcha,
  refreshCaptcha,
  validateCaptcha,
  cleanCaptcha,
  getConfigList,
  addConfig,
  updateConfig,
  deleteConfig
}

export default captchaApi
