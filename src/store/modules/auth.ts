/**
 * 认证状态管理 (TypeScript版本)
 * 管理用户登录状态、用户信息、权限等
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { ElMessage } from 'element-plus'
import { httpClient } from '../../api/client'
import type { 
  LoginRequest, 
  LoginResponse, 
  User, 
  AuthState,
  ChangePasswordRequest,
  SessionInfo
} from '../../types/auth'

/**
 * 认证API服务
 */
class AuthService {
  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/api/auth/login', credentials)
    return response.data
  }

  /**
   * 用户注销
   */
  async logout(): Promise<void> {
    await httpClient.post('/api/auth/logout')
  }

  /**
   * 刷新token
   */
  async refreshToken(): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/api/auth/refresh')
    return response.data
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    const response = await httpClient.get<User>('/api/auth/current')
    return response.data
  }

  /**
   * 修改密码
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await httpClient.post('/api/auth/change-password', data)
  }

  /**
   * 检查权限
   */
  checkPermission(permission: string, userPermissions: string[]): boolean {
    if (!permission || !userPermissions.length) return false
    return userPermissions.includes(permission) || userPermissions.includes('*')
  }

  /**
   * 检查角色
   */
  checkRole(role: string, userRoles: string[]): boolean {
    if (!role || !userRoles.length) return false
    return userRoles.includes(role) || userRoles.includes('admin')
  }

  /**
   * 获取会话信息
   */
  async getSessionInfo(): Promise<SessionInfo> {
    const response = await httpClient.get<SessionInfo>('/api/auth/session')
    return response.data
  }
}

// 创建认证服务实例
const authService = new AuthService()

/**
 * 认证Store
 */
