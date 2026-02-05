/**
 * 日期时间工具函数
 */

/**
 * 格式化日期时间
 * @param date 日期字符串或Date对象
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date | null | undefined, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '-'
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) return '-'
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化相对时间
 * @param date 日期字符串或Date对象
 * @returns 相对时间字符串，如 "2小时前"
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) return '-'
  
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 获取日期范围
 * @param type 范围类型：'today' | 'yesterday' | 'week' | 'month' | 'year'
 * @returns [开始日期, 结束日期]
 */
export function getDateRange(type: 'today' | 'yesterday' | 'week' | 'month' | 'year'): [Date, Date] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (type) {
    case 'today':
      return [today, new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)]
    
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      return [yesterday, new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)]
    
    case 'week':
      const weekStart = new Date(today.getTime() - (today.getDay() || 7) * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
      return [weekStart, weekEnd]
    
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return [monthStart, monthEnd]
    
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1)
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      return [yearStart, yearEnd]
    
    default:
      return [today, new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)]
  }
}

/**
 * 判断是否为同一天
 * @param date1 日期1
 * @param date2 日期2
 * @returns 是否为同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

/**
 * 获取时间戳
 * @param date 日期，默认为当前时间
 * @returns 时间戳
 */
export function getTimestamp(date?: Date): number {
  return (date || new Date()).getTime()
}