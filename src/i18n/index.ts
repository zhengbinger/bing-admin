/**
 * 国际化配置
 * 支持中文和英文语言切换
 */

import { createI18n } from 'vue-i18n'
import type { App } from 'vue'

// 导入语言文件
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

// 支持的语言列表
export const SUPPORT_LOCALES = ['zh-CN', 'en-US'] as const
export type SupportLocale = typeof SUPPORT_LOCALES[number]

// 语言信息
export const LOCALE_INFO = {
  'zh-CN': {
    name: '简体中文',
    shortName: '中文',
    flag: '🇨🇳',
    dir: 'ltr' as const,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    currency: 'CNY',
    currencySymbol: '¥',
    numberSeparator: ',',
    decimalSeparator: '.',
    firstDayOfWeek: 1 // Monday
  },
  'en-US': {
    name: 'English',
    shortName: 'EN',
    flag: '🇺🇸',
    dir: 'ltr' as const,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'h:mm:ss A',
    currency: 'USD',
    currencySymbol: '$',
    numberSeparator: ',',
    decimalSeparator: '.',
    firstDayOfWeek: 0 // Sunday
  }
} as const

// 默认语言
export const DEFAULT_LOCALE: SupportLocale = 'zh-CN'

// 语言存储键
export const LOCALE_STORAGE_KEY = 'bing-admin-locale'

/**
 * 获取浏览器语言
 */
export function getBrowserLocale(): SupportLocale {
  const browserLang = navigator.language || navigator.languages[0]
  
  // 精确匹配
  if (SUPPORT_LOCALES.includes(browserLang as SupportLocale)) {
    return browserLang as SupportLocale
  }
  
  // 语言代码匹配（如 'zh' 匹配 'zh-CN'）
  const langCode = browserLang.split('-')[0]
  const matchedLocale = SUPPORT_LOCALES.find(locale => locale.startsWith(langCode))
  
  return matchedLocale || DEFAULT_LOCALE
}

/**
 * 获取存储的语言设置
 */
export function getStoredLocale(): SupportLocale {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
      if (stored && SUPPORT_LOCALES.includes(stored as SupportLocale)) {
        return stored as SupportLocale
      }
    }
  } catch (error) {
    // 静默处理localStorage错误
    console.warn('Failed to get stored locale:', error)
  }
  return getBrowserLocale()
}

/**
 * 保存语言设置
 */
export function setStoredLocale(locale: SupportLocale): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    }
  } catch (error) {
    // 静默处理localStorage错误，比如存储空间不足
    console.warn('Failed to save locale preference:', error)
  }
}

/**
 * 创建i18n实例
 */
export function createAppI18n() {
  const locale = getStoredLocale()
  
  const i18n = createI18n({
    legacy: false, // 使用 Composition API
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    globalInjection: true, // 全局注入 $t 函数
    messages: {
      'zh-CN': zhCN,
      'en-US': enUS
    },
    // 数字格式化
    numberFormats: {
      'zh-CN': {
        currency: {
          style: 'currency',
          currency: 'CNY',
          notation: 'standard'
        },
        decimal: {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        },
        percent: {
          style: 'percent',
          useGrouping: false
        }
      },
      'en-US': {
        currency: {
          style: 'currency',
          currency: 'USD',
          notation: 'standard'
        },
        decimal: {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        },
        percent: {
          style: 'percent',
          useGrouping: false
        }
      }
    },
    // 日期时间格式化
    datetimeFormats: {
      'zh-CN': {
        short: {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        },
        long: {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          weekday: 'short',
          hour: 'numeric',
          minute: 'numeric'
        },
        time: {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        },
        // 新增格式
        full: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          timeZoneName: 'short'
        },
        date: {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        },
        monthDay: {
          month: 'long',
          day: 'numeric'
        },
        yearMonth: {
          year: 'numeric',
          month: 'long'
        }
      },
      'en-US': {
        short: {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        },
        long: {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          weekday: 'short',
          hour: 'numeric',
          minute: 'numeric'
        },
        time: {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        },
        // 新增格式
        full: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          timeZoneName: 'short'
        },
        date: {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        },
        monthDay: {
          month: 'long',
          day: 'numeric'
        },
        yearMonth: {
          year: 'numeric',
          month: 'long'
        }
      }
    }
  })
  
  return i18n
}

/**
 * 安装i18n插件
 */
export function setupI18n(app: App) {
  const i18n = createAppI18n()
  app.use(i18n)
  return i18n
}

/**
 * 切换语言
 */
export async function switchLocale(locale: SupportLocale) {
  const { global } = createAppI18n()
  
  if (!SUPPORT_LOCALES.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}`)
    return
  }
  
  global.locale.value = locale
  setStoredLocale(locale)
  
  // 更新HTML lang属性
  document.documentElement.lang = locale
  
  // 更新文本方向
  const localeInfo = LOCALE_INFO[locale]
  document.documentElement.dir = localeInfo.dir
  
  // 更新页面标题
  document.title = global.t('app.title')
}

/**
 * 动态加载语言包
 */
export async function loadLocaleMessages(locale: SupportLocale) {
  try {
    // 动态导入语言文件
    const messages = await import(`./locales/${locale}.ts`)
    return messages.default
  } catch (error) {
    console.error(`Failed to load locale messages for ${locale}:`, error)
    // 回退到默认语言
    if (locale !== DEFAULT_LOCALE) {
      return loadLocaleMessages(DEFAULT_LOCALE)
    }
    throw error
  }
}

/**
 * 设置语言包消息
 */
export function setLocaleMessages(i18n: any, locale: SupportLocale, messages: any) {
  i18n.global.setLocaleMessage(locale, messages)
}

/**
 * 动态切换语言（支持懒加载）
 */
export async function switchLocaleDynamic(locale: SupportLocale) {
  if (!SUPPORT_LOCALES.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}`)
    return
  }

  const i18n = createAppI18n()
  
  // 检查语言包是否已加载
  if (!i18n.global.availableLocales.includes(locale)) {
    try {
      // 动态加载语言包
      const messages = await loadLocaleMessages(locale)
      setLocaleMessages(i18n, locale, messages)
    } catch (error) {
      console.error(`Failed to switch to locale ${locale}:`, error)
      return
    }
  }
  
  // 切换语言
  i18n.global.locale.value = locale
  setStoredLocale(locale)
  
  // 更新HTML属性
  document.documentElement.lang = locale
  const localeInfo = LOCALE_INFO[locale]
  document.documentElement.dir = localeInfo.dir
  
  // 更新页面标题
  document.title = i18n.global.t('app.title')
}

/**
 * 获取当前语言信息
 */
export function getCurrentLocaleInfo() {
  const locale = getStoredLocale()
  return LOCALE_INFO[locale]
}

export default createAppI18n