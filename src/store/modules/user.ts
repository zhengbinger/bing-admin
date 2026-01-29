/**
 * 用户状态管理
 * 管理用户登录状态、用户信息、用户列表等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { User, LoginRequest, LoginResponse, PageResult } from '../../types'
import { userApiService, type UserQueryParams } from '../../api/services/user'
import api from '../../api'

// 用户状态接口
interface UserState {
  token: string
  userInfo: User | null
  refreshToken: string
  expiration: Date | null
  refreshExpiration: Date | null
}

// 用户列表状态接口
interface UserListState {
  users: User[]
  total: number
  loading: boolean
  currentPage: number
  pageSize: number
  searchParams: UserQueryParams
}

// 用户选择状态接口
interface UserSelectionState {
  selectedUsers: User[]
  selectedUserIds: number[]
}

export const useUserStore = defineStore('user', () => {
  // ===== 认证相关状态 =====
  const token = ref<string>(localStorage.getItem('token') || '')
  const refreshToken = ref<string>(localStorage.getItem('refreshToken') || '')
  const userInfo = ref<User | null>(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const expiration = ref<Date | null>(
    localStorage.getItem('expiration') ? new Date(localStorage.getItem('expiration')!) : null
  )
  const refreshExpiration = ref<Date | null>(
    localStorage.getItem('refreshExpiration') ? new Date(localStorage.getItem('refreshExpiration')!) : null
  )

  // ===== 用户列表管理状态 =====
  const users = ref<User[]>([])
  const total = ref<number>(0)
  const loading = ref<boolean>(false)
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(20)
  const searchParams = ref<UserQueryParams>({})

  // ===== 用户选择状态 =====
  const selectedUsers = ref<User[]>([])
  const selectedUserIds = ref<number[]>([])

  // ===== 缓存状态 =====
  const userCache = ref<Map<number, User>>(new Map())
  const searchCache = ref<Map<string, PageResult<User>>>(new Map())

  // ===== 计算属性 =====
  const isLogin = computed(() => !!token.value && (!expiration.value || expiration.value > new Date()))
  const isTokenExpired = computed(() => expiration.value ? expiration.value <= new Date() : false)
  const canRefreshToken = computed(() => refreshExpiration.value ? refreshExpiration.value > new Date() : false)
  const hasSelectedUsers = computed(() => selectedUsers.value.length > 0)
  const selectedUserCount = computed(() => selectedUsers.value.length)

  // ===== 认证相关方法 =====
  
  /**
   * 登录
   */
  const login = async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.auth.login(data)
      const loginData = response.data as LoginResponse
      
      // 保存认证状态
      token.value = loginData.token
      refreshToken.value = loginData.refreshToken
      userInfo.value = {
        id: loginData.userId,
        username: loginData.username,
        nickname: loginData.nickname,
        email: '',
        phone: '',
        status: 1,
        createTime: new Date(),
        updateTime: new Date(),
        roles: [],
        organizations: []
      }
      expiration.value = new Date(loginData.expiration)
      refreshExpiration.value = new Date(loginData.refreshExpiration)
      
      // 持久化存储
      persistAuthData()
      
      ElMessage.success('登录成功')
      return loginData
    } catch (error) {
      ElMessage.error('登录失败')
      throw error
    }
  }

  /**
   * 退出登录
   */
  const logout = async (): Promise<void> => {
    try {
      await api.auth.logout()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      clearAuthData()
      ElMessage.success('退出登录成功')
    }
  }

  /**
   * 刷新令牌
   */
  const refreshAuthToken = async (): Promise<boolean> => {
    if (!canRefreshToken.value) {
      clearAuthData()
      return false
    }

    try {
      const response = await api.auth.refreshToken(refreshToken.value)
      const loginData = response.data as LoginResponse
      
      token.value = loginData.token
      refreshToken.value = loginData.refreshToken
      expiration.value = new Date(loginData.expiration)
      refreshExpiration.value = new Date(loginData.refreshExpiration)
      
      persistAuthData()
      return true
    } catch (error) {
      console.error('刷新令牌失败:', error)
      clearAuthData()
      return false
    }
  }

  /**
   * 获取当前用户信息
   */
  const getCurrentUser = async (): Promise<User> => {
    try {
      const response = await api.auth.getCurrentUser()
      const userData = response.data as User
      
      userInfo.value = userData
      localStorage.setItem('userInfo', JSON.stringify(userData))
      
      return userData
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  /**
   * 更新用户信息
   */
  const updateUserInfo = (data: Partial<User>): void => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...data }
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  }

  // ===== 用户列表管理方法 =====

  /**
   * 获取用户列表
   */
  const fetchUsers = async (params: UserQueryParams = {}): Promise<void> => {
    loading.value = true
    try {
      // 检查缓存
      const cacheKey = JSON.stringify(params)
      if (searchCache.value.has(cacheKey)) {
        const cachedResult = searchCache.value.get(cacheKey)!
        users.value = cachedResult.records
        total.value = cachedResult.total
        return
      }

      const result = await userApiService.getUsers(params)
      users.value = result.records
      total.value = result.total
      currentPage.value = result.current
      pageSize.value = result.size

      // 更新缓存
      searchCache.value.set(cacheKey, result)
      
      // 更新用户缓存
      result.records.forEach(user => {
        userCache.value.set(user.id, user)
      })
    } catch (error) {
      console.error('获取用户列表失败:', error)
      ElMessage.error('获取用户列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索用户
   */
  const searchUsers = async (params: UserQueryParams): Promise<void> => {
    searchParams.value = params
    currentPage.value = 1
    await fetchUsers({ ...params, page: 1, size: pageSize.value })
  }

  /**
   * 分页查询
   */
  const changePage = async (page: number): Promise<void> => {
    currentPage.value = page
    await fetchUsers({ ...searchParams.value, page, size: pageSize.value })
  }

  /**
   * 改变页面大小
   */
  const changePageSize = async (size: number): Promise<void> => {
    pageSize.value = size
    currentPage.value = 1
    await fetchUsers({ ...searchParams.value, page: 1, size })
  }

  /**
   * 获取用户详情（带缓存）
   */
  const getUserById = async (id: number): Promise<User> => {
    // 先检查缓存
    if (userCache.value.has(id)) {
      return userCache.value.get(id)!
    }

    try {
      const user = await userApiService.getUserById(id)
      userCache.value.set(id, user)
      return user
    } catch (error) {
      console.error('获取用户详情失败:', error)
      throw error
    }
  }

  /**
   * 创建用户
   */
  const createUser = async (userData: any): Promise<User> => {
    try {
      const user = await userApiService.createUser(userData)
      
      // 清除搜索缓存
      searchCache.value.clear()
      
      // 如果当前在第一页，添加到列表开头
      if (currentPage.value === 1) {
        users.value.unshift(user)
        total.value += 1
      }
      
      // 更新缓存
      userCache.value.set(user.id, user)
      
      ElMessage.success('创建用户成功')
      return user
    } catch (error) {
      console.error('创建用户失败:', error)
      ElMessage.error('创建用户失败')
      throw error
    }
  }

  /**
   * 更新用户
   */
  const updateUser = async (id: number, userData: any): Promise<User> => {
    try {
      const user = await userApiService.updateUser(id, userData)
      
      // 更新列表中的用户
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = user
      }
      
      // 更新缓存
      userCache.value.set(id, user)
      
      // 清除搜索缓存
      searchCache.value.clear()
      
      ElMessage.success('更新用户成功')
      return user
    } catch (error) {
      console.error('更新用户失败:', error)
      ElMessage.error('更新用户失败')
      throw error
    }
  }

  /**
   * 删除用户
   */
  const deleteUser = async (id: number): Promise<void> => {
    try {
      await userApiService.deleteUser(id)
      
      // 从列表中移除
      users.value = users.value.filter(u => u.id !== id)
      total.value -= 1
      
      // 从缓存中移除
      userCache.value.delete(id)
      
      // 从选择中移除
      selectedUsers.value = selectedUsers.value.filter(u => u.id !== id)
      selectedUserIds.value = selectedUserIds.value.filter(uid => uid !== id)
      
      // 清除搜索缓存
      searchCache.value.clear()
      
      ElMessage.success('删除用户成功')
    } catch (error) {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
      throw error
    }
  }

  // ===== 用户选择管理方法 =====

  /**
   * 选择用户
   */
  const selectUser = (user: User): void => {
    if (!selectedUserIds.value.includes(user.id)) {
      selectedUsers.value.push(user)
      selectedUserIds.value.push(user.id)
    }
  }

  /**
   * 取消选择用户
   */
  const unselectUser = (userId: number): void => {
    selectedUsers.value = selectedUsers.value.filter(u => u.id !== userId)
    selectedUserIds.value = selectedUserIds.value.filter(id => id !== userId)
  }

  /**
   * 切换用户选择状态
   */
  const toggleUserSelection = (user: User): void => {
    if (selectedUserIds.value.includes(user.id)) {
      unselectUser(user.id)
    } else {
      selectUser(user)
    }
  }

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = (): void => {
    if (selectedUsers.value.length === users.value.length) {
      // 取消全选
      selectedUsers.value = []
      selectedUserIds.value = []
    } else {
      // 全选
      selectedUsers.value = [...users.value]
      selectedUserIds.value = users.value.map(u => u.id)
    }
  }

  /**
   * 清除选择
   */
  const clearSelection = (): void => {
    selectedUsers.value = []
    selectedUserIds.value = []
  }

  // ===== 批量操作方法 =====

  /**
   * 批量删除用户
   */
  const batchDeleteUsers = async (userIds?: number[]): Promise<void> => {
    const idsToDelete = userIds || selectedUserIds.value
    if (idsToDelete.length === 0) {
      ElMessage.warning('请选择要删除的用户')
      return
    }

    try {
      await userApiService.batchDeleteUsers(idsToDelete)
      
      // 从列表中移除
      users.value = users.value.filter(u => !idsToDelete.includes(u.id))
      total.value -= idsToDelete.length
      
      // 从缓存中移除
      idsToDelete.forEach(id => userCache.value.delete(id))
      
      // 清除选择
      clearSelection()
      
      // 清除搜索缓存
      searchCache.value.clear()
      
      ElMessage.success(`成功删除 ${idsToDelete.length} 个用户`)
    } catch (error) {
      console.error('批量删除用户失败:', error)
      ElMessage.error('批量删除用户失败')
      throw error
    }
  }

  /**
   * 批量更新用户状态
   */
  const batchUpdateUserStatus = async (status: number, userIds?: number[]): Promise<void> => {
    const idsToUpdate = userIds || selectedUserIds.value
    if (idsToUpdate.length === 0) {
      ElMessage.warning('请选择要更新的用户')
      return
    }

    try {
      await userApiService.batchOperation({
        userIds: idsToUpdate,
        operation: status === 1 ? 'enable' : 'disable'
      })
      
      // 更新列表中的用户状态
      users.value.forEach(user => {
        if (idsToUpdate.includes(user.id)) {
          user.status = status
        }
      })
      
      // 更新缓存中的用户状态
      idsToUpdate.forEach(id => {
        const cachedUser = userCache.value.get(id)
        if (cachedUser) {
          cachedUser.status = status
        }
      })
      
      // 清除搜索缓存
      searchCache.value.clear()
      
      const statusText = status === 1 ? '启用' : '禁用'
      ElMessage.success(`成功${statusText} ${idsToUpdate.length} 个用户`)
    } catch (error) {
      console.error('批量更新用户状态失败:', error)
      ElMessage.error('批量更新用户状态失败')
      throw error
    }
  }

  // ===== 工具方法 =====

  /**
   * 持久化认证数据
   */
  const persistAuthData = (): void => {
    localStorage.setItem('token', token.value)
    localStorage.setItem('refreshToken', refreshToken.value)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    if (expiration.value) {
      localStorage.setItem('expiration', expiration.value.toISOString())
    }
    if (refreshExpiration.value) {
      localStorage.setItem('refreshExpiration', refreshExpiration.value.toISOString())
    }
  }

  /**
   * 清除认证数据
   */
  const clearAuthData = (): void => {
    token.value = ''
    refreshToken.value = ''
    userInfo.value = null
    expiration.value = null
    refreshExpiration.value = null
    
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('expiration')
    localStorage.removeItem('refreshExpiration')
  }

  /**
   * 清除用户列表缓存
   */
  const clearUserCache = (): void => {
    userCache.value.clear()
    searchCache.value.clear()
  }

  /**
   * 刷新用户列表
   */
  const refreshUsers = async (): Promise<void> => {
    clearUserCache()
    await fetchUsers({ ...searchParams.value, page: currentPage.value, size: pageSize.value })
  }

  return {
    // 认证状态
    token,
    refreshToken,
    userInfo,
    expiration,
    refreshExpiration,
    isLogin,
    isTokenExpired,
    canRefreshToken,

    // 用户列表状态
    users,
    total,
    loading,
    currentPage,
    pageSize,
    searchParams,

    // 用户选择状态
    selectedUsers,
    selectedUserIds,
    hasSelectedUsers,
    selectedUserCount,

    // 认证方法
    login,
    logout,
    refreshAuthToken,
    getCurrentUser,
    updateUserInfo,

    // 用户列表管理方法
    fetchUsers,
    searchUsers,
    changePage,
    changePageSize,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,

    // 用户选择方法
    selectUser,
    unselectUser,
    toggleUserSelection,
    toggleSelectAll,
    clearSelection,

    // 批量操作方法
    batchDeleteUsers,
    batchUpdateUserStatus,

    // 工具方法
    clearAuthData,
    clearUserCache
  }
}, {
  persist: {
    key: 'userStore',
    storage: localStorage,
    paths: ['token', 'refreshToken', 'userInfo', 'expiration', 'refreshExpiration']
  }
})