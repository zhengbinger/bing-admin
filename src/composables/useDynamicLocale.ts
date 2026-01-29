/**
 * 动态语言加载 composable
 */

import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  SUPPORT_LOCALES, 
  loadLocaleMessages, 
  setLocaleMessages,
  setStoredLocale,
  LOCALE_INFO,
  type SupportLocale 
} from '@/i18n'
import { TextDirectionUtils } from '@/utils/text-direction'

/**
 * 动态语言加载状态
 */
interface LoadingState {
  loading: boolean
  error: string | null
  loadedLocales: Set<SupportLocale>
}

/**
 * 使用动态语言加载
 */
export function useDynamicLocale() {
  const { locale, availableLocales } = useI18n()
  
  // 加载状态
  const loadingState = ref<LoadingState>({
    loading: false,
    error: null,
    loadedLocales: new Set(availableLocales as SupportLocale[])
  })

  /**
   * 当前语言
   */
  const currentLocale = computed(() => locale.value as SupportLocale)

  /**
   * 当前语言信息
   */
  const currentLocaleInfo = computed(() => LOCALE_INFO[currentLocale.value])

  /**
   * 支持的语言列表
   */
  const supportedLocales = computed(() => 
    SUPPORT_LOCALES.map(locale => ({
      value: locale,
      label: LOCALE_INFO[locale].name,
      shortName: LOCALE_INFO[locale].shortName,
      flag: LOCALE_INFO[locale].flag,
      loaded: loadingState.value.loadedLocales.has(locale)
    }))
  )

  /**
   * 是否正在加载
   */
  const isLoading = computed(() => loadingState.value.loading)

  /**
   * 加载错误
   */
  const loadError = computed(() => loadingState.value.error)

  /**
   * 检查语言包是否已加载
   */
  const isLocaleLoaded = (targetLocale: SupportLocale): boolean => {
    return loadingState.value.loadedLocales.has(targetLocale)
  }

  /**
   * 加载语言包
   */
  const loadLocale = async (targetLocale: SupportLocale): Promise<boolean> => {
    if (!SUPPORT_LOCALES.includes(targetLocale)) {
      console.warn(`Unsupported locale: ${targetLocale}`)
      return false
    }

    // 如果已经加载，直接返回成功
    if (isLocaleLoaded(targetLocale)) {
      return true
    }

    loadingState.value.loading = true
    loadingState.value.error = null

    try {
      // 动态加载语言包
      const messages = await loadLocaleMessages(targetLocale)
      
      // 设置语言包消息
      const { global } = useI18n()
      setLocaleMessages(global, targetLocale, messages)
      
      // 标记为已加载
      loadingState.value.loadedLocales.add(targetLocale)
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      loadingState.value.error = `Failed to load locale ${targetLocale}: ${errorMessage}`
      console.error('Failed to load locale:', error)
      return false
    } finally {
      loadingState.value.loading = false
    }
  }

  /**
   * 切换语言（支持动态加载）
   */
  const switchLocale = async (targetLocale: SupportLocale): Promise<boolean> => {
    if (targetLocale === currentLocale.value) {
      return true
    }

    // 先加载语言包
    const loaded = await loadLocale(targetLocale)
    if (!loaded) {
      return false
    }

    try {
      // 切换语言
      locale.value = targetLocale
      
      // 保存到本地存储
      setStoredLocale(targetLocale)
      
      // 更新HTML属性
      document.documentElement.lang = targetLocale
      TextDirectionUtils.setDocumentDirection(targetLocale)
      
      // 更新页面标题
      const { t } = useI18n()
      document.title = t('app.title')
      
      return true
    } catch (error) {
      console.error('Failed to switch locale:', error)
      return false
    }
  }

  /**
   * 预加载语言包
   */
  const preloadLocale = async (targetLocale: SupportLocale): Promise<boolean> => {
    return loadLocale(targetLocale)
  }

  /**
   * 预加载所有支持的语言包
   */
  const preloadAllLocales = async (): Promise<void> => {
    const promises = SUPPORT_LOCALES
      .filter(locale => !isLocaleLoaded(locale))
      .map(locale => preloadLocale(locale))
    
    await Promise.allSettled(promises)
  }

  /**
   * 清除加载错误
   */
  const clearError = (): void => {
    loadingState.value.error = null
  }

  /**
   * 重新加载语言包
   */
  const reloadLocale = async (targetLocale: SupportLocale): Promise<boolean> => {
    // 从已加载列表中移除
    loadingState.value.loadedLocales.delete(targetLocale)
    
    // 重新加载
    return loadLocale(targetLocale)
  }

  /**
   * 获取语言加载统计
   */
  const getLoadingStats = () => {
    const total = SUPPORT_LOCALES.length
    const loaded = loadingState.value.loadedLocales.size
    const percentage = Math.round((loaded / total) * 100)
    
    return {
      total,
      loaded,
      percentage,
      remaining: total - loaded
    }
  }

  return {
    // 状态
    currentLocale,
    currentLocaleInfo,
    supportedLocales,
    isLoading,
    loadError,
    
    // 方法
    switchLocale,
    loadLocale,
    preloadLocale,
    preloadAllLocales,
    isLocaleLoaded,
    clearError,
    reloadLocale,
    getLoadingStats
  }
}

/**
 * 语言加载管理器
 */
export class LocaleLoadManager {
  private static instance: LocaleLoadManager
  private loadedLocales = new Set<SupportLocale>()
  private loadingPromises = new Map<SupportLocale, Promise<boolean>>()

  static getInstance(): LocaleLoadManager {
    if (!LocaleLoadManager.instance) {
      LocaleLoadManager.instance = new LocaleLoadManager()
    }
    return LocaleLoadManager.instance
  }

  /**
   * 加载语言包（单例模式，避免重复加载）
   */
  async loadLocale(locale: SupportLocale): Promise<boolean> {
    // 如果已经加载，直接返回
    if (this.loadedLocales.has(locale)) {
      return true
    }

    // 如果正在加载，返回现有的 Promise
    if (this.loadingPromises.has(locale)) {
      return this.loadingPromises.get(locale)!
    }

    // 开始加载
    const loadingPromise = this.doLoadLocale(locale)
    this.loadingPromises.set(locale, loadingPromise)

    try {
      const result = await loadingPromise
      if (result) {
        this.loadedLocales.add(locale)
      }
      return result
    } finally {
      this.loadingPromises.delete(locale)
    }
  }

  private async doLoadLocale(locale: SupportLocale): Promise<boolean> {
    try {
      const messages = await loadLocaleMessages(locale)
      const { global } = useI18n()
      setLocaleMessages(global, locale, messages)
      return true
    } catch (error) {
      console.error(`Failed to load locale ${locale}:`, error)
      return false
    }
  }

  /**
   * 检查是否已加载
   */
  isLoaded(locale: SupportLocale): boolean {
    return this.loadedLocales.has(locale)
  }

  /**
   * 获取已加载的语言列表
   */
  getLoadedLocales(): SupportLocale[] {
    return Array.from(this.loadedLocales)
  }

  /**
   * 清除加载状态
   */
  clear(): void {
    this.loadedLocales.clear()
    this.loadingPromises.clear()
  }
}

export default useDynamicLocale