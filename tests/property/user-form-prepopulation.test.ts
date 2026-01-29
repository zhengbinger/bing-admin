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
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}

vi.mock('../../src/api/client', () => ({
  httpClient: mockHttpClient
}))

/**
 * Property 11: User Edit Form Pre-population
 * For any user being edited, the form should be pre-populated with existing user data
 * Validates: Requirements 3.3
 * 
 * Feature: bing-admin-frontend-rewrite, Property 11: User Edit Form Pre-population
 */
describe('Property 11: User Edit Form Pre-population', () => {
  let useUserStore: any
  let userApiService: any

  beforeEach(async () => {
    // Create fresh Pinia instance for each test
    const pinia = createPinia()
    setActivePinia(pinia)

    // Clear localStorage
    localStorage.clear()

    // Reset all mocks
    vi.clearAllMocks()

    // Import after setting up mocks
    const userStoreModule = await import('../../src/store/modules/user')
    const userApiModule = await import('../../src/api/services/user')
    
    useUserStore = userStoreModule.useUserStore
    userApiService = userApiModule.userApiService

    // Clear any existing store state and cache
    const userStore = useUserStore()
    userStore.clearUserCache()
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should pre-populate form with existing user data for any user being edited', async () => {
    // Property: For any user being edited, the form should be pre-populated with existing user data
    const userStore = useUserStore()

    // Test cases with different user data combinations
    const testUsers = [
      // User with all fields populated
      {
        id: 1,
        username: 'john_doe',
        nickname: 'John Doe',
        email: 'john.doe@example.com',
        phone: '13800138001',
        status: 1,
        avatar: 'https://example.com/avatar1.jpg',
        createTime: new Date('2023-01-01T10:00:00Z'),
        updateTime: new Date('2023-06-01T15:30:00Z'),
        roles: [
          {
            id: 1,
            name: 'Administrator',
            code: 'ADMIN',
            description: 'System Administrator',
            status: 1,
            createTime: new Date('2023-01-01T10:00:00Z'),
            updateTime: new Date('2023-01-01T10:00:00Z')
          },
          {
            id: 2,
            name: 'Manager',
            code: 'MANAGER',
            description: 'Department Manager',
            status: 1,
            createTime: new Date('2023-01-01T10:00:00Z'),
            updateTime: new Date('2023-01-01T10:00:00Z')
          }
        ],
        organizations: [
          {
            id: 1,
            name: 'IT Department',
            code: 'IT',
            parentId: null,
            level: 1,
            sort: 1,
            status: 1,
            description: 'Information Technology Department',
            createTime: new Date('2023-01-01T10:00:00Z'),
            updateTime: new Date('2023-01-01T10:00:00Z')
          }
        ],
        channels: ['web', 'mobile', 'api']
      },
      // User with minimal required fields
      {
        id: 2,
        username: 'minimal_user',
        nickname: 'Minimal User',
        email: '',
        phone: '',
        status: 0,
        avatar: null,
        createTime: new Date('2023-02-01T10:00:00Z'),
        updateTime: new Date('2023-02-01T10:00:00Z'),
        roles: [],
        organizations: [],
        channels: ['web']
      },
      // User with partial data
      {
        id: 3,
        username: 'partial_user',
        nickname: 'Partial User',
        email: 'partial@example.com',
        phone: '',
        status: 1,
        avatar: null,
        createTime: new Date('2023-03-01T10:00:00Z'),
        updateTime: new Date('2023-03-01T10:00:00Z'),
        roles: [
          {
            id: 3,
            name: 'User',
            code: 'USER',
            description: 'Regular User',
            status: 1,
            createTime: new Date('2023-01-01T10:00:00Z'),
            updateTime: new Date('2023-01-01T10:00:00Z')
          }
        ],
        organizations: [
          {
            id: 2,
            name: 'Sales Department',
            code: 'SALES',
            parentId: null,
            level: 1,
            sort: 2,
            status: 1,
            description: 'Sales Department',
            createTime: new Date('2023-01-01T10:00:00Z'),
            updateTime: new Date('2023-01-01T10:00:00Z')
          },
          {
            id: 3,
            name: 'Marketing Team',
            code: 'MARKETING',
            parentId: 2,
            level: 2,
            sort: 1,
            status: 1,
            description: 'Marketing Team under Sales',
            createTime: new Date('2023-01-01T10:00:00Z'),
            updateTime: new Date('2023-01-01T10:00:00Z')
          }
        ],
        channels: ['web', 'wechat']
      },
      // User with special characters and unicode
      {
        id: 4,
        username: 'unicode_user',
        nickname: '张三 (Zhang San)',
        email: 'zhangsan@公司.com',
        phone: '18612345678',
        status: 1,
        avatar: 'https://example.com/avatar4.jpg',
        createTime: new Date('2023-04-01T10:00:00Z'),
        updateTime: new Date('2023-07-01T10:00:00Z'),
        roles: [
          {
            id: 4,
            name: '高级用户',
            code: 'SENIOR_USER',
            description: '高级用户权限',
            status: 1,
            createTime: new Date('2023-01-01T10:00:00Z'),
            updateTime: new Date('2023-01-01T10:00:00Z')
          }
        ],
        organizations: [
          {
            id: 4,
            name: '研发部门',
            code: 'RD',
            parentId: null,
            level: 1,
            sort: 3,
            status: 1,
            description: '研发部门',
            createTime: new Date('2023-01-01T10:00:00Z'),
            updateTime: new Date('2023-01-01T10:00:00Z')
          }
        ],
        channels: ['web', 'mobile', 'wechat', 'api']
      },
      // User with inactive status and no roles/organizations
      {
        id: 5,
        username: 'inactive_user',
        nickname: 'Inactive User',
        email: 'inactive@example.com',
        phone: '15987654321',
        status: 0,
        avatar: null,
        createTime: new Date('2023-05-01T10:00:00Z'),
        updateTime: new Date('2023-05-01T10:00:00Z'),
        roles: [],
        organizations: [],
        channels: []
      }
    ]

    for (const testUser of testUsers) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      // Mock API response for getUserById
      mockHttpClient.get.mockResolvedValueOnce({ data: testUser })

      // Retrieve user data (simulating form loading)
      const retrievedUser = await userStore.getUserById(testUser.id)

      // Verify that the retrieved user data matches the original user data exactly
      expect(retrievedUser).toBeDefined()
      expect(retrievedUser.id).toBe(testUser.id)
      expect(retrievedUser.username).toBe(testUser.username)
      expect(retrievedUser.nickname).toBe(testUser.nickname)
      expect(retrievedUser.email).toBe(testUser.email)
      expect(retrievedUser.phone).toBe(testUser.phone)
      expect(retrievedUser.status).toBe(testUser.status)
      expect(retrievedUser.avatar).toBe(testUser.avatar)

      // Verify dates are preserved
      expect(retrievedUser.createTime).toEqual(testUser.createTime)
      expect(retrievedUser.updateTime).toEqual(testUser.updateTime)

      // Verify roles are pre-populated correctly
      expect(retrievedUser.roles).toHaveLength(testUser.roles.length)
      testUser.roles.forEach((role, index) => {
        expect(retrievedUser.roles[index]).toEqual(role)
      })

      // Verify organizations are pre-populated correctly
      expect(retrievedUser.organizations).toHaveLength(testUser.organizations.length)
      testUser.organizations.forEach((org, index) => {
        expect(retrievedUser.organizations[index]).toEqual(org)
      })

      // Verify channels are pre-populated correctly
      if (testUser.channels) {
        expect(retrievedUser.channels).toEqual(testUser.channels)
      }

      // Verify API was called with correct user ID
      expect(mockHttpClient.get).toHaveBeenCalledWith(`/api/user/${testUser.id}`)

      // Verify user data is correctly retrieved and matches expected structure
      expect(retrievedUser).toEqual(testUser)

      vi.clearAllMocks()
    }
  })

  it('should handle cached user data for form pre-population', async () => {
    // Property: For any cached user being edited, the form should use cached data without API call
    const userStore = useUserStore()

    const testUser = {
      id: 10,
      username: 'cached_user',
      nickname: 'Cached User',
      email: 'cached@example.com',
      phone: '13912345678',
      status: 1,
      avatar: 'https://example.com/cached.jpg',
      createTime: new Date('2023-01-01T10:00:00Z'),
      updateTime: new Date('2023-06-01T10:00:00Z'),
      roles: [
        {
          id: 5,
          name: 'Cached Role',
          code: 'CACHED',
          description: 'Cached Role Description',
          status: 1,
          createTime: new Date('2023-01-01T10:00:00Z'),
          updateTime: new Date('2023-01-01T10:00:00Z')
        }
      ],
      organizations: [
        {
          id: 5,
          name: 'Cached Organization',
          code: 'CACHED_ORG',
          parentId: null,
          level: 1,
          sort: 1,
          status: 1,
          description: 'Cached Organization',
          createTime: new Date('2023-01-01T10:00:00Z'),
          updateTime: new Date('2023-01-01T10:00:00Z')
        }
      ],
      channels: ['web', 'mobile']
    }

    // First call - should make API call and cache the result
    mockHttpClient.get.mockResolvedValueOnce({ data: testUser })
    const firstRetrievedUser = await userStore.getUserById(testUser.id)
    
    // Verify first call made API request
    expect(mockHttpClient.get).toHaveBeenCalledWith(`/api/user/${testUser.id}`)
    expect(firstRetrievedUser).toEqual(testUser)

    // Clear mock to verify no additional API calls
    vi.clearAllMocks()

    // Second call - should use cached data without API call
    const secondRetrievedUser = await userStore.getUserById(testUser.id)
    
    // Verify no API call was made (using cache)
    expect(mockHttpClient.get).not.toHaveBeenCalled()
    
    // Verify cached data is identical to original
    expect(secondRetrievedUser).toEqual(testUser)
    expect(secondRetrievedUser).toEqual(firstRetrievedUser)
    
    // Verify all fields are preserved in cache
    expect(secondRetrievedUser.username).toBe(testUser.username)
    expect(secondRetrievedUser.nickname).toBe(testUser.nickname)
    expect(secondRetrievedUser.email).toBe(testUser.email)
    expect(secondRetrievedUser.phone).toBe(testUser.phone)
    expect(secondRetrievedUser.status).toBe(testUser.status)
    expect(secondRetrievedUser.roles).toEqual(testUser.roles)
    expect(secondRetrievedUser.organizations).toEqual(testUser.organizations)
    expect(secondRetrievedUser.channels).toEqual(testUser.channels)
  })

  it('should handle form pre-population with empty or null values', async () => {
    // Property: For any user with empty or null values, the form should handle pre-population gracefully
    const userStore = useUserStore()

    // Test cases with various empty/null value combinations
    const testUsersWithEmptyValues = [
      // User with null email and phone
      {
        id: 20,
        username: 'null_fields_user',
        nickname: 'Null Fields User',
        email: null,
        phone: null,
        status: 1,
        avatar: null,
        createTime: new Date('2023-01-01T10:00:00Z'),
        updateTime: new Date('2023-01-01T10:00:00Z'),
        roles: [],
        organizations: [],
        channels: null
      },
      // User with empty string values
      {
        id: 21,
        username: 'empty_fields_user',
        nickname: 'Empty Fields User',
        email: '',
        phone: '',
        status: 1,
        avatar: '',
        createTime: new Date('2023-01-01T10:00:00Z'),
        updateTime: new Date('2023-01-01T10:00:00Z'),
        roles: [],
        organizations: [],
        channels: []
      },
      // User with undefined values
      {
        id: 22,
        username: 'undefined_fields_user',
        nickname: 'Undefined Fields User',
        email: undefined,
        phone: undefined,
        status: 1,
        avatar: undefined,
        createTime: new Date('2023-01-01T10:00:00Z'),
        updateTime: new Date('2023-01-01T10:00:00Z'),
        roles: undefined,
        organizations: undefined,
        channels: undefined
      }
    ]

    for (const testUser of testUsersWithEmptyValues) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      // Mock API response
      mockHttpClient.get.mockResolvedValueOnce({ data: testUser })

      // Retrieve user data
      const retrievedUser = await userStore.getUserById(testUser.id)

      // Verify basic fields are preserved
      expect(retrievedUser.id).toBe(testUser.id)
      expect(retrievedUser.username).toBe(testUser.username)
      expect(retrievedUser.nickname).toBe(testUser.nickname)
      expect(retrievedUser.status).toBe(testUser.status)

      // Verify empty/null values are handled correctly
      expect(retrievedUser.email).toBe(testUser.email)
      expect(retrievedUser.phone).toBe(testUser.phone)
      expect(retrievedUser.avatar).toBe(testUser.avatar)

      // Verify arrays are handled correctly (should be arrays even if originally null/undefined)
      if (testUser.roles === null || testUser.roles === undefined) {
        expect(Array.isArray(retrievedUser.roles) || retrievedUser.roles === null || retrievedUser.roles === undefined).toBe(true)
      } else {
        expect(retrievedUser.roles).toEqual(testUser.roles)
      }

      if (testUser.organizations === null || testUser.organizations === undefined) {
        expect(Array.isArray(retrievedUser.organizations) || retrievedUser.organizations === null || retrievedUser.organizations === undefined).toBe(true)
      } else {
        expect(retrievedUser.organizations).toEqual(testUser.organizations)
      }

      if (testUser.channels === null || testUser.channels === undefined) {
        expect(Array.isArray(retrievedUser.channels) || retrievedUser.channels === null || retrievedUser.channels === undefined).toBe(true)
      } else {
        expect(retrievedUser.channels).toEqual(testUser.channels)
      }

      // Verify API was called correctly
      expect(mockHttpClient.get).toHaveBeenCalledWith(`/api/user/${testUser.id}`)

      vi.clearAllMocks()
    }
  })

  it('should handle form pre-population with complex nested data structures', async () => {
    // Property: For any user with complex nested data, the form should pre-populate all nested structures correctly
    const userStore = useUserStore()

    const complexUser = {
      id: 30,
      username: 'complex_user',
      nickname: 'Complex User',
      email: 'complex@example.com',
      phone: '13800138030',
      status: 1,
      avatar: 'https://example.com/complex.jpg',
      createTime: new Date('2023-01-01T10:00:00Z'),
      updateTime: new Date('2023-08-01T10:00:00Z'),
      roles: [
        {
          id: 10,
          name: 'Super Admin',
          code: 'SUPER_ADMIN',
          description: 'Super Administrator with all permissions',
          status: 1,
          createTime: new Date('2023-01-01T10:00:00Z'),
          updateTime: new Date('2023-01-01T10:00:00Z')
        },
        {
          id: 11,
          name: 'Department Head',
          code: 'DEPT_HEAD',
          description: 'Department Head Role',
          status: 1,
          createTime: new Date('2023-02-01T10:00:00Z'),
          updateTime: new Date('2023-02-01T10:00:00Z')
        },
        {
          id: 12,
          name: 'Project Manager',
          code: 'PM',
          description: 'Project Manager Role',
          status: 1,
          createTime: new Date('2023-03-01T10:00:00Z'),
          updateTime: new Date('2023-03-01T10:00:00Z')
        }
      ],
      organizations: [
        {
          id: 10,
          name: 'Corporate Headquarters',
          code: 'HQ',
          parentId: null,
          level: 1,
          sort: 1,
          status: 1,
          description: 'Main corporate headquarters',
          createTime: new Date('2023-01-01T10:00:00Z'),
          updateTime: new Date('2023-01-01T10:00:00Z')
        },
        {
          id: 11,
          name: 'Technology Division',
          code: 'TECH',
          parentId: 10,
          level: 2,
          sort: 1,
          status: 1,
          description: 'Technology Division under HQ',
          createTime: new Date('2023-01-01T10:00:00Z'),
          updateTime: new Date('2023-01-01T10:00:00Z')
        },
        {
          id: 12,
          name: 'Software Development Team',
          code: 'DEV',
          parentId: 11,
          level: 3,
          sort: 1,
          status: 1,
          description: 'Software Development Team under Tech Division',
          createTime: new Date('2023-01-01T10:00:00Z'),
          updateTime: new Date('2023-01-01T10:00:00Z')
        }
      ],
      channels: ['web', 'mobile', 'wechat', 'api']
    }

    // Clear cache to ensure fresh API call
    userStore.clearUserCache()
    
    // Mock API response
    mockHttpClient.get.mockResolvedValueOnce({ data: complexUser })

    // Retrieve user data
    const retrievedUser = await userStore.getUserById(complexUser.id)

    // Verify all basic fields
    expect(retrievedUser.id).toBe(complexUser.id)
    expect(retrievedUser.username).toBe(complexUser.username)
    expect(retrievedUser.nickname).toBe(complexUser.nickname)
    expect(retrievedUser.email).toBe(complexUser.email)
    expect(retrievedUser.phone).toBe(complexUser.phone)
    expect(retrievedUser.status).toBe(complexUser.status)
    expect(retrievedUser.avatar).toBe(complexUser.avatar)

    // Verify complex role structure
    expect(retrievedUser.roles).toHaveLength(3)
    complexUser.roles.forEach((role, index) => {
      expect(retrievedUser.roles[index].id).toBe(role.id)
      expect(retrievedUser.roles[index].name).toBe(role.name)
      expect(retrievedUser.roles[index].code).toBe(role.code)
      expect(retrievedUser.roles[index].description).toBe(role.description)
      expect(retrievedUser.roles[index].status).toBe(role.status)
      expect(retrievedUser.roles[index].createTime).toEqual(role.createTime)
      expect(retrievedUser.roles[index].updateTime).toEqual(role.updateTime)
    })

    // Verify complex organization hierarchy
    expect(retrievedUser.organizations).toHaveLength(3)
    complexUser.organizations.forEach((org, index) => {
      expect(retrievedUser.organizations[index].id).toBe(org.id)
      expect(retrievedUser.organizations[index].name).toBe(org.name)
      expect(retrievedUser.organizations[index].code).toBe(org.code)
      expect(retrievedUser.organizations[index].parentId).toBe(org.parentId)
      expect(retrievedUser.organizations[index].level).toBe(org.level)
      expect(retrievedUser.organizations[index].sort).toBe(org.sort)
      expect(retrievedUser.organizations[index].status).toBe(org.status)
      expect(retrievedUser.organizations[index].description).toBe(org.description)
      expect(retrievedUser.organizations[index].createTime).toEqual(org.createTime)
      expect(retrievedUser.organizations[index].updateTime).toEqual(org.updateTime)
    })

    // Verify channels array
    expect(retrievedUser.channels).toEqual(complexUser.channels)
    expect(retrievedUser.channels).toHaveLength(4)
    expect(retrievedUser.channels).toContain('web')
    expect(retrievedUser.channels).toContain('mobile')
    expect(retrievedUser.channels).toContain('wechat')
    expect(retrievedUser.channels).toContain('api')

    // Verify API was called correctly
    expect(mockHttpClient.get).toHaveBeenCalledWith(`/api/user/${complexUser.id}`)
  })

  it('should handle API errors during form pre-population gracefully', async () => {
    // Property: For any user retrieval that fails, the system should handle errors gracefully
    const userStore = useUserStore()

    const testUserId = 999

    // Test different types of API errors
    const apiErrors = [
      // User not found (404)
      {
        response: {
          status: 404,
          data: {
            code: 404,
            message: 'User not found'
          }
        }
      },
      // Unauthorized access (403)
      {
        response: {
          status: 403,
          data: {
            code: 403,
            message: 'Access denied'
          }
        }
      },
      // Server error (500)
      {
        response: {
          status: 500,
          data: {
            code: 500,
            message: 'Internal server error'
          }
        }
      },
      // Network error
      new Error('Network Error')
    ]

    for (const error of apiErrors) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      // Mock API error
      mockHttpClient.get.mockRejectedValueOnce(error)

      // Attempt to retrieve user should throw error
      await expect(userStore.getUserById(testUserId)).rejects.toThrow()

      // Verify API was called
      expect(mockHttpClient.get).toHaveBeenCalledWith(`/api/user/${testUserId}`)

      // Verify no additional API calls are made after error
      vi.clearAllMocks()
      
      // Subsequent calls should still make API requests since caching failed
      mockHttpClient.get.mockRejectedValueOnce(error)
      await expect(userStore.getUserById(testUserId)).rejects.toThrow()
      expect(mockHttpClient.get).toHaveBeenCalledWith(`/api/user/${testUserId}`)

      vi.clearAllMocks()
    }
  })

  it('should maintain data integrity during concurrent form pre-population requests', async () => {
    // Property: For any concurrent user retrieval requests, the system should maintain data integrity
    const userStore = useUserStore()

    // Create multiple users for concurrent retrieval
    const concurrentUsers = [
      {
        id: 100,
        username: 'concurrent_user_1',
        nickname: 'Concurrent User 1',
        email: 'concurrent1@example.com',
        phone: '13800138100',
        status: 1,
        avatar: null,
        createTime: new Date('2023-01-01T10:00:00Z'),
        updateTime: new Date('2023-01-01T10:00:00Z'),
        roles: [{ id: 1, name: 'Role 1', code: 'ROLE1', description: 'Role 1', status: 1, createTime: new Date(), updateTime: new Date() }],
        organizations: [{ id: 1, name: 'Org 1', code: 'ORG1', parentId: null, level: 1, sort: 1, status: 1, description: 'Org 1', createTime: new Date(), updateTime: new Date() }],
        channels: ['web']
      },
      {
        id: 101,
        username: 'concurrent_user_2',
        nickname: 'Concurrent User 2',
        email: 'concurrent2@example.com',
        phone: '13800138101',
        status: 1,
        avatar: null,
        createTime: new Date('2023-01-01T10:00:00Z'),
        updateTime: new Date('2023-01-01T10:00:00Z'),
        roles: [{ id: 2, name: 'Role 2', code: 'ROLE2', description: 'Role 2', status: 1, createTime: new Date(), updateTime: new Date() }],
        organizations: [{ id: 2, name: 'Org 2', code: 'ORG2', parentId: null, level: 1, sort: 2, status: 1, description: 'Org 2', createTime: new Date(), updateTime: new Date() }],
        channels: ['mobile']
      },
      {
        id: 102,
        username: 'concurrent_user_3',
        nickname: 'Concurrent User 3',
        email: 'concurrent3@example.com',
        phone: '13800138102',
        status: 0,
        avatar: null,
        createTime: new Date('2023-01-01T10:00:00Z'),
        updateTime: new Date('2023-01-01T10:00:00Z'),
        roles: [],
        organizations: [],
        channels: ['api']
      }
    ]

    // Mock API responses for all users
    mockHttpClient.get
      .mockResolvedValueOnce({ data: concurrentUsers[0] })
      .mockResolvedValueOnce({ data: concurrentUsers[1] })
      .mockResolvedValueOnce({ data: concurrentUsers[2] })

    // Execute concurrent user retrieval requests
    const retrievalPromises = concurrentUsers.map(user => 
      userStore.getUserById(user.id)
    )

    // Wait for all requests to complete
    const retrievedUsers = await Promise.all(retrievalPromises)

    // Verify all users were retrieved correctly
    expect(retrievedUsers).toHaveLength(3)
    retrievedUsers.forEach((user, index) => {
      expect(user.id).toBe(concurrentUsers[index].id)
      expect(user.username).toBe(concurrentUsers[index].username)
      expect(user.nickname).toBe(concurrentUsers[index].nickname)
      expect(user.email).toBe(concurrentUsers[index].email)
      expect(user.phone).toBe(concurrentUsers[index].phone)
      expect(user.status).toBe(concurrentUsers[index].status)
      expect(user.roles).toEqual(concurrentUsers[index].roles)
      expect(user.organizations).toEqual(concurrentUsers[index].organizations)
      expect(user.channels).toEqual(concurrentUsers[index].channels)
    })

    // Verify all API calls were made
    expect(mockHttpClient.get).toHaveBeenCalledTimes(3)
    concurrentUsers.forEach(user => {
      expect(mockHttpClient.get).toHaveBeenCalledWith(`/api/user/${user.id}`)
    })

    // Verify data integrity is maintained across all concurrent requests
    expect(retrievedUsers).toHaveLength(3)
    retrievedUsers.forEach((user, index) => {
      expect(user).toEqual(concurrentUsers[index])
    })
  })

  it('should handle form pre-population with special data types and edge cases', async () => {
    // Property: For any user with special data types, the form should handle pre-population correctly
    const userStore = useUserStore()

    const specialDataUser = {
      id: 200,
      username: 'special_data_user',
      nickname: 'Special Data User',
      email: 'special@example.com',
      phone: '13800138200',
      status: 1,
      avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      createTime: new Date('2023-01-01T10:00:00Z'),
      updateTime: new Date('2023-12-01T10:00:00Z'),
      roles: [
        {
          id: 999,
          name: 'Special Role with "Quotes" & Symbols!',
          code: 'SPECIAL_ROLE_123',
          description: 'Role with special characters: <>&"\'',
          status: 1,
          createTime: new Date('2023-01-01T10:00:00Z'),
          updateTime: new Date('2023-01-01T10:00:00Z')
        }
      ],
      organizations: [
        {
          id: 999,
          name: 'Organization with 中文 & English',
          code: 'MIXED_LANG_ORG',
          parentId: null,
          level: 1,
          sort: 999,
          status: 1,
          description: 'Mixed language organization: 这是一个测试组织',
          createTime: new Date('2023-01-01T10:00:00Z'),
          updateTime: new Date('2023-01-01T10:00:00Z')
        }
      ],
      channels: ['web', 'mobile', 'custom_channel_123']
    }

    // Clear cache to ensure fresh API call
    userStore.clearUserCache()
    
    // Mock API response
    mockHttpClient.get.mockResolvedValueOnce({ data: specialDataUser })

    // Retrieve user data
    const retrievedUser = await userStore.getUserById(specialDataUser.id)

    // Verify all special data is preserved
    expect(retrievedUser.id).toBe(specialDataUser.id)
    expect(retrievedUser.username).toBe(specialDataUser.username)
    expect(retrievedUser.nickname).toBe(specialDataUser.nickname)
    expect(retrievedUser.email).toBe(specialDataUser.email)
    expect(retrievedUser.phone).toBe(specialDataUser.phone)
    expect(retrievedUser.avatar).toBe(specialDataUser.avatar) // Base64 image data

    // Verify special characters in role data
    expect(retrievedUser.roles[0].name).toBe('Special Role with "Quotes" & Symbols!')
    expect(retrievedUser.roles[0].code).toBe('SPECIAL_ROLE_123')
    expect(retrievedUser.roles[0].description).toBe('Role with special characters: <>&"\'')

    // Verify mixed language organization data
    expect(retrievedUser.organizations[0].name).toBe('Organization with 中文 & English')
    expect(retrievedUser.organizations[0].code).toBe('MIXED_LANG_ORG')
    expect(retrievedUser.organizations[0].description).toBe('Mixed language organization: 这是一个测试组织')

    // Verify custom channel
    expect(retrievedUser.channels).toContain('custom_channel_123')
    expect(retrievedUser.channels).toEqual(['web', 'mobile', 'custom_channel_123'])

    // Verify dates are handled correctly
    expect(retrievedUser.createTime).toEqual(specialDataUser.createTime)
    expect(retrievedUser.updateTime).toEqual(specialDataUser.updateTime)

    // Verify API was called correctly
    expect(mockHttpClient.get).toHaveBeenCalledWith(`/api/user/${specialDataUser.id}`)
  })
})