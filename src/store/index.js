import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

/**
 * Pinia状态管理
 * 创建和配置Pinia实例
 */

// 创建Pinia实例
const pinia = createPinia()

// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

export default pinia

// 导出所有store
export * from './modules/user'
export * from './modules/system'
