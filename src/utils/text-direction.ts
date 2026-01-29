/**
 * 文本方向处理工具
 */

import { LOCALE_INFO, type SupportLocale } from '@/i18n'

/**
 * 文本方向类型
 */
export type TextDirection = 'ltr' | 'rtl'

/**
 * 文本方向工具类
 */
export class TextDirectionUtils {
  /**
   * 获取语言的文本方向
   */
  static getDirection(locale: SupportLocale): TextDirection {
    return LOCALE_INFO[locale].dir
  }

  /**
   * 检查是否为RTL语言
   */
  static isRTL(locale: SupportLocale): boolean {
    return LOCALE_INFO[locale].dir === 'rtl'
  }

  /**
   * 检查是否为LTR语言
   */
  static isLTR(locale: SupportLocale): boolean {
    return LOCALE_INFO[locale].dir === 'ltr'
  }

  /**
   * 设置文档的文本方向
   */
  static setDocumentDirection(locale: SupportLocale): void {
    const direction = this.getDirection(locale)
    document.documentElement.dir = direction
    document.documentElement.setAttribute('data-direction', direction)
  }

  /**
   * 设置元素的文本方向
   */
  static setElementDirection(element: HTMLElement, locale: SupportLocale): void {
    const direction = this.getDirection(locale)
    element.dir = direction
    element.setAttribute('data-direction', direction)
  }

  /**
   * 获取方向相关的CSS类名
   */
  static getDirectionClass(locale: SupportLocale): string {
    const direction = this.getDirection(locale)
    return `text-${direction}`
  }

  /**
   * 获取方向相关的样式对象
   */
  static getDirectionStyles(locale: SupportLocale): Record<string, string> {
    const direction = this.getDirection(locale)
    return {
      direction,
      textAlign: direction === 'rtl' ? 'right' : 'left'
    }
  }

  /**
   * 根据文本方向调整边距/内边距
   */
  static adjustSpacing(locale: SupportLocale, leftValue: string, rightValue: string): Record<string, string> {
    const isRTL = this.isRTL(locale)
    return {
      marginLeft: isRTL ? rightValue : leftValue,
      marginRight: isRTL ? leftValue : rightValue,
      paddingLeft: isRTL ? rightValue : leftValue,
      paddingRight: isRTL ? leftValue : rightValue
    }
  }

  /**
   * 根据文本方向调整位置
   */
  static adjustPosition(locale: SupportLocale, leftValue: string, rightValue: string): Record<string, string> {
    const isRTL = this.isRTL(locale)
    return {
      left: isRTL ? rightValue : leftValue,
      right: isRTL ? leftValue : rightValue
    }
  }

  /**
   * 获取文本对齐方式
   */
  static getTextAlign(locale: SupportLocale, align: 'start' | 'end' | 'center' = 'start'): string {
    if (align === 'center') return 'center'
    
    const isRTL = this.isRTL(locale)
    if (align === 'start') {
      return isRTL ? 'right' : 'left'
    } else {
      return isRTL ? 'left' : 'right'
    }
  }

  /**
   * 获取浮动方向
   */
  static getFloat(locale: SupportLocale, float: 'start' | 'end'): string {
    const isRTL = this.isRTL(locale)
    if (float === 'start') {
      return isRTL ? 'right' : 'left'
    } else {
      return isRTL ? 'left' : 'right'
    }
  }

  /**
   * 获取边框半径（用于圆角）
   */
  static getBorderRadius(locale: SupportLocale, startStart: string, startEnd: string, endStart: string, endEnd: string): Record<string, string> {
    const isRTL = this.isRTL(locale)
    return {
      borderTopLeftRadius: isRTL ? startEnd : startStart,
      borderTopRightRadius: isRTL ? startStart : startEnd,
      borderBottomLeftRadius: isRTL ? endEnd : endStart,
      borderBottomRightRadius: isRTL ? endStart : endEnd
    }
  }

  /**
   * 获取变换原点
   */
  static getTransformOrigin(locale: SupportLocale, horizontal: 'start' | 'end' | 'center', vertical: 'top' | 'bottom' | 'center'): string {
    let horizontalValue: string
    
    if (horizontal === 'center') {
      horizontalValue = 'center'
    } else {
      const isRTL = this.isRTL(locale)
      horizontalValue = horizontal === 'start' 
        ? (isRTL ? 'right' : 'left')
        : (isRTL ? 'left' : 'right')
    }
    
    return `${horizontalValue} ${vertical}`
  }
}

/**
 * Vue 指令：自动设置文本方向
 */
export const vTextDirection = {
  mounted(el: HTMLElement, binding: { value: SupportLocale }) {
    TextDirectionUtils.setElementDirection(el, binding.value)
  },
  updated(el: HTMLElement, binding: { value: SupportLocale }) {
    TextDirectionUtils.setElementDirection(el, binding.value)
  }
}

/**
 * 响应式文本方向 composable
 */
export function useTextDirection(locale: SupportLocale) {
  const direction = TextDirectionUtils.getDirection(locale)
  const isRTL = TextDirectionUtils.isRTL(locale)
  const isLTR = TextDirectionUtils.isLTR(locale)

  return {
    direction,
    isRTL,
    isLTR,
    getDirectionClass: () => TextDirectionUtils.getDirectionClass(locale),
    getDirectionStyles: () => TextDirectionUtils.getDirectionStyles(locale),
    adjustSpacing: (left: string, right: string) => TextDirectionUtils.adjustSpacing(locale, left, right),
    adjustPosition: (left: string, right: string) => TextDirectionUtils.adjustPosition(locale, left, right),
    getTextAlign: (align: 'start' | 'end' | 'center' = 'start') => TextDirectionUtils.getTextAlign(locale, align),
    getFloat: (float: 'start' | 'end') => TextDirectionUtils.getFloat(locale, float)
  }
}

export default TextDirectionUtils