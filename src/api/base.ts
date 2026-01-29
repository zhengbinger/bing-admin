/**
 * Base API Service Class
 * Provides common methods and patterns for all API services
 */

import { httpClient, ApiResponse, PageResult, RequestConfig } from './client'

// Common query parameters interface
export interface BaseQueryParams {
  page?: number
  size?: number
  sort?: string
  order?: 'asc' | 'desc'
}

// Base entity interface
export interface BaseEntity {
  id: number
  createTime?: Date | string
  updateTime?: Date | string
}

// Base API service class
export abstract class BaseApiService<T extends BaseEntity, CreateRequest = Partial<T>, UpdateRequest = Partial<T>> {
  protected baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * Get paginated list
   */
  async getList(params?: BaseQueryParams & Record<string, any>, config?: RequestConfig): Promise<ApiResponse<PageResult<T>>> {
    return httpClient.get(`${this.baseUrl}`, { params, ...config })
  }

  /**
   * Get all items (without pagination)
   */
  async getAll(params?: Record<string, any>, config?: RequestConfig): Promise<ApiResponse<T[]>> {
    return httpClient.get(`${this.baseUrl}/all`, { params, ...config })
  }

  /**
   * Get item by ID
   */
  async getById(id: number, config?: RequestConfig): Promise<ApiResponse<T>> {
    return httpClient.get(`${this.baseUrl}/${id}`, config)
  }

  /**
   * Create new item
   */
  async create(data: CreateRequest, config?: RequestConfig): Promise<ApiResponse<T>> {
    return httpClient.post(`${this.baseUrl}`, data, config)
  }

  /**
   * Update existing item
   */
  async update(id: number, data: UpdateRequest, config?: RequestConfig): Promise<ApiResponse<T>> {
    return httpClient.put(`${this.baseUrl}/${id}`, data, config)
  }

  /**
   * Partially update existing item
   */
  async patch(id: number, data: Partial<UpdateRequest>, config?: RequestConfig): Promise<ApiResponse<T>> {
    return httpClient.patch(`${this.baseUrl}/${id}`, data, config)
  }

  /**
   * Delete item by ID
   */
  async delete(id: number, config?: RequestConfig): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/${id}`, config)
  }

  /**
   * Batch delete items
   */
  async batchDelete(ids: number[], config?: RequestConfig): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/batch`, { 
      data: { ids }, 
      ...config 
    })
  }

  /**
   * Check if item exists
   */
  async exists(id: number, config?: RequestConfig): Promise<ApiResponse<boolean>> {
    return httpClient.get(`${this.baseUrl}/${id}/exists`, config)
  }

  /**
   * Get item count
   */
  async count(params?: Record<string, any>, config?: RequestConfig): Promise<ApiResponse<number>> {
    return httpClient.get(`${this.baseUrl}/count`, { params, ...config })
  }

  /**
   * Search items
   */
  async search(query: string, params?: BaseQueryParams & Record<string, any>, config?: RequestConfig): Promise<ApiResponse<PageResult<T>>> {
    return httpClient.get(`${this.baseUrl}/search`, { 
      params: { q: query, ...params }, 
      ...config 
    })
  }

  /**
   * Export items
   */
  async export(params?: Record<string, any>, config?: RequestConfig): Promise<ApiResponse<Blob>> {
    return httpClient.get(`${this.baseUrl}/export`, { 
      params, 
      responseType: 'blob',
      ...config 
    })
  }

  /**
   * Import items
   */
  async import(file: File, config?: RequestConfig): Promise<ApiResponse<{ success: number; failed: number; errors?: string[] }>> {
    const formData = new FormData()
    formData.append('file', file)
    
    return httpClient.post(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
  }

  /**
   * Batch update items
   */
  async batchUpdate(updates: Array<{ id: number; data: Partial<UpdateRequest> }>, config?: RequestConfig): Promise<ApiResponse<T[]>> {
    return httpClient.put(`${this.baseUrl}/batch`, { updates }, config)
  }

  /**
   * Get item history/audit log
   */
  async getHistory(id: number, params?: BaseQueryParams, config?: RequestConfig): Promise<ApiResponse<PageResult<any>>> {
    return httpClient.get(`${this.baseUrl}/${id}/history`, { params, ...config })
  }

  /**
   * Restore deleted item (if supported)
   */
  async restore(id: number, config?: RequestConfig): Promise<ApiResponse<T>> {
    return httpClient.post(`${this.baseUrl}/${id}/restore`, {}, config)
  }

  /**
   * Duplicate item
   */
  async duplicate(id: number, config?: RequestConfig): Promise<ApiResponse<T>> {
    return httpClient.post(`${this.baseUrl}/${id}/duplicate`, {}, config)
  }

  /**
   * Get related items
   */
  async getRelated(id: number, relation: string, params?: BaseQueryParams, config?: RequestConfig): Promise<ApiResponse<PageResult<any>>> {
    return httpClient.get(`${this.baseUrl}/${id}/${relation}`, { params, ...config })
  }

  /**
   * Validate item data
   */
  async validate(data: CreateRequest | UpdateRequest, config?: RequestConfig): Promise<ApiResponse<{ valid: boolean; errors?: Record<string, string[]> }>> {
    return httpClient.post(`${this.baseUrl}/validate`, data, config)
  }

  /**
   * Get item statistics
   */
  async getStats(params?: Record<string, any>, config?: RequestConfig): Promise<ApiResponse<Record<string, any>>> {
    return httpClient.get(`${this.baseUrl}/stats`, { params, ...config })
  }

  /**
   * Custom action on item
   */
  async action(id: number, action: string, data?: any, config?: RequestConfig): Promise<ApiResponse<any>> {
    return httpClient.post(`${this.baseUrl}/${id}/${action}`, data, config)
  }

  /**
   * Custom bulk action
   */
  async bulkAction(action: string, ids: number[], data?: any, config?: RequestConfig): Promise<ApiResponse<any>> {
    return httpClient.post(`${this.baseUrl}/bulk/${action}`, { ids, ...data }, config)
  }
}

// Utility functions for common API operations
export class ApiUtils {
  /**
   * Build query string from parameters
   */
  static buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })
    
    return searchParams.toString()
  }

  /**
   * Handle file download from API response
   */
  static downloadFile(response: ApiResponse<Blob>, filename?: string): void {
    const blob = response.data
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  /**
   * Format error messages for display
   */
  static formatErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error
    }
    
    if (error?.message) {
      return error.message
    }
    
    if (error?.response?.data?.message) {
      return error.response.data.message
    }
    
    return '操作失败，请稍后重试'
  }

  /**
   * Debounce function for search operations
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null
    return function (...args: Parameters<T>) {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxRetries) {
          throw lastError
        }
        
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  }

  /**
   * Transform flat array to tree structure
   */
  static arrayToTree<T extends { id: number; parentId: number | null }>(
    items: T[],
    parentId: number | null = null
  ): (T & { children: T[] })[] {
    return items
      .filter(item => item.parentId === parentId)
      .map(item => ({
        ...item,
        children: this.arrayToTree(items, item.id)
      }))
  }

  /**
   * Transform tree structure to flat array
   */
  static treeToArray<T extends { children?: T[] }>(tree: T[]): T[] {
    const result: T[] = []
    const stack = [...tree]
    
    while (stack.length) {
      const node = stack.pop()!
      result.push(node)
      if (node.children) {
        stack.push(...node.children)
      }
    }
    
    return result
  }
}

export default BaseApiService