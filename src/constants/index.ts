// API相关常量
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const UPLOAD_URL = import.meta.env.VITE_APP_UPLOAD_URL

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  LANGUAGE: 'language',
  THEME: 'theme',
  SIDEBAR_STATUS: 'sidebar_status'
} as const

// 用户状态
export const USER_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
} as const

// 角色状态
export const ROLE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
} as const

// 组织状态
export const ORGANIZATION_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
} as const

// 权限类型
export const PERMISSION_TYPE = {
  MENU: 'menu',
  BUTTON: 'button',
  API: 'api'
} as const

// 页面大小选项
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// 默认页面大小
export const DEFAULT_PAGE_SIZE = 20

// 支持的语言
export const SUPPORTED_LANGUAGES = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' }
]

// 默认语言
export const DEFAULT_LANGUAGE = 'zh-CN'

// 主题选项
export const THEME_OPTIONS = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' }
]

// 默认主题
export const DEFAULT_THEME = 'light'

// HTTP状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

// 业务状态码
export const BUSINESS_CODE = {
  SUCCESS: 200,
  FAIL: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422
} as const