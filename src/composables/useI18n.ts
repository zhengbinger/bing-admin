/**
 * 国际化相关的组合式函数
 */

import { computed } from 'vue'
import { useI18n as useVueI18n } from 'vue-i18n'
import { 
  SUPPORT_LOCALES, 
  LOCALE_INFO, 
  setStoredLocale, 
  getCurrentLocaleInfo,
  type SupportLocale 
} from '@/i18n'

/**
 * 使用国际化
 */
export function useI18n() {
  const { locale, t, d, n } = useVueI18n()

  /**
   * 当前语言
   */
  const currentLocale = computed(() => locale.value as SupportLocale)

  /**
   * 当前语言信息
   */
  const currentLocaleInfo = computed(() => getCurrentLocaleInfo())

  /**
   * 支持的语言列表
   */
  const supportedLocales = computed(() => 
    SUPPORT_LOCALES.map(locale => ({
      value: locale,
      label: LOCALE_INFO[locale].name,
      shortName: LOCALE_INFO[locale].shortName,
      flag: LOCALE_INFO[locale].flag
    }))
  )

  /**
   * 切换语言
   */
  const switchLocale = async (newLocale: SupportLocale) => {
    if (!SUPPORT_LOCALES.includes(newLocale)) {
      console.warn(`Unsupported locale: ${newLocale}`)
      return
    }

    if (newLocale === locale.value) {
      return
    }

    // 更新i18n locale
    locale.value = newLocale
    
    // 保存到本地存储
    setStoredLocale(newLocale)
    
    // 更新HTML lang属性
    document.documentElement.lang = newLocale
    
    // 更新页面标题
    document.title = t('app.title')
  }

  /**
   * 获取翻译文本
   */
  const translate = (key: string, params?: Record<string, any>) => {
    return t(key, params)
  }

  /**
   * 格式化日期
   */
  const formatDate = (date: Date | string | number, format = 'short') => {
    return d(new Date(date), format)
  }

  /**
   * 格式化时间
   */
  const formatTime = (date: Date | string | number) => {
    return d(new Date(date), 'time')
  }

  /**
   * 格式化完整日期时间
   */
  const formatDateTime = (date: Date | string | number, format = 'long') => {
    return d(new Date(date), format)
  }

  /**
   * 格式化相对时间
   */
  const formatRelativeTime = (date: Date | string | number): string => {
    const now = new Date()
    const targetDate = new Date(date)
    const diffMs = now.getTime() - targetDate.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffMinutes < 1) {
      return t('time.now')
    } else if (diffMinutes < 60) {
      return t('time.minutesAgo', { n: diffMinutes })
    } else if (diffHours < 24) {
      return t('time.hoursAgo', { n: diffHours })
    } else if (diffDays < 7) {
      return t('time.daysAgo', { n: diffDays })
    } else if (diffWeeks < 4) {
      return t('time.weeksAgo', { n: diffWeeks })
    } else if (diffMonths < 12) {
      return t('time.monthsAgo', { n: diffMonths })
    } else {
      return t('time.yearsAgo', { n: diffYears })
    }
  }

  /**
   * 格式化数字
   */
  const formatNumber = (number: number, format = 'decimal') => {
    return n(number, format)
  }

  /**
   * 格式化货币
   */
  const formatCurrency = (amount: number) => {
    return n(amount, 'currency')
  }

  /**
   * 格式化百分比
   */
  const formatPercent = (value: number) => {
    return n(value / 100, 'percent')
  }

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const size = (bytes / Math.pow(1024, i)).toFixed(2)
    return `${size} ${sizes[i]}`
  }

  /**
   * 根据语言环境格式化数字
   */
  const formatNumberLocale = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale.value, options).format(number)
  }

  /**
   * 根据语言环境格式化日期
   */
  const formatDateLocale = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(locale.value, options).format(new Date(date))
  }

  return {
    // 状态
    currentLocale,
    currentLocaleInfo,
    supportedLocales,
    
    // 方法
    switchLocale,
    translate,
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime,
    formatNumber,
    formatCurrency,
    formatPercent,
    formatFileSize,
    formatNumberLocale,
    formatDateLocale,
    
    // 原始方法
    t,
    d,
    n
  }
}

