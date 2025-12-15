/**
 * 微信小程序API
 */
import request from '../utils/request'

const wechatApi = {
  // 微信小程序登录
  login(data) {
    return request({
      url: '/api/wechat/login',
      method: 'post',
      data
    })
  },

  // 获取微信用户信息
  getUserInfo(data) {
    return request({
      url: '/api/wechat/user-info',
      method: 'post',
      data
    })
  },

  // 绑定微信用户
  bindUser(data) {
    return request({
      url: '/api/wechat/bind',
      method: 'post',
      data
    })
  },

  // 解绑微信用户
  unbindUser(userId) {
    return request({
      url: `/api/wechat/unbind/${userId}`,
      method: 'delete'
    })
  },

  // 获取微信配置
  getConfig() {
    return request({
      url: '/api/wechat/config',
      method: 'get'
    })
  },

  // 更新微信配置
  updateConfig(data) {
    return request({
      url: '/api/wechat/config',
      method: 'put',
      data
    })
  }
}

export default wechatApi