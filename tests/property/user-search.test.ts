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
 * Property 13: User Search and Filtering
 * For any search term or filter criteria, the system should return matching users
 * Validates: Requirements 3.5
 * 
 * Feature: bing-admin-frontend-rewrite, Property 13: User Search and Filtering
 */
describe('Property 13: User Search and Filtering', () => {
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

  it('should return matching users for any username search term', async () => {
    // Property: For any username search term, the system should return matching users
    const userStore = useUserStore()

    const searchTerms = [
      'admin',
      'user',
      'test',
      'john',
      'manager',
      'dev',
      'support',
      'guest'
    ]

    for (const searchTerm of searchTerms) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      // Generate mock users that match the search term
      const matchingUsers = Array.from({ length: 3 }, (_, index) => ({
        id: index + 1,
        username: `${searchTerm}_${index + 1}`,
        nickname: `${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)} User ${index + 1}`,
        email: `${searchTerm}${index + 1}@example.com`,
        phone: `1234567890${index}`,
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: [],
        channels: []
      }))

      const mockResponse = {
        records: matchingUsers,
        total: matchingUsers.length,
        current: 1,
        size: 20,
        pages: 1
      }

      mockHttpClient.get.mockResolvedValueOnce({ data: mockResponse })

      // Search by username
      await userStore.searchUsers({ username: searchTerm })

      // Verify search results
      expect(userStore.users).toHaveLength(matchingUsers.length)
      expect(userStore.total).toBe(matchingUsers.length)
      expect(userStore.searchParams).toEqual({ username: searchTerm })

      // Verify all returned users match the search criteria
      userStore.users.forEach((user: any) => {
        expect(user.username.toLowerCase()).toContain(searchTerm.toLowerCase())
      })

      // Verify API was called with correct search parameters
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/user/list', {
        params: { username: searchTerm, page: 1, size: 20 }
      })

      vi.clearAllMocks()
    }
  })

  it('should return matching users for any email search term', async () => {
    // Property: For any email search term, the system should return matching users
    const userStore = useUserStore()

    const emailSearchTerms = [
      'admin@example.com',
      'test@company.com',
      'user@domain.org',
      'support@help.net',
      'manager@business.co',
      'dev@tech.io'
    ]

    for (const emailTerm of emailSearchTerms) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      // Generate mock users that match the email search
      const matchingUsers = Array.from({ length: 2 }, (_, index) => ({
        id: index + 1,
        username: `user_${index + 1}`,
        nickname: `User ${index + 1}`,
        email: index === 0 ? emailTerm : `alt_${emailTerm}`,
        phone: `1234567890${index}`,
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: [],
        channels: []
      }))

      const mockResponse = {
        records: matchingUsers,
        total: matchingUsers.length,
        current: 1,
        size: 20,
        pages: 1
      }

      mockHttpClient.get.mockResolvedValueOnce({ data: mockResponse })

      // Search by email
      await userStore.searchUsers({ email: emailTerm })

      // Verify search results
      expect(userStore.users).toHaveLength(matchingUsers.length)
      expect(userStore.total).toBe(matchingUsers.length)
      expect(userStore.searchParams).toEqual({ email: emailTerm })

      // Verify all returned users match the email search criteria
      userStore.users.forEach((user: any) => {
        expect(user.email.toLowerCase()).toContain(emailTerm.toLowerCase())
      })

      // Verify API was called with correct search parameters
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/user/list', {
        params: { email: emailTerm, page: 1, size: 20 }
      })

      vi.clearAllMocks()
    }
  })

  it('should return matching users for any status filter', async () => {
    // Property: For any status filter, the system should return users with matching status
    const userStore = useUserStore()

    const statusFilters = [0, 1] // 0 = inactive, 1 = active

    for (const status of statusFilters) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      // Generate mock users with the specified status
      const matchingUsers = Array.from({ length: 5 }, (_, index) => ({
        id: index + 1,
        username: `user_${status}_${index + 1}`,
        nickname: `${status === 1 ? 'Active' : 'Inactive'} User ${index + 1}`,
        email: `user${index + 1}@example.com`,
        phone: `1234567890${index}`,
        status: status,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: [],
        channels: []
      }))

      const mockResponse = {
        records: matchingUsers,
        total: matchingUsers.length,
        current: 1,
        size: 20,
        pages: 1
      }

      mockHttpClient.get.mockResolvedValueOnce({ data: mockResponse })

      // Filter by status
      await userStore.searchUsers({ status })

      // Verify filter results
      expect(userStore.users).toHaveLength(matchingUsers.length)
      expect(userStore.total).toBe(matchingUsers.length)
      expect(userStore.searchParams).toEqual({ status })

      // Verify all returned users have the correct status
      userStore.users.forEach((user: any) => {
        expect(user.status).toBe(status)
      })

      // Verify API was called with correct filter parameters
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/user/list', {
        params: { status, page: 1, size: 20 }
      })

      vi.clearAllMocks()
    }
  })

  it('should return matching users for any phone search term', async () => {
    // Property: For any phone search term, the system should return matching users
    const userStore = useUserStore()

    const phoneSearchTerms = [
      '123456',
      '987654',
      '555-0123',
      '+1-234-567',
      '13800138000',
      '18612345678'
    ]

    for (const phoneTerm of phoneSearchTerms) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      // Generate mock users that match the phone search
      const matchingUsers = Array.from({ length: 2 }, (_, index) => ({
        id: index + 1,
        username: `user_${index + 1}`,
        nickname: `User ${index + 1}`,
        email: `user${index + 1}@example.com`,
        phone: index === 0 ? phoneTerm : `${phoneTerm}${index}`,
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: [],
        channels: []
      }))

      const mockResponse = {
        records: matchingUsers,
        total: matchingUsers.length,
        current: 1,
        size: 20,
        pages: 1
      }

      mockHttpClient.get.mockResolvedValueOnce({ data: mockResponse })

      // Search by phone
      await userStore.searchUsers({ phone: phoneTerm })

      // Verify search results
      expect(userStore.users).toHaveLength(matchingUsers.length)
      expect(userStore.total).toBe(matchingUsers.length)
      expect(userStore.searchParams).toEqual({ phone: phoneTerm })

      // Verify all returned users match the phone search criteria
      userStore.users.forEach((user: any) => {
        expect(user.phone).toContain(phoneTerm)
      })

      // Verify API was called with correct search parameters
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/user/list', {
        params: { phone: phoneTerm, page: 1, size: 20 }
      })

      vi.clearAllMocks()
    }
  })

  it('should return matching users for any role filter', async () => {
    // Property: For any role filter, the system should return users with matching roles
    const userStore = useUserStore()

    const roleIds = [1, 2, 3, 4, 5]

    for (const roleId of roleIds) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      // Generate mock users with the specified role
      const matchingUsers = Array.from({ length: 3 }, (_, index) => ({
        id: index + 1,
        username: `role_user_${index + 1}`,
        nickname: `Role User ${index + 1}`,
        email: `roleuser${index + 1}@example.com`,
        phone: `1234567890${index}`,
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [{
          id: roleId,
          name: `Role ${roleId}`,
          code: `ROLE_${roleId}`,
          description: `Role ${roleId} Description`,
          status: 1,
          createTime: new Date(),
          updateTime: new Date()
        }],
        organizations: [],
        channels: []
      }))

      const mockResponse = {
        records: matchingUsers,
        total: matchingUsers.length,
        current: 1,
        size: 20,
        pages: 1
      }

      mockHttpClient.get.mockResolvedValueOnce({ data: mockResponse })

      // Filter by role
      await userStore.searchUsers({ roleId })

      // Verify filter results
      expect(userStore.users).toHaveLength(matchingUsers.length)
      expect(userStore.total).toBe(matchingUsers.length)
      expect(userStore.searchParams).toEqual({ roleId })

      // Verify all returned users have the correct role
      userStore.users.forEach((user: any) => {
        expect(user.roles.some((role: any) => role.id === roleId)).toBe(true)
      })

      // Verify API was called with correct filter parameters
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/user/list', {
        params: { roleId, page: 1, size: 20 }
      })

      vi.clearAllMocks()
    }
  })

  it('should return matching users for any organization filter', async () => {
    // Property: For any organization filter, the system should return users from matching organizations
    const userStore = useUserStore()

    const organizationIds = [1, 2, 3, 4, 5]

    for (const organizationId of organizationIds) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      // Generate mock users with the specified organization
      const matchingUsers = Array.from({ length: 4 }, (_, index) => ({
        id: index + 1,
        username: `org_user_${index + 1}`,
        nickname: `Org User ${index + 1}`,
        email: `orguser${index + 1}@example.com`,
        phone: `1234567890${index}`,
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: [{
          id: organizationId,
          name: `Organization ${organizationId}`,
          code: `ORG_${organizationId}`,
          parentId: null,
          level: 1,
          sort: organizationId,
          status: 1,
          description: `Organization ${organizationId} Description`,
          createTime: new Date(),
          updateTime: new Date()
        }],
        channels: []
      }))

      const mockResponse = {
        records: matchingUsers,
        total: matchingUsers.length,
        current: 1,
        size: 20,
        pages: 1
      }

      mockHttpClient.get.mockResolvedValueOnce({ data: mockResponse })

      // Filter by organization
      await userStore.searchUsers({ organizationId })

      // Verify filter results
      expect(userStore.users).toHaveLength(matchingUsers.length)
      expect(userStore.total).toBe(matchingUsers.length)
      expect(userStore.searchParams).toEqual({ organizationId })

      // Verify all returned users belong to the correct organization
      userStore.users.forEach((user: any) => {
        expect(user.organizations.some((org: any) => org.id === organizationId)).toBe(true)
      })

      // Verify API was called with correct filter parameters
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/user/list', {
        params: { organizationId, page: 1, size: 20 }
      })

      vi.clearAllMocks()
    }
  })

  it('should return matching users for any combination of search criteria', async () => {
    // Property: For any combination of search criteria, the system should return users matching all criteria
    const userStore = useUserStore()

    const combinedSearchCriteria = [
      { username: 'admin', status: 1 },
      { email: 'test@example.com', roleId: 2 },
      { phone: '123456', organizationId: 1 },
      { username: 'manager', status: 1, roleId: 3 },
      { nickname: 'John', email: 'john@company.com', status: 1 },
      { username: 'dev', roleId: 4, organizationId: 2, status: 1 }
    ]

    for (const criteria of combinedSearchCriteria) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      // Generate mock users that match all the criteria
      const matchingUsers = Array.from({ length: 2 }, (_, index) => {
        const user: any = {
          id: index + 1,
          username: criteria.username ? `${criteria.username}_${index + 1}` : `user_${index + 1}`,
          nickname: criteria.nickname ? `${criteria.nickname} ${index + 1}` : `User ${index + 1}`,
          email: criteria.email ? (index === 0 ? criteria.email : `alt_${criteria.email}`) : `user${index + 1}@example.com`,
          phone: criteria.phone ? `${criteria.phone}${index}` : `1234567890${index}`,
          status: criteria.status !== undefined ? criteria.status : 1,
          createTime: new Date(),
          updateTime: new Date(),
          roles: [],
          organizations: [],
          channels: []
        }

        // Add role if specified
        if (criteria.roleId) {
          user.roles = [{
            id: criteria.roleId,
            name: `Role ${criteria.roleId}`,
            code: `ROLE_${criteria.roleId}`,
            description: `Role ${criteria.roleId} Description`,
            status: 1,
            createTime: new Date(),
            updateTime: new Date()
          }]
        }

        // Add organization if specified
        if (criteria.organizationId) {
          user.organizations = [{
            id: criteria.organizationId,
            name: `Organization ${criteria.organizationId}`,
            code: `ORG_${criteria.organizationId}`,
            parentId: null,
            level: 1,
            sort: criteria.organizationId,
            status: 1,
            description: `Organization ${criteria.organizationId} Description`,
            createTime: new Date(),
            updateTime: new Date()
          }]
        }

        return user
      })

      const mockResponse = {
        records: matchingUsers,
        total: matchingUsers.length,
        current: 1,
        size: 20,
        pages: 1
      }

      mockHttpClient.get.mockResolvedValueOnce({ data: mockResponse })

      // Search with combined criteria
      await userStore.searchUsers(criteria)

      // Verify search results
      expect(userStore.users).toHaveLength(matchingUsers.length)
      expect(userStore.total).toBe(matchingUsers.length)
      expect(userStore.searchParams).toEqual(criteria)

      // Verify all returned users match all the search criteria
      userStore.users.forEach((user: any) => {
        if (criteria.username) {
          expect(user.username.toLowerCase()).toContain(criteria.username.toLowerCase())
        }
        if (criteria.nickname) {
          expect(user.nickname.toLowerCase()).toContain(criteria.nickname.toLowerCase())
        }
        if (criteria.email) {
          expect(user.email.toLowerCase()).toContain(criteria.email.toLowerCase())
        }
        if (criteria.phone) {
          expect(user.phone).toContain(criteria.phone)
        }
        if (criteria.status !== undefined) {
          expect(user.status).toBe(criteria.status)
        }
        if (criteria.roleId) {
          expect(user.roles.some((role: any) => role.id === criteria.roleId)).toBe(true)
        }
        if (criteria.organizationId) {
          expect(user.organizations.some((org: any) => org.id === criteria.organizationId)).toBe(true)
        }
      })

      // Verify API was called with correct combined parameters
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/user/list', {
        params: { ...criteria, page: 1, size: 20 }
      })

      vi.clearAllMocks()
    }
  })

  it('should handle empty search results for any search criteria', async () => {
    // Property: For any search criteria that matches no users, the system should return empty results gracefully
    const userStore = useUserStore()

    const noMatchCriteria = [
      { username: 'nonexistent_user' },
      { email: 'notfound@nowhere.com' },
      { phone: '999999999999' },
      { status: 99 }, // Invalid status
      { roleId: 999 }, // Non-existent role
      { organizationId: 999 }, // Non-existent organization
      { username: 'ghost', status: 0, roleId: 999 }
    ]

    for (const criteria of noMatchCriteria) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      const emptyResponse = {
        records: [],
        total: 0,
        current: 1,
        size: 20,
        pages: 0
      }

      mockHttpClient.get.mockResolvedValueOnce({ data: emptyResponse })

      // Search with criteria that should return no results
      await userStore.searchUsers(criteria)

      // Verify empty results are handled correctly
      expect(userStore.users).toHaveLength(0)
      expect(userStore.total).toBe(0)
      expect(userStore.searchParams).toEqual(criteria)
      expect(userStore.currentPage).toBe(1)

      // Verify API was called with the search criteria
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/user/list', {
        params: { ...criteria, page: 1, size: 20 }
      })

      vi.clearAllMocks()
    }
  })

  it('should preserve search criteria across pagination for any search terms', async () => {
    // Property: For any search terms, pagination should preserve the search criteria
    const userStore = useUserStore()

    const searchCriteria = [
      { username: 'test' },
      { status: 1 },
      { email: 'admin@example.com' },
      { username: 'manager', roleId: 2 }
    ]

    for (const criteria of searchCriteria) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      // Mock first page response
      const firstPageUsers = Array.from({ length: 20 }, (_, index) => ({
        id: index + 1,
        username: `search_user_${index + 1}`,
        nickname: `Search User ${index + 1}`,
        email: `searchuser${index + 1}@example.com`,
        phone: `1234567890${index}`,
        status: criteria.status !== undefined ? criteria.status : 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: criteria.roleId ? [{
          id: criteria.roleId,
          name: `Role ${criteria.roleId}`,
          code: `ROLE_${criteria.roleId}`,
          description: `Role ${criteria.roleId} Description`,
          status: 1,
          createTime: new Date(),
          updateTime: new Date()
        }] : [],
        organizations: [],
        channels: []
      }))

      const firstPageResponse = {
        records: firstPageUsers,
        total: 50,
        current: 1,
        size: 20,
        pages: 3
      }

      mockHttpClient.get.mockResolvedValueOnce({ data: firstPageResponse })

      // Perform initial search
      await userStore.searchUsers(criteria)

      // Verify initial search state
      expect(userStore.searchParams).toEqual(criteria)
      expect(userStore.currentPage).toBe(1)

      // Clear cache for next page request
      userStore.clearUserCache()

      // Mock second page response
      const secondPageUsers = Array.from({ length: 20 }, (_, index) => ({
        id: index + 21,
        username: `search_user_${index + 21}`,
        nickname: `Search User ${index + 21}`,
        email: `searchuser${index + 21}@example.com`,
        phone: `1234567890${index + 20}`,
        status: criteria.status !== undefined ? criteria.status : 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: criteria.roleId ? [{
          id: criteria.roleId,
          name: `Role ${criteria.roleId}`,
          code: `ROLE_${criteria.roleId}`,
          description: `Role ${criteria.roleId} Description`,
          status: 1,
          createTime: new Date(),
          updateTime: new Date()
        }] : [],
        organizations: [],
        channels: []
      }))

      const secondPageResponse = {
        records: secondPageUsers,
        total: 50,
        current: 2,
        size: 20,
        pages: 3
      }

      mockHttpClient.get.mockResolvedValueOnce({ data: secondPageResponse })

      // Navigate to second page
      await userStore.changePage(2)

      // Verify search criteria are preserved during pagination
      expect(userStore.searchParams).toEqual(criteria)
      expect(userStore.currentPage).toBe(2)
      expect(userStore.users).toHaveLength(20)

      // Verify API was called with preserved search criteria
      expect(mockHttpClient.get).toHaveBeenLastCalledWith('/api/user/list', {
        params: { ...criteria, page: 2, size: 20 }
      })

      vi.clearAllMocks()
    }
  })

  it('should handle special characters and edge cases in search terms', async () => {
    // Property: For any search terms including special characters, the system should handle them correctly
    const userStore = useUserStore()

    const specialSearchTerms = [
      { username: 'user@domain' }, // @ symbol
      { username: 'user-name' }, // hyphen
      { username: 'user_name' }, // underscore
      { username: 'user.name' }, // dot
      { username: 'user name' }, // space
      { username: 'user123' }, // numbers
      { username: 'User' }, // uppercase
      { username: 'üser' }, // unicode
      { email: 'test+tag@example.com' }, // plus in email
      { phone: '+1-234-567-8900' }, // formatted phone
      { nickname: "O'Connor" }, // apostrophe
      { username: '' }, // empty string
      { username: '   ' } // whitespace only
    ]

    for (const searchTerm of specialSearchTerms) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      // Generate appropriate mock response based on search term
      const shouldReturnResults = Object.values(searchTerm)[0].trim().length > 0
      const mockUsers = shouldReturnResults ? Array.from({ length: 1 }, (_, index) => ({
        id: index + 1,
        username: searchTerm.username ? `match_${searchTerm.username}_${index + 1}` : `user_${index + 1}`,
        nickname: searchTerm.nickname ? `${searchTerm.nickname} ${index + 1}` : `User ${index + 1}`,
        email: searchTerm.email ? searchTerm.email : `user${index + 1}@example.com`,
        phone: searchTerm.phone ? searchTerm.phone : `1234567890${index}`,
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: [],
        channels: []
      })) : []

      const mockResponse = {
        records: mockUsers,
        total: mockUsers.length,
        current: 1,
        size: 20,
        pages: mockUsers.length > 0 ? 1 : 0
      }

      mockHttpClient.get.mockResolvedValueOnce({ data: mockResponse })

      // Search with special characters
      await userStore.searchUsers(searchTerm)

      // Verify search results
      expect(userStore.users).toHaveLength(mockUsers.length)
      expect(userStore.total).toBe(mockUsers.length)
      expect(userStore.searchParams).toEqual(searchTerm)

      // Verify API was called with the special search term
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/user/list', {
        params: { ...searchTerm, page: 1, size: 20 }
      })

      vi.clearAllMocks()
    }
  })

  it('should maintain search performance for any result set size', async () => {
    // Property: For any result set size, search performance should remain consistent
    const userStore = useUserStore()

    const resultSetSizes = [0, 1, 10, 50, 100, 500, 1000]

    for (const resultSize of resultSetSizes) {
      // Clear cache to ensure fresh API call
      userStore.clearUserCache()
      
      const pageSize = 20
      const totalPages = Math.ceil(resultSize / pageSize)
      const usersOnFirstPage = Math.min(pageSize, resultSize)

      // Generate mock users for the first page
      const mockUsers = Array.from({ length: usersOnFirstPage }, (_, index) => ({
        id: index + 1,
        username: `perf_user_${index + 1}`,
        nickname: `Performance User ${index + 1}`,
        email: `perfuser${index + 1}@example.com`,
        phone: `1234567890${index}`,
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: [],
        channels: []
      }))

      const mockResponse = {
        records: mockUsers,
        total: resultSize,
        current: 1,
        size: pageSize,
        pages: totalPages
      }

      const startTime = Date.now()
      mockHttpClient.get.mockResolvedValueOnce({ data: mockResponse })

      // Perform search
      await userStore.searchUsers({ username: 'perf' })
      
      const endTime = Date.now()
      const searchTime = endTime - startTime

      // Verify search completed successfully regardless of result size
      expect(userStore.users).toHaveLength(usersOnFirstPage)
      expect(userStore.total).toBe(resultSize)
      expect(userStore.searchParams).toEqual({ username: 'perf' })

      // Verify search completed in reasonable time (should be very fast with mocked API)
      expect(searchTime).toBeLessThan(100) // 100ms threshold for mocked operations

      // Verify API was called correctly
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/user/list', {
        params: { username: 'perf', page: 1, size: 20 }
      })

      vi.clearAllMocks()
    }
  })
})