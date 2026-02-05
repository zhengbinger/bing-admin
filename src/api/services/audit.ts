/**
 * 审计日志API服务
 * 提供日志查询、搜索、导出等功能
 */

import { httpClient } from '../client'
import type { PageResult } from '../../types'

// 审计日志接口
export interface AuditLog {
  id: number
  userId: number
  username: string
  module: string
  action: string
  description: string
  ipAddress: string
  userAgent: string
  requestData?: any
  responseData?: any
  status: 'success' | 'failed' | 'warning'
  duration?: number
  createTime: string
}

// 日志查询参数接口
export interface AuditLogQueryParams {
  page?: number
  size?: number
  userId?: number
  username?: string
  module?: string
  action?: string
  status?: 'success' | 'failed' | 'warning'
  ipAddress?: string
  startTime?: string
  endTime?: string
  keyword?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 日志统计接口
export interface AuditLogStats {
  total: number
  todayCount: number
  successCount: number
  failedCount: number
  warningCount: number
  topModules: Array<{ module: string; count: number }>
  topActions: Array<{ action: string; count: number }>
  topUsers: Array<{ username: string; count: number }>
  hourlyStats: Array<{ hour: number; count: number }>
}

// 日志导出参数接口
export interface LogExportParams extends AuditLogQueryParams {
  format: 'csv' | 'excel' | 'json'
  fields?: string[]
}

/**
 * 审计日志API服务类
 */
export class AuditLogApiService {
  /**
   * 获取审计日志列表（分页）
   */
  async getAuditLogs(params: AuditLogQueryParams = {}): Promise<PageResult<AuditLog>> {
    const response = await httpClient.get<PageResult<AuditLog>>('/api/audit/logs', { params })
    return response.data
  }

  /**
   * 获取审计日志详情
   */
  async getAuditLogById(id: number): Promise<AuditLog> {
    const response = await httpClient.get<AuditLog>(`/api/audit/logs/${id}`)
    return response.data
  }

  /**
   * 搜索审计日志
   */
  async searchAuditLogs(keyword: string, params: Omit<AuditLogQueryParams, 'keyword'> = {}): Promise<PageResult<AuditLog>> {
    const response = await httpClient.get<PageResult<AuditLog>>('/api/audit/logs/search', {
      params: { ...params, keyword }
    })
    return response.data
  }

  /**
   * 获取审计日志统计信息
   */
  async getAuditLogStats(params?: {
    startTime?: string
    endTime?: string
    module?: string
  }): Promise<AuditLogStats> {
    const response = await httpClient.get<AuditLogStats>('/api/audit/stats', { params })
    return response.data
  }

  /**
   * 导出审计日志
   */
  async exportAuditLogs(params: LogExportParams): Promise<Blob> {
    const response = await httpClient.post('/api/audit/logs/export', params, {
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * 获取模块列表
   */
  async getModules(): Promise<string[]> {
    const response = await httpClient.get<string[]>('/api/audit/modules')
    return response.data
  }

  /**
   * 获取操作列表
   */
  async getActions(module?: string): Promise<string[]> {
    const response = await httpClient.get<string[]>('/api/audit/actions', {
      params: { module }
    })
    return response.data
  }

  /**
   * 批量删除审计日志（管理员功能）
   */
  async batchDeleteLogs(ids: number[]): Promise<void> {
    await httpClient.post('/api/audit/logs/batch-delete', { ids })
  }

  /**
   * 清理过期日志
   */
  async cleanupExpiredLogs(days: number): Promise<{ deletedCount: number }> {
    const response = await httpClient.post<{ deletedCount: number }>('/api/audit/logs/cleanup', { days })
    return response.data
  }

  /**
   * 获取实时日志流（WebSocket连接）
   */
  connectRealTimeLogs(onMessage: (log: AuditLog) => void, onError?: (error: any) => void): WebSocket | null {
    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/audit/logs/realtime`
      const ws = new WebSocket(wsUrl)
      
      ws.onmessage = (event) => {
        try {
          const log = JSON.parse(event.data) as AuditLog
          onMessage(log)
        } catch (error) {
          console.error('Failed to parse real-time log:', error)
          onError?.(error)
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        onError?.(error)
      }
      
      return ws
    } catch (error) {
      console.error('Failed to connect to real-time logs:', error)
      onError?.(error)
      return null
    }
  }

  /**
   * 获取安全事件日志
   */
  async getSecurityEvents(params: AuditLogQueryParams = {}): Promise<PageResult<AuditLog>> {
    const response = await httpClient.get<PageResult<AuditLog>>('/api/audit/security-events', { params })
    return response.data
  }

  /**
   * 标记安全事件为已处理
   */
  async markSecurityEventHandled(id: number, note?: string): Promise<void> {
    await httpClient.post(`/api/audit/security-events/${id}/handle`, { note })
  }

  /**
   * 获取用户操作轨迹
   */
  async getUserActionTrail(userId: number, params?: {
    startTime?: string
    endTime?: string
    page?: number
    size?: number
  }): Promise<PageResult<AuditLog>> {
    const response = await httpClient.get<PageResult<AuditLog>>(`/api/audit/users/${userId}/trail`, { params })
    return response.data
  }

  /**
   * 获取IP地址操作记录
   */
  async getIpActionHistory(ipAddress: string, params?: {
    startTime?: string
    endTime?: string
    page?: number
    size?: number
  }): Promise<PageResult<AuditLog>> {
    const response = await httpClient.get<PageResult<AuditLog>>('/api/audit/ip-history', {
      params: { ...params, ipAddress }
    })
    return response.data
  }
}

// 创建审计日志API服务实例
export const auditLogApiService = new AuditLogApiService()

// 导出默认实例
export default auditLogApiService