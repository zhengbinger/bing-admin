/**
 * 组织机构管理API服务
 * 提供组织机构CRUD操作、树结构管理、层级验证等接口
 */

import { httpClient } from '../client'
import type { PageResult } from '../../types'

// 组织机构接口
export interface Organization {
  id: number
  name: string
  code: string
  parentId?: number | null
  level: number
  sort: number
  description?: string
  status: number
  userCount?: number
  children?: Organization[]
  createTime: string
  updateTime: string
}

// 组织机构查询参数接口
export interface OrganizationQueryParams {
  page?: number
  size?: number
  name?: string
  code?: string
  parentId?: number | null
  level?: number
  status?: number
  createTimeStart?: string
  createTimeEnd?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 组织机构创建请求接口
export interface CreateOrganizationRequest {
  name: string
  code: string
  parentId?: number | null
  sort?: number
  description?: string
  status?: number
}

// 组织机构更新请求接口
export interface UpdateOrganizationRequest {
  name?: string
  code?: string
  parentId?: number | null
  sort?: number
  description?: string
  status?: number
}

// 组织机构移动请求接口
export interface MoveOrganizationRequest {
  targetParentId?: number | null
  targetSort?: number
}

// 批量组织机构操作请求接口
export interface BatchOrganizationOperationRequest {
  organizationIds: number[]
  operation: 'delete' | 'enable' | 'disable' | 'move'
  params?: Record<string, any>
}

// 组织机构层级验证结果接口
export interface OrganizationHierarchyValidation {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 组织机构API服务类
 */
export class OrganizationApiService {
  /**
   * 获取组织机构列表（分页）
   */
  async getOrganizations(params: OrganizationQueryParams = {}): Promise<PageResult<Organization>> {
    const response = await httpClient.get<PageResult<Organization>>('/api/organization/list', { params })
    return response.data
  }

  /**
   * 获取组织机构树结构
   */
  async getOrganizationTree(params: { 
    includeDisabled?: boolean
    maxLevel?: number
    parentId?: number | null
  } = {}): Promise<Organization[]> {
    const response = await httpClient.get<Organization[]>('/api/organization/tree', { params })
    return response.data
  }

  /**
   * 获取所有组织机构（扁平列表，用于下拉选择）
   */
  async getAllOrganizations(): Promise<Organization[]> {
    const response = await httpClient.get<Organization[]>('/api/organization/all')
    return response.data
  }

  /**
   * 获取组织机构详情
   */
  async getOrganizationById(id: number): Promise<Organization> {
    const response = await httpClient.get<Organization>(`/api/organization/${id}`)
    return response.data
  }

  /**
   * 创建组织机构
   */
  async createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
    const response = await httpClient.post<Organization>('/api/organization', data)
    return response.data
  }

  /**
   * 更新组织机构信息
   */
  async updateOrganization(id: number, data: UpdateOrganizationRequest): Promise<Organization> {
    const response = await httpClient.put<Organization>(`/api/organization/${id}`, data)
    return response.data
  }

  /**
   * 删除组织机构
   */
  async deleteOrganization(id: number): Promise<void> {
    await httpClient.delete(`/api/organization/${id}`)
  }

  /**
   * 批量删除组织机构
   */
  async batchDeleteOrganizations(organizationIds: number[]): Promise<void> {
    await httpClient.post('/api/organization/batch-delete', { organizationIds })
  }

  /**
   * 批量操作组织机构
   */
  async batchOperation(request: BatchOrganizationOperationRequest): Promise<void> {
    await httpClient.post('/api/organization/batch-operation', request)
  }

  /**
   * 移动组织机构（拖拽重排序）
   */
  async moveOrganization(id: number, data: MoveOrganizationRequest): Promise<void> {
    await httpClient.put(`/api/organization/${id}/move`, data)
  }

  /**
   * 获取组织机构的子节点
   */
  async getOrganizationChildren(id: number, params: {
    includeDisabled?: boolean
    recursive?: boolean
  } = {}): Promise<Organization[]> {
    const response = await httpClient.get<Organization[]>(`/api/organization/${id}/children`, { params })
    return response.data
  }

  /**
   * 获取组织机构的父级路径
   */
  async getOrganizationPath(id: number): Promise<Organization[]> {
    const response = await httpClient.get<Organization[]>(`/api/organization/${id}/path`)
    return response.data
  }

