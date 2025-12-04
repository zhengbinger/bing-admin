import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import userApi from '../../api/user'

/**
 * 用户状态管理
 * 管理用户登录状态、用户信息等
 */
export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const isLogin = computed(() => !!token.value)

  /**
   * 登录
   * @param {Object} data 登录信息
   * @returns {Promise} 登录结果
   */
  const login = async (data) => {
    try {
      const response = await userApi.login(data)
      const { token: newToken, user } = response.data
      
      // 保存状态
      token.value = newToken
      userInfo.value = user
      
      // 持久化存储
      localStorage.setItem('token', newToken)
      localStorage.setItem('userInfo', JSON.stringify(user))
      
      ElMessage.success('登录成功')
      return response
    } catch (error) {
      ElMessage.error('登录失败')
      throw error
    }
  }

  /**
   * 退出登录
   */
  const logout = async () => {
    try {
      await userApi.logout()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      // 清除状态
      token.value = ''
      userInfo.value = null
      
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      ElMessage.success('退出登录成功')
    }
  }

  /**
   * 获取当前用户信息
   */
  const getCurrentUser = async () => {
    try {
      const response = await userApi.getCurrentUser()
      userInfo.value = response.data
      localStorage.setItem('userInfo', JSON.stringify(response.data))
      return response
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  /**
   * 更新用户信息
   * @param {Object} data 用户信息
   */
  const updateUserInfo = (data) => {
    userInfo.value = { ...userInfo.value, ...data }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  return {
    token,
    userInfo,
    isLogin,
    login,
    logout,
    getCurrentUser,
    updateUserInfo
  }
}, {
  persist: {
    key: 'userStore',
    storage: localStorage,
    paths: ['token', 'userInfo']
  }
})
