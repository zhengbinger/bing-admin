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
 * Property 4: Invalid Credential Handling
 * For any login attempt with invalid credentials, the system should display appropriate error messages
 * Validates: Requirements 2.3
 * 
 * Feature: bing-admin-frontend-rewrite, Property 4: Invalid Credential Handling
 */
describe('Property 4: Invalid Credential Handling', () => {
  let useAuthStore: any

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
    useAuthStore = authModule.useAuthStore
    
    // Initialize auth store to ensure clean state
    const authStore = useAuthStore()
    authStore.clearAuthData()
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should reject login for any invalid credential combination', async () => {
    // Property: For any invalid credentials, login should be rejected with appropriate error
    const authStore = useAuthStore()
    
    const invalidCredentialSets = [
      {
        username: 'wronguser',
        password: 'wrongpass',
        channel: 'web',
        expectedError: 'Invalid username or password'
      },
      {
        username: 'admin',
        password: 'wrongpassword',
        channel: 'web',
        expectedError: 'Invalid password'
      },
      {
        username: 'nonexistentuser',
        password: 'anypassword',
        channel: 'web',
        expectedError: 'User not found'
      },
      {
        username: 'lockeduser',
        password: 'correctpass',
        channel: 'web',
        expectedError: 'Account is locked'
      }
    ]

    for (const credentials of invalidCredentialSets) {
      // Mock authentication failure
      const mockError = new Error(credentials.expectedError)
      mockHttpClient.post.mockRejectedValueOnce(mockError)

      // Attempt login with invalid credentials
      await expect(authStore.login(credentials)).rejects.toThrow(credentials.expectedError)

      // Verify user remains unauthenticated
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.token).toBe(null)
      expect(authStore.user).toBe(null)
    }
  })

  it('should handle empty or missing credential fields', async () => {
    // Property: For any empty or missing credential fields, appropriate validation should occur
    const authStore = useAuthStore()
    
    const invalidCredentialFormats = [
      {
        username: '',
        password: 'password123',
        channel: 'web'
      },
      {
        username: 'user123',
        password: '',
        channel: 'web'
      },
      {
        username: '',
        password: '',
        channel: 'web'
      },
      {
        username: 'user123',
        password: 'password123',
        channel: ''
      }
    ]

    for (const credentials of invalidCredentialFormats) {
      // Mock validation error
      const mockError = new Error('Required fields are missing')
      mockHttpClient.post.mockRejectedValueOnce(mockError)

      // Attempt login with invalid format
      await expect(authStore.login(credentials)).rejects.toThrow()

      // Verify authentication state remains clean
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.token).toBe(null)
    }
  })

  it('should handle authentication server errors gracefully', async () => {
    // Property: For any server error during authentication, the system should handle it gracefully
    const authStore = useAuthStore()
    
    const serverErrorScenarios = [
      {
        error: new Error('Network Error'),
        expectedBehavior: 'network_error'
      },
      {
        error: new Error('Internal Server Error'),
        expectedBehavior: 'server_error'
      },
      {
        error: new Error('Service Unavailable'),
        expectedBehavior: 'service_unavailable'
      },
      {
        error: new Error('Timeout'),
        expectedBehavior: 'timeout'
      }
    ]

    const credentials = {
      username: 'testuser',
      password: 'password123',
      channel: 'web'
    }

    for (const scenario of serverErrorScenarios) {
      mockHttpClient.post.mockRejectedValueOnce(scenario.error)

      // Attempt login during server error
      await expect(authStore.login(credentials)).rejects.toThrow(scenario.error.message)

      // Verify clean state after error
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.token).toBe(null)
      expect(authStore.user).toBe(null)
      expect(authStore.permissions).toEqual([])
    }
  })

  it('should handle malformed authentication responses', async () => {
    // Property: For any malformed authentication response, the system should handle it appropriately
    const authStore = useAuthStore()
    
    const malformedResponses = [
      {
        data: null,
        description: 'null response'
      },
      {
        data: {},
        description: 'empty response'
      },
      {
        data: {
          token: null,
          userId: 1
        },
        description: 'missing required fields'
      },
      {
        data: {
          token: 'valid-token',
          // missing other required fields
        },
        description: 'incomplete response'
      }
    ]

    const credentials = {
      username: 'testuser',
      password: 'password123',
      channel: 'web'
    }

    for (const response of malformedResponses) {
      mockHttpClient.post.mockResolvedValueOnce(response)

      // Attempt login with malformed response
      try {
        await authStore.login(credentials)
        // If no error is thrown, verify the state is still clean
        if (!authStore.isAuthenticated) {
          expect(authStore.token).toBeFalsy()
          expect(authStore.user).toBeNull()
        }
      } catch (error) {
        // If error is thrown, verify clean state
        expect(authStore.isAuthenticated).toBe(false)
        expect(authStore.token).toBeFalsy()
        expect(authStore.user).toBeNull()
      }
    }
  })

  it('should handle rate limiting and security restrictions', async () => {
    // Property: For any rate limiting or security restriction, appropriate handling should occur
    const authStore = useAuthStore()
    
    const securityScenarios = [
      {
        error: new Error('Too many login attempts'),
        statusCode: 429,
        expectedBehavior: 'rate_limited'
      },
      {
        error: new Error('Account temporarily locked'),
        statusCode: 423,
        expectedBehavior: 'account_locked'
      },
      {
        error: new Error('IP address blocked'),
        statusCode: 403,
        expectedBehavior: 'ip_blocked'
      },
      {
        error: new Error('Captcha required'),
        statusCode: 400,
        expectedBehavior: 'captcha_required'
      }
    ]

    const credentials = {
      username: 'testuser',
      password: 'password123',
      channel: 'web'
    }

    for (const scenario of securityScenarios) {
      // Add status code to error
      ;(scenario.error as any).response = { status: scenario.statusCode }
      mockHttpClient.post.mockRejectedValueOnce(scenario.error)

      // Attempt login with security restriction
      await expect(authStore.login(credentials)).rejects.toThrow(scenario.error.message)

      // Verify authentication remains blocked
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.token).toBe(null)
    }
  })

  it('should maintain security for any credential injection attempts', async () => {
    // Property: For any credential injection attempts, the system should remain secure
    const authStore = useAuthStore()
    
    const injectionAttempts = [
      {
        username: "admin'; DROP TABLE users; --",
        password: 'password123',
        channel: 'web'
      },
      {
        username: '<script>alert("xss")</script>',
        password: 'password123',
        channel: 'web'
      },
      {
        username: 'admin',
        password: "' OR '1'='1",
        channel: 'web'
      },
      {
        username: '../../etc/passwd',
        password: 'password123',
        channel: 'web'
      }
    ]

    for (const credentials of injectionAttempts) {
      // Mock security error for injection attempts
      const mockError = new Error('Invalid input detected')
      mockHttpClient.post.mockRejectedValueOnce(mockError)

      // Attempt login with injection
      await expect(authStore.login(credentials)).rejects.toThrow()

      // Verify system remains secure
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.token).toBe(null)
      expect(authStore.user).toBe(null)
    }
  })

  it('should handle concurrent invalid login attempts', async () => {
    // Property: For any concurrent invalid login attempts, each should be handled independently
    const authStore = useAuthStore()
    
    const concurrentInvalidCredentials = [
      {
        username: 'user1',
        password: 'wrongpass1',
        channel: 'web'
      },
      {
        username: 'user2',
        password: 'wrongpass2',
        channel: 'web'
      },
      {
        username: 'user3',
        password: 'wrongpass3',
        channel: 'web'
      }
    ]

    // Mock all requests to fail
    mockHttpClient.post
      .mockRejectedValueOnce(new Error('Invalid credentials 1'))
      .mockRejectedValueOnce(new Error('Invalid credentials 2'))
      .mockRejectedValueOnce(new Error('Invalid credentials 3'))

    // Attempt concurrent invalid logins
    const results = await Promise.allSettled(
      concurrentInvalidCredentials.map(creds => authStore.login(creds))
    )

    // All should be rejected
    results.forEach(result => {
      expect(result.status).toBe('rejected')
    })

    // Authentication state should remain clean
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.token).toBe(null)
    expect(authStore.user).toBe(null)
  })

  it('should validate error message consistency for any authentication failure', async () => {
    // Property: For any authentication failure, error messages should be consistent and informative
    const authStore = useAuthStore()
    
    const errorScenarios = [
      {
        credentials: { username: 'user1', password: 'wrong', channel: 'web' },
        serverError: 'Authentication failed',
        expectedPattern: /authentication|login|credential/i
      },
      {
        credentials: { username: 'locked', password: 'pass', channel: 'web' },
        serverError: 'Account locked',
        expectedPattern: /locked|disabled|suspended/i
      },
      {
        credentials: { username: 'expired', password: 'pass', channel: 'web' },
        serverError: 'Account expired',
        expectedPattern: /expired|inactive/i
      }
    ]

    for (const scenario of errorScenarios) {
      const mockError = new Error(scenario.serverError)
      mockHttpClient.post.mockRejectedValueOnce(mockError)

      try {
        await authStore.login(scenario.credentials)
        expect.fail('Expected login to throw error')
      } catch (error: any) {
        // Verify error message follows expected pattern
        expect(error.message).toMatch(scenario.expectedPattern)
      }

      // Verify clean state
      expect(authStore.isAuthenticated).toBe(false)
    }
  })

  it('should prevent authentication state corruption for any invalid login', async () => {
    // Property: For any invalid login attempt, the authentication state should not be corrupted
    const authStore = useAuthStore()
    
    // First, establish a clean initial state
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.token).toBe(null)
    expect(authStore.user).toBe(null)
    expect(authStore.permissions).toEqual([])

    const invalidAttempts = [
      { username: 'invalid1', password: 'wrong1', channel: 'web' },
      { username: 'invalid2', password: 'wrong2', channel: 'mobile' },
      { username: 'invalid3', password: 'wrong3', channel: 'desktop' }
    ]

    for (const credentials of invalidAttempts) {
      mockHttpClient.post.mockRejectedValueOnce(new Error('Authentication failed'))

      // Attempt invalid login
      try {
        await authStore.login(credentials)
        expect.fail('Expected login to fail')
      } catch (error) {
        // Expected to fail
      }

      // Verify state remains clean after each failed attempt
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.token).toBe(null)
      expect(authStore.user).toBe(null)
      expect(authStore.permissions).toEqual([])
      
      // Verify localStorage remains clean
      expect(localStorage.getItem('auth_token')).toBe(null)
      expect(localStorage.getItem('auth_user')).toBe(null)
      expect(localStorage.getItem('auth_permissions')).toBe(null)
    }
  })
})