import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import { useUserStore } from '../store/modules/user'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '', // API基础路径
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 加载实例
let loadingInstance = null

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 显示加载动画
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.5)'
    })

    // 获取用户token
    const userStore = useUserStore()
    const token = userStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    // 隐藏加载动画
    if (loadingInstance) {
      loadingInstance.close()
    }
    console.error('请求错误:', error)
    ElMessage.error('请求发送失败，请稍后重试')
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 隐藏加载动画
    if (loadingInstance) {
      loadingInstance.close()
    }

    const res = response.data

    // 检查响应状态
    if (res.code !== 200) {
      // 特殊错误处理
      if (res.code === 401) {
        // 未登录或token过期
        // 检查是否是登录请求，如果是则不触发登出逻辑
        if (response.config.url !== '/auth/login') {
          ElMessage.error('登录已过期，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          window.location.href = '/login'
        }
      } else if (res.code === 403) {
        // 无权限
        ElMessage.error('您没有操作权限')
      } else {
        // 其他错误
        ElMessage.error(res.message || '操作失败')
      }
      return Promise.reject(new Error(res.message || 'Error'))
    }

    return res
  },
  error => {
    // 隐藏加载动画
    if (loadingInstance) {
      loadingInstance.close()
    }

    console.error('响应错误:', error)

    // 网络错误处理
    if (error.message.includes('Network Error')) {
      ElMessage.error('网络连接失败，请检查网络设置')
    } else if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请稍后重试')
    } else if (error.response) {
      // HTTP状态码错误
      const status = error.response.status
      const config = error.response.config
      switch (status) {
        case 400:
          ElMessage.error('请求参数错误')
          break
        case 401:
          // 检查是否是登录请求，如果是则不触发登出逻辑
          if (config.url !== '/auth/login') {
            ElMessage.error('登录已过期，请重新登录')
            const userStore = useUserStore()
            userStore.logout()
            window.location.href = '/login'
          }
          break
        case 403:
          ElMessage.error('您没有操作权限')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        case 502:
          ElMessage.error('网关错误')
          break
        case 503:
          ElMessage.error('服务暂时不可用')
          break
        case 504:
          ElMessage.error('网关超时')
          break
        default:
          ElMessage.error(`请求失败 (${status})`)
      }
    } else {
      ElMessage.error('请求失败，请稍后重试')
    }

    return Promise.reject(error)
  }
)

export default service
