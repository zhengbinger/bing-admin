# Bing Admin 前端管理系统

## 项目概述

Bing Admin 是一个基于 Vue 3 + Element Plus 的企业级后台管理系统，完整对接 bing-framework 后端的所有功能接口。

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **HTTP 客户端**: Axios
- **构建工具**: Vite
- **开发语言**: JavaScript

## 功能模块

### 1. 认证管理
- ✅ 用户登录/登出
- ✅ 验证码支持（图片验证码）
- ✅ 多渠道登录（WEB、MOBILE、API、第三方）
- ✅ Token 自动刷新
- ✅ 权限路由控制

### 2. 系统管理
- ✅ 用户管理
- ✅ 角色管理
- ✅ 权限管理
- ✅ 组织管理
- ✅ 数据字典管理
- ✅ 系统配置管理
- ✅ 登录记录管理
- ✅ 白名单管理
- ✅ 第三方用户管理
- ✅ 审计日志管理

### 3. 缓存管理
- ✅ 缓存统计信息展示
- ✅ 缓存预热功能
- ✅ 缓存键查询和管理
- ✅ 缓存值查看和编辑
- ✅ 缓存清理功能

### 4. 微信小程序管理
- ✅ 微信配置管理
- ✅ 微信用户列表
- ✅ 用户绑定/解绑
- ✅ 用户信息展示

## API 接口对接

### 已完成的 API 模块

1. **认证 API** (`/api/auth`)
   - 登录、注册、登出
   - 获取当前用户信息
   - 刷新 Token
   - 修改密码

2. **用户管理 API** (`/api/user`)
   - 用户 CRUD 操作
   - 用户权限管理

3. **角色管理 API** (`/api/roles`)
   - 角色 CRUD 操作
   - 角色权限分配

4. **权限管理 API** (`/api/permissions`)
   - 权限 CRUD 操作
   - 权限树结构

5. **组织管理 API** (`/api/organization`)
   - 组织 CRUD 操作
   - 组织树结构

6. **系统配置 API** (`/api/system-config`)
   - 系统配置 CRUD 操作

7. **数据字典 API** (`/api/data-dict`)
   - 数据字典 CRUD 操作
   - 字典项管理

8. **登录记录 API** (`/api/loginRecords`)
   - 登录记录查询
   - 登录统计

9. **白名单管理 API** (`/api/white-list`)
   - 白名单 CRUD 操作

10. **验证码 API** (`/api/captcha`)
    - 验证码生成
    - 验证码配置

11. **缓存管理 API** (`/api/cache`)
    - 缓存统计
    - 缓存操作
    - 缓存监控

12. **审计日志 API** (`/api/audit-log/config`)
    - 审计日志查询
    - 日志导出

13. **微信小程序 API** (`/api/wechat`)
    - 微信登录
    - 用户信息获取
    - 用户绑定管理

14. **第三方用户 API** (`/api/third-party-user`)
    - 第三方用户管理
    - 用户绑定操作

15. **用户组织关联 API** (`/api/user-organization`)
    - 用户组织关系管理

## 项目结构

```
bing-admin/
├── src/
│   ├── api/                    # API 接口模块
│   │   ├── auth.js            # 认证相关 API
│   │   ├── user.js            # 用户管理 API
│   │   ├── role.js            # 角色管理 API
│   │   ├── permission.js      # 权限管理 API
│   │   ├── organization.js    # 组织管理 API
│   │   ├── systemConfig.js    # 系统配置 API
│   │   ├── dataDict.js        # 数据字典 API
│   │   ├── loginRecord.js     # 登录记录 API
│   │   ├── whiteList.js       # 白名单 API
│   │   ├── captcha.js         # 验证码 API
│   │   ├── cache.js           # 缓存管理 API
│   │   ├── auditLog.js        # 审计日志 API
│   │   ├── wechat.js          # 微信 API
│   │   ├── thirdPartyUser.js  # 第三方用户 API
│   │   ├── userOrganization.js # 用户组织 API
│   │   └── index.js           # API 统一导出
│   ├── assets/                # 静态资源
│   ├── components/            # 公共组件
│   ├── layout/                # 布局组件
│   ├── router/                # 路由配置
│   ├── store/                 # 状态管理
│   │   └── modules/
│   │       └── user.js        # 用户状态管理
│   ├── utils/                 # 工具函数
│   │   ├── request.js         # HTTP 请求封装
│   │   ├── storage.js         # 本地存储工具
│   │   └── index.js           # 工具函数
│   ├── views/                 # 页面组件
│   │   ├── Login.vue          # 登录页面
│   │   ├── Dashboard.vue      # 仪表盘
│   │   ├── User.vue           # 用户管理
│   │   ├── Role.vue           # 角色管理
│   │   ├── Permission.vue     # 权限管理
│   │   ├── Organization.vue   # 组织管理
│   │   ├── SystemConfig.vue   # 系统配置
│   │   ├── DataDict.vue       # 数据字典
│   │   ├── LoginRecord.vue    # 登录记录
│   │   ├── WhiteList.vue      # 白名单管理
│   │   ├── CacheManagement.vue # 缓存管理
│   │   ├── AuditLog.vue       # 审计日志
│   │   ├── ThirdPartyUser.vue # 第三方用户
│   │   ├── WechatManagement.vue # 微信管理
│   │   └── 404.vue            # 404 页面
│   ├── App.vue                # 根组件
│   └── main.js                # 入口文件
├── .env.development           # 开发环境配置
├── .env.production            # 生产环境配置
├── package.json               # 项目依赖
├── vite.config.js             # Vite 配置
└── README.md                  # 项目说明
```

## 核心特性

### 1. 权限控制
- 基于角色的权限控制（RBAC）
- 动态路由加载
- 按钮级权限控制
- 菜单权限过滤

### 2. 用户体验
- 响应式设计，支持移动端
- 国际化支持
- 主题切换
- 加载状态管理
- 错误处理机制

### 3. 开发体验
- TypeScript 支持（可选）
- 热重载开发
- 代码分割
- 懒加载路由
- API 统一管理

### 4. 安全特性
- JWT Token 认证
- 请求拦截器
- 响应拦截器
- XSS 防护
- CSRF 防护

## 环境配置

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产环境
```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## API 基础配置

### 开发环境
- API 基础路径: `http://localhost:8081/api`

### 生产环境
- API 基础路径: `/api`

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 更新日志

### v1.0.0 (2025-12-15)
- ✅ 完成所有后端 API 接口对接
- ✅ 实现完整的权限控制系统
- ✅ 添加缓存管理功能
- ✅ 添加审计日志功能
- ✅ 添加第三方用户管理
- ✅ 添加微信小程序管理
- ✅ 优化用户界面和交互体验
- ✅ 完善错误处理和加载状态

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。