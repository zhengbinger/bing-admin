/**
 * 错误处理工具类
 * 统一捕获和处理应用中的各种错误
 * 提供错误信息格式化和错误处理方法
 * 
 * @author zhengbing
 * @date 2025-11-11
 */

import { ElMessage, ElNotification } from 'element-plus'

// 错误类型枚举
export const ErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',     // 网络错误
  API_ERROR: 'API_ERROR',             // API错误
  VALIDATION_ERROR: 'VALIDATION_ERROR', // 验证错误
  PERMISSION_ERROR: 'PERMISSION_ERROR', // 权限错误
  SERVER_ERROR: 'SERVER_ERROR',       // 服务器错误
  CLIENT_ERROR: 'CLIENT_ERROR',       // 客户端错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'      // 未知错误
}

/**
 * 错误处理类
 */
export class ErrorHandler {
  /**
   * 格式化错误信息
   * @param {Error|Object} error - 错误对象
   * @returns {Object} 格式化后的错误信息
   */
  static formatError(error) {
    if (!error) {
      return {
        type: ErrorType.UNKNOWN_ERROR,
        code: 'UNKNOWN',
        message: '未知错误',
        detail: null
      }
    }

    // 如果是Error实例
    if (error instanceof Error) {
      return {
        type: ErrorType.CLIENT_ERROR,
        code: error.name || 'CLIENT_ERROR',
        message: error.message || '客户端错误',
        detail: error.stack
      }
    }

    // 如果是API错误响应
    if (error.response) {
      const { status, data } = error.response
      return {
        type: this.getErrorType(status),
        code: status,
        message: data.message || this.getStatusMessage(status),
        detail: data.detail || JSON.stringify(data),
        response: error.response
      }
    }

    // 如果是请求错误
    if (error.request) {
      return {
        type: ErrorType.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
        message: '网络错误，无法连接到服务器',
        detail: JSON.stringify(error.request)
      }
    }

    // 其他类型错误
    return {
      type: ErrorType.UNKNOWN_ERROR,
      code: error.code || 'UNKNOWN',
      message: error.message || '未知错误',
      detail: JSON.stringify(error)
    }
  }

  /**
   * 根据HTTP状态码获取错误类型
   * @param {number} status - HTTP状态码
   * @returns {string} 错误类型
   */
  static getErrorType(status) {
    if (status >= 400 && status < 500) {
      if (status === 401 || status === 403) {
        return ErrorType.PERMISSION_ERROR
      } else if (status === 400) {
        return ErrorType.VALIDATION_ERROR
      }
      return ErrorType.CLIENT_ERROR
    } else if (status >= 500) {
      return ErrorType.SERVER_ERROR
    } else if (status === 0) {
      return ErrorType.NETWORK_ERROR
    }
    return ErrorType.UNKNOWN_ERROR
  }

  /**
   * 根据HTTP状态码获取默认错误信息
   * @param {number} status - HTTP状态码
   * @returns {string} 默认错误信息
   */
  static getStatusMessage(status) {
    const messages = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '拒绝访问，没有权限',
      404: '请求资源不存在',
      405: '请求方法不允许',
      406: '请求格式不支持',
      408: '请求超时',
      409: '请求冲突',
      429: '请求过于频繁，请稍后再试',
      500: '服务器内部错误',
      501: '服务器未实现该功能',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时'
    }
    return messages[status] || '请求失败'
  }

  /**
   * 全局错误处理
   * @param {Error|Object} error - 错误对象
   * @param {Object} options - 处理选项
   * @returns {Promise<void>} 处理结果
   */
  static async handleError(error, options = {}) {
    const { showMessage = true, showNotification = false, redirect = null } = options
    
    // 格式化错误信息
    const formattedError = this.formatError(error)
    
    // 记录错误日志
    this.logError(formattedError)
    
    // 显示错误信息
    if (showMessage) {
      ElMessage.error(formattedError.message)
    } else if (showNotification) {
      ElNotification.error({
        title: '错误',
        message: formattedError.message,
        duration: 5000
      })
    }
    
    // 特殊错误处理
    switch (formattedError.type) {
      case ErrorType.PERMISSION_ERROR:
        // 处理权限错误（如重定向到登录页）
        if (redirect) {
          // 可以使用Vue Router的push方法重定向
          const router = await import('../router')
          router.default.push(redirect)
        }
        break
      case ErrorType.NETWORK_ERROR:
        // 处理网络错误
        break
      case ErrorType.SERVER_ERROR:
        // 处理服务器错误
        break
      default:
        // 其他错误处理
        break
    }
    
    // 抛出错误，允许上层继续处理
    throw formattedError
  }

  /**
   * 记录错误日志
   * @param {Object} error - 格式化后的错误信息
   */
  static logError(error) {
    // 这里可以集成日志系统，如Sentry、log4js等
    console.error('[' + new Date().toISOString() + '] ERROR:', {
      type: error.type,
      code: error.code,
      message: error.message,
      detail: error.detail
    })
  }

  /**
   * 处理Promise错误
   * @param {Function} handler - 错误处理函数
   * @returns {Function} 包装后的错误处理函数
   */
  static handlePromiseError(handler = null) {
    return (error) => {
      if (handler) {
        return handler(error)
      }
      return this.handleError(error)
    }
  }

  /**
   * 捕获并处理函数执行错误
   * @param {Function} func - 要执行的函数
   * @param {Object} options - 处理选项
   * @returns {Function} 包装后的函数
   */
  static tryCatch(func, options = {}) {
    return async (...args) => {
      try {
        return await func(...args)
      } catch (error) {
        return this.handleError(error, options)
      }
    }
  }
}

/**
 * 全局错误捕获
 * @param {Vue} app - Vue应用实例
 */
export const setupGlobalErrorHandler = (app) => {
  // 捕获Vue组件错误
  app.config.errorHandler = (error, instance, info) => {
    const formattedError = ErrorHandler.formatError(error)
    formattedError.componentInfo = info
    formattedError.componentInstance = instance
    
    ErrorHandler.logError(formattedError)
    ErrorHandler.handleError(error, { showMessage: true })
  }

  // 捕获未处理的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.handleError(event.reason, { showMessage: true })
  })

  // 捕获全局错误
  window.addEventListener('error', (event) => {
    ErrorHandler.handleError(event.error, { showMessage: true })
  })
}

export default ErrorHandler