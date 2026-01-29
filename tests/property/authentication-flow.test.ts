import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  }
}))

// Mock HTTP client
const mockHttpClient = {
  post: vi.fn(),
  get: vi.fn()
}

vi.mock('../../src/api/client', () => ({
  httpClient: mockHttpClient
}))

/**
 * Property 2: Authentication Flow Protection
 * For any unauthenticated user attempting to access protected routes, the system should redirect to the login page
 * Validates: Requirements 2.1
 * 
 * Feature: bing-admin-frontend-rewrite, Property 2: Authentication Flow Protection
 */
describe('Property 2: Authentication Flow Protection', () => {
  let useAuthStore: any
  let authGuard: any
  let permissionGuard: any

  beforeEach(async () => {
    // Create fresh Pinia instance for each test
    const pinia = createPinia()
    setActivePinia(pinia)

    // Clear localStorage
    localStorage.clear()

    // Reset all mocks
    vi.clearAllMocks()

    // Import after setting up mocks
    const authModule = await import('../../src/store/modules/auth')
    const guardsModule = await import('../../src/router/guards')
    
    useAuthStore = authModule.useAuthStore
    authGuard = guardsModule.authGuard
    permissionGuard = guardsModule.permissionGuard
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should redirect unauthenticated users to login page for any protected route', async () => {
    // Property: For any unauthenticated user attempting to access protected routes, redirect to login
    const authStore = useAuthStore()
    
    // Ensure user is not authenticated
    expect(authStore.isAuthenticated).toBe(false)
    
    const protectedRoutes = [
      '/dashboard',
      '/users',
      '/roles',
      '/permissions',
      '/organizations',
      '/settings',
      '/profile',
      '/admin/config'
    ]

    for (const routePath of protectedRoutes) {
      const to = { path: routePath, fullPath: routePath, meta: {} }
      const from = { path: '/', fullPath: '/', meta: {} }
      const next = vi.fn()

      await authGuard(to as any, from as any, next)

      // Should redirect to login with redirect query
      expect(next).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: routePath }
      })
    }
  })

  it('should allow access to white-listed routes for any user', async () => {
    // Property: For any user (authenticated or not), white-listed routes should be accessible
    const authStore = useAuthStore()
    
    // Ensure user is not authenticated
    expect(authStore.isAuthenticated).toBe(false)
    
    const whiteListRoutes = [
      '/login',
      '/register',
      '/forgot-password',
      '/404',
      '/403'
    ]

    for (const routePath of whiteListRoutes) {
      const to = { path: routePath, fullPath: routePath, meta: {} }
      const from = { path: '/', fullPath: '/', meta: {} }
      const next = vi.fn()

      await authGuard(to as any, from as any, next)

      // Should allow access without redirect
      expect(next).toHaveBeenCalledWith()
    }
  })

  it('should allow authenticated users to access any protected route', async () => {
    // Property: For any authenticated user, protected routes should be accessible
    const authStore = useAuthStore()
    
    // Mock successful login response
    const mockLoginResponse = {
      data: {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiration: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        refreshExpiration: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        userId: 1,
        username: 'testuser',
        nickname: 'Test User',
        roles: ['user'],
        permissions: ['user:view', 'dashboard:view'],
        channelConfig: {}
      }
    }

    mockHttpClient.post.mockResolvedValueOnce(mockLoginResponse)

    // Login user
    await authStore.login({
      username: 'testuser',
      password: 'password',
      channel: 'web'
    })

    expect(authStore.isAuthenticated).toBe(true)

    const protectedRoutes = [
      '/dashboard',
      '/users',
      '/profile',
      '/settings'
    ]

    for (const routePath of protectedRoutes) {
      const to = { path: routePath, fullPath: routePath, meta: {} }
      const from = { path: '/', fullPath: '/', meta: {} }
      const next = vi.fn()

      await authGuard(to as any, from as any, next)

      // Should allow access
      expect(next).toHaveBeenCalledWith()
    }
  })

  it('should validate authentication state consistency for any login operation', async () => {
    // Property: For any login operation, authentication state should be consistent
    const authStore = useAuthStore()
    
    const loginCredentials = {
      username: 'testuser',
      password: 'password123',
      channel: 'web'
    }

    const mockLoginResponse = {
      data: {
        token: 'auth-token-123',
        refreshToken: 'refresh-token-123',
        expiration: new Date(Date.now() + 3600000).toISOString(),
        refreshExpiration: new Date(Date.now() + 7200000).toISOString(),
        userId: 1,
        username: 'testuser',
        nickname: 'Test User',
        roles: ['user', 'manager'],
        permissions: ['user:view', 'user:create', 'dashboard:view'],
        channelConfig: { theme: 'light' }
      }
    }

    mockHttpClient.post.mockResolvedValueOnce(mockLoginResponse)

    // Perform login
    const result = await authStore.login(loginCredentials)

    // Verify all authentication state is consistent
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.token).toBe('auth-token-123')
    expect(authStore.refreshToken).toBe('refresh-token-123')
    expect(authStore.user?.username).toBe('testuser')
    expect(authStore.user?.nickname).toBe('Test User')
    expect(authStore.permissions).toEqual(['user:view', 'user:create', 'dashboard:view'])
    expect(authStore.userRoles).toEqual(['user', 'manager'])

    // Verify localStorage consistency
    expect(localStorage.getItem('auth_token')).toBe('auth-token-123')
    expect(localStorage.getItem('auth_refresh_token')).toBe('refresh-token-123')
    expect(JSON.parse(localStorage.getItem('auth_permissions') || '[]')).toEqual(['user:view', 'user:create', 'dashboard:view'])
  })

  it('should successfully refresh token for any valid refresh token', async () => {
    // Property: For any valid refresh token, the system should successfully refresh authentication
    const authStore = useAuthStore()
    
    // Set up expired token with valid refresh token
    const expiredTime = new Date(Date.now() - 1000).toISOString()
    authStore.token = 'expired-token'
    authStore.refreshToken = 'valid-refresh-token'
    authStore.expirationTime = new Date(expiredTime)
    authStore.user = {
      id: 1,
      username: 'testuser',
      nickname: 'Test User',
      email: '',
      phone: '',
      status: 1,
      createTime: new Date(),
      updateTime: new Date(),
      roles: [],
      organizations: [],
      permissions: []
    }

    // Mock successful refresh
    const mockRefreshResponse = {
      data: {
        token: 'new-token',
        refreshToken: 'new-refresh-token',
        expiration: new Date(Date.now() + 3600000).toISOString(),
        refreshExpiration: new Date(Date.now() + 7200000).toISOString(),
        userId: 1,
        username: 'testuser',
        nickname: 'Test User',
        roles: ['user'],
        permissions: ['user:view'],
        channelConfig: {}
      }
    }

    mockHttpClient.post.mockResolvedValueOnce(mockRefreshResponse)

    // Manually call refresh token
    await authStore.refreshAuthToken()

    // Token should be refreshed
    expect(authStore.token).toBe('new-token')
    expect(authStore.isAuthenticated).toBe(true)
  })

  it('should handle missing user info for any authenticated session', async () => {
    // Property: For any authenticated session without user info, the system should fetch user data
    const authStore = useAuthStore()
    
    // Set up token without user info
    authStore.token = 'valid-token'
    authStore.expirationTime = new Date(Date.now() + 3600000)

    // Mock getCurrentUser response
    const mockUserResponse = {
      data: {
        id: 1,
        username: 'testuser',
        nickname: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        status: 1,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        roles: [{ id: 1, name: 'User', code: 'user', description: 'Regular user', status: 1, createTime: new Date().toISOString(), updateTime: new Date().toISOString() }],
        organizations: [],
        permissions: ['user:view', 'dashboard:view']
      }
    }

    mockHttpClient.get.mockResolvedValueOnce(mockUserResponse)

    // Manually call getCurrentUser to simulate the guard behavior
    await authStore.getCurrentUser()

    // Should fetch user info
    expect(mockHttpClient.get).toHaveBeenCalledWith('/api/auth/current')
    expect(authStore.user?.username).toBe('testuser')
  })

  it('should handle user info fetch failure for any session', async () => {
    // Property: For any session where user info fetch fails, redirect to login
    const authStore = useAuthStore()
    
    // Set up token without user info
    localStorage.setItem('auth_token', 'valid-token')
    localStorage.setItem('auth_expiration_time', new Date(Date.now() + 3600000).toISOString())

    // Mock getCurrentUser failure
    mockHttpClient.get.mockRejectedValueOnce(new Error('User info fetch failed'))

    const to = { path: '/dashboard', fullPath: '/dashboard', meta: {} }
    const from = { path: '/', fullPath: '/', meta: {} }
    const next = vi.fn()

    await authGuard(to as any, from as any, next)

    // Should redirect to login due to user info fetch failure
    expect(next).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/dashboard' }
    })
  })

  it('should validate authentication state consistency for any login operation', async () => {
    // Property: For any login operation, authentication state should be consistent
    const authStore = useAuthStore()
    
    const loginCredentials = {
      username: 'testuser',
      password: 'password123',
      channel: 'web'
    }

    const mockLoginResponse = {
      data: {
        token: 'auth-token-123',
        refreshToken: 'refresh-token-123',
        expiration: new Date(Date.now() + 3600000).toISOString(),
        refreshExpiration: new Date(Date.now() + 7200000).toISOString(),
        userId: 1,
        username: 'testuser',
        nickname: 'Test User',
        roles: ['user', 'manager'],
        permissions: ['user:view', 'user:create', 'dashboard:view'],
        channelConfig: { theme: 'light' }
      }
    }

    mockHttpClient.post.mockResolvedValueOnce(mockLoginResponse)

    // Perform login
    const result = await authStore.login(loginCredentials)

    // Verify all authentication state is consistent
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.token).toBe('auth-token-123')
    expect(authStore.refreshToken).toBe('refresh-token-123')
    expect(authStore.user?.username).toBe('testuser')
    expect(authStore.user?.nickname).toBe('Test User')
    expect(authStore.permissions).toEqual(['user:view', 'user:create', 'dashboard:view'])
    expect(authStore.userRoles).toEqual(['user', 'manager'])

    // Verify localStorage consistency
    expect(localStorage.getItem('auth_token')).toBe('auth-token-123')
    expect(localStorage.getItem('auth_refresh_token')).toBe('refresh-token-123')
    expect(JSON.parse(localStorage.getItem('auth_permissions') || '[]')).toEqual(['user:view', 'user:create', 'dashboard:view'])
  })

  it('should clear all authentication data for any logout operation', async () => {
    // Property: For any logout operation, all authentication data should be cleared
    const authStore = useAuthStore()
    
    // Set up authenticated state
    const mockLoginResponse = {
      data: {
        token: 'auth-token',
        refreshToken: 'refresh-token',
        expiration: new Date(Date.now() + 3600000).toISOString(),
        refreshExpiration: new Date(Date.now() + 7200000).toISOString(),
        userId: 1,
        username: 'testuser',
        nickname: 'Test User',
        roles: ['user'],
        permissions: ['user:view'],
        channelConfig: {}
      }
    }

    mockHttpClient.post.mockResolvedValueOnce(mockLoginResponse)
    await authStore.login({ username: 'testuser', password: 'password', channel: 'web' })

    // Verify authenticated state
    expect(authStore.isAuthenticated).toBe(true)

    // Mock logout API call
    mockHttpClient.post.mockResolvedValueOnce({ data: {} })

    // Perform logout
    await authStore.logout()

    // Verify all data is cleared
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.token).toBe(null)
    expect(authStore.refreshToken).toBe(null)
    expect(authStore.user).toBe(null)
    expect(authStore.permissions).toEqual([])

    // Verify localStorage is cleared
    expect(localStorage.getItem('auth_token')).toBe(null)
    expect(localStorage.getItem('auth_refresh_token')).toBe(null)
    expect(localStorage.getItem('auth_user')).toBe(null)
    expect(localStorage.getItem('auth_permissions')).toBe(null)
  })
})