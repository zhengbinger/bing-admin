/**
 * 认证相关类型定义
 */

// 登录请求接口
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

// 登录响应接口
export interface LoginResponse {
  token: string
  refreshToken: string
  expiration: Date | string
  refreshExpiration: Date | string
  userId: number
  username: string
  nickname: string
  roles: string[]
  permissions: string[]
  channelConfig: Record<string, any>
}

// 用户信息接口
export interface User {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  status: number
  avatar?: string
  createTime: Date | string
  updateTime: Date | string
  roles: Role[]
  organizations: Organization[]
  channels?: string[]
  permissions?: string[]
}

// 角色接口
export interface Role {
  id: number
  name: string
  code: string
  description: string
  status: number
  createTime: Date | string
  updateTime: Date | string
}

// 组织接口
export interface Organization {
  id: number
  name: string
  code: string
  parentId: number | null
  level: number
  sort: number
  status: number
  description: string
  createTime: Date | string
  updateTime: Date | string
}

// 权限接口
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

// 修改密码请求接口
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// 认证状态接口
export interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  permissions: string[]
  isAuthenticated: boolean
  isLoading: boolean
  loginTime: Date | null
  expirationTime: Date | null
}

// 会话信息接口
export interface SessionInfo {
  userId: number
  username: string
  loginTime: Date
  lastActiveTime: Date
  ipAddress: string
  userAgent: string
  deviceId?: string
}