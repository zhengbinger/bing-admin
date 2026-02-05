/**
 * 用户状态管理
 * 管理用户列表、用户详情等
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { User } from '../../types'

export const useUserStore = defineStore('user', () => {
  // ===== 用户状态 =====
  const users = ref<User[]>([])
  const allUsersCache = ref<User[]>([])
  const allUsersCacheTime = ref<number>(0)

  // ===== 用户管理方法 =====

  /**
   * 获取所有用户（用于角色分配）
   */
  const getAllUsers = async (forceRefresh = false): Promise<User[]> => {
    const now = Date.now()
    const cacheExpiry = 5 * 60 * 1000 // 5分钟缓存

    if (!forceRefresh && allUsersCache.value.length > 0 && (now - allUsersCacheTime.value) < cacheExpiry) {
      return allUsersCache.value
    }

    try {
      // TODO: 实际的API调用
      // const result = await userApiService.getAllUsers()
      
      // 临时模拟数据
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          realName: '系统管理员',
          email: 'admin@example.com',
          status: 1,
          createTime: '2024-01-01 00:00:00',
          updateTime: '2024-01-01 00:00:00'
        },
        {
          id: 2,
          username: 'user1',
          realName: '普通用户1',
          email: 'user1@example.com',
          status: 1,
          createTime: '2024-01-02 00:00:00',
          updateTime: '2024-01-02 00:00:00'
        },
        {
          id: 3,
          username: 'user2',
          realName: '普通用户2',
          email: 'user2@example.com',
          status: 0,
          createTime: '2024-01-03 00:00:00',
          updateTime: '2024-01-03 00:00:00'
        }
      ]
      
      allUsersCache.value = mockUsers
      allUsersCacheTime.value = now
      return mockUsers
    } catch (error) {
      console.error('获取所有用户失败:', error)
      ElMessage.error('获取所有用户失败')
      return []
    }
  }

  /**
   * 清除用户缓存
   */
  const clearUserCache = (): void => {
    allUsersCache.value = []
    allUsersCacheTime.value = 0
  }

  return {
    // 用户状态
    users,

    // 用户管理方法
    getAllUsers,
    clearUserCache
  }
}, {
  persist: {
    key: 'userStore',
    storage: localStorage,
    paths: []
  }
})