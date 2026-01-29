/**
 * HTTP Client and API Infrastructure
 * Modern Axios-based HTTP client with interceptors, error handling, and request cancellation
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError, CancelTokenSource } from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import { useUserStore } from '../store/modules/user'

// API Response interface
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// Page result interface
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// Request configuration with retry options
export interface RequestConfig extends InternalAxiosRequestConfig {
  retry?: number
  retryDelay?: number
  showLoading?: boolean
  showError?: boolean
}

// Error types
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

export interface ApiError extends Error {
  type: ErrorType
  code?: number
  response?: AxiosResponse
}

// Request cancellation manager
class RequestCancellationManager {
  private pendingRequests = new Map<string, CancelTokenSource>()

  generateRequestKey(config: InternalAxiosRequestConfig): string {
    return `${config.method?.toUpperCase()}_${config.url}_${JSON.stringify(config.params || {})}`
  }

  addRequest(config: InternalAxiosRequestConfig): CancelTokenSource {
    const requestKey = this.generateRequestKey(config)
    
    // Cancel existing request with same key
    if (this.pendingRequests.has(requestKey)) {
      this.cancelRequest(requestKey)
    }

    const cancelTokenSource = axios.CancelToken.source()
    this.pendingRequests.set(requestKey, cancelTokenSource)
    
    return cancelTokenSource
  }

  removeRequest(config: InternalAxiosRequestConfig): void {
    const requestKey = this.generateRequestKey(config)
    this.pendingRequests.delete(requestKey)
  }

  cancelRequest(requestKey: string): void {
    const cancelTokenSource = this.pendingRequests.get(requestKey)
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Request cancelled due to navigation or duplicate request')
      this.pendingRequests.delete(requestKey)
    }
  }

  cancelAllRequests(): void {
    this.pendingRequests.forEach((cancelTokenSource, requestKey) => {
      cancelTokenSource.cancel('All requests cancelled')
    })
    this.pendingRequests.clear()
  }
}

// HTTP Client class
export class HttpClient {
  private axiosInstance: AxiosInstance
  private cancellationManager: RequestCancellationManager
  private loadingInstance: any = null

  constructor(baseURL?: string) {
    this.cancellationManager = new RequestCancellationManager()
    
    this.axiosInstance = axios.create({
      baseURL: baseURL || import.meta.env.VITE_API_BASE_URL || '',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add cancel token for request cancellation
        const cancelTokenSource = this.cancellationManager.addRequest(config)
        config.cancelToken = cancelTokenSource.token

        // Show loading if enabled
        const requestConfig = config as RequestConfig
        if (requestConfig.showLoading !== false) {
          this.showLoading()
        }

        // Add authentication token
        const userStore = useUserStore()
        const token = userStore.token
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }

        return config
      },
      (error: AxiosError) => {
        this.hideLoading()
        return Promise.reject(this.createApiError(error, ErrorType.SYSTEM_ERROR))
      }
    )

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Remove request from pending list
        this.cancellationManager.removeRequest(response.config)
        this.hideLoading()

        const res = response.data as ApiResponse

        // Check business logic response
        if (res.code !== 200) {
          return this.handleBusinessError(res, response)
        }

        return response
      },
      (error: AxiosError) => {
        // Remove request from pending list if config exists
        if (error.config) {
          this.cancellationManager.removeRequest(error.config)
        }
        this.hideLoading()

        return this.handleResponseError(error)
      }
    )
  }

  private showLoading(): void {
    if (!this.loadingInstance) {
      this.loadingInstance = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.5)'
      })
    }
  }

  private hideLoading(): void {
    if (this.loadingInstance) {
      this.loadingInstance.close()
      this.loadingInstance = null
    }
  }

  private handleBusinessError(res: ApiResponse, response: AxiosResponse): Promise<never> {
    const requestConfig = response.config as RequestConfig
    
    if (res.code === 401) {
      return this.handleAuthError(res, response)
    } else if (res.code === 403) {
      if (requestConfig.showError !== false) {
        ElMessage.error('您没有操作权限')
      }
      return Promise.reject(this.createApiError(new Error(res.message), ErrorType.PERMISSION_ERROR, res.code, response))
    } else {
      if (requestConfig.showError !== false) {
        ElMessage.error(res.message || '操作失败')
      }
      return Promise.reject(this.createApiError(new Error(res.message), ErrorType.BUSINESS_ERROR, res.code, response))
    }
  }

  private handleAuthError(res: ApiResponse, response: AxiosResponse): Promise<never> {
    const requestConfig = response.config as RequestConfig
    
    // Don't trigger logout for login requests
    if (response.config.url !== '/auth/login') {
      if (requestConfig.showError !== false) {
        ElMessage.error('登录已过期，请重新登录')
      }
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
    }
    
    return Promise.reject(this.createApiError(new Error(res.message), ErrorType.AUTH_ERROR, res.code, response))
  }

  private async handleResponseError(error: AxiosError): Promise<never> {
    // Handle cancelled requests
    if (axios.isCancel(error)) {
      return Promise.reject(this.createApiError(error, ErrorType.SYSTEM_ERROR))
    }

    const requestConfig = error.config as RequestConfig
    
    // Retry logic for network errors
    if (this.shouldRetry(error) && requestConfig) {
      const retryCount = requestConfig.retry || 0
      if (retryCount > 0) {
        requestConfig.retry = retryCount - 1
        const retryDelay = requestConfig.retryDelay || 1000
        
        await this.delay(retryDelay)
        return this.axiosInstance.request(requestConfig)
      }
    }

    // Handle different error types
    if (error.message.includes('Network Error')) {
      if (requestConfig?.showError !== false) {
        ElMessage.error('网络连接失败，请检查网络设置')
      }
      return Promise.reject(this.createApiError(error, ErrorType.NETWORK_ERROR))
    }

    if (error.message.includes('timeout')) {
      if (requestConfig?.showError !== false) {
        ElMessage.error('请求超时，请稍后重试')
      }
      return Promise.reject(this.createApiError(error, ErrorType.TIMEOUT_ERROR))
    }

    if (error.response) {
      return this.handleHttpStatusError(error)
    }

    if (requestConfig?.showError !== false) {
      ElMessage.error('请求失败，请稍后重试')
    }
    return Promise.reject(this.createApiError(error, ErrorType.SYSTEM_ERROR))
  }

  private handleHttpStatusError(error: AxiosError): Promise<never> {
    const status = error.response?.status
    const requestConfig = error.config as RequestConfig
    
    if (requestConfig?.showError !== false) {
      switch (status) {
        case 400:
          ElMessage.error('请求参数错误')
          break
        case 401:
          if (error.config?.url !== '/auth/login') {
            ElMessage.error('登录已过期，请重新登录')
            const userStore = useUserStore()
            userStore.logout()
            window.location.href = '/login'
          }
          break
        case 403:
          ElMessage.error('您没有操作权限')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        case 502:
          ElMessage.error('网关错误')
          break
        case 503:
          ElMessage.error('服务暂时不可用')
          break
        case 504:
          ElMessage.error('网关超时')
          break
        default:
          ElMessage.error(`请求失败 (${status})`)
      }
    }

    const errorType = status === 401 ? ErrorType.AUTH_ERROR : 
                     status === 403 ? ErrorType.PERMISSION_ERROR : 
                     ErrorType.SYSTEM_ERROR

    return Promise.reject(this.createApiError(error, errorType, status, error.response))
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors and timeout errors
    return error.message.includes('Network Error') || 
           error.message.includes('timeout') ||
           (error.response?.status && error.response.status >= 500)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private createApiError(
    originalError: Error | AxiosError, 
    type: ErrorType, 
    code?: number, 
    response?: AxiosResponse
  ): ApiError {
    const apiError = new Error(originalError.message) as ApiError
    apiError.type = type
    apiError.code = code
    apiError.response = response
    apiError.stack = originalError.stack
    return apiError
  }

  // Public methods
  public get<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get(url, config)
  }

  public post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post(url, data, config)
  }

  public put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put(url, data, config)
  }

  public delete<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete(url, config)
  }

  public patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch(url, data, config)
  }

  // Request cancellation methods
  public cancelRequest(url: string, method: string = 'GET', params?: any): void {
    const requestKey = this.cancellationManager.generateRequestKey({
      method,
      url,
      params
    })
    this.cancellationManager.cancelRequest(requestKey)
  }

  public cancelAllRequests(): void {
    this.cancellationManager.cancelAllRequests()
  }

  // Get axios instance for advanced usage
  public getInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

// Create default HTTP client instance
export const httpClient = new HttpClient()

// Export default instance methods for convenience
export const { get, post, put, delete: del, patch, cancelRequest, cancelAllRequests } = httpClient
export default httpClient