  /**
   * 获取组织机构的用户数量
   */
  async getOrganizationUserCount(id: number, params: {
    includeChildren?: boolean
    includeDisabled?: boolean
  } = {}): Promise<{ count: number; details: Record<string, number> }> {
    const response = await httpClient.get<{ count: number; details: Record<string, number> }>(`/api/organization/${id}/user-count`, { params })
    return response.data
  }

  /**
   * 检查组织机构代码是否可用
   */
  async checkOrganizationCodeAvailable(code: string, excludeId?: number): Promise<boolean> {
    const response = await httpClient.get<{ available: boolean }>('/api/organization/check-code', {
      params: { code, excludeId }
    })
    return response.data.available
  }

  /**
   * 检查组织机构名称是否可用
   */
  async checkOrganizationNameAvailable(name: string, parentId?: number | null, excludeId?: number): Promise<boolean> {
    const response = await httpClient.get<{ available: boolean }>('/api/organization/check-name', {
      params: { name, parentId, excludeId }
    })
    return response.data.available
  }

  /**
   * 检查组织机构是否可以删除
   */
  async checkOrganizationDeletable(id: number): Promise<{ 
    deletable: boolean
    userCount: number
    childCount: number
    reasons: string[]
  }> {
    const response = await httpClient.get<{ 
      deletable: boolean
      userCount: number
      childCount: number
      reasons: string[]
    }>(`/api/organization/${id}/check-deletable`)
    return response.data
  }

  /**
   * 验证组织机构层级结构
   */
  async validateOrganizationHierarchy(data: {
    id?: number
    parentId?: number | null
    operation: 'create' | 'update' | 'move'
  }): Promise<OrganizationHierarchyValidation> {
    const response = await httpClient.post<OrganizationHierarchyValidation>('/api/organization/validate-hierarchy', data)
    return response.data
  }

  /**
   * 搜索组织机构（支持模糊搜索）
   */
  async searchOrganizations(keyword: string, limit: number = 10): Promise<Organization[]> {
    const response = await httpClient.get<Organization[]>('/api/organization/search', {
      params: { keyword, limit }
    })
    return response.data
  }

  /**
   * 获取组织机构统计信息
   */
  async getOrganizationStats(): Promise<{
    total: number
    active: number
    inactive: number
    byLevel: Record<string, number>
    byUserCount: Record<string, number>
    maxDepth: number
    avgChildrenCount: number
  }> {
    const response = await httpClient.get<{
      total: number
      active: number
      inactive: number
      byLevel: Record<string, number>
      byUserCount: Record<string, number>
      maxDepth: number
      avgChildrenCount: number
    }>('/api/organization/stats')
    return response.data
  }

  /**
   * 导出组织机构数据
   */
  async exportOrganizations(params: OrganizationQueryParams = {}): Promise<Blob> {
    const response = await httpClient.get('/api/organization/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * 导入组织机构数据
   */
  async importOrganizations(file: File, options: { 
    updateExisting?: boolean
    skipErrors?: boolean
    validateHierarchy?: boolean
  } = {}): Promise<{ 
    success: number
    failed: number
    errors?: string[]
    warnings?: string[]
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('options', JSON.stringify(options))

    const response = await httpClient.post<{
      success: number
      failed: number
      errors?: string[]
      warnings?: string[]
    }>('/api/organization/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * 重建组织机构树结构索引
   */
  async rebuildOrganizationTree(): Promise<{ success: boolean; message: string }> {
    const response = await httpClient.post<{ success: boolean; message: string }>('/api/organization/rebuild-tree')
    return response.data
  }

  /**
   * 获取组织机构的完整层级信息
   */
  async getOrganizationHierarchyInfo(id: number): Promise<{
    level: number
    path: Organization[]
    children: Organization[]
    siblings: Organization[]
    userCount: number
    totalUserCount: number
  }> {
    const response = await httpClient.get<{
      level: number
      path: Organization[]
      children: Organization[]
      siblings: Organization[]
      userCount: number
      totalUserCount: number
    }>(`/api/organization/${id}/hierarchy-info`)
    return response.data
  }
}

// 创建组织机构API服务实例
export const organizationApiService = new OrganizationApiService()

// 导出默认实例
export default organizationApiService