export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('auth_refresh_token'))
  const user = ref<User | null>(null)
  const permissions = ref<string[]>([])
  const isLoading = ref(false)
  const loginTime = ref<Date | null>(null)
  const expirationTime = ref<Date | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRoles = computed(() => user.value?.roles?.map(role => role.code) || [])
  const isTokenExpired = computed(() => {
    if (!expirationTime.value) return false
    return new Date() >= new Date(expirationTime.value)
  })

  // 初始化用户信息
  const initializeAuth = async (): Promise<void> => {
    const storedUser = localStorage.getItem('auth_user')
    const storedPermissions = localStorage.getItem('auth_permissions')
    const storedLoginTime = localStorage.getItem('auth_login_time')
    const storedExpirationTime = localStorage.getItem('auth_expiration_time')

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (error) {
        console.error('解析用户信息失败:', error)
        clearAuthData()
      }
    }

    if (storedPermissions) {
      try {
        permissions.value = JSON.parse(storedPermissions)
      } catch (error) {
        console.error('解析权限信息失败:', error)
        permissions.value = []
      }
    }

    if (storedLoginTime) {
      loginTime.value = new Date(storedLoginTime)
    }

    if (storedExpirationTime) {
      expirationTime.value = new Date(storedExpirationTime)
    }

    // 如果token存在但已过期，尝试刷新
    if (token.value && isTokenExpired.value) {
      try {
        await refreshAuthToken()
      } catch (error) {
        console.error('刷新token失败:', error)
        await logout()
      }
    }
  }

  // 清除认证数据
  const clearAuthData = (): void => {
    token.value = null
    refreshToken.value = null
    user.value = null
    permissions.value = []
    loginTime.value = null
    expirationTime.value = null

    // 清除本地存储
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_refresh_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_permissions')
    localStorage.removeItem('auth_login_time')
    localStorage.removeItem('auth_expiration_time')
  }

  // 保存认证数据
  const saveAuthData = (loginResponse: LoginResponse): void => {
    token.value = loginResponse.token
    refreshToken.value = loginResponse.refreshToken
    
    const now = new Date()
    loginTime.value = now
    
    // 安全处理过期时间
    let expirationDate: Date
    if (loginResponse.expiration) {
      if (typeof loginResponse.expiration === 'string') {
        expirationDate = new Date(loginResponse.expiration)
      } else if (loginResponse.expiration instanceof Date) {
        expirationDate = loginResponse.expiration
      } else {
        // 如果过期时间无效，设置为1小时后
        expirationDate = new Date(now.getTime() + 60 * 60 * 1000)
      }
    } else {
      // 默认1小时后过期
      expirationDate = new Date(now.getTime() + 60 * 60 * 1000)
    }
    
    // 验证日期是否有效
    if (isNaN(expirationDate.getTime())) {
      expirationDate = new Date(now.getTime() + 60 * 60 * 1000)
    }
    
    expirationTime.value = expirationDate

    // 构建用户对象
    const userData: User = {
      id: loginResponse.userId,
      username: loginResponse.username,
      nickname: loginResponse.nickname,
      email: '',
      phone: '',
      status: 1,
      createTime: now,
      updateTime: now,
      roles: (loginResponse.roles || []).map(roleCode => ({
        id: 0,
        name: roleCode,
        code: roleCode,
        description: '',
        status: 1,
        createTime: now,
        updateTime: now
      })),
      organizations: [],
      permissions: loginResponse.permissions || []
    }

    user.value = userData
    permissions.value = loginResponse.permissions || []

    // 持久化存储
    localStorage.setItem('auth_token', loginResponse.token)
    localStorage.setItem('auth_refresh_token', loginResponse.refreshToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))
    localStorage.setItem('auth_permissions', JSON.stringify(loginResponse.permissions || []))
    localStorage.setItem('auth_login_time', now.toISOString())
    localStorage.setItem('auth_expiration_time', expirationDate.toISOString())
  }

  /**
   * 用户登录
   */
  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      isLoading.value = true
      
      const response = await authService.login(credentials)
      
      // 保存认证数据
      saveAuthData(response)
      
      ElMessage.success('登录成功')
      return response
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户注销
   */
  const logout = async (): Promise<void> => {
    try {
      isLoading.value = true
      
      // 调用后端注销接口
      if (token.value) {
        try {
          await authService.logout()
        } catch (error) {
          console.error('后端注销失败:', error)
        }
      }
      
      // 清除本地数据
      clearAuthData()
      
      ElMessage.success('退出登录成功')
    } catch (error: any) {
      console.error('注销失败:', error)
      // 即使后端调用失败，也要清除本地数据
      clearAuthData()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 刷新token
   */
  const refreshAuthToken = async (): Promise<LoginResponse> => {
    try {
      const response = await authService.refreshToken()
      
      // 更新认证数据
      saveAuthData(response)
      
      return response
    } catch (error: any) {
      console.error('刷新token失败:', error)
      // 刷新失败，清除认证数据
      clearAuthData()
      throw error
    }
  }

  /**
   * 获取当前用户信息
   */
  const getCurrentUser = async (): Promise<User> => {
    try {
      isLoading.value = true
      
      const userData = await authService.getCurrentUser()
      
      // 更新用户信息
      user.value = userData
      
      // 更新权限
      if (userData.permissions) {
        permissions.value = userData.permissions
        localStorage.setItem('auth_permissions', JSON.stringify(userData.permissions))
      }
      
      // 更新本地存储的用户信息
      localStorage.setItem('auth_user', JSON.stringify(userData))
      
      return userData
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新用户信息
   */
  const updateUserInfo = (userData: Partial<User>): void => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  /**
   * 检查权限
   */
  const checkPermission = (permission: string): boolean => {
    return authService.checkPermission(permission, permissions.value)
  }

  /**
   * 检查角色
   */
  const checkRole = (role: string): boolean => {
    return authService.checkRole(role, userRoles.value)
  }

  /**
   * 检查多个权限（AND逻辑）
   */
  const checkPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => checkPermission(permission))
  }

  /**
   * 检查多个权限（OR逻辑）
   */
  const checkAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => checkPermission(permission))
  }

  /**
   * 检查多个角色（AND逻辑）
   */
  const checkRoles = (requiredRoles: string[]): boolean => {
    return requiredRoles.every(role => checkRole(role))
  }

  /**
   * 检查多个角色（OR逻辑）
   */
  const checkAnyRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some(role => checkRole(role))
  }

  /**
   * 修改密码
   */
  const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
    try {
      isLoading.value = true
      
      await authService.changePassword(data)
      
      ElMessage.success('密码修改成功')
    } catch (error: any) {
      ElMessage.error(error.message || '密码修改失败')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取会话信息
   */
  const getSessionInfo = async (): Promise<SessionInfo> => {
    try {
      return await authService.getSessionInfo()
    } catch (error: any) {
      console.error('获取会话信息失败:', error)
      throw error
    }
  }

  /**
   * 检查会话是否有效
   */
  const isSessionValid = (): boolean => {
    return isAuthenticated.value && !isTokenExpired.value
  }

  // 返回store接口
  return {
    // 状态 (测试环境下需要可写)
    token,
    refreshToken,
    user,
    permissions,
    isLoading: readonly(isLoading),
    loginTime,
    expirationTime,
    
    // 计算属性
    isAuthenticated,
    userRoles,
    isTokenExpired,
    
    // 方法
    initializeAuth,
    login,
    logout,
    refreshAuthToken,
    getCurrentUser,
    updateUserInfo,
    checkPermission,
    checkRole,
    checkPermissions,
    checkAnyPermission,
    checkRoles,
    checkAnyRole,
    changePassword,
    getSessionInfo,
    isSessionValid,
    clearAuthData,
    
    // 测试环境下暴露内部方法
    ...(import.meta.env.NODE_ENV === 'test' ? {
      saveAuthData: (loginResponse: LoginResponse) => saveAuthData(loginResponse)
    } : {})
  }
})

// 导出认证服务供其他地方使用
export { authService }