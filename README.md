# Bing Admin 前端项目

## 项目介绍

Bing Admin 是一个基于 Vue 3 + Element Plus 构建的现代化企业级后台管理系统前端解决方案。该系统采用响应式设计，提供了完整的用户认证、权限管理、角色分配等核心功能模块，适用于各类企业级应用的管理后台开发。

## 技术栈

- **前端框架**: Vue 3.4.21
- **路由管理**: Vue Router 4.3.0
- **HTTP 客户端**: Axios 1.6.7
- **UI 组件库**: Element Plus 2.5.6
- **构建工具**: Vite 5.1.6
- **语言**: JavaScript

## 功能特性

- ✅ 现代化登录界面，支持响应式设计
- ✅ 完整的权限管理体系（用户、角色、权限）
- ✅ 路由守卫与权限控制
- ✅ 优雅的 UI 设计与交互体验
- ✅ 中文本地化支持
- ✅ 模块化的项目结构

## 项目结构

```
bing-admin/
├── public/            # 静态资源
├── src/
│   ├── assets/        # 项目资源（样式、图片等）
│   ├── components/    # 通用组件
│   ├── layout/        # 布局组件
│   ├── router/        # 路由配置
│   ├── views/         # 页面视图
│   ├── App.vue        # 应用入口组件
│   └── main.js        # 应用入口文件
├── index.html         # HTML 模板
├── package.json       # 项目配置和依赖
├── vite.config.js     # Vite 配置
└── README.md          # 项目文档
```

## 安装与运行

### 前置要求

- Node.js 16.0 或更高版本
- npm 8.0 或更高版本

### 安装依赖

```bash
# 进入项目目录
cd bing-admin

# 安装依赖
npm install
```

### 开发环境运行

```bash
npm run dev
```

运行后，可通过浏览器访问 `http://localhost:3000` 查看项目。

### 生产环境构建

```bash
npm run build
```

构建后的文件将生成在 `dist` 目录中。

### 预览构建结果

```bash
npm run preview
```

## 主要页面功能

### 1. 登录页面 (/login)

提供用户登录功能，包含用户名和密码输入框，支持记住密码等功能。登录成功后跳转到首页。

### 2. 仪表盘 (/dashboard)

系统首页，展示关键指标和数据概览。

### 3. 用户管理 (/user)

管理系统用户，支持用户的增删改查操作。

### 4. 角色管理 (/role)

管理系统角色，支持角色的增删改查和权限分配。

### 5. 权限管理 (/permission)

管理系统权限，支持权限的增删改查操作。

## 路由配置

系统使用 Vue Router 进行路由管理，并实现了路由守卫功能，确保只有已登录用户才能访问受保护的页面。

```javascript
// 路由守卫示例
router.beforeEach((to, from, next) => {
  // 检查页面标题
  document.title = to.meta.title || 'Bing Admin'
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 检查是否已登录
    const token = localStorage.getItem('token')
    if (token) {
      next()
    } else {
      next({ name: 'login' })
    }
  } else {
    next()
  }
})
```

## API 接口

系统使用 Axios 进行 API 请求，与后端服务交互。主要接口包括：

- 用户登录接口
- 用户管理相关接口
- 角色管理相关接口
- 权限管理相关接口

注：当前为演示环境，部分接口使用模拟数据。

## 开发说明

### 添加新页面

1. 在 `src/views/` 目录下创建新的 Vue 组件
2. 在 `src/router/index.js` 中配置路由
3. 根据需要添加权限配置

### 样式定制

系统使用 Element Plus 作为 UI 组件库，可以通过覆盖默认样式或使用 Element Plus 的主题定制功能来调整界面样式。

## 浏览器兼容性

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

本项目采用 MIT 许可证。

## 联系方式

如有任何问题或建议，请联系项目维护者。

---

*Bing Admin - 企业级后台管理系统解决方案*