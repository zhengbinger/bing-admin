/**
 * 日期时间工具函数
 * 提供日期格式化、解析等功能
 */

import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'

// 获取当前语言环境
const getLocale = () => {
  const lang = localStorage.getItem('language') || 'zh-CN'
  return lang === 'zh-CN' ? zhCN : enUS
}

/**
 * 格式化日期
 * @param date 日期对象、字符串或时间戳
 * @param formatStr 格式字符串，默认为 'yyyy-MM-dd HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  formatStr: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  if (!date) return '-'
  
  try {
    let dateObj: Date
    
    if (typeof date === 'string') {
      // 处理ISO字符串
      dateObj = parseISO(date)
    } else if (typeof date === 'number') {
      // 处理时间戳
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return '-'
    }
    
    if (!isValid(dateObj)) {
      return '-'
    }
    
    return format(dateObj, formatStr, { locale: getLocale() })
  } catch (error) {
    console.error('日期格式化失败:', error)
    return '-'
  }
}

/**
 * 格式化日期（仅日期部分）
 * @param date 日期
 * @returns 格式化后的日期字符串
 */
export function formatDateOnly(date: Date | string | number | null | undefined): string {
  return formatDate(date, 'yyyy-MM-dd')
}

/**
 * 格式化时间（仅时间部分）
 * @param date 日期
 * @returns 格式化后的时间字符串
 */
export function formatTimeOnly(date: Date | string | number | null | undefined): string {
  return formatDate(date, 'HH:mm:ss')
}

/**
 * 格式化日期时间（精确到分钟）
 * @param date 日期
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  return formatDate(date, 'yyyy-MM-dd HH:mm')
}

/**
 * 格式化相对时间
 * @param date 日期
 * @returns 相对时间字符串（如：2小时前）
 */
export function formatRelativeTime(date: Date | string | number | null | undefined): string {
  if (!date) return '-'
  
  try {
    let dateObj: Date
    
    if (typeof date === 'string') {
      dateObj = parseISO(date)
    } else if (typeof date === 'number') {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return '-'
    }
    
    if (!isValid(dateObj)) {
      return '-'
    }
    
    return formatDistanceToNow(dateObj, { 
      addSuffix: true, 
      locale: getLocale() 
    })
  } catch (error) {
    console.error('相对时间格式化失败:', error)
    return '-'
  }
}

/**
 * 智能格式化日期
 * 根据时间距离现在的长短选择不同的格式
 * @param date 日期
 * @returns 格式化后的日期字符串
 */
export function formatSmartDate(date: Date | string | number | null | undefined): string {
  if (!date) return '-'
  
  try {
    let dateObj: Date
    
    if (typeof date === 'string') {
      dateObj = parseISO(date)
    } else if (typeof date === 'number') {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return '-'
    }
    
    if (!isValid(dateObj)) {
      return '-'
    }
    
    const now = new Date()
    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      // 24小时内显示相对时间
      return formatRelativeTime(dateObj)
    } else if (diffInHours < 24 * 7) {
      // 一周内显示月日和时间
      return format(dateObj, 'MM-dd HH:mm', { locale: getLocale() })
    } else if (dateObj.getFullYear() === now.getFullYear()) {
      // 同年显示月日
      return format(dateObj, 'MM-dd', { locale: getLocale() })
    } else {
      // 不同年显示完整日期
      return format(dateObj, 'yyyy-MM-dd', { locale: getLocale() })
    }
  } catch (error) {
    console.error('智能日期格式化失败:', error)
    return '-'
  }
}

/**
 * 解析日期字符串
 * @param dateStr 日期字符串
 * @returns Date对象或null
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  
  try {
    const date = parseISO(dateStr)
    return isValid(date) ? date : null
  } catch (error) {
    console.error('日期解析失败:', error)
    return null
  }
}

/**
 * 检查日期是否有效
 * @param date 日期
 * @returns 是否有效
 */
export function isValidDate(date: any): boolean {
  if (!date) return false
  
  try {
    let dateObj: Date
    
    if (typeof date === 'string') {
      dateObj = parseISO(date)
    } else if (typeof date === 'number') {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return false
    }
    
    return isValid(dateObj)
  } catch (error) {
    return false
  }
}

/**
 * 获取日期范围的开始和结束时间
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 日期范围对象
 */
export function getDateRange(
  startDate: Date | string | null, 
  endDate: Date | string | null
): { start: string | null; end: string | null } {
  const start = startDate ? formatDate(startDate, 'yyyy-MM-dd 00:00:00') : null
  const end = endDate ? formatDate(endDate, 'yyyy-MM-dd 23:59:59') : null
  
  return { start, end }
}

/**
 * 获取今天的日期范围
 * @returns 今天的开始和结束时间
 */
export function getTodayRange(): { start: string; end: string } {
  const today = new Date()
  return {
    start: format(today, 'yyyy-MM-dd 00:00:00'),
    end: format(today, 'yyyy-MM-dd 23:59:59')
  }
}

/**
 * 获取本周的日期范围
 * @returns 本周的开始和结束时间
 */
export function getThisWeekRange(): { start: string; end: string } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - dayOfWeek)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  
  return {
    start: format(startOfWeek, 'yyyy-MM-dd 00:00:00'),
    end: format(endOfWeek, 'yyyy-MM-dd 23:59:59')
  }
}

/**
 * 获取本月的日期范围
 * @returns 本月的开始和结束时间
 */
export function getThisMonthRange(): { start: string; end: string } {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  return {
    start: format(startOfMonth, 'yyyy-MM-dd 00:00:00'),
    end: format(endOfMonth, 'yyyy-MM-dd 23:59:59')
  }
}

/**
 * 获取最近N天的日期范围
 * @param days 天数
 * @returns 日期范围
 */
export function getRecentDaysRange(days: number): { start: string; end: string } {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(now.getDate() - days + 1)
  
  return {
    start: format(startDate, 'yyyy-MM-dd 00:00:00'),
    end: format(now, 'yyyy-MM-dd 23:59:59')
  }
}