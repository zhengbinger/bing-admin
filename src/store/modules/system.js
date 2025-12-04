import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import userApi from '../../api/user'

/**
 * 系统状态管理
 * 管理主题、布局、菜单状态等系统配置
 */
export const useSystemStore = defineStore('system', () => {
  // 状态
  const sidebarCollapsed = ref(false)
  const theme = ref(localStorage.getItem('theme') || 'light')
  const language = ref(localStorage.getItem('language') || 'zh-CN')
  const breadcrumb = ref(true)
  const tagsView = ref(true)
  const menuTree = ref([])
  const menuLoading = ref(false)

  // 计算属性
  const isDarkTheme = computed(() => theme.value === 'dark')

  /**
   * 切换侧边栏折叠状态
   */
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  /**
   * 设置侧边栏折叠状态
   * @param {Boolean} collapsed 是否折叠
   */
  const setSidebarCollapsed = (collapsed) => {
    sidebarCollapsed.value = collapsed
  }

  /**
   * 切换主题
   * @param {String} newTheme 新主题（light/dark）
   */
  const toggleTheme = (newTheme) => {
    theme.value = newTheme || (theme.value === 'light' ? 'dark' : 'light')
    localStorage.setItem('theme', theme.value)
    applyTheme()
  }

  /**
   * 设置语言
   * @param {String} lang 语言代码（zh-CN/en-US）
   */
  const setLanguage = (lang) => {
    language.value = lang
    localStorage.setItem('language', lang)
  }

  /**
   * 设置面包屑显示状态
   * @param {Boolean} visible 是否显示
   */
  const setBreadcrumbVisible = (visible) => {
    breadcrumb.value = visible
  }

  /**
   * 设置标签页显示状态
   * @param {Boolean} visible 是否显示
   */
  const setTagsViewVisible = (visible) => {
    tagsView.value = visible
  }

  /**
   * 应用主题
   */
  const applyTheme = () => {
    if (isDarkTheme.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  /**
   * 获取用户菜单树
   */
  const getUserMenuTree = async () => {
    menuLoading.value = true
    try {
      const response = await userApi.getUserMenuTree()
      menuTree.value = response.data
      return response.data
    } catch (error) {
      console.error('获取菜单树失败:', error)
      menuTree.value = []
      throw error
    } finally {
      menuLoading.value = false
    }
  }

  /**
   * 清除菜单树
   */
  const clearMenuTree = () => {
    menuTree.value = []
  }

  return {
    sidebarCollapsed,
    theme,
    language,
    breadcrumb,
    tagsView,
    menuTree,
    menuLoading,
    isDarkTheme,
    toggleSidebar,
    setSidebarCollapsed,
    toggleTheme,
    setLanguage,
    setBreadcrumbVisible,
    setTagsViewVisible,
    applyTheme,
    getUserMenuTree,
    clearMenuTree
  }
}, {
  persist: {
    key: 'systemStore',
    storage: localStorage,
    paths: ['sidebarCollapsed', 'theme', 'language', 'breadcrumb', 'tagsView']
  }
})
