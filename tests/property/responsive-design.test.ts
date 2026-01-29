/**
 * 响应式设计属性测试
 * 
 * **Feature: bing-admin-frontend-rewrite, Property 30: Responsive Design**
 * 
 * 验证系统在不同屏幕尺寸下的响应式行为
 * 
 * Property: For any screen size (desktop, tablet, mobile), the system should display and function correctly
 * Validates: Requirements 15.1
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ElButton, ElMenu, ElMenuItem } from 'element-plus'
import MainLayout from '../../src/layouts/MainLayout.vue'
import { useLayoutStore } from '../../src/store/modules/layout'

// 模拟组件
vi.mock('../../src/components/layout/SidebarMenu.vue', () => ({
  default: {
    name: 'SidebarMenu',
    template: '<div class="sidebar-menu-mock">Menu</div>',
    props: ['collapsed']
  }
}))

vi.mock('../../src/components/layout/Breadcrumb.vue', () => ({
  default: {
    name: 'Breadcrumb',
    template: '<div class="breadcrumb-mock">Breadcrumb</div>'
  }
}))

vi.mock('../../src/components/layout/HeaderActions.vue', () => ({
  default: {
    name: 'HeaderActions',
    template: '<div class="header-actions-mock">Actions</div>'
  }
}))

// 模拟路由
const mockRouter = {
  push: vi.fn(),
  currentRoute: { value: { path: '/dashboard' } }
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

// 屏幕尺寸配置
const SCREEN_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  largeDesktop: { width: 2560, height: 1440 }
}

// 测试用例生成器
const generateResponsiveTestCases = () => {
  const testCases = []
  
  // 为每种屏幕尺寸生成测试用例
  Object.entries(SCREEN_SIZES).forEach(([deviceType, dimensions]) => {
    testCases.push({
      deviceType,
      width: dimensions.width,
      height: dimensions.height,
      expectedMobile: dimensions.width < 768,
      expectedCollapsed: dimensions.width < 768
    })
  })
  
  return testCases
}

describe('Property 30: Responsive Design', () => {
  let pinia: any
  let layoutStore: any
  let wrapper: any
  let originalInnerWidth: number
  let originalInnerHeight: number

  beforeEach(() => {
    // 保存原始窗口尺寸
    originalInnerWidth = window.innerWidth
    originalInnerHeight = window.innerHeight
    
    // 创建 Pinia 实例
    pinia = createPinia()
    
    // 模拟窗口对象
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920
    })
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080
    })

    // 模拟 resize 事件
    window.addEventListener = vi.fn()
    window.removeEventListener = vi.fn()
  })

  afterEach(() => {
    // 恢复原始窗口尺寸
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    })
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight
    })

    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (screenWidth: number, screenHeight: number) => {
    // 设置窗口尺寸
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: screenWidth
    })
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: screenHeight
    })

    return mount(MainLayout, {
      global: {
        plugins: [pinia],
        components: {
          ElButton,
          ElMenu,
          ElMenuItem
        },
        stubs: {
          'router-view': true,
          'el-icon': true
        }
      }
    })
  }

  it('should adapt layout for different screen sizes', async () => {
    const testCases = generateResponsiveTestCases()
    
    for (const { deviceType, width, height, expectedMobile, expectedCollapsed } of testCases) {
      // 创建组件实例
      wrapper = createWrapper(width, height)
      layoutStore = useLayoutStore()
      
      // 触发移动端检查
      layoutStore.checkMobile()
      
      // 等待Vue更新
      await wrapper.vm.$nextTick()
      
      // 验证移动端检测
      expect(layoutStore.isMobile).toBe(expectedMobile)
      
      // 验证布局类名
      const layoutElement = wrapper.find('.main-layout')
      expect(layoutElement.exists()).toBe(true)
      
      if (expectedMobile) {
        expect(layoutElement.classes()).toContain('is-mobile')
      } else {
        expect(layoutElement.classes()).not.toContain('is-mobile')
      }
      
      // 验证侧边栏状态
      const sidebar = wrapper.find('.main-sidebar')
      expect(sidebar.exists()).toBe(true)
      
      // 验证侧边栏宽度计算
      const actualWidth = layoutStore.sidebarWidth
      console.log(`${deviceType}: isMobile=${layoutStore.isMobile}, isCollapsed=${layoutStore.isCollapsed}, width=${actualWidth}`)
      
      // 验证宽度是有效的像素值
      expect(actualWidth).toMatch(/^\d+px$/)
      
      console.log(`✓ ${deviceType} (${width}x${height}): Mobile=${expectedMobile}, Width=${actualWidth}`)
      
      wrapper.unmount()
    }
  })

  it('should handle window resize events correctly', () => {
    // 从桌面尺寸开始
    wrapper = createWrapper(1920, 1080)
    layoutStore = useLayoutStore()
    
    // 初始状态应该是桌面
    layoutStore.checkMobile()
    expect(layoutStore.isMobile).toBe(false)
    
    // 模拟窗口缩小到移动端尺寸
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    })
    
    layoutStore.checkMobile()
    expect(layoutStore.isMobile).toBe(true)
    expect(layoutStore.isCollapsed).toBe(true) // 移动端自动折叠
    
    // 模拟窗口放大到桌面尺寸
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920
    })
    
    layoutStore.checkMobile()
    expect(layoutStore.isMobile).toBe(false)
  })

  it('should maintain proper layout structure across all screen sizes', () => {
    const testCases = generateResponsiveTestCases()
    
    testCases.forEach(({ deviceType, width, height }) => {
      wrapper = createWrapper(width, height)
      
      // 验证主要布局元素存在
      expect(wrapper.find('.main-layout').exists()).toBe(true)
      expect(wrapper.find('.main-sidebar').exists()).toBe(true)
      expect(wrapper.find('.main-container').exists()).toBe(true)
      expect(wrapper.find('.main-header').exists()).toBe(true)
      expect(wrapper.find('.main-content').exists()).toBe(true)
      expect(wrapper.find('.main-footer').exists()).toBe(true)
      
      // 验证组件结构
      expect(wrapper.find('.sidebar-header').exists()).toBe(true)
      expect(wrapper.find('.sidebar-content').exists()).toBe(true)
      expect(wrapper.find('.header-left').exists()).toBe(true)
      expect(wrapper.find('.header-right').exists()).toBe(true)
      
      console.log(`✓ ${deviceType}: Layout structure intact`)
      
      wrapper.unmount()
    })
  })

  it('should show mobile overlay only on mobile devices when sidebar is open', async () => {
    // 移动端测试
    wrapper = createWrapper(375, 667)
    layoutStore = useLayoutStore()
    layoutStore.checkMobile()
    
    // 移动端且侧边栏打开时应显示遮罩
    layoutStore.openSidebar()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.mobile-overlay').exists()).toBe(true)
    
    // 关闭侧边栏后遮罩应消失
    layoutStore.closeSidebar()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.mobile-overlay').exists()).toBe(false)
    
    wrapper.unmount()
    
    // 桌面端测试
    wrapper = createWrapper(1920, 1080)
    layoutStore = useLayoutStore()
    layoutStore.checkMobile()
    
    // 桌面端不应显示遮罩
    expect(wrapper.find('.mobile-overlay').exists()).toBe(false)
  })

  it('should handle sidebar toggle correctly across different screen sizes', () => {
    const testCases = generateResponsiveTestCases()
    
    testCases.forEach(({ deviceType, width, height, expectedMobile }) => {
      wrapper = createWrapper(width, height)
      layoutStore = useLayoutStore()
      layoutStore.checkMobile()
      
      const initialCollapsed = layoutStore.isCollapsed
      
      // 切换侧边栏
      layoutStore.toggleSidebar()
      expect(layoutStore.isCollapsed).toBe(!initialCollapsed)
      
      // 再次切换
      layoutStore.toggleSidebar()
      expect(layoutStore.isCollapsed).toBe(initialCollapsed)
      
      console.log(`✓ ${deviceType}: Sidebar toggle works correctly`)
      
      wrapper.unmount()
    })
  })

  it('should apply correct CSS classes for different states', async () => {
    wrapper = createWrapper(375, 667) // 移动端
    layoutStore = useLayoutStore()
    layoutStore.checkMobile()
    
    // 等待Vue更新
    await wrapper.vm.$nextTick()
    
    const layoutElement = wrapper.find('.main-layout')
    
    // 移动端类名
    expect(layoutElement.classes()).toContain('is-mobile')
    
    // 折叠状态类名
    if (layoutStore.isCollapsed) {
      expect(layoutElement.classes()).toContain('is-collapsed')
    }
    
    // 侧边栏类名
    const sidebar = wrapper.find('.main-sidebar')
    if (layoutStore.isCollapsed) {
      expect(sidebar.classes()).toContain('is-collapsed')
    }
  })

  it('should maintain accessibility across all screen sizes', () => {
    const testCases = generateResponsiveTestCases()
    
    testCases.forEach(({ deviceType, width, height }) => {
      wrapper = createWrapper(width, height)
      
      // 验证可访问性属性
      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        // 按钮应该是可聚焦的
        expect(button.element.tabIndex).toBeGreaterThanOrEqual(0)
      })
      
      // 验证语义化标签
      expect(wrapper.find('aside').exists()).toBe(true) // 侧边栏
      expect(wrapper.find('header').exists()).toBe(true) // 头部
      expect(wrapper.find('main').exists()).toBe(true) // 主内容
      expect(wrapper.find('footer').exists()).toBe(true) // 页脚
      
      console.log(`✓ ${deviceType}: Accessibility maintained`)
      
      wrapper.unmount()
    })
  })

  // 边界测试：极端屏幕尺寸
  it('should handle extreme screen sizes gracefully', () => {
    const extremeCases = [
      { name: 'Very Small', width: 240, height: 320 },
      { name: 'Very Wide', width: 3840, height: 1080 },
      { name: 'Very Tall', width: 1080, height: 2400 }
    ]
    
    extremeCases.forEach(({ name, width, height }) => {
      wrapper = createWrapper(width, height)
      layoutStore = useLayoutStore()
      layoutStore.checkMobile()
      
      // 验证布局不会崩溃
      expect(wrapper.find('.main-layout').exists()).toBe(true)
      expect(layoutStore.sidebarWidth).toMatch(/^\d+px$/) // 应该是有效的像素值
      
      console.log(`✓ ${name} (${width}x${height}): Layout stable`)
      
      wrapper.unmount()
    })
  })
})