// Global type definitions
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export interface User {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  status: number
  avatar?: string
  createTime: Date
  updateTime: Date
  roles: Role[]
  organizations: Organization[]
  channels?: string[]
}

export interface Role {
  id: number
  name: string
  code: string
  description: string
  status: number
  createTime: Date
  updateTime: Date
}

export interface Organization {
  id: number
  name: string
  code: string
  parentId: number | null
  level: number
  sort: number
  status: number
  description: string
  createTime: Date
  updateTime: Date
}

export interface Permission {
  id: number
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  parentId: number | null
  path?: string
  component?: string
  icon?: string
  sort: number
  status: number
  children?: Permission[]
}

export interface LoginRequest {
  username: string
  password: string
  channel: string
  captcha?: string
  captchaKey?: string
  captchaType?: string
  deviceId?: string
  deviceInfo?: string
  clientVersion?: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  expiration: Date
  refreshExpiration: Date
  userId: number
  username: string
  nickname: string
  roles: string[]
  permissions: string[]
  channelConfig: Record<string, any>
}