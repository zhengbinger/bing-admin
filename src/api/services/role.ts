/**
 * 角色管理API服务
 * 提供角色CRUD操作、权限管理、角色分配等接口
 */

import { httpClient } from '../client'
import type { PageResult, Role, Permission, User } from '../../types'

// 角色查询参数接口
export interface RoleQueryParams {
  page?: number
  size?: number
  name?: string
  code?: string
  status?: number
  createTimeStart?: string
  createTimeEnd?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 角色创建请求接口
export interface CreateRoleRequest {
  name: string
  code: string
  description?: string
  status?: number
  permissionIds?: number[]
}

// 角色更新请求接口
export interface UpdateRoleRequest {
  name?: string
  code?: string
  description?: string
  status?: number
  permissionIds?: number[]
}

// 角色详情接口（包含权限信息）
export interface RoleDetail extends Role {
  permissions: Permission[]
}

// 角色分配请求接口
export interface RoleAssignmentRequest {
  userIds: number[]
  roleIds: number[]
  operation: 'assign' | 'remove'
}

// 批量角色操作请求接口
export interface BatchRoleOperationRequest {
  roleIds: number[]
  operation: 'delete' | 'enable' | 'disable' | 'duplicate'
  params?: Record<string, any>
}

/**
 * 角色API服务类
 */
export class RoleApiService {
  /**
   * 获取角色列表（分页）
   */
  async getRoles(params: RoleQueryParams = {}): Promise<PageResult<Role>> {
    const response = await httpClient.get<PageResult<Role>>('/api/role/list', { params })
    return response.data
  }

  /**
   * 获取所有角色（不分页，用于下拉选择）
   */
  async getAllRoles(): Promise<Role[]> {
    const response = await httpClient.get<Role[]>('/api/role/all')
    return response.data
  }

  /**
   * 获取角色详情（包含权限信息）
   */
  async getRoleById(id: number): Promise<RoleDetail> {
    const response = await httpClient.get<RoleDetail>(`/api/role/${id}`)
    return response.data
  }

  /**
   * 创建角色
   */
  async createRole(data: CreateRoleRequest): Promise<Role> {
    const response = await httpClient.post<Role>('/api/role', data)
    return response.data
  }

  /**
   * 更新角色信息
   */
  async updateRole(id: number, data: UpdateRoleRequest): Promise<Role> {
    const response = await httpClient.put<Role>(`/api/role/${id}`, data)
    return response.data
  }

  /**
   * 删除角色
   */
  async deleteRole(id: number): Promise<void> {
    await httpClient.delete(`/api/role/${id}`)
  }

  /**
   * 批量删除角色
   */
  async batchDeleteRoles(roleIds: number[]): Promise<void> {
    await httpClient.post('/api/role/batch-delete', { roleIds })
  }

  /**
   * 批量操作角色
   */
  async batchOperation(request: BatchRoleOperationRequest): Promise<void> {
    await httpClient.post('/api/role/batch-operation', request)
  }

  /**
   * 复制角色
   */
  async duplicateRole(id: number, newName: string): Promise<Role> {
    const response = await httpClient.post<Role>(`/api/role/${id}/duplicate`, { name: newName })
    return response.data
  }

  /**
   * 获取角色的权限列表
   */
  async getRolePermissions(id: number): Promise<Permission[]> {
    const response = await httpClient.get<Permission[]>(`/api/role/${id}/permissions`)
    return response.data
  }

  /**
   * 更新角色权限
   */
  async updateRolePermissions(id: number, permissionIds: number[]): Promise<void> {
    await httpClient.put(`/api/role/${id}/permissions`, { permissionIds })
  }

  /**
   * 获取角色关联的用户列表
   */
  async getRoleUsers(id: number, params: { page?: number; size?: number } = {}): Promise<PageResult<User>> {
    const response = await httpClient.get<PageResult<User>>(`/api/role/${id}/users`, { params })
    return response.data
  }

  /**
   * 分配角色给用户
   */
  async assignRolesToUsers(request: RoleAssignmentRequest): Promise<void> {
    await httpClient.post('/api/role/assign', request)
  }

  /**
   * 从用户移除角色
   */
  async removeRolesFromUsers(request: RoleAssignmentRequest): Promise<void> {
    await httpClient.post('/api/role/remove', request)
  }

  /**
   * 检查角色代码是否可用
   */
  async checkRoleCodeAvailable(code: string, excludeId?: number): Promise<boolean> {
    const response = await httpClient.get<{ available: boolean }>('/api/role/check-code', {
      params: { code, excludeId }
    })
    return response.data.available
  }

  /**
   * 检查角色名称是否可用
   */
  async checkRoleNameAvailable(name: string, excludeId?: number): Promise<boolean> {
    const response = await httpClient.get<{ available: boolean }>('/api/role/check-name', {
      params: { name, excludeId }
    })
    return response.data.available
  }

  /**
   * 检查角色是否可以删除（是否有用户使用）
   */
  async checkRoleDeletable(id: number): Promise<{ deletable: boolean; userCount: number }> {
    const response = await httpClient.get<{ deletable: boolean; userCount: number }>(`/api/role/${id}/check-deletable`)
    return response.data
  }

  /**
   * 搜索角色（支持模糊搜索）
   */
  async searchRoles(keyword: string, limit: number = 10): Promise<Role[]> {
    const response = await httpClient.get<Role[]>('/api/role/search', {
      params: { keyword, limit }
    })
    return response.data
  }

  /**
   * 导出角色数据
   */
  async exportRoles(params: RoleQueryParams = {}): Promise<Blob> {
    const response = await httpClient.get('/api/role/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * 导入角色数据
   */
  async importRoles(file: File, options: { 
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
    }>('/api/role/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * 获取角色统计信息
   */
  async getRoleStats(): Promise<{
    total: number
    active: number
    inactive: number
    newThisMonth: number
    byPermissionCount: Record<string, number>
    byUserCount: Record<string, number>
  }> {
    const response = await httpClient.get<{
      total: number
      active: number
      inactive: number
      newThisMonth: number
      byPermissionCount: Record<string, number>
      byUserCount: Record<string, number>
    }>('/api/role/stats')
    return response.data
  }
}

// 创建角色API服务实例
export const roleApiService = new RoleApiService()

// 导出默认实例
export default roleApiService