/**
 * 角色状态管理
 * 管理角色列表、角色详情、权限分配等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Role, Permission, PageResult } from '../../types'
import { roleApiService, type RoleQueryParams, type RoleDetail } from '../../api/services/role'

// 角色列表状态接口
interface RoleListState {
  roles: Role[]
  total: number
  loading: boolean
  currentPage: number
  pageSize: number
  searchParams: RoleQueryParams
}

// 角色选择状态接口
interface RoleSelectionState {
  selectedRoles: Role[]
  selectedRoleIds: number[]
}

export const useRoleStore = defineStore('role', () => {
  // ===== 角色列表管理状态 =====
  const roles = ref<Role[]>([])
  const total = ref<number>(0)
  const loading = ref<boolean>(false)
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(20)
  const searchParams = ref<RoleQueryParams>({})

  // ===== 角色选择状态 =====
  const selectedRoles = ref<Role[]>([])
  const selectedRoleIds = ref<number[]>([])

  // ===== 缓存状态 =====
  const roleCache = ref<Map<number, RoleDetail>>(new Map())
  const searchCache = ref<Map<string, PageResult<Role>>>(new Map())
  const allRolesCache = ref<Role[]>([])
  const allRolesCacheTime = ref<number>(0)

  // ===== 计算属性 =====
  const hasSelectedRoles = computed(() => selectedRoles.value.length > 0)
  const selectedRoleCount = computed(() => selectedRoles.value.length)

  // ===== 角色列表管理方法 =====

  /**
   * 获取角色列表
   */
  const fetchRoles = async (params: RoleQueryParams = {}): Promise<void> => {
    loading.value = true
    try {
      // 检查缓存
      const cacheKey = JSON.stringify(params)
      if (searchCache.value.has(cacheKey)) {
        const cachedResult = searchCache.value.get(cacheKey)!
        roles.value = cachedResult.records
        total.value = cachedResult.total
        return
      }

      const result = await roleApiService.getRoles(params)
      roles.value = result.records
      total.value = result.total
      currentPage.value = result.current
      pageSize.value = result.size

      // 更新缓存
      searchCache.value.set(cacheKey, result)
      
      // 更新角色缓存
      result.records.forEach(role => {
        if (!roleCache.value.has(role.id)) {
          roleCache.value.set(role.id, role as RoleDetail)
        }
      })
    } catch (error) {
      console.error('获取角色列表失败:', error)
      ElMessage.error('获取角色列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取所有角色（用于下拉选择）
   */
  const getAllRoles = async (forceRefresh = false): Promise<Role[]> => {
    const now = Date.now()
    const cacheExpiry = 5 * 60 * 1000 // 5分钟缓存

    if (!forceRefresh && allRolesCache.value.length > 0 && (now - allRolesCacheTime.value) < cacheExpiry) {
      return allRolesCache.value
    }

    try {
      const result = await roleApiService.getAllRoles()
      allRolesCache.value = result
      allRolesCacheTime.value = now
      return result
    } catch (error) {
      console.error('获取所有角色失败:', error)
      return []
    }
  }

  /**
   * 搜索角色
   */
  const searchRoles = async (params: RoleQueryParams): Promise<void> => {
    searchParams.value = params
    currentPage.value = 1
    await fetchRoles({ ...params, page: 1, size: pageSize.value })
  }

  /**
   * 分页查询
   */
  const changePage = async (page: number): Promise<void> => {
    currentPage.value = page
    await fetchRoles({ ...searchParams.value, page, size: pageSize.value })
  }

  /**
   * 改变页面大小
   */
  const changePageSize = async (size: number): Promise<void> => {
    pageSize.value = size
    currentPage.value = 1
    await fetchRoles({ ...searchParams.value, page: 1, size })
  }

  /**
   * 获取角色详情（带缓存）
   */
  const getRoleById = async (id: number): Promise<RoleDetail> => {
    // 先检查缓存
    if (roleCache.value.has(id)) {
      return roleCache.value.get(id)!
    }

    try {
      const role = await roleApiService.getRoleById(id)
      roleCache.value.set(id, role)
      return role
    } catch (error) {
      console.error('获取角色详情失败:', error)
      throw error
    }
  }

  /**
   * 创建角色
   */
  const createRole = async (roleData: any): Promise<Role> => {
    try {
      const role = await roleApiService.createRole(roleData)
      
      // 清除搜索缓存
      searchCache.value.clear()
      allRolesCache.value = []
      
      // 如果当前在第一页，添加到列表开头
      if (currentPage.value === 1) {
        roles.value.unshift(role)
        total.value += 1
      }
      
      // 更新缓存
      roleCache.value.set(role.id, role as RoleDetail)
      
      ElMessage.success('创建角色成功')
      return role
    } catch (error) {
      console.error('创建角色失败:', error)
      ElMessage.error('创建角色失败')
      throw error
    }
  }

  /**
   * 更新角色
   */
  const updateRole = async (id: number, roleData: any): Promise<Role> => {
    try {
      const role = await roleApiService.updateRole(id, roleData)
      
      // 更新列表中的角色
      const index = roles.value.findIndex(r => r.id === id)
      if (index !== -1) {
        roles.value[index] = role
      }
      
      // 更新缓存
      const cachedRole = roleCache.value.get(id)
      if (cachedRole) {
        Object.assign(cachedRole, role)
      }
      
      // 清除搜索缓存和全部角色缓存
      searchCache.value.clear()
      allRolesCache.value = []
      
      ElMessage.success('更新角色成功')
      return role
    } catch (error) {
      console.error('更新角色失败:', error)
      ElMessage.error('更新角色失败')
      throw error
    }
  }

  /**
   * 删除角色
   */
  const deleteRole = async (id: number): Promise<void> => {
    try {
      await roleApiService.deleteRole(id)
      
      // 从列表中移除
      roles.value = roles.value.filter(r => r.id !== id)
      total.value -= 1
      
      // 从缓存中移除
      roleCache.value.delete(id)
      
      // 从选择中移除
      selectedRoles.value = selectedRoles.value.filter(r => r.id !== id)
      selectedRoleIds.value = selectedRoleIds.value.filter(rid => rid !== id)
      
      // 清除搜索缓存和全部角色缓存
      searchCache.value.clear()
      allRolesCache.value = []
      
      ElMessage.success('删除角色成功')
    } catch (error) {
      console.error('删除角色失败:', error)
      ElMessage.error('删除角色失败')
      throw error
    }
  }

  /**
   * 复制角色
   */
  const duplicateRole = async (id: number, newName: string): Promise<Role> => {
    try {
      const role = await roleApiService.duplicateRole(id, newName)
      
      // 清除搜索缓存
      searchCache.value.clear()
      allRolesCache.value = []
      
      // 如果当前在第一页，添加到列表开头
      if (currentPage.value === 1) {
        roles.value.unshift(role)
        total.value += 1
      }
      
      // 更新缓存
      roleCache.value.set(role.id, role as RoleDetail)
      
      ElMessage.success('复制角色成功')
      return role
    } catch (error) {
      console.error('复制角色失败:', error)
      ElMessage.error('复制角色失败')
      throw error
    }
  }

  /**
   * 检查角色是否可以删除
   */
  const checkRoleDeletable = async (id: number): Promise<{ deletable: boolean; userCount: number }> => {
    try {
      return await roleApiService.checkRoleDeletable(id)
    } catch (error) {
      console.error('检查角色删除权限失败:', error)
      return { deletable: false, userCount: 0 }
    }
  }

  // ===== 角色选择管理方法 =====

  /**
   * 选择角色
   */
  const selectRole = (role: Role): void => {
    if (!selectedRoleIds.value.includes(role.id)) {
      selectedRoles.value.push(role)
      selectedRoleIds.value.push(role.id)
    }
  }

  /**
   * 取消选择角色
   */
  const unselectRole = (roleId: number): void => {
    selectedRoles.value = selectedRoles.value.filter(r => r.id !== roleId)
    selectedRoleIds.value = selectedRoleIds.value.filter(id => id !== roleId)
  }

  /**
   * 切换角色选择状态
   */
  const toggleRoleSelection = (role: Role): void => {
    if (selectedRoleIds.value.includes(role.id)) {
      unselectRole(role.id)
    } else {
      selectRole(role)
    }
  }

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = (): void => {
    if (selectedRoles.value.length === roles.value.length) {
      // 取消全选
      selectedRoles.value = []
      selectedRoleIds.value = []
    } else {
      // 全选
      selectedRoles.value = [...roles.value]
      selectedRoleIds.value = roles.value.map(r => r.id)
    }
  }

  /**
   * 清除选择
   */
  const clearSelection = (): void => {
    selectedRoles.value = []
    selectedRoleIds.value = []
  }

  // ===== 批量操作方法 =====

  /**
   * 批量删除角色
   */
  const batchDeleteRoles = async (roleIds?: number[]): Promise<void> => {
    const idsToDelete = roleIds || selectedRoleIds.value
    if (idsToDelete.length === 0) {
      ElMessage.warning('请选择要删除的角色')
      return
    }

    try {
      await roleApiService.batchDeleteRoles(idsToDelete)
      
      // 从列表中移除
      roles.value = roles.value.filter(r => !idsToDelete.includes(r.id))
      total.value -= idsToDelete.length
      
      // 从缓存中移除
      idsToDelete.forEach(id => roleCache.value.delete(id))
      
      // 清除选择
      clearSelection()
      
      // 清除搜索缓存和全部角色缓存
      searchCache.value.clear()
      allRolesCache.value = []
      
      ElMessage.success(`成功删除 ${idsToDelete.length} 个角色`)
    } catch (error) {
      console.error('批量删除角色失败:', error)
      ElMessage.error('批量删除角色失败')
      throw error
    }
  }

  /**
   * 批量更新角色状态
   */
  const batchUpdateRoleStatus = async (status: number, roleIds?: number[]): Promise<void> => {
    const idsToUpdate = roleIds || selectedRoleIds.value
    if (idsToUpdate.length === 0) {
      ElMessage.warning('请选择要更新的角色')
      return
    }

    try {
      await roleApiService.batchOperation({
        roleIds: idsToUpdate,
        operation: status === 1 ? 'enable' : 'disable'
      })
      
      // 更新列表中的角色状态
      roles.value.forEach(role => {
        if (idsToUpdate.includes(role.id)) {
          role.status = status
        }
      })
      
      // 更新缓存中的角色状态
      idsToUpdate.forEach(id => {
        const cachedRole = roleCache.value.get(id)
        if (cachedRole) {
          cachedRole.status = status
        }
      })
      
      // 清除搜索缓存和全部角色缓存
      searchCache.value.clear()
      allRolesCache.value = []
      
      const statusText = status === 1 ? '启用' : '禁用'
      ElMessage.success(`成功${statusText} ${idsToUpdate.length} 个角色`)
    } catch (error) {
      console.error('批量更新角色状态失败:', error)
      ElMessage.error('批量更新角色状态失败')
      throw error
    }
  }

  // ===== 权限管理方法 =====

  /**
   * 获取角色权限
   */
  const getRolePermissions = async (id: number): Promise<Permission[]> => {
    try {
      return await roleApiService.getRolePermissions(id)
    } catch (error) {
      console.error('获取角色权限失败:', error)
      throw error
    }
  }

  /**
   * 更新角色权限
   */
  const updateRolePermissions = async (id: number, permissionIds: number[]): Promise<void> => {
    try {
      await roleApiService.updateRolePermissions(id, permissionIds)
      
      // 清除角色缓存以强制重新加载
      roleCache.value.delete(id)
      
      ElMessage.success('更新角色权限成功')
    } catch (error) {
      console.error('更新角色权限失败:', error)
      ElMessage.error('更新角色权限失败')
      throw error
    }
  }

  // ===== 工具方法 =====

  /**
   * 清除角色缓存
   */
  const clearRoleCache = (): void => {
    roleCache.value.clear()
    searchCache.value.clear()
    allRolesCache.value = []
    allRolesCacheTime.value = 0
  }

  /**
   * 刷新角色列表
   */
  const refreshRoles = async (): Promise<void> => {
    clearRoleCache()
    await fetchRoles({ ...searchParams.value, page: currentPage.value, size: pageSize.value })
  }

  /**
   * 搜索角色（模糊搜索）
   */
  const searchRolesByKeyword = async (keyword: string, limit = 10): Promise<Role[]> => {
    try {
      return await roleApiService.searchRoles(keyword, limit)
    } catch (error) {
      console.error('搜索角色失败:', error)
      return []
    }
  }

  return {
    // 角色列表状态
    roles,
    total,
    loading,
    currentPage,
    pageSize,
    searchParams,

    // 角色选择状态
    selectedRoles,
    selectedRoleIds,
    hasSelectedRoles,
    selectedRoleCount,

    // 角色列表管理方法
    fetchRoles,
    getAllRoles,
    searchRoles,
    changePage,
    changePageSize,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    duplicateRole,
    checkRoleDeletable,
    refreshRoles,

    // 角色选择方法
    selectRole,
    unselectRole,
    toggleRoleSelection,
    toggleSelectAll,
    clearSelection,

    // 批量操作方法
    batchDeleteRoles,
    batchUpdateRoleStatus,

    // 权限管理方法
    getRolePermissions,
    updateRolePermissions,

    // 工具方法
    clearRoleCache,
    searchRolesByKeyword
  }
}, {
  persist: {
    key: 'roleStore',
    storage: localStorage,
    paths: ['searchParams', 'currentPage', 'pageSize']
  }
})