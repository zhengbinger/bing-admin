/**
 * 用户管理API服务
 * 提供用户CRUD操作、权限管理、批量操作等接口
 */

import { httpClient } from '../client'
import type { PageResult, User, Role } from '../../types'

// 用户查询参数接口
export interface UserQueryParams {
  page?: number
  size?: number
  username?: string
  nickname?: string
  email?: string
  phone?: string
  status?: number
  roleId?: number
  organizationId?: number
  createTimeStart?: string
  createTimeEnd?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 用户创建请求接口
export interface CreateUserRequest {
  username: string
  nickname: string
  email?: string
  phone?: string
  password?: string
  status?: number
  roleIds?: number[]
  organizationIds?: number[]
  channels?: string[]
}

// 用户更新请求接口
export interface UpdateUserRequest {
  nickname?: string
  email?: string
  phone?: string
  status?: number
  roleIds?: number[]
  organizationIds?: number[]
  channels?: string[]
}

// 密码重置请求接口
export interface ResetPasswordRequest {
  newPassword?: string
  generateRandom?: boolean
  sendNotification?: boolean
}

// 批量操作请求接口
export interface BatchOperationRequest {
  userIds: number[]
  operation: 'delete' | 'enable' | 'disable' | 'assignRole' | 'removeRole'
  params?: Record<string, any>
}

/**
 * 用户API服务类
 */
export class UserApiService {
  /**
   * 获取用户列表（分页）
   */
  async getUsers(params: UserQueryParams = {}): Promise<PageResult<User>> {
    const response = await httpClient.get<PageResult<User>>('/api/user/list', { params })
    return response.data
  }

  /**
   * 获取用户详情
   */
  async getUserById(id: number): Promise<User> {
    const response = await httpClient.get<User>(`/api/user/${id}`)
    return response.data
  }

  /**
   * 创建用户
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await httpClient.post<User>('/api/user', data)
    return response.data
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await httpClient.put<User>(`/api/user/${id}`, data)
    return response.data
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number): Promise<void> {
    await httpClient.delete(`/api/user/${id}`)
  }

  /**
   * 批量删除用户
   */
  async batchDeleteUsers(userIds: number[]): Promise<void> {
    await httpClient.post('/api/user/batch-delete', { userIds })
  }

  /**
   * 批量操作用户
   */
  async batchOperation(request: BatchOperationRequest): Promise<void> {
    await httpClient.post('/api/user/batch-operation', request)
  }

  /**
   * 重置用户密码
   */
  async resetPassword(id: number, data: ResetPasswordRequest): Promise<{ password?: string }> {
    const response = await httpClient.put<{ password?: string }>(`/api/user/${id}/reset-password`, data)
    return response.data
  }

  /**
   * 生成随机密码
   */
  async generateRandomPassword(id: number): Promise<{ password: string }> {
    const response = await httpClient.post<{ password: string }>(`/api/user/${id}/generate-password`)
    return response.data
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(id: number, status: number): Promise<void> {
    await httpClient.put(`/api/user/${id}/status`, { status })
  }

  /**
   * 获取用户权限列表
   */
  async getUserPermissions(id: number): Promise<string[]> {
    const response = await httpClient.get<string[]>(`/api/user/${id}/permissions`)
    return response.data
  }

  /**
   * 获取用户角色列表
   */
  async getUserRoles(id: number): Promise<Role[]> {
    const response = await httpClient.get<Role[]>(`/api/user/${id}/roles`)
    return response.data
  }

  /**
   * 分配用户角色
   */
  async assignRoles(id: number, roleIds: number[]): Promise<void> {
    await httpClient.put(`/api/user/${id}/roles`, { roleIds })
  }

  /**
   * 移除用户角色
   */
  async removeRoles(id: number, roleIds: number[]): Promise<void> {
    await httpClient.delete(`/api/user/${id}/roles`, { data: { roleIds } })
  }

  /**
   * 搜索用户（支持模糊搜索）
   */
  async searchUsers(keyword: string, limit: number = 10): Promise<User[]> {
    const response = await httpClient.get<User[]>('/api/user/search', {
      params: { keyword, limit }
    })
    return response.data
  }

  /**
   * 检查用户名是否可用
   */
  async checkUsernameAvailable(username: string, excludeId?: number): Promise<boolean> {
    const response = await httpClient.get<{ available: boolean }>('/api/user/check-username', {
      params: { username, excludeId }
    })
    return response.data.available
  }

  /**
   * 检查邮箱是否可用
   */
  async checkEmailAvailable(email: string, excludeId?: number): Promise<boolean> {
    const response = await httpClient.get<{ available: boolean }>('/api/user/check-email', {
      params: { email, excludeId }
    })
    return response.data.available
  }

  /**
   * 检查手机号是否可用
   */
  async checkPhoneAvailable(phone: string, excludeId?: number): Promise<boolean> {
    const response = await httpClient.get<{ available: boolean }>('/api/user/check-phone', {
      params: { phone, excludeId }
    })
    return response.data.available
  }

  /**
   * 导出用户数据
   */
  async exportUsers(params: UserQueryParams = {}): Promise<Blob> {
    const response = await httpClient.get('/api/user/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * 导入用户数据
   */
  async importUsers(file: File, options: { 
    updateExisting?: boolean
    skipErrors?: boolean 
  } = {}): Promise<{ 
    success: number
    failed: number
    errors?: string[] 
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('options', JSON.stringify(options))

    const response = await httpClient.post<{
      success: number
      failed: number
      errors?: string[]
    }>('/api/user/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(): Promise<{
    total: number
    active: number
    inactive: number
    newThisMonth: number
    byRole: Record<string, number>
    byOrganization: Record<string, number>
  }> {
    const response = await httpClient.get<{
      total: number
      active: number
      inactive: number
      newThisMonth: number
      byRole: Record<string, number>
      byOrganization: Record<string, number>
    }>('/api/user/stats')
    return response.data
  }
}

// 创建用户API服务实例
export const userApiService = new UserApiService()

// 导出默认实例
export default userApiService