/**
 * 日志工具类
 * 用于记录应用的各种操作和错误信息
 * 支持不同级别的日志记录和日志格式化
 * 
 * @author zhengbing
 * @date 2025-11-11
 */

// 日志级别枚举
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
}

// 日志配置
const LOG_CONFIG = {
  // 日志输出级别，低于此级别的日志不会输出
  level: LogLevel.DEBUG,
  // 是否输出到控制台
  console: true,
  // 是否启用日志存储
  storage: false,
  // 存储日志的最大数量
  maxStorage: 1000,
  // 是否启用远程日志
  remote: false,
  // 远程日志URL
  remoteUrl: '/api/logs'
}

// 日志级别权重
const LEVEL_WEIGHT = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.FATAL]: 4
}

/**
 * 日志工具类
 */
export class Logger {
  constructor(name = 'App') {
    this.name = name
  }

  /**
   * 检查日志级别是否允许输出
   * @param {string} level - 日志级别
   * @returns {boolean} 是否允许输出
   */
  static isLevelEnabled(level) {
    return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[LOG_CONFIG.level]
  }

  /**
   * 格式化日志信息
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   * @returns {Object} 格式化后的日志对象
   */
  formatLog(level, message, data = null) {
    return {
      timestamp: new Date().toISOString(),
      name: this.name,
      level: level,
      message: message,
      data: data,
      userAgent: navigator.userAgent,
      url: window.location.href,
      // 可以添加更多上下文信息
      sessionId: this.getSessionId()
    }
  }

  /**
   * 获取会话ID
   * @returns {string} 会话ID
   */
  getSessionId() {
    // 这里可以从用户存储或状态管理中获取会话ID
    return localStorage.getItem('sessionId') || 'anonymous'
  }

  /**
   * 输出日志到控制台
   * @param {Object} log - 格式化后的日志对象
   */
  logToConsole(log) {
    if (!LOG_CONFIG.console) return

    const { level, timestamp, name, message, data } = log
    const prefix = `[${timestamp}] [${level}] [${name}]`

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data)
        break
      case LogLevel.INFO:
        console.info(prefix, message, data)
        break
      case LogLevel.WARN:
        console.warn(prefix, message, data)
        break
      case LogLevel.ERROR:
        console.error(prefix, message, data)
        break
      case LogLevel.FATAL:
        console.error(prefix, message, data)
        break
      default:
        console.log(prefix, message, data)
    }
  }

  /**
   * 存储日志到本地存储
   * @param {Object} log - 格式化后的日志对象
   */
  storeLog(log) {
    if (!LOG_CONFIG.storage) return

    try {
      const logs = JSON.parse(localStorage.getItem('appLogs') || '[]')
      logs.push(log)

      // 限制日志数量
      if (logs.length > LOG_CONFIG.maxStorage) {
        logs.splice(0, logs.length - LOG_CONFIG.maxStorage)
      }

      localStorage.setItem('appLogs', JSON.stringify(logs))
    } catch (error) {
      console.error('存储日志失败:', error)
    }
  }

  /**
   * 发送日志到远程服务器
   * @param {Object} log - 格式化后的日志对象
   */
  async sendRemoteLog(log) {
    if (!LOG_CONFIG.remote) return

    try {
      // 使用fetch发送日志，避免循环依赖
      await fetch(LOG_CONFIG.remoteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(log)
      })
    } catch (error) {
      // 避免日志发送失败导致无限循环
      console.error('发送远程日志失败:', error)
    }
  }

  /**
   * 记录调试日志
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   */
  debug(message, data = null) {
    if (!Logger.isLevelEnabled(LogLevel.DEBUG)) return

    const log = this.formatLog(LogLevel.DEBUG, message, data)
    this.logToConsole(log)
    this.storeLog(log)
    this.sendRemoteLog(log)
  }

  /**
   * 记录信息日志
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   */
  info(message, data = null) {
    if (!Logger.isLevelEnabled(LogLevel.INFO)) return

    const log = this.formatLog(LogLevel.INFO, message, data)
    this.logToConsole(log)
    this.storeLog(log)
    this.sendRemoteLog(log)
  }

  /**
   * 记录警告日志
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   */
  warn(message, data = null) {
    if (!Logger.isLevelEnabled(LogLevel.WARN)) return

    const log = this.formatLog(LogLevel.WARN, message, data)
    this.logToConsole(log)
    this.storeLog(log)
    this.sendRemoteLog(log)
  }

  /**
   * 记录错误日志
   * @param {string} message - 日志消息
   * @param {Object|Error} error - 错误对象
   */
  error(message, error = null) {
    if (!Logger.isLevelEnabled(LogLevel.ERROR)) return

    let errorData = error
    if (error instanceof Error) {
      errorData = {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    }

    const log = this.formatLog(LogLevel.ERROR, message, errorData)
    this.logToConsole(log)
    this.storeLog(log)
    this.sendRemoteLog(log)
  }

  /**
   * 记录致命错误日志
   * @param {string} message - 日志消息
   * @param {Object|Error} error - 错误对象
   */
  fatal(message, error = null) {
    if (!Logger.isLevelEnabled(LogLevel.FATAL)) return

    let errorData = error
    if (error instanceof Error) {
      errorData = {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    }

    const log = this.formatLog(LogLevel.FATAL, message, errorData)
    this.logToConsole(log)
    this.storeLog(log)
    this.sendRemoteLog(log)
  }

  /**
   * 获取本地存储的日志
   * @param {number} limit - 获取日志的数量限制
   * @returns {Array} 日志数组
   */
  static getStoredLogs(limit = null) {
    try {
      const logs = JSON.parse(localStorage.getItem('appLogs') || '[]')
      if (limit) {
        return logs.slice(-limit)
      }
      return logs
    } catch (error) {
      console.error('获取存储日志失败:', error)
      return []
    }
  }

  /**
   * 清空本地存储的日志
   */
  static clearStoredLogs() {
    try {
      localStorage.removeItem('appLogs')
    } catch (error) {
      console.error('清空存储日志失败:', error)
    }
  }

  /**
   * 更新日志配置
   * @param {Object} config - 新的配置
   */
  static updateConfig(config) {
    Object.assign(LOG_CONFIG, config)
  }
}

// 创建默认日志实例
const defaultLogger = new Logger()

// 导出默认日志实例
export default {
  debug: defaultLogger.debug.bind(defaultLogger),
  info: defaultLogger.info.bind(defaultLogger),
  warn: defaultLogger.warn.bind(defaultLogger),
  error: defaultLogger.error.bind(defaultLogger),
  fatal: defaultLogger.fatal.bind(defaultLogger),
  getStoredLogs: Logger.getStoredLogs,
  clearStoredLogs: Logger.clearStoredLogs,
  updateConfig: Logger.updateConfig
}

// 导出创建日志实例的工厂函数
export const createLogger = (name) => new Logger(name)