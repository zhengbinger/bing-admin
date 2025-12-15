/**
 * 认证相关API
 */
import request from '../utils/request'

const authApi = {
  // 用户登录
  login(data) {
    return request({
      url: '/api/auth/login',
      method: 'post',
      data
    })
  },

  // 用户注册
  register(data) {
    return request({
      url: '/api/auth/register',
      method: 'post',
      data
    })
  },

  // 用户注销
  logout() {
    return request({
      url: '/api/auth/logout',
      method: 'post'
    })
  },

  // 获取当前用户信息
  getCurrentUser() {
    return request({
      url: '/api/auth/current',
      method: 'get'
    })
  },

  // 刷新token
  refreshToken() {
    return request({
      url: '/api/auth/refresh',
      method: 'post'
    })
  },

  // 修改密码
  changePassword(data) {
    return request({
      url: '/api/auth/change-password',
      method: 'post',
      data
    })
  }
}

export default authApi