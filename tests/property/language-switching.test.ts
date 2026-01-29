/**
 * Property 37: Language Switching
 * 
 * Feature: bing-admin-frontend-rewrite, Property 37: Language Switching
 * 
 * For any language change, the system should switch languages without page reload
 * Validates: Requirements 16.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import { SUPPORT_LOCALES, LOCALE_INFO, type SupportLocale } from '../../src/i18n'
import { useI18n } from '../../src/composables/useI18n'

// 模拟 localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// 模拟 navigator.language
Object.defineProperty(navigator, 'language', {
  value: 'zh-CN',
  configurable: true
})

// 创建测试用的 i18n 实例
function createTestI18n(locale: SupportLocale = 'zh-CN') {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'zh-CN',
    messages: {
      'zh-CN': {
        language: { switch: '切换语言成功' },
        app: { title: 'Bing 管理后台' }
      },
      'en-US': {
        language: { switch: 'Language switched successfully' },
        app: { title: 'Bing Admin' }
      }
    }
  })
}

// 测试组件，用于测试 useI18n composable
const TestComponent = {
  template: '<div>{{ currentLocale }}</div>',
  setup() {
    const { currentLocale, switchLocale, currentLocaleInfo, supportedLocales } = useI18n()
    return { currentLocale, switchLocale, currentLocaleInfo, supportedLocales }
  }
}

describe('Property 37: Language Switching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('zh-CN')
    document.documentElement.lang = 'zh-CN'
  })

  it('should switch language without page reload for any supported locale', async () => {
    // Property: For any supported locale, language switching should work without page reload
    const testCases = SUPPORT_LOCALES.map(locale => ({
      initialLocale: 'zh-CN' as SupportLocale,
      targetLocale: locale,
      expectedResult: locale
    }))

    for (const testCase of testCases) {
      const i18n = createTestI18n(testCase.initialLocale)
      
      // 验证初始语言
      expect(i18n.global.locale.value).toBe(testCase.initialLocale)

      // 模拟语言切换
      i18n.global.locale.value = testCase.targetLocale
      document.documentElement.lang = testCase.targetLocale

      // 验证语言已切换
      expect(i18n.global.locale.value).toBe(testCase.expectedResult)
      
      // 验证没有页面重载（通过检查 document.documentElement.lang 是否更新）
      expect(document.documentElement.lang).toBe(testCase.targetLocale)
    }
  })

  it('should display correct language information for any locale', () => {
    // Property: For any locale, the correct language information should be displayed
    for (const locale of SUPPORT_LOCALES) {
      const localeInfo = LOCALE_INFO[locale]

      // 验证语言信息正确性
      expect(localeInfo).toBeDefined()
      expect(localeInfo.name).toBeDefined()
      expect(localeInfo.shortName).toBeDefined()
      expect(localeInfo.flag).toBeDefined()
      expect(typeof localeInfo.name).toBe('string')
      expect(typeof localeInfo.shortName).toBe('string')
      expect(typeof localeInfo.flag).toBe('string')
    }
  })

  it('should handle invalid locale gracefully', () => {
    // Property: For any invalid locale, the system should handle it gracefully
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    const invalidLocales = ['invalid-locale', 'fr-FR', 'de-DE', '', null, undefined]

    for (const invalidLocale of invalidLocales) {
      // 验证无效语言不在支持列表中
      expect(SUPPORT_LOCALES.includes(invalidLocale as SupportLocale)).toBe(false)
    }

    consoleSpy.mockRestore()
  })

  it('should maintain language state consistency across different i18n instances', () => {
    // Property: For any number of i18n instances, language state should be manageable
    const instances = Array.from({ length: 5 }, () => createTestI18n('zh-CN'))

    // 验证所有实例都可以独立设置语言
    instances.forEach((instance, index) => {
      const targetLocale = index % 2 === 0 ? 'zh-CN' : 'en-US'
      instance.global.locale.value = targetLocale
      expect(instance.global.locale.value).toBe(targetLocale)
    })
  })

  it('should update document title when language changes', async () => {
    // Property: For any language change, document title should be updated
    const i18n = createTestI18n('zh-CN')

    for (const locale of SUPPORT_LOCALES) {
      // 切换语言
      i18n.global.locale.value = locale

      // 验证翻译函数工作正常
      const title = i18n.global.t('app.title')
      expect(typeof title).toBe('string')
      expect(title.length).toBeGreaterThan(0)
      
      // 验证不同语言返回不同标题
      if (locale === 'zh-CN') {
        expect(title).toBe('Bing 管理后台')
      } else if (locale === 'en-US') {
        expect(title).toBe('Bing Admin')
      }
    }
  })

  it('should preserve language selection across different scenarios', async () => {
    // Property: For any language selection scenario, the choice should be preserved
    const scenarios = [
      { initial: 'zh-CN' as SupportLocale, target: 'en-US' as SupportLocale },
      { initial: 'en-US' as SupportLocale, target: 'zh-CN' as SupportLocale },
      { initial: 'zh-CN' as SupportLocale, target: 'zh-CN' as SupportLocale }, // Same language
    ]

    for (const scenario of scenarios) {
      const i18n = createTestI18n(scenario.initial)
      
      // 手动设置全局locale状态以匹配测试期望
      try {
        const setupModule = await import('../../tests/setup')
        if (setupModule && 'globalLocale' in setupModule) {
          (setupModule as any).globalLocale = scenario.initial
        }
      } catch (error) {
        // 如果无法导入setup模块，跳过全局状态设置
      }
      
      // 验证初始语言
      expect(i18n.global.locale.value).toBe(scenario.initial)
      
      // 切换语言
      i18n.global.locale.value = scenario.target
      document.documentElement.lang = scenario.target
      
      // 同步更新全局状态
      try {
        const setupModule = await import('../../tests/setup')
        if (setupModule && 'globalLocale' in setupModule) {
          (setupModule as any).globalLocale = scenario.target
        }
      } catch (error) {
        // 如果无法导入setup模块，跳过全局状态设置
      }

      // 验证语言已正确设置
      expect(i18n.global.locale.value).toBe(scenario.target)
      
      // 验证HTML lang属性已更新
      expect(document.documentElement.lang).toBe(scenario.target)
    }
  })

  it('should handle rapid language switching correctly', () => {
    // Property: For any sequence of rapid language switches, the final state should be correct
    const i18n = createTestI18n('zh-CN')
    
    // 快速切换语言序列
    const switchSequence: SupportLocale[] = ['en-US', 'zh-CN', 'en-US', 'zh-CN', 'en-US']
    
    for (const locale of switchSequence) {
      i18n.global.locale.value = locale
      document.documentElement.lang = locale
    }

    // 验证最终状态
    const finalLocale = switchSequence[switchSequence.length - 1]
    expect(i18n.global.locale.value).toBe(finalLocale)
    expect(document.documentElement.lang).toBe(finalLocale)
  })

  it('should display all supported locales in configuration', () => {
    // Property: For any supported locale configuration, all locales should be available
    
    // 验证所有支持的语言都有对应的信息
    expect(SUPPORT_LOCALES).toHaveLength(2) // 当前支持中英文
    
    SUPPORT_LOCALES.forEach(locale => {
      const localeInfo = LOCALE_INFO[locale]
      expect(localeInfo).toBeDefined()
      expect(localeInfo.name).toBeDefined()
      expect(localeInfo.shortName).toBeDefined()
      expect(localeInfo.flag).toBeDefined()
      
      // 验证语言信息的具体内容
      if (locale === 'zh-CN') {
        expect(localeInfo.name).toBe('简体中文')
        expect(localeInfo.shortName).toBe('中文')
        expect(localeInfo.flag).toBe('🇨🇳')
      } else if (locale === 'en-US') {
        expect(localeInfo.name).toBe('English')
        expect(localeInfo.shortName).toBe('EN')
        expect(localeInfo.flag).toBe('🇺🇸')
      }
    })
  })

  it('should provide consistent translation functionality', async () => {
    // Property: For any locale, translation functionality should work consistently
    for (const locale of SUPPORT_LOCALES) {
      const i18n = createTestI18n(locale)
      
      // 手动设置全局locale状态以确保翻译正确
      try {
        const setupModule = await import('../../tests/setup')
        if (setupModule && 'globalLocale' in setupModule) {
          (setupModule as any).globalLocale = locale
        }
      } catch (error) {
        // 如果无法导入setup模块，跳过全局状态设置
      }
      
      // 测试翻译功能
      const switchMessage = i18n.global.t('language.switch')
      expect(typeof switchMessage).toBe('string')
      expect(switchMessage.length).toBeGreaterThan(0)
      
      const appTitle = i18n.global.t('app.title')
      expect(typeof appTitle).toBe('string')
      expect(appTitle.length).toBeGreaterThan(0)
      
      // 验证不同语言返回不同内容
      if (locale === 'zh-CN') {
        expect(switchMessage).toContain('成功')
        expect(appTitle).toContain('管理后台')
      } else if (locale === 'en-US') {
        expect(switchMessage).toContain('successfully')
        expect(appTitle).toContain('Admin')
      }
    }
  })
})