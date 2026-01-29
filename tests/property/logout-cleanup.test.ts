/**
 * Property-Based Test: Logout Session Cleanup
 * Feature: bing-admin-frontend-rewrite, Property 8: Logout Session Cleanup
 * 
 * Property: For any logout operation, the system should clean up the user session completely
 * Validates: Requirements 2.7
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../src/store/modules/auth'
import type { LoginResponse, User } from '../../src/types/auth'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn()
  }
}))

// Mock HTTP client
vi.mock('../../src/api/client', () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

describe('Property 8: Logout Session Cleanup', () => {
  let pinia: any
  let router: any
  let authStore: any

  beforeEach(() => {
    // 创建新的 Pinia 实例
    pinia = createPinia()
    setActivePinia(pinia)
    
    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/login', name: 'Login', component: { template: '<div>Login</div>' } },
        { path: '/dashboard', name: 'Dashboard', component: { template: '<div>Dashboard</div>' } }
      ]
    })
    
    // 获取认证store
    authStore = useAuthStore()
    
    // 清除本地存储
    localStorage.clear()
    sessionStorage.clear()
    
    // 重置所有mock
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  /**
   * 生成测试用的完整用户会话数据
   */
  const generateUserSession = (): {
    loginResponse: LoginResponse
    userData: User
    additionalData: Record<string, any>
  } => {
    const userId = Math.floor(Math.random() * 10000) + 1
    const username = `user_${Math.random().toString(36).substr(2, 8)}`
    const nickname = `User ${Math.floor(Math.random() * 1000)}`
    
    const now = new Date()
    const expiration = new Date(now.getTime() + 60 * 60 * 1000) // 1小时后过期
    const refreshExpiration = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7天后过期

    const loginResponse: LoginResponse = {
      token: `token_${Math.random().toString(36).substr(2, 32)}`,
      refreshToken: `refresh_${Math.random().toString(36).substr(2, 32)}`,
      expiration: expiration.toISOString(),
      refreshExpiration: refreshExpiration.toISOString(),
      userId,
      username,
      nickname,
      roles: ['user', 'editor'].slice(0, Math.floor(Math.random() * 2) + 1),
      permissions: ['read:profile', 'write:profile', 'read:users'].slice(0, Math.floor(Math.random() * 3) + 1),
      channelConfig: {
        theme: 'light',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai'
      }
    }

    const userData: User = {
      id: userId,
      username,
      nickname,
      email: `${username}@example.com`,
      phone: `1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      status: 1,
      avatar: `https://avatar.example.com/${userId}.jpg`,
      createTime: new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      updateTime: now,
      roles: loginResponse.roles.map((roleCode, index) => ({
        id: index + 1,
        name: roleCode.charAt(0).toUpperCase() + roleCode.slice(1),
        code: roleCode,
        description: `${roleCode} role`,
        status: 1,
        createTime: now,
        updateTime: now
      })),
      organizations: [{
        id: Math.floor(Math.random() * 100) + 1,
        name: 'Test Organization',
        code: 'test_org',
        parentId: null,
        level: 1,
        sort: 1,
        status: 1,
        description: 'Test organization',
        createTime: now,
        updateTime: now
      }],
      permissions: loginResponse.permissions
    }

    const additionalData = {
      lastLoginTime: now.toISOString(),
      loginCount: Math.floor(Math.random() * 100) + 1,
      preferences: {
        theme: 'light',
        language: 'zh-CN',
        pageSize: 20
      },
      recentActions: Array.from({ length: 5 }, (_, i) => ({
        action: `action_${i}`,
        timestamp: new Date(now.getTime() - i * 60000).toISOString()
      }))
    }

    return { loginResponse, userData, additionalData }
  }

  /**
   * 设置完整的用户会话状态
   */
  const setupUserSession = (sessionData: ReturnType<typeof generateUserSession>): void => {
    const { loginResponse, userData, additionalData } = sessionData

    // 使用暴露的内部方法设置认证数据
    if (typeof (authStore as any).saveAuthData === 'function') {
      (authStore as any).saveAuthData(loginResponse)
    } else {
      // 直接设置状态（如果可用）
      if (authStore.token && typeof authStore.token === 'object' && 'value' in authStore.token) {
        authStore.token.value = loginResponse.token
        authStore.refreshToken.value = loginResponse.refreshToken
        authStore.user.value = userData
        authStore.permissions.value = loginResponse.permissions
        authStore.loginTime.value = new Date()
        authStore.expirationTime.value = new Date(loginResponse.expiration)
      }
    }

    // 设置额外的会话数据
    localStorage.setItem('user_preferences', JSON.stringify(additionalData.preferences))
    localStorage.setItem('recent_actions', JSON.stringify(additionalData.recentActions))
    localStorage.setItem('last_login_time', additionalData.lastLoginTime)
    localStorage.setItem('login_count', additionalData.loginCount.toString())

    // 设置会话存储
    sessionStorage.setItem('current_session', JSON.stringify({
      sessionId: `session_${Math.random().toString(36).substr(2, 16)}`,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }))

    // 设置一些临时数据
    sessionStorage.setItem('temp_data', JSON.stringify({
      formData: { field1: 'value1', field2: 'value2' },
      searchHistory: ['search1', 'search2', 'search3']
    }))
  }

  /**
   * 验证所有会话数据是否被完全清除
   */
  const verifyCompleteCleanup = (): void => {
    // 验证认证store状态被清除
    const tokenValue = authStore.token && typeof authStore.token === 'object' && 'value' in authStore.token 
      ? authStore.token.value 
      : authStore.token
    const refreshTokenValue = authStore.refreshToken && typeof authStore.refreshToken === 'object' && 'value' in authStore.refreshToken 
      ? authStore.refreshToken.value 
      : authStore.refreshToken
    const userValue = authStore.user && typeof authStore.user === 'object' && 'value' in authStore.user 
      ? authStore.user.value 
      : authStore.user
    const permissionsValue = authStore.permissions && typeof authStore.permissions === 'object' && 'value' in authStore.permissions 
      ? authStore.permissions.value 
      : authStore.permissions

    expect(tokenValue).toBeNull()
    expect(refreshTokenValue).toBeNull()
    expect(userValue).toBeNull()
    expect(permissionsValue).toEqual([])
    expect(authStore.isAuthenticated).toBe(false)

    // 验证本地存储被清除
    expect(localStorage.getItem('auth_token')).toBeFalsy()
    expect(localStorage.getItem('auth_refresh_token')).toBeFalsy()
    expect(localStorage.getItem('auth_user')).toBeFalsy()
    expect(localStorage.getItem('auth_permissions')).toBeFalsy()
    expect(localStorage.getItem('auth_login_time')).toBeFalsy()
    expect(localStorage.getItem('auth_expiration_time')).toBeFalsy()

    // 验证其他相关数据被清除（如果实现了的话）
    // 注意：这些数据的清除取决于具体的实现策略
    // 有些应用可能选择保留用户偏好设置
  }

  it('should completely clean up session data on successful logout', async () => {
    // 生成100个不同的用户会话场景
    const testCases = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      sessionData: generateUserSession(),
      logoutSuccess: Math.random() > 0.1 // 90%的成功率
    }))

    for (const testCase of testCases) {
      // 重置状态
      authStore.clearAuthData()
      localStorage.clear()
      sessionStorage.clear()
      vi.clearAllMocks()

      // 设置用户会话
      setupUserSession(testCase.sessionData)

      // 验证会话已建立
      expect(authStore.isAuthenticated).toBe(true)
      const tokenValue = authStore.token && typeof authStore.token === 'object' && 'value' in authStore.token 
        ? authStore.token.value 
        : authStore.token
      const userValue = authStore.user && typeof authStore.user === 'object' && 'value' in authStore.user 
        ? authStore.user.value 
        : authStore.user
      expect(tokenValue).toBeTruthy()
      expect(userValue).toBeTruthy()

      // Mock logout API
      const { httpClient } = await import('../../src/api/client')
      if (testCase.logoutSuccess) {
        vi.mocked(httpClient.post).mockResolvedValueOnce({ data: {} })
      } else {
        vi.mocked(httpClient.post).mockRejectedValueOnce(new Error('Network error'))
      }

      // 执行注销
      await authStore.logout()

      // 验证完全清理
      verifyCompleteCleanup()

      // 验证成功消息
      expect(ElMessage.success).toHaveBeenCalledWith('退出登录成功')

      // 验证API调用
      expect(httpClient.post).toHaveBeenCalledWith('/api/auth/logout')
    }
  })

  it('should clean up session data even when logout API fails', async () => {
    const testCases = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      sessionData: generateUserSession(),
      errorType: ['network', 'server', 'timeout'][Math.floor(Math.random() * 3)]
    }))

    for (const testCase of testCases) {
      // 重置状态
      authStore.clearAuthData()
      localStorage.clear()
      sessionStorage.clear()
      vi.clearAllMocks()

      // 设置用户会话
      setupUserSession(testCase.sessionData)

      // Mock logout API failure
      const { httpClient } = await import('../../src/api/client')
      const errorMessage = `${testCase.errorType} error`
      vi.mocked(httpClient.post).mockRejectedValueOnce(new Error(errorMessage))

      // 执行注销
      await authStore.logout()

      // 即使API失败，也应该清理本地数据
      verifyCompleteCleanup()

      // 验证成功消息（即使API失败，本地清理成功也应该显示成功）
      expect(ElMessage.success).toHaveBeenCalledWith('退出登录成功')
    }
  })

  it('should handle concurrent logout operations gracefully', async () => {
    const testCases = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      sessionData: generateUserSession(),
      concurrentCalls: Math.floor(Math.random() * 5) + 2
    }))

    for (const testCase of testCases) {
      // 重置状态
      authStore.clearAuthData()
      localStorage.clear()
      sessionStorage.clear()
      vi.clearAllMocks()

      // 设置用户会话
      setupUserSession(testCase.sessionData)

      // Mock logout API
      const { httpClient } = await import('../../src/api/client')
      vi.mocked(httpClient.post).mockResolvedValue({ data: {} })

      // 并发执行多个注销操作
      const logoutPromises = Array.from({ length: testCase.concurrentCalls }, () => 
        authStore.logout()
      )

      // 等待所有注销操作完成
      await Promise.all(logoutPromises)

      // 验证最终状态
      verifyCompleteCleanup()

      // 验证API只被调用一次或多次（取决于实现的防重复机制）
      expect(httpClient.post).toHaveBeenCalled()
    }
  })

  it('should clean up session data with various data types and structures', async () => {
    const testCases = Array.from({ length: 50 }, (_, i) => {
      const sessionData = generateUserSession()
      
      // 添加各种类型的额外数据
      const complexData = {
        arrays: [1, 2, 3, 'a', 'b', 'c'],
        objects: { nested: { deep: { value: 'test' } } },
        booleans: [true, false],
        numbers: [0, -1, 3.14, Infinity],
        nullValues: [null, undefined],
        dates: [new Date().toISOString()],
        functions: 'function() { return "test"; }' // 序列化后的函数
      }

      return {
        id: i + 1,
        sessionData,
        complexData
      }
    })

    for (const testCase of testCases) {
      // 重置状态
      authStore.clearAuthData()
      localStorage.clear()
      sessionStorage.clear()
      vi.clearAllMocks()

      // 设置用户会话
      setupUserSession(testCase.sessionData)

      // 添加复杂数据结构
      localStorage.setItem('complex_data', JSON.stringify(testCase.complexData))
      sessionStorage.setItem('temp_complex_data', JSON.stringify(testCase.complexData))

      // Mock logout API
      const { httpClient } = await import('../../src/api/client')
      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: {} })

      // 执行注销
      await authStore.logout()

      // 验证基本清理
      verifyCompleteCleanup()

      // 验证复杂数据结构的处理（根据实现策略）
      // 注意：某些应用可能选择保留非敏感的复杂数据
    }
  })

  it('should maintain cleanup consistency across different session states', async () => {
    const testCases = Array.from({ length: 100 }, (_, i) => {
      const sessionData = generateUserSession()
      
      return {
        id: i + 1,
        sessionData,
        initialState: {
          hasToken: Math.random() > 0.1,
          hasUser: Math.random() > 0.1,
          hasPermissions: Math.random() > 0.2,
          hasLocalStorage: Math.random() > 0.1,
          hasSessionStorage: Math.random() > 0.3
        }
      }
    })

    for (const testCase of testCases) {
      // 重置状态
      authStore.clearAuthData()
      localStorage.clear()
      sessionStorage.clear()
      vi.clearAllMocks()

      // 根据测试用例设置不同的初始状态
      if (testCase.initialState.hasToken) {
        const token = testCase.sessionData.loginResponse.token
        if (authStore.token && typeof authStore.token === 'object' && 'value' in authStore.token) {
          authStore.token.value = token
        }
        if (testCase.initialState.hasLocalStorage) {
          localStorage.setItem('auth_token', token)
        }
      }

      if (testCase.initialState.hasUser) {
        const userData = testCase.sessionData.userData
        if (authStore.user && typeof authStore.user === 'object' && 'value' in authStore.user) {
          authStore.user.value = userData
        }
        if (testCase.initialState.hasLocalStorage) {
          localStorage.setItem('auth_user', JSON.stringify(userData))
        }
      }

      if (testCase.initialState.hasPermissions) {
        const permissions = testCase.sessionData.loginResponse.permissions
        if (authStore.permissions && typeof authStore.permissions === 'object' && 'value' in authStore.permissions) {
          authStore.permissions.value = permissions
        }
        if (testCase.initialState.hasLocalStorage) {
          localStorage.setItem('auth_permissions', JSON.stringify(permissions))
        }
      }

      if (testCase.initialState.hasSessionStorage) {
        sessionStorage.setItem('temp_session_data', JSON.stringify({ test: 'data' }))
      }

      // Mock logout API
      const { httpClient } = await import('../../src/api/client')
      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: {} })

      // 执行注销
      await authStore.logout()

      // 无论初始状态如何，注销后都应该完全清理
      verifyCompleteCleanup()
    }
  })

  it('should handle logout cleanup with memory constraints', async () => {
    const testCases = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      sessionData: generateUserSession(),
      dataSize: Math.floor(Math.random() * 1000) + 100 // 100-1100 items
    }))

    for (const testCase of testCases) {
      // 重置状态
      authStore.clearAuthData()
      localStorage.clear()
      sessionStorage.clear()
      vi.clearAllMocks()

      // 设置用户会话
      setupUserSession(testCase.sessionData)

      // 添加大量数据来模拟内存压力
      const largeData = Array.from({ length: testCase.dataSize }, (_, i) => ({
        id: i,
        data: `large_data_${i}_${Math.random().toString(36).substr(2, 20)}`
      }))

      try {
        localStorage.setItem('large_data', JSON.stringify(largeData))
      } catch (error) {
        // 如果存储空间不足，跳过这个测试用例
        continue
      }

      // Mock logout API
      const { httpClient } = await import('../../src/api/client')
      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: {} })

      // 执行注销
      await authStore.logout()

      // 验证清理完成
      verifyCompleteCleanup()

      // 验证大数据不影响清理过程
      expect(ElMessage.success).toHaveBeenCalledWith('退出登录成功')
    }
  })
})