/**
 * 语言切换工具类
 */
export class I18nUtils {
  /**
   * 检查是否为支持的语言
   */
  static isSupportedLocale(locale: string): locale is SupportLocale {
    return SUPPORT_LOCALES.includes(locale as SupportLocale)
  }

  /**
   * 获取语言信息
   */
  static getLocaleInfo(locale: SupportLocale) {
    return LOCALE_INFO[locale]
  }

  /**
   * 获取浏览器首选语言
   */
  static getBrowserPreferredLocale(): SupportLocale {
    const browserLang = navigator.language || navigator.languages[0]
    
    // 精确匹配
    if (this.isSupportedLocale(browserLang)) {
      return browserLang
    }
    
    // 语言代码匹配
    const langCode = browserLang.split('-')[0]
    const matchedLocale = SUPPORT_LOCALES.find(locale => locale.startsWith(langCode))
    
    return matchedLocale || 'zh-CN'
  }

  /**
   * 获取文本方向
   */
  static getTextDirection(locale: SupportLocale): 'ltr' | 'rtl' {
    return LOCALE_INFO[locale].dir
  }

  /**
   * 获取货币符号
   */
  static getCurrencySymbol(locale: SupportLocale): string {
    return LOCALE_INFO[locale].currencySymbol
  }

  /**
   * 获取日期格式
   */
  static getDateFormat(locale: SupportLocale): string {
    return LOCALE_INFO[locale].dateFormat
  }

  /**
   * 获取时间格式
   */
  static getTimeFormat(locale: SupportLocale): string {
    return LOCALE_INFO[locale].timeFormat
  }

  /**
   * 获取一周的第一天
   */
  static getFirstDayOfWeek(locale: SupportLocale): number {
    return LOCALE_INFO[locale].firstDayOfWeek
  }

  /**
   * 格式化相对时间
   */
  static formatRelativeTime(date: Date | string | number, locale: SupportLocale = 'zh-CN'): string {
    const now = new Date()
    const targetDate = new Date(date)
    const diffMs = now.getTime() - targetDate.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    const { t } = useVueI18n()

    if (diffMinutes < 1) {
      return t('time.now')
    } else if (diffMinutes < 60) {
      return t('time.minutesAgo', { n: diffMinutes })
    } else if (diffHours < 24) {
      return t('time.hoursAgo', { n: diffHours })
    } else if (diffDays < 7) {
      return t('time.daysAgo', { n: diffDays })
    } else if (diffWeeks < 4) {
      return t('time.weeksAgo', { n: diffWeeks })
    } else if (diffMonths < 12) {
      return t('time.monthsAgo', { n: diffMonths })
    } else {
      return t('time.yearsAgo', { n: diffYears })
    }
  }

  /**
   * 格式化数字（带千分位分隔符）
   */
  static formatNumberWithSeparator(number: number, locale: SupportLocale): string {
    const localeInfo = LOCALE_INFO[locale]
    return number.toLocaleString(locale, {
      useGrouping: true
    })
  }

  /**
   * 格式化货币
   */
  static formatCurrency(amount: number, locale: SupportLocale): string {
    const localeInfo = LOCALE_INFO[locale]
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: localeInfo.currency
    }).format(amount)
  }

  /**
   * 格式化日期范围
   */
  static formatDateRange(startDate: Date | string | number, endDate: Date | string | number, locale: SupportLocale): string {
    const formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    
    const start = formatter.format(new Date(startDate))
    const end = formatter.format(new Date(endDate))
    
    return `${start} - ${end}`
  }

  /**
   * 检查是否为RTL语言
   */
  static isRTL(locale: SupportLocale): boolean {
    return LOCALE_INFO[locale].dir === 'rtl'
  }

  /**
   * 获取本地化的排序比较函数
   */
  static getCollator(locale: SupportLocale): Intl.Collator {
    return new Intl.Collator(locale, {
      numeric: true,
      sensitivity: 'base'
    })
  }
}

export default useI18n