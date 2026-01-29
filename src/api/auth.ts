/**
 * 认证相关API (TypeScript版本)
 */
import { httpClient } from './client'
import type { 
  LoginRequest, 
  LoginResponse, 
  User, 
  ChangePasswordRequest,
  SessionInfo
} from '../types/auth'

/**
 * 认证API服务类
 */
class AuthApiService {
  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/api/auth/login', credentials)
    return response.data
  }

  /**
   * 用户注册
   */
  async register(data: {
    username: string
    password: string
    email: string
    nickname?: string
  }): Promise<User> {
    const response = await httpClient.post<User>('/api/auth/register', data)
    return response.data
  }

  /**
   * 用户注销
   */
  async logout(): Promise<void> {
    await httpClient.post('/api/auth/logout')
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    const response = await httpClient.get<User>('/api/auth/current')
    return response.data
  }

  /**
   * 刷新token
   */
  async refreshToken(): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/api/auth/refresh')
    return response.data
  }

  /**
   * 修改密码
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await httpClient.post('/api/auth/change-password', data)
  }

  /**
   * 获取会话信息
   */
  async getSessionInfo(): Promise<SessionInfo> {
    const response = await httpClient.get<SessionInfo>('/api/auth/session')
    return response.data
  }

  /**
   * 验证token有效性
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await httpClient.get<{ valid: boolean }>('/api/auth/validate')
      return response.data.valid
    } catch (error) {
      return false
    }
  }

  /**
   * 获取用户权限列表
   */
  async getUserPermissions(userId?: number): Promise<string[]> {
    const response = await httpClient.get<string[]>('/api/auth/permissions', {
      params: userId ? { userId } : undefined
    })
    return response.data
  }

  /**
   * 检查单个权限
   */
  async checkPermission(permission: string): Promise<boolean> {
    try {
      const response = await httpClient.get<{ hasPermission: boolean }>('/api/auth/check-permission', {
        params: { permission }
      })
      return response.data.hasPermission
    } catch (error) {
      return false
    }
  }

  /**
   * 批量检查权限
   */
  async checkPermissions(permissions: string[]): Promise<Record<string, boolean>> {
    const response = await httpClient.post<Record<string, boolean>>('/api/auth/check-permissions', {
      permissions
    })
    return response.data
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(data: {
    type: 'email' | 'sms'
    target: string
    purpose: 'login' | 'register' | 'reset_password'
  }): Promise<{ success: boolean; message: string }> {
    const response = await httpClient.post<{ success: boolean; message: string }>('/api/auth/send-code', data)
    return response.data
  }

  /**
   * 验证验证码
   */
  async verifyCode(data: {
    type: 'email' | 'sms'
    target: string
    code: string
    purpose: 'login' | 'register' | 'reset_password'
  }): Promise<{ valid: boolean; token?: string }> {
    const response = await httpClient.post<{ valid: boolean; token?: string }>('/api/auth/verify-code', data)
    return response.data
  }

  /**
   * 重置密码
   */
  async resetPassword(data: {
    token: string
    newPassword: string
    confirmPassword: string
  }): Promise<void> {
    await httpClient.post('/api/auth/reset-password', data)
  }

  /**
   * 获取登录历史
   */
  async getLoginHistory(params?: {
    page?: number
    size?: number
    startDate?: string
    endDate?: string
  }): Promise<{
    records: Array<{
      id: number
      loginTime: string
      ipAddress: string
      userAgent: string
      status: 'success' | 'failed'
      message?: string
    }>
    total: number
  }> {
    const response = await httpClient.get('/api/auth/login-history', { params })
    return response.data
  }
}

// 创建并导出API服务实例
const authApi = new AuthApiService()

export default authApi
export { AuthApiService }