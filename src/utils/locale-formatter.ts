/**
 * 基于语言环境的格式化工具
 */

import { LOCALE_INFO, type SupportLocale } from '@/i18n'

/**
 * 语言环境格式化器
 */
export class LocaleFormatter {
  private locale: SupportLocale
  private localeInfo: typeof LOCALE_INFO[SupportLocale]

  constructor(locale: SupportLocale) {
    this.locale = locale
    this.localeInfo = LOCALE_INFO[locale]
  }

  /**
   * 格式化数字
   */
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, {
      useGrouping: true,
      ...options
    }).format(number)
  }

  /**
   * 格式化货币
   */
  formatCurrency(amount: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: this.localeInfo.currency,
      ...options
    }).format(amount)
  }

  /**
   * 格式化百分比
   */
  formatPercent(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'percent',
      ...options
    }).format(value)
  }

  /**
   * 格式化日期
   */
  formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options
    }).format(new Date(date))
  }

  /**
   * 格式化时间
   */
  formatTime(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      ...options
    }).format(new Date(date))
  }

  /**
   * 格式化日期时间
   */
  formatDateTime(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      ...options
    }).format(new Date(date))
  }

  /**
   * 格式化相对时间
   */
  formatRelativeTime(date: Date | string | number): string {
    const now = new Date()
    const targetDate = new Date(date)
    const diffMs = now.getTime() - targetDate.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' })

    if (Math.abs(diffSeconds) < 60) {
      return rtf.format(-diffSeconds, 'second')
    } else if (Math.abs(diffMinutes) < 60) {
      return rtf.format(-diffMinutes, 'minute')
    } else if (Math.abs(diffHours) < 24) {
      return rtf.format(-diffHours, 'hour')
    } else if (Math.abs(diffDays) < 30) {
      return rtf.format(-diffDays, 'day')
    } else {
      // 对于更长的时间，使用绝对日期
      return this.formatDate(targetDate)
    }
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    const units = this.locale === 'zh-CN' 
      ? ['字节', 'KB', 'MB', 'GB', 'TB'] 
      : ['Bytes', 'KB', 'MB', 'GB', 'TB']
    
    if (bytes === 0) return `0 ${units[0]}`
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const size = (bytes / Math.pow(1024, i)).toFixed(2)
    
    return `${this.formatNumber(parseFloat(size))} ${units[i]}`
  }

  /**
   * 格式化列表
   */
  formatList(items: string[], options?: Intl.ListFormatOptions): string {
    return new Intl.ListFormat(this.locale, {
      style: 'long',
      type: 'conjunction',
      ...options
    }).format(items)
  }

  /**
   * 格式化日期范围
   */
  formatDateRange(startDate: Date | string | number, endDate: Date | string | number): string {
    const start = this.formatDate(startDate)
    const end = this.formatDate(endDate)
    const separator = this.locale === 'zh-CN' ? ' 至 ' : ' - '
    return `${start}${separator}${end}`
  }

  /**
   * 格式化时间范围
   */
  formatTimeRange(startTime: Date | string | number, endTime: Date | string | number): string {
    const start = this.formatTime(startTime)
    const end = this.formatTime(endTime)
    const separator = this.locale === 'zh-CN' ? ' 至 ' : ' - '
    return `${start}${separator}${end}`
  }

  /**
   * 格式化持续时间
   */
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      const dayUnit = this.locale === 'zh-CN' ? '天' : 'day'
      const hourUnit = this.locale === 'zh-CN' ? '小时' : 'hour'
      return `${days}${dayUnit} ${hours % 24}${hourUnit}`
    } else if (hours > 0) {
      const hourUnit = this.locale === 'zh-CN' ? '小时' : 'hour'
      const minuteUnit = this.locale === 'zh-CN' ? '分钟' : 'minute'
      return `${hours}${hourUnit} ${minutes % 60}${minuteUnit}`
    } else if (minutes > 0) {
      const minuteUnit = this.locale === 'zh-CN' ? '分钟' : 'minute'
      const secondUnit = this.locale === 'zh-CN' ? '秒' : 'second'
      return `${minutes}${minuteUnit} ${seconds % 60}${secondUnit}`
    } else {
      const secondUnit = this.locale === 'zh-CN' ? '秒' : 'second'
      return `${seconds}${secondUnit}`
    }
  }

  /**
   * 获取排序比较函数
   */
  getCollator(options?: Intl.CollatorOptions): Intl.Collator {
    return new Intl.Collator(this.locale, {
      numeric: true,
      sensitivity: 'base',
      ...options
    })
  }

  /**
   * 获取文本方向
   */
  getTextDirection(): 'ltr' | 'rtl' {
    return this.localeInfo.dir
  }

  /**
   * 获取货币符号
   */
  getCurrencySymbol(): string {
    return this.localeInfo.currencySymbol
  }

  /**
   * 获取一周的第一天
   */
  getFirstDayOfWeek(): number {
    return this.localeInfo.firstDayOfWeek
  }
}

/**
 * 创建格式化器实例
 */
export function createFormatter(locale: SupportLocale): LocaleFormatter {
  return new LocaleFormatter(locale)
}

/**
 * 全局格式化工具函数
 */
export const formatters = {
  /**
   * 根据当前语言环境格式化数字
   */
  number: (value: number, locale: SupportLocale, options?: Intl.NumberFormatOptions) => {
    return createFormatter(locale).formatNumber(value, options)
  },

  /**
   * 根据当前语言环境格式化货币
   */
  currency: (value: number, locale: SupportLocale, options?: Intl.NumberFormatOptions) => {
    return createFormatter(locale).formatCurrency(value, options)
  },

  /**
   * 根据当前语言环境格式化日期
   */
  date: (value: Date | string | number, locale: SupportLocale, options?: Intl.DateTimeFormatOptions) => {
    return createFormatter(locale).formatDate(value, options)
  },

  /**
   * 根据当前语言环境格式化时间
   */
  time: (value: Date | string | number, locale: SupportLocale, options?: Intl.DateTimeFormatOptions) => {
    return createFormatter(locale).formatTime(value, options)
  },

  /**
   * 根据当前语言环境格式化相对时间
   */
  relativeTime: (value: Date | string | number, locale: SupportLocale) => {
    return createFormatter(locale).formatRelativeTime(value)
  },

  /**
   * 根据当前语言环境格式化文件大小
   */
  fileSize: (value: number, locale: SupportLocale) => {
    return createFormatter(locale).formatFileSize(value)
  }
}

export default LocaleFormatter