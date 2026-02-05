/**
 * 权限状态管理
 * 管理权限列表、权限树结构等
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Permission } from '../../types'

export const usePermissionStore = defineStore('permission', () => {
  // ===== 权限状态 =====
  const permissions = ref<Permission[]>([])
  const allPermissionsCache = ref<Permission[]>([])
  const allPermissionsCacheTime = ref<number>(0)

  // ===== 权限管理方法 =====

  /**
   * 获取所有权限（用于权限树）
   */
  const getAllPermissions = async (forceRefresh = false): Promise<Permission[]> => {
    const now = Date.now()
    const cacheExpiry = 5 * 60 * 1000 // 5分钟缓存

    if (!forceRefresh && allPermissionsCache.value.length > 0 && (now - allPermissionsCacheTime.value) < cacheExpiry) {
      return allPermissionsCache.value
    }

    try {
      // TODO: 实际的API调用
      // const result = await permissionApiService.getAllPermissions()
      
      // 临时模拟数据
      const mockPermissions: Permission[] = [
        {
          id: 1,
          name: '系统管理',
          code: 'system',
          type: 'module',
          status: 1,
          children: [
            {
              id: 2,
              name: '用户管理',
              code: 'user',
              type: 'menu',
              status: 1,
              children: [
                { id: 3, name: '查看用户', code: 'user:view', type: 'button', status: 1 },
                { id: 4, name: '创建用户', code: 'user:create', type: 'button', status: 1 },
                { id: 5, name: '编辑用户', code: 'user:update', type: 'button', status: 1 },
                { id: 6, name: '删除用户', code: 'user:delete', type: 'button', status: 1 }
              ]
            },
            {
              id: 7,
              name: '角色管理',
              code: 'role',
              type: 'menu',
              status: 1,
              children: [
                { id: 8, name: '查看角色', code: 'role:view', type: 'button', status: 1 },
                { id: 9, name: '创建角色', code: 'role:create', type: 'button', status: 1 },
                { id: 10, name: '编辑角色', code: 'role:update', type: 'button', status: 1 },
                { id: 11, name: '删除角色', code: 'role:delete', type: 'button', status: 1 },
                { id: 12, name: '分配角色', code: 'role:assign', type: 'button', status: 1 }
              ]
            }
          ]
        }
      ]
      
      allPermissionsCache.value = mockPermissions
      allPermissionsCacheTime.value = now
      return mockPermissions
    } catch (error) {
      console.error('获取所有权限失败:', error)
      ElMessage.error('获取所有权限失败')
      return []
    }
  }

  /**
   * 清除权限缓存
   */
  const clearPermissionCache = (): void => {
    allPermissionsCache.value = []
    allPermissionsCacheTime.value = 0
  }

  return {
    // 权限状态
    permissions,

    // 权限管理方法
    getAllPermissions,
    clearPermissionCache
  }
}, {
  persist: {
    key: 'permissionStore',
    storage: localStorage,
    paths: []
  }
})