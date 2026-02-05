/**
 * 系统配置API服务
 */

import { httpClient } from '../client'

export interface SystemConfig {
  id: number
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  group: string
  description?: string
  required: boolean
  defaultValue?: string
  options?: string[]
  validation?: string
  createTime: string
  updateTime: string
}

export interface ConfigGroup {
  name: string
  label: string
  description?: string
  configs: SystemConfig[]
}

export interface ConfigChangeLog {
  action: 'update' | 'batch_update' | 'reset' | 'restore'
  changes?: Array<{key: string, oldValue: any, newValue: any}>
  filename?: string
  timestamp: string
  group: string
}

export class ConfigApiService {
  async getConfigs(): Promise<ConfigGroup[]> {
    const response = await httpClient.get<ConfigGroup[]>('/api/config/groups')
    return response.data
  }

  async updateConfig(key: string, value: string): Promise<void> {
    await httpClient.put(`/api/config/${key}`, { value })
  }

  async batchUpdateConfigs(configs: Record<string, string>): Promise<void> {
    await httpClient.put('/api/config/batch', configs)
  }

  async resetConfig(key: string): Promise<void> {
    await httpClient.post(`/api/config/${key}/reset`)
  }

  async backupConfigs(): Promise<Blob> {
    const response = await httpClient.get('/api/config/backup', { 
      headers: {},
      responseType: 'blob' 
    } as any)
    return response.data
  }

  async restoreConfigs(file: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    await httpClient.post('/api/config/restore', formData)
  }

  async logConfigChanges(log: ConfigChangeLog): Promise<void> {
    await httpClient.post('/api/config/log', log)
  }

  async getConfigLogs(params?: {
    group?: string
    action?: string
    startTime?: string
    endTime?: string
    page?: number
    size?: number
  }): Promise<{
    logs: ConfigChangeLog[]
    total: number
  }> {
    const response = await httpClient.get('/api/config/logs', { 
      headers: {} as any,
      params 
    })
    return response.data
  }
}

export const configApiService = new ConfigApiService()
export default configApiService