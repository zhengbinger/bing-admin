/**
 * 本地存储工具类
 * 封装localStorage和sessionStorage的常用操作
 * 提供类型转换和异常处理
 * 
 * @author zhengbing
 * @date 2025-11-11
 */

// 存储类型枚举
const StorageType = {
  LOCAL: 'localStorage',
  SESSION: 'sessionStorage'
}

/**
 * 获取存储对象
 * @param {string} type - 存储类型
 * @returns {Storage} 存储对象
 */
const getStorage = (type = StorageType.LOCAL) => {
  return type === StorageType.LOCAL ? localStorage : sessionStorage
}

/**
 * 存储数据
 * @param {string} key - 存储键名
 * @param {any} value - 存储值
 * @param {string} type - 存储类型
 * @returns {boolean} 是否存储成功
 */
export const setItem = (key, value, type = StorageType.LOCAL) => {
  try {
    const storage = getStorage(type)
    const jsonValue = JSON.stringify(value)
    storage.setItem(key, jsonValue)
    return true
  } catch (error) {
    console.error(`存储数据失败 [${key}]:`, error)
    return false
  }
}

/**
 * 获取数据
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值
 * @param {string} type - 存储类型
 * @returns {any} 获取的值或默认值
 */
export const getItem = (key, defaultValue = null, type = StorageType.LOCAL) => {
  try {
    const storage = getStorage(type)
    const jsonValue = storage.getItem(key)
    return jsonValue !== null ? JSON.parse(jsonValue) : defaultValue
  } catch (error) {
    console.error(`获取数据失败 [${key}]:`, error)
    return defaultValue
  }
}

/**
 * 删除数据
 * @param {string} key - 存储键名
 * @param {string} type - 存储类型
 * @returns {boolean} 是否删除成功
 */
export const removeItem = (key, type = StorageType.LOCAL) => {
  try {
    const storage = getStorage(type)
    storage.removeItem(key)
    return true
  } catch (error) {
    console.error(`删除数据失败 [${key}]:`, error)
    return false
  }
}

/**
 * 清除所有数据
 * @param {string} type - 存储类型
 * @returns {boolean} 是否清除成功
 */
export const clear = (type = StorageType.LOCAL) => {
  try {
    const storage = getStorage(type)
    storage.clear()
    return true
  } catch (error) {
    console.error('清除数据失败:', error)
    return false
  }
}

/**
 * 批量存储数据
 * @param {Object} data - 要存储的键值对对象
 * @param {string} type - 存储类型
 * @returns {boolean} 是否全部存储成功
 */
export const setItems = (data, type = StorageType.LOCAL) => {
  try {
    Object.entries(data).forEach(([key, value]) => {
      setItem(key, value, type)
    })
    return true
  } catch (error) {
    console.error('批量存储数据失败:', error)
    return false
  }
}

/**
 * 批量获取数据
 * @param {Array<string>} keys - 要获取的键名数组
 * @param {Object} defaultValues - 默认值对象
 * @param {string} type - 存储类型
 * @returns {Object} 获取的键值对对象
 */
export const getItems = (keys, defaultValues = {}, type = StorageType.LOCAL) => {
  try {
    const result = {}
    keys.forEach(key => {
      result[key] = getItem(key, defaultValues[key], type)
    })
    return result
  } catch (error) {
    console.error('批量获取数据失败:', error)
    return defaultValues
  }
}

/**
 * 检查存储是否可用
 * @param {string} type - 存储类型
 * @returns {boolean} 存储是否可用
 */
export const isStorageAvailable = (type = StorageType.LOCAL) => {
  try {
    const storage = getStorage(type)
    const testKey = '__test_storage__'
    storage.setItem(testKey, testKey)
    storage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}

// 导出localStorage快捷方法
export const local = {
  set: (key, value) => setItem(key, value, StorageType.LOCAL),
  get: (key, defaultValue) => getItem(key, defaultValue, StorageType.LOCAL),
  remove: (key) => removeItem(key, StorageType.LOCAL),
  clear: () => clear(StorageType.LOCAL),
  setItems: (data) => setItems(data, StorageType.LOCAL),
  getItems: (keys, defaultValues) => getItems(keys, defaultValues, StorageType.LOCAL)
}

// 导出sessionStorage快捷方法
export const session = {
  set: (key, value) => setItem(key, value, StorageType.SESSION),
  get: (key, defaultValue) => getItem(key, defaultValue, StorageType.SESSION),
  remove: (key) => removeItem(key, StorageType.SESSION),
  clear: () => clear(StorageType.SESSION),
  setItems: (data) => setItems(data, StorageType.SESSION),
  getItems: (keys, defaultValues) => getItems(keys, defaultValues, StorageType.SESSION)
}

export default {
  StorageType,
  setItem,
  getItem,
  removeItem,
  clear,
  setItems,
  getItems,
  isStorageAvailable,
  local,
  session
}