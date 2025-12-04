import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import pinia from './store'

// 引入全局样式
import './assets/styles/variables.css'
import './assets/styles/global.css'

// 引入错误处理和日志工具
import { setupGlobalErrorHandler } from './utils/errorHandler'
import logger from './utils/logger'

// 创建Vue应用实例
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 配置全局错误处理
setupGlobalErrorHandler(app)

// 记录应用启动日志
logger.info('应用启动', {
  appName: 'bing-admin',
  version: '1.0.0',
  timestamp: new Date().toISOString()
})

// 使用插件
app.use(ElementPlus)
app.use(router)
app.use(pinia)

// 挂载应用
app.mount('#app')

// 记录应用挂载完成日志
logger.info('应用挂载完成', {
  element: '#app'
})