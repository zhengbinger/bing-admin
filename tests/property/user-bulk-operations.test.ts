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
 * Property 15: User Bulk Operations
 * For any selected group of users, the system should support bulk operations
 * Validates: Requirements 3.7
 * 
 * Feature: bing-admin-frontend-rewrite, Property 15: User Bulk Operations
 */
describe('Property 15: User Bulk Operations', () => {
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

  it('should support bulk delete operations for any selected group of users', async () => {
    // Property: For any selected group of users, the system should support bulk delete operations
    const userStore = useUserStore()

    // Test with different group sizes
    const groupSizes = [1, 2, 5, 10, 25, 50]

    for (const groupSize of groupSizes) {
      // Clear cache and selection
      userStore.clearUserCache()
      userStore.clearSelection()
      
      // Generate mock users
      const mockUsers = Array.from({ length: groupSize + 10 }, (_, index) => ({
        id: index + 1,
        username: `bulk_user_${index + 1}`,
        nickname: `Bulk User ${index + 1}`,
        email: `bulk_user${index + 1}@example.com`,
        phone: `1234567890${index}`,
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: [],
        channels: []
      }))

      // Set up initial user list
      userStore.users.splice(0, userStore.users.length, ...mockUsers)
      userStore.total = mockUsers.length

      // Select a group of users for bulk operation
      const selectedUsers = mockUsers.slice(0, groupSize)
      selectedUsers.forEach(user => userStore.selectUser(user))

      // Verify selection state
      expect(userStore.selectedUsers).toHaveLength(groupSize)
      expect(userStore.selectedUserIds).toHaveLength(groupSize)
      expect(userStore.hasSelectedUsers).toBe(true)
      expect(userStore.selectedUserCount).toBe(groupSize)

      // Mock successful bulk delete API response
      mockHttpClient.post.mockResolvedValueOnce({ data: {} })

      // Perform bulk delete operation
      await userStore.batchDeleteUsers()

      // Verify API was called with correct user IDs
      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/user/batch-delete', {
        userIds: selectedUsers.map(u => u.id)
      })

      // Verify users were removed from the list
      expect(userStore.users).toHaveLength(mockUsers.length - groupSize)
      expect(userStore.total).toBe(mockUsers.length - groupSize)

      // Verify selection was cleared
      expect(userStore.selectedUsers).toHaveLength(0)
      expect(userStore.selectedUserIds).toHaveLength(0)
      expect(userStore.hasSelectedUsers).toBe(false)

      // Verify deleted users are no longer in the list
      selectedUsers.forEach(deletedUser => {
        expect(userStore.users.find(u => u.id === deletedUser.id)).toBeUndefined()
      })

      vi.clearAllMocks()
    }
  })

  it('should support bulk status update operations for any selected group of users', async () => {
    // Property: For any selected group of users, the system should support bulk status update operations
    const userStore = useUserStore()

    const statusValues = [0, 1] // 0 = disabled, 1 = enabled
    const groupSizes = [1, 3, 7, 15]

    for (const status of statusValues) {
      for (const groupSize of groupSizes) {
        // Clear cache and selection
        userStore.clearUserCache()
        userStore.clearSelection()
        
        // Generate mock users with opposite status
        const initialStatus = status === 1 ? 0 : 1
        const mockUsers = Array.from({ length: groupSize + 5 }, (_, index) => ({
          id: index + 1,
          username: `status_user_${index + 1}`,
          nickname: `Status User ${index + 1}`,
          email: `status_user${index + 1}@example.com`,
          phone: `1234567890${index}`,
          status: initialStatus,
          createTime: new Date(),
          updateTime: new Date(),
          roles: [],
          organizations: [],
          channels: []
        }))

        // Set up initial user list
        userStore.users.splice(0, userStore.users.length, ...mockUsers)
        userStore.total = mockUsers.length

        // Select a group of users for bulk operation
        const selectedUsers = mockUsers.slice(0, groupSize)
        selectedUsers.forEach(user => userStore.selectUser(user))

        // Verify selection state
        expect(userStore.selectedUsers).toHaveLength(groupSize)
        expect(userStore.selectedUserIds).toHaveLength(groupSize)

        // Mock successful bulk status update API response
        mockHttpClient.post.mockResolvedValueOnce({ data: {} })

        // Perform bulk status update operation
        await userStore.batchUpdateUserStatus(status)

        // Verify API was called with correct parameters
        const expectedOperation = status === 1 ? 'enable' : 'disable'
        expect(mockHttpClient.post).toHaveBeenCalledWith('/api/user/batch-operation', {
          userIds: selectedUsers.map(u => u.id),
          operation: expectedOperation
        })

        // Verify user statuses were updated in the list
        selectedUsers.forEach(selectedUser => {
          const updatedUser = userStore.users.find(u => u.id === selectedUser.id)
          expect(updatedUser).toBeDefined()
          expect(updatedUser!.status).toBe(status)
        })

        // Verify non-selected users were not affected
        const nonSelectedUsers = mockUsers.slice(groupSize)
        nonSelectedUsers.forEach(nonSelectedUser => {
          const unchangedUser = userStore.users.find(u => u.id === nonSelectedUser.id)
          expect(unchangedUser).toBeDefined()
          expect(unchangedUser!.status).toBe(initialStatus)
        })

        vi.clearAllMocks()
      }
    }
  })

  it('should handle bulk operations with specific user ID arrays', async () => {
    // Property: For any specific array of user IDs, the system should support bulk operations
    const userStore = useUserStore()

    const testCases = [
      { userIds: [1], description: 'single user ID' },
      { userIds: [1, 3, 5], description: 'multiple non-consecutive IDs' },
      { userIds: [10, 11, 12, 13], description: 'consecutive IDs' },
      { userIds: [100, 50, 25, 75], description: 'random order IDs' },
      { userIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], description: 'large ID array' }
    ]

    for (const testCase of testCases) {
      // Clear cache and selection
      userStore.clearUserCache()
      userStore.clearSelection()
      
      // Generate mock users that include all the test IDs
      const maxId = Math.max(...testCase.userIds)
      const mockUsers = Array.from({ length: maxId + 5 }, (_, index) => ({
        id: index + 1,
        username: `specific_user_${index + 1}`,
        nickname: `Specific User ${index + 1}`,
        email: `specific_user${index + 1}@example.com`,
        phone: `1234567890${index}`,
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: [],
        channels: []
      }))

      // Set up initial user list
      userStore.users.splice(0, userStore.users.length, ...mockUsers)
      userStore.total = mockUsers.length

      // Mock successful bulk delete API response
      mockHttpClient.post.mockResolvedValueOnce({ data: {} })

      // Perform bulk delete with specific user IDs
      await userStore.batchDeleteUsers(testCase.userIds)

      // Verify API was called with the specific user IDs
      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/user/batch-delete', {
        userIds: testCase.userIds
      })

      // Verify specified users were removed from the list
      testCase.userIds.forEach(userId => {
        expect(userStore.users.find(u => u.id === userId)).toBeUndefined()
      })

      // Verify total count was updated correctly
      expect(userStore.total).toBe(mockUsers.length - testCase.userIds.length)

      // Verify remaining users are still in the list
      const remainingUserIds = mockUsers
        .filter(u => !testCase.userIds.includes(u.id))
        .map(u => u.id)
      
      remainingUserIds.forEach(userId => {
        expect(userStore.users.find(u => u.id === userId)).toBeDefined()
      })

      vi.clearAllMocks()
    }
  })

  it('should handle empty selection gracefully for any bulk operation', async () => {
    // Property: For any bulk operation with empty selection, the system should handle it gracefully
    const userStore = useUserStore()

    // Clear selection to ensure empty state
    userStore.clearSelection()

    // Verify empty selection state
    expect(userStore.selectedUsers).toHaveLength(0)
    expect(userStore.selectedUserIds).toHaveLength(0)
    expect(userStore.hasSelectedUsers).toBe(false)

    // Test bulk delete with empty selection
    await userStore.batchDeleteUsers()

    // Verify no API call was made for empty selection
    expect(mockHttpClient.post).not.toHaveBeenCalled()

    // Test bulk status update with empty selection
    await userStore.batchUpdateUserStatus(1)

    // Verify no API call was made for empty selection
    expect(mockHttpClient.post).not.toHaveBeenCalled()

    // Test with explicit empty array
    await userStore.batchDeleteUsers([])

    // Verify no API call was made for empty array
    expect(mockHttpClient.post).not.toHaveBeenCalled()
  })

  it('should maintain data consistency during bulk operations for any user set', async () => {
    // Property: For any user set, bulk operations should maintain data consistency
    const userStore = useUserStore()

    const userSets = [
      { size: 5, selectCount: 2, description: 'small set with partial selection' },
      { size: 20, selectCount: 10, description: 'medium set with half selection' },
      { size: 50, selectCount: 5, description: 'large set with small selection' },
      { size: 100, selectCount: 100, description: 'large set with full selection' }
    ]

    for (const userSet of userSets) {
      // Clear cache and selection
      userStore.clearUserCache()
      userStore.clearSelection()
      
      // Generate mock users
      const mockUsers = Array.from({ length: userSet.size }, (_, index) => ({
        id: index + 1,
        username: `consistency_user_${index + 1}`,
        nickname: `Consistency User ${index + 1}`,
        email: `consistency_user${index + 1}@example.com`,
        phone: `1234567890${index}`,
        status: Math.random() > 0.5 ? 1 : 0, // Random initial status
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: [],
        channels: []
      }))

      // Set up initial user list
      userStore.users.splice(0, userStore.users.length, ...mockUsers)
      userStore.total = mockUsers.length

      // Select users for bulk operation
      const selectedUsers = mockUsers.slice(0, userSet.selectCount)
      selectedUsers.forEach(user => userStore.selectUser(user))

      // Store initial state for verification
      const initialUserCount = userStore.users.length
      const initialTotal = userStore.total
      const selectedUserIds = selectedUsers.map(u => u.id)

      // Mock successful bulk delete API response
      mockHttpClient.post.mockResolvedValueOnce({ data: {} })

      // Perform bulk delete operation
      await userStore.batchDeleteUsers()

      // Verify data consistency after bulk delete
      expect(userStore.users).toHaveLength(initialUserCount - userSet.selectCount)
      expect(userStore.total).toBe(initialTotal - userSet.selectCount)

      // Verify no duplicate users exist
      const userIds = userStore.users.map(u => u.id)
      const uniqueUserIds = [...new Set(userIds)]
      expect(userIds).toHaveLength(uniqueUserIds.length)

      // Verify deleted users are completely removed
      selectedUserIds.forEach(deletedId => {
        expect(userStore.users.find(u => u.id === deletedId)).toBeUndefined()
      })

      // Verify remaining users maintain their original properties
      const remainingUsers = mockUsers.filter(u => !selectedUserIds.includes(u.id))
      remainingUsers.forEach(originalUser => {
        const currentUser = userStore.users.find(u => u.id === originalUser.id)
        expect(currentUser).toBeDefined()
        expect(currentUser!.username).toBe(originalUser.username)
        expect(currentUser!.email).toBe(originalUser.email)
        expect(currentUser!.phone).toBe(originalUser.phone)
      })

      // Verify selection state is cleared
      expect(userStore.selectedUsers).toHaveLength(0)
      expect(userStore.selectedUserIds).toHaveLength(0)
      expect(userStore.hasSelectedUsers).toBe(false)

      vi.clearAllMocks()
    }
  })

  it('should handle concurrent bulk operations correctly for any operation sequence', async () => {
    // Property: For any sequence of concurrent bulk operations, the system should handle them correctly
    const userStore = useUserStore()

    // Set up initial user list
    const mockUsers = Array.from({ length: 20 }, (_, index) => ({
      id: index + 1,
      username: `concurrent_user_${index + 1}`,
      nickname: `Concurrent User ${index + 1}`,
      email: `concurrent_user${index + 1}@example.com`,
      phone: `1234567890${index}`,
      status: 0, // All start as disabled
      createTime: new Date(),
      updateTime: new Date(),
      roles: [],
      organizations: [],
      channels: []
    }))

    userStore.users.splice(0, userStore.users.length, ...mockUsers)
    userStore.total = mockUsers.length

    // Select different groups for concurrent operations
    const group1 = mockUsers.slice(0, 5)
    const group2 = mockUsers.slice(5, 10)
    const group3 = mockUsers.slice(10, 15)

    // Mock API responses for concurrent operations
    mockHttpClient.post
      .mockResolvedValueOnce({ data: {} }) // First operation
      .mockResolvedValueOnce({ data: {} }) // Second operation
      .mockResolvedValueOnce({ data: {} }) // Third operation

    // Perform concurrent bulk operations
    const operation1 = userStore.batchUpdateUserStatus(1, group1.map(u => u.id))
    const operation2 = userStore.batchUpdateUserStatus(1, group2.map(u => u.id))
    const operation3 = userStore.batchDeleteUsers(group3.map(u => u.id))

    // Wait for all operations to complete
    await Promise.all([operation1, operation2, operation3])

    // Verify all API calls were made
    expect(mockHttpClient.post).toHaveBeenCalledTimes(3)

    // Verify the final state is consistent
    // Groups 1 and 2 should be enabled (status = 1)
    group1.concat(group2).forEach(user => {
      const updatedUser = userStore.users.find(u => u.id === user.id)
      expect(updatedUser).toBeDefined()
      expect(updatedUser!.status).toBe(1)
    })

    // Group 3 should be deleted
    group3.forEach(user => {
      expect(userStore.users.find(u => u.id === user.id)).toBeUndefined()
    })

    // Verify total count is correct
    expect(userStore.total).toBe(mockUsers.length - group3.length)
  })

  it('should preserve cache consistency during bulk operations for any cache state', async () => {
    // Property: For any cache state, bulk operations should preserve cache consistency
    const userStore = useUserStore()

    // Set up initial users
    const mockUsers = Array.from({ length: 15 }, (_, index) => ({
      id: index + 1,
      username: `cache_user_${index + 1}`,
      nickname: `Cache User ${index + 1}`,
      email: `cache_user${index + 1}@example.com`,
      phone: `1234567890${index}`,
      status: 1,
      createTime: new Date(),
      updateTime: new Date(),
      roles: [],
      organizations: [],
      channels: []
    }))

    userStore.users.splice(0, userStore.users.length, ...mockUsers)
    userStore.total = mockUsers.length

    // Note: userCache and searchCache are internal to the store and not exposed
    // We test the behavior through the public API instead

    // Select users for bulk delete
    const selectedUsers = mockUsers.slice(0, 5)
    selectedUsers.forEach(user => userStore.selectUser(user))

    // Mock successful bulk delete API response
    mockHttpClient.post.mockResolvedValueOnce({ data: {} })

    // Perform bulk delete operation
    await userStore.batchDeleteUsers()

    // Verify deleted users are removed from the user list (which reflects cache consistency)
    selectedUsers.forEach(deletedUser => {
      expect(userStore.users.find(u => u.id === deletedUser.id)).toBeUndefined()
    })

    // Verify remaining users are still in the list
    const remainingUsers = mockUsers.slice(5)
    remainingUsers.forEach(remainingUser => {
      expect(userStore.users.find(u => u.id === remainingUser.id)).toBeDefined()
    })

    // Verify total count is updated correctly
    expect(userStore.total).toBe(mockUsers.length - selectedUsers.length)

    // Verify selection is cleared (indicating cache consistency)
    expect(userStore.selectedUsers).toHaveLength(0)
    expect(userStore.selectedUserIds).toHaveLength(0)
  })

  it('should handle API errors gracefully during bulk operations for any error scenario', async () => {
    // Property: For any API error scenario, bulk operations should handle errors gracefully
    const userStore = useUserStore()

    const errorScenarios = [
      { error: new Error('Network error'), description: 'network failure' },
      { error: new Error('Server error'), description: 'server error' },
      { error: new Error('Unauthorized'), description: 'authorization error' },
      { error: new Error('Validation failed'), description: 'validation error' }
    ]

    for (const scenario of errorScenarios) {
      // Clear cache and selection
      userStore.clearUserCache()
      userStore.clearSelection()
      
      // Set up initial user list
      const mockUsers = Array.from({ length: 10 }, (_, index) => ({
        id: index + 1,
        username: `error_user_${index + 1}`,
        nickname: `Error User ${index + 1}`,
        email: `error_user${index + 1}@example.com`,
        phone: `1234567890${index}`,
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: [],
        channels: []
      }))

      userStore.users.splice(0, userStore.users.length, ...mockUsers)
      userStore.total = mockUsers.length

      // Select users for bulk operation
      const selectedUsers = mockUsers.slice(0, 3)
      selectedUsers.forEach(user => userStore.selectUser(user))

      // Store initial state
      const initialUserCount = userStore.users.length
      const initialTotal = userStore.total
      const initialSelectedCount = userStore.selectedUsers.length

      // Mock API error response
      mockHttpClient.post.mockRejectedValueOnce(scenario.error)

      // Perform bulk delete operation and expect it to handle error gracefully
      try {
        await userStore.batchDeleteUsers()
      } catch (error) {
        // Error should be caught and handled by the store
      }

      // Verify state remains unchanged after error
      expect(userStore.users).toHaveLength(initialUserCount)
      expect(userStore.total).toBe(initialTotal)

      // Verify selection state is preserved (user can retry)
      expect(userStore.selectedUsers).toHaveLength(initialSelectedCount)

      // Verify API was called
      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/user/batch-delete', {
        userIds: selectedUsers.map(u => u.id)
      })

      vi.clearAllMocks()
    }
  })

  it('should support bulk operations with mixed user properties for any user combination', async () => {
    // Property: For any combination of users with different properties, bulk operations should work correctly
    const userStore = useUserStore()

    // Create users with mixed properties
    const mixedUsers = [
      // Active users with different roles
      {
        id: 1,
        username: 'admin_user',
        nickname: 'Admin User',
        email: 'admin@example.com',
        phone: '1111111111',
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [{ id: 1, name: 'Admin', code: 'ADMIN', description: 'Administrator', status: 1, createTime: new Date(), updateTime: new Date() }],
        organizations: [{ id: 1, name: 'IT Dept', code: 'IT', parentId: null, level: 1, sort: 1, status: 1, description: 'IT Department', createTime: new Date(), updateTime: new Date() }],
        channels: ['web', 'mobile']
      },
      // Inactive user with no roles
      {
        id: 2,
        username: 'inactive_user',
        nickname: 'Inactive User',
        email: 'inactive@example.com',
        phone: '2222222222',
        status: 0,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: [],
        channels: ['web']
      },
      // Regular user with multiple roles and organizations
      {
        id: 3,
        username: 'regular_user',
        nickname: 'Regular User',
        email: 'regular@example.com',
        phone: '3333333333',
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [
          { id: 2, name: 'User', code: 'USER', description: 'Regular User', status: 1, createTime: new Date(), updateTime: new Date() },
          { id: 3, name: 'Editor', code: 'EDITOR', description: 'Content Editor', status: 1, createTime: new Date(), updateTime: new Date() }
        ],
        organizations: [
          { id: 2, name: 'Sales Dept', code: 'SALES', parentId: null, level: 1, sort: 2, status: 1, description: 'Sales Department', createTime: new Date(), updateTime: new Date() },
          { id: 3, name: 'Marketing Dept', code: 'MARKETING', parentId: null, level: 1, sort: 3, status: 1, description: 'Marketing Department', createTime: new Date(), updateTime: new Date() }
        ],
        channels: ['web', 'mobile', 'api']
      },
      // User with minimal properties
      {
        id: 4,
        username: 'minimal_user',
        nickname: 'Minimal User',
        email: 'minimal@example.com',
        phone: '4444444444',
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: [],
        channels: []
      }
    ]

    userStore.users.splice(0, userStore.users.length, ...mixedUsers)
    userStore.total = mixedUsers.length

    // Test bulk operations with different combinations
    const combinations = [
      { users: [mixedUsers[0]], description: 'admin user only' },
      { users: [mixedUsers[1]], description: 'inactive user only' },
      { users: [mixedUsers[0], mixedUsers[2]], description: 'users with roles' },
      { users: [mixedUsers[1], mixedUsers[3]], description: 'users without roles' },
      { users: mixedUsers, description: 'all mixed users' }
    ]

    for (const combination of combinations) {
      // Clear selection
      userStore.clearSelection()
      
      // Select the combination of users
      combination.users.forEach(user => userStore.selectUser(user))

      // Mock successful bulk status update API response
      mockHttpClient.post.mockResolvedValueOnce({ data: {} })

      // Perform bulk status update (enable all selected users)
      await userStore.batchUpdateUserStatus(1)

      // Verify API was called with correct user IDs
      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/user/batch-operation', {
        userIds: combination.users.map(u => u.id),
        operation: 'enable'
      })

      // Verify all selected users now have status = 1
      combination.users.forEach(selectedUser => {
        const updatedUser = userStore.users.find(u => u.id === selectedUser.id)
        expect(updatedUser).toBeDefined()
        expect(updatedUser!.status).toBe(1)
      })

      // Verify other properties remain unchanged
      combination.users.forEach(selectedUser => {
        const updatedUser = userStore.users.find(u => u.id === selectedUser.id)
        expect(updatedUser!.username).toBe(selectedUser.username)
        expect(updatedUser!.email).toBe(selectedUser.email)
        expect(updatedUser!.roles).toEqual(selectedUser.roles)
        expect(updatedUser!.organizations).toEqual(selectedUser.organizations)
      })

      vi.clearAllMocks()
    }
  })

  it('should maintain selection state consistency during bulk operations for any selection pattern', async () => {
    // Property: For any selection pattern, bulk operations should maintain selection state consistency
    const userStore = useUserStore()

    // Set up initial user list
    const mockUsers = Array.from({ length: 20 }, (_, index) => ({
      id: index + 1,
      username: `selection_user_${index + 1}`,
      nickname: `Selection User ${index + 1}`,
      email: `selection_user${index + 1}@example.com`,
      phone: `1234567890${index}`,
      status: 1,
      createTime: new Date(),
      updateTime: new Date(),
      roles: [],
      organizations: [],
      channels: []
    }))

    userStore.users.splice(0, userStore.users.length, ...mockUsers)
    userStore.total = mockUsers.length

    const selectionPatterns = [
      { indices: [0, 2, 4, 6], description: 'even indices' },
      { indices: [1, 3, 5, 7], description: 'odd indices' },
      { indices: [0, 1, 2], description: 'consecutive from start' },
      { indices: [17, 18, 19], description: 'consecutive from end' },
      { indices: [0, 5, 10, 15], description: 'evenly spaced' },
      { indices: [19, 0, 10, 5], description: 'random order' }
    ]

    for (const pattern of selectionPatterns) {
      // Clear selection
      userStore.clearSelection()
      
      // Apply selection pattern
      const selectedUsers = pattern.indices.map(index => mockUsers[index])
      selectedUsers.forEach(user => userStore.selectUser(user))

      // Verify selection state before operation
      expect(userStore.selectedUsers).toHaveLength(selectedUsers.length)
      expect(userStore.selectedUserIds).toEqual(selectedUsers.map(u => u.id))
      expect(userStore.hasSelectedUsers).toBe(true)
      expect(userStore.selectedUserCount).toBe(selectedUsers.length)

      // Mock successful bulk delete API response (delete clears selection)
      mockHttpClient.post.mockResolvedValueOnce({ data: {} })

      // Perform bulk delete operation (this clears selection)
      await userStore.batchDeleteUsers()

      // Verify selection state is cleared after delete operation
      expect(userStore.selectedUsers).toHaveLength(0)
      expect(userStore.selectedUserIds).toHaveLength(0)
      expect(userStore.hasSelectedUsers).toBe(false)
      expect(userStore.selectedUserCount).toBe(0)

      // Verify the users were deleted from the list
      selectedUsers.forEach(selectedUser => {
        expect(userStore.users.find(u => u.id === selectedUser.id)).toBeUndefined()
      })

      // Verify non-selected users are still in the list
      const nonSelectedUsers = mockUsers.filter(u => !selectedUsers.includes(u))
      nonSelectedUsers.forEach(nonSelectedUser => {
        expect(userStore.users.find(u => u.id === nonSelectedUser.id)).toBeDefined()
      })

      // Reset user list for next test (add back deleted users)
      userStore.users.splice(0, userStore.users.length, ...mockUsers)
      userStore.total = mockUsers.length

      vi.clearAllMocks()
    }

    // Test bulk status update (which does NOT clear selection)
    userStore.clearSelection()
    
    // Select some users for status update
    const statusUpdateUsers = mockUsers.slice(0, 3)
    statusUpdateUsers.forEach(user => userStore.selectUser(user))

    // Verify selection before status update
    expect(userStore.selectedUsers).toHaveLength(statusUpdateUsers.length)

    // Mock successful bulk status update API response
    mockHttpClient.post.mockResolvedValueOnce({ data: {} })

    // Perform bulk status update operation (this does NOT clear selection)
    await userStore.batchUpdateUserStatus(0)

    // Verify selection state is NOT cleared after status update operation
    expect(userStore.selectedUsers).toHaveLength(statusUpdateUsers.length)
    expect(userStore.selectedUserIds).toEqual(statusUpdateUsers.map(u => u.id))
    expect(userStore.hasSelectedUsers).toBe(true)
    expect(userStore.selectedUserCount).toBe(statusUpdateUsers.length)

    // Verify the operation was applied to the correct users
    statusUpdateUsers.forEach(selectedUser => {
      const updatedUser = userStore.users.find(u => u.id === selectedUser.id)
      expect(updatedUser).toBeDefined()
      expect(updatedUser!.status).toBe(0)
    })
  })
})