/**
 * 通用工具函数类
 * 提供日期、数字、字符串、验证等常用操作的工具函数
 * 
 * @author zhengbing
 * @date 2025-11-11
 */

/**
 * 格式化日期时间
 * @param {Date|string|number} date - 日期对象、字符串或时间戳
 * @param {string} format - 格式化字符串 (YYYY-MM-DD HH:mm:ss)
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化数字
 * @param {number} num - 数字
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的数字字符串
 */
export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined || isNaN(num)) return '0'
  
  return num.toFixed(decimals)
}

/**
 * 格式化金额
 * @param {number} amount - 金额
 * @param {string} currency - 货币符号
 * @returns {string} 格式化后的金额字符串
 */
export const formatMoney = (amount, currency = '¥') => {
  if (amount === null || amount === undefined || isNaN(amount)) return `${currency}0.00`
  
  const formatted = new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
  
  return `${currency}${formatted}`
}

/**
 * 格式化百分比
 * @param {number} value - 数值
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的百分比字符串
 */
export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '0%'
  
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * 生成随机ID
 * @param {number} length - ID长度
 * @returns {string} 随机ID
 */
export const generateId = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 生成唯一ID（基于时间戳）
 * @returns {string} 唯一ID
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 判断是否为空值
 * @param {any} value - 要判断的值
 * @returns {boolean} 是否为空
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  return false
}

/**
 * 判断是否为非空值
 * @param {any} value - 要判断的值
 * @returns {boolean} 是否为非空
 */
export const isNotEmpty = (value) => {
  return !isEmpty(value)
}

/**
 * 数组去重
 * @param {Array} arr - 原数组
 * @param {string} key - 去重键（对象数组时使用）
 * @returns {Array} 去重后的数组
 */
export const uniqueArray = (arr, key) => {
  if (!Array.isArray(arr)) return []
  
  if (key) {
    return arr.filter((item, index, self) => {
      return index === self.findIndex(t => t[key] === item[key])
    })
  } else {
    return [...new Set(arr)]
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, wait = 300) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, limit = 300) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
export const validatePhone = (phone) => {
  const re = /^1[3-9]\d{9}$/
  return re.test(phone)
}

/**
 * 验证身份证号格式
 * @param {string} idCard - 身份证号
 * @returns {boolean} 是否有效
 */
export const validateIdCard = (idCard) => {
  const re = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return re.test(idCard)
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {number} 密码强度 (0-弱, 1-中, 2-强)
 */
export const validatePasswordStrength = (password) => {
  if (password.length < 6) return 0
  
  let strength = 0
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++
  
  return Math.min(strength, 2)
}

/**
 * 截取字符串
 * @param {string} str - 字符串
 * @param {number} length - 截取长度
 * @param {string} suffix - 后缀
 * @returns {string} 截取后的字符串
 */
export const truncateString = (str, length = 20, suffix = '...') => {
  if (!str || typeof str !== 'string') return ''
  if (str.length <= length) return str
  
  return str.substring(0, length) + suffix
}

/**
 * 获取URL参数
 * @param {string} url - URL地址
 * @returns {Object} 参数对象
 */
export const getUrlParams = (url = window.location.href) => {
  const params = {}
  const urlParts = url.split('?')
  
  if (urlParts.length > 1) {
    const queryString = urlParts[1]
    const pairs = queryString.split('&')
    
    pairs.forEach(pair => {
      const [key, value] = pair.split('=')
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    })
  }
  
  return params
}

/**
 * 构建URL参数
 * @param {Object} params - 参数对象
 * @returns {string} 参数字符串
 */
export const buildUrlParams = (params) => {
  if (!params || typeof params !== 'object') return ''
  
  const pairs = []
  for (const key in params) {
    if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== undefined) {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    }
  }
  
  return pairs.length > 0 ? `?${pairs.join('&')}` : ''
}

/**
 * 获取随机颜色
 * @returns {string} 十六进制颜色值
 */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

/**
 * 计算两个日期之间的天数
 * @param {Date|string|number} date1 - 开始日期
 * @param {Date|string|number} date2 - 结束日期
 * @returns {number} 天数差
 */
export const getDaysBetween = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0
  
  const diffTime = Math.abs(d2 - d1)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * 数组分组
 * @param {Array} arr - 原数组
 * @param {Function|string} groupBy - 分组依据（函数或属性名）
 * @returns {Object} 分组后的对象
 */
export const groupBy = (arr, groupBy) => {
  if (!Array.isArray(arr)) return {}
  
  return arr.reduce((result, item) => {
    const key = typeof groupBy === 'function' ? groupBy(item) : item[groupBy]
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
    return result
  }, {})
}

/**
 * 对象排序
 * @param {Array} arr - 原数组
 * @param {string} key - 排序键
 * @param {boolean} ascending - 是否升序
 * @returns {Array} 排序后的数组
 */
export const sortBy = (arr, key, ascending = true) => {
  if (!Array.isArray(arr)) return []
  
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return ascending ? -1 : 1
    if (a[key] > b[key]) return ascending ? 1 : -1
    return 0
  })
}

/**
 * 安全获取对象属性
 * @param {Object} obj - 对象
 * @param {string} path - 属性路径
 * @param {any} defaultValue - 默认值
 * @returns {any} 属性值或默认值
 */
export const get = (obj, path, defaultValue = undefined) => {
  if (obj === null || obj === undefined) return defaultValue
  
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result[key] === null || result[key] === undefined) {
      return defaultValue
    }
    result = result[key]
  }
  
  return result
}

/**
 * 安全设置对象属性
 * @param {Object} obj - 对象
 * @param {string} path - 属性路径
 * @param {any} value - 属性值
 * @returns {Object} 设置后的对象
 */
export const set = (obj, path, value) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj
  
  const keys = path.split('.')
  const lastKey = keys.pop()
  let result = obj
  
  for (const key of keys) {
    if (result[key] === null || result[key] === undefined) {
      result[key] = {}
    }
    result = result[key]
  }
  
  result[lastKey] = value
  return obj
}

export default {
  formatDate,
  formatNumber,
  formatMoney,
  formatPercent,
  generateId,
  generateUniqueId,
  deepClone,
  isEmpty,
  isNotEmpty,
  uniqueArray,
  debounce,
  throttle,
  validateEmail,
  validatePhone,
  validateIdCard,
  validatePasswordStrength,
  truncateString,
  getUrlParams,
  buildUrlParams,
  getRandomColor,
  getDaysBetween,
  groupBy,
  sortBy,
  get,
  set
}