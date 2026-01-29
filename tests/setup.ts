import { vi } from 'vitest'

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_APP_TITLE: 'Bing Admin System',
    VITE_API_BASE_URL: 'http://localhost:8080/api',
    VITE_APP_BASE_API: '/api',
    VITE_APP_UPLOAD_URL: 'http://localhost:8080/api/upload',
    VITE_APP_WEBSOCKET_URL: 'ws://localhost:8080/ws',
    NODE_ENV: 'test'
  }
}))

// Create a proper localStorage mock that actually stores values
const localStorageData: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageData[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageData[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageData[key]
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageData).forEach(key => delete localStorageData[key])
  })
}
vi.stubGlobal('localStorage', localStorageMock)

// Create a proper sessionStorage mock that actually stores values
const sessionStorageData: Record<string, string> = {}
const sessionStorageMock = {
  getItem: vi.fn((key: string) => sessionStorageData[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    sessionStorageData[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete sessionStorageData[key]
  }),
  clear: vi.fn(() => {
    Object.keys(sessionStorageData).forEach(key => delete sessionStorageData[key])
  })
}
vi.stubGlobal('sessionStorage', sessionStorageMock)

// Mock HTTP Client with proper response structure
vi.mock('@/api/client', () => ({
  httpClient: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} })
  }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  },
  ElMenu: {
    name: 'ElMenu',
    template: '<div class="el-menu"><slot /></div>'
  },
  ElMenuItem: {
    name: 'ElMenuItem',
    template: '<div class="el-menu-item"><slot /></div>'
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot /></i>'
  }
}))

// Mock Vue I18n with better translation support
const translations: Record<string, Record<string, string>> = {
  'zh-CN': {
    'app.title': 'Bing 管理后台',
    'language.switch': '语言切换成功',
    'common.success': '成功'
  },
  'en-US': {
    'app.title': 'Bing Admin',
    'language.switch': 'Language switched successfully',
    'common.success': 'Success'
  }
}

// Create a global locale state that can be shared across instances
let globalLocale = 'zh-CN'

// Export for testing
export { globalLocale }

// Create a reactive locale object
const createLocaleRef = () => {
  return {
    get value() {
      return globalLocale
    },
    set value(newValue: string) {
      globalLocale = newValue
    }
  }
}

vi.mock('vue-i18n', () => ({
  useI18n: () => {
    const locale = createLocaleRef()
    return {
      t: vi.fn((key: string) => translations[globalLocale]?.[key] || key),
      d: vi.fn((date: Date) => date.toLocaleDateString()),
      n: vi.fn((number: number, format?: string) => {
        if (format === 'currency') {
          return globalLocale === 'zh-CN' ? `¥${number}` : `$${number}`
        }
        if (format === 'percent') {
          return `${number}%`
        }
        return number.toLocaleString()
      }),
      locale
    }
  },
  createI18n: vi.fn(() => {
    const locale = createLocaleRef()
    return {
      global: {
        t: vi.fn((key: string) => translations[globalLocale]?.[key] || key),
        d: vi.fn((date: Date) => date.toLocaleDateString()),
        n: vi.fn((number: number, format?: string) => {
          if (format === 'currency') {
            return globalLocale === 'zh-CN' ? `¥${number}` : `$${number}`
          }
          if (format === 'percent') {
            return `${number}%`
          }
          return number.toLocaleString()
        }),
        locale
      }
    }
  })
}))

// Reset storage and global state before each test
beforeEach(() => {
  Object.keys(localStorageData).forEach(key => delete localStorageData[key])
  Object.keys(sessionStorageData).forEach(key => delete sessionStorageData[key])
  globalLocale = 'zh-CN' // Reset global locale
  
  // Reset all mocks
  vi.clearAllMocks()
})