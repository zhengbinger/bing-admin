/**
 * 布局状态管理
 * 管理侧边栏状态、主题、语言、缓存视图等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 主题类型
export type ThemeType = 'light' | 'dark' | 'auto'

// 语言类型
export type LanguageType = 'zh-CN' | 'en-US'

// 布局配置
export interface LayoutConfig {
  sidebarCollapsed: boolean
  theme: ThemeType
  language: LanguageType
  showBreadcrumb: boolean
  showFooter: boolean
  fixedHeader: boolean
  enableTransition: boolean
}

// 移动端断点
const MOBILE_BREAKPOINT = 768

/**
 * 布局Store
 */
export const useLayoutStore = defineStore('layout', () => {
  // 状态
  const isCollapsed = ref<boolean>(false)
  const isMobile = ref<boolean>(false)
  const theme = ref<ThemeType>('light')
  const language = ref<LanguageType>('zh-CN')
  const cachedViews = ref<string[]>([])
  const showBreadcrumb = ref<boolean>(true)
  const showFooter = ref<boolean>(true)
  const fixedHeader = ref<boolean>(true)
  const enableTransition = ref<boolean>(true)

  // 计算属性
  const sidebarWidth = computed(() => {
    if (isMobile.value) return isCollapsed.value ? '0px' : '260px'
    return isCollapsed.value ? '64px' : '260px'
  })

  const isDarkTheme = computed(() => {
    if (theme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value === 'dark'
  })

  const layoutConfig = computed<LayoutConfig>(() => ({
    sidebarCollapsed: isCollapsed.value,
    theme: theme.value,
    language: language.value,
    showBreadcrumb: showBreadcrumb.value,
    showFooter: showFooter.value,
    fixedHeader: fixedHeader.value,
    enableTransition: enableTransition.value
  }))

  // 初始化布局配置
  const initializeLayout = (): void => {
    // 从本地存储恢复配置
    const savedConfig = localStorage.getItem('layout_config')
    if (savedConfig) {
      try {
        const config: LayoutConfig = JSON.parse(savedConfig)
        isCollapsed.value = config.sidebarCollapsed
        theme.value = config.theme
        language.value = config.language
        showBreadcrumb.value = config.showBreadcrumb
        showFooter.value = config.showFooter
        fixedHeader.value = config.fixedHeader
        enableTransition.value = config.enableTransition
      } catch (error) {
        console.error('解析布局配置失败:', error)
      }
    }

    // 检查移动端
    checkMobile()

    // 应用主题
    applyTheme()

    // 监听系统主题变化
    if (theme.value === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', applyTheme)
    }
  }

  // 保存布局配置
  const saveLayoutConfig = (): void => {
    localStorage.setItem('layout_config', JSON.stringify(layoutConfig.value))
  }

  // 检查是否为移动端
  const checkMobile = (): void => {
    const width = window.innerWidth
    const wasMobile = isMobile.value
    isMobile.value = width < MOBILE_BREAKPOINT

    // 移动端自动折叠侧边栏
    if (isMobile.value && !wasMobile) {
      isCollapsed.value = true
    }
    // 桌面端恢复侧边栏状态
    else if (!isMobile.value && wasMobile) {
      const savedConfig = localStorage.getItem('layout_config')
      if (savedConfig) {
        try {
          const config: LayoutConfig = JSON.parse(savedConfig)
          isCollapsed.value = config.sidebarCollapsed
        } catch (error) {
          isCollapsed.value = false
        }
      }
    }
  }

  // 切换侧边栏
  const toggleSidebar = (): void => {
    isCollapsed.value = !isCollapsed.value
    if (!isMobile.value) {
      saveLayoutConfig()
    }
  }

  // 打开侧边栏
  const openSidebar = (): void => {
    isCollapsed.value = false
    if (!isMobile.value) {
      saveLayoutConfig()
    }
  }

  // 关闭侧边栏
  const closeSidebar = (): void => {
    isCollapsed.value = true
    if (!isMobile.value) {
      saveLayoutConfig()
    }
  }

  // 设置主题
  const setTheme = (newTheme: ThemeType): void => {
    theme.value = newTheme
    applyTheme()
    saveLayoutConfig()
  }

  // 应用主题
  const applyTheme = (): void => {
    const html = document.documentElement
    
    if (isDarkTheme.value) {
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
    } else {
      html.classList.remove('dark')
      html.setAttribute('data-theme', 'light')
    }
  }

  // 切换主题
  const toggleTheme = (): void => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // 设置语言
  const setLanguage = (newLanguage: LanguageType): void => {
    language.value = newLanguage
    saveLayoutConfig()
  }

  // 添加缓存视图
  const addCachedView = (viewName: string): void => {
    if (!cachedViews.value.includes(viewName)) {
      cachedViews.value.push(viewName)
    }
  }

  // 移除缓存视图
  const removeCachedView = (viewName: string): void => {
    const index = cachedViews.value.indexOf(viewName)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  // 清除所有缓存视图
  const clearCachedViews = (): void => {
    cachedViews.value = []
  }

  // 设置面包屑显示
  const setBreadcrumbVisible = (visible: boolean): void => {
    showBreadcrumb.value = visible
    saveLayoutConfig()
  }

  // 设置页脚显示
  const setFooterVisible = (visible: boolean): void => {
    showFooter.value = visible
    saveLayoutConfig()
  }

  // 设置固定头部
  const setFixedHeader = (fixed: boolean): void => {
    fixedHeader.value = fixed
    saveLayoutConfig()
  }

  // 设置过渡动画
  const setTransitionEnabled = (enabled: boolean): void => {
    enableTransition.value = enabled
    saveLayoutConfig()
  }

  // 重置布局配置
  const resetLayoutConfig = (): void => {
    isCollapsed.value = false
    theme.value = 'light'
    language.value = 'zh-CN'
    showBreadcrumb.value = true
    showFooter.value = true
    fixedHeader.value = true
    enableTransition.value = true
    cachedViews.value = []
    
    applyTheme()
    saveLayoutConfig()
  }

  // 获取布局统计信息
  const getLayoutStats = () => ({
    sidebarWidth: sidebarWidth.value,
    isMobile: isMobile.value,
    isCollapsed: isCollapsed.value,
    theme: theme.value,
    language: language.value,
    cachedViewsCount: cachedViews.value.length,
    isDarkTheme: isDarkTheme.value
  })

  return {
    // 状态
    isCollapsed,
    isMobile,
    theme,
    language,
    cachedViews,
    showBreadcrumb,
    showFooter,
    fixedHeader,
    enableTransition,

    // 计算属性
    sidebarWidth,
    isDarkTheme,
    layoutConfig,

    // 方法
    initializeLayout,
    checkMobile,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    setTheme,
    toggleTheme,
    setLanguage,
    addCachedView,
    removeCachedView,
    clearCachedViews,
    setBreadcrumbVisible,
    setFooterVisible,
    setFixedHeader,
    setTransitionEnabled,
    resetLayoutConfig,
    getLayoutStats
  }
})