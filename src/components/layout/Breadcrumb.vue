<!--
  面包屑导航组件
  显示当前页面的导航路径
-->
<template>
  <div class="breadcrumb-container">
    <el-breadcrumb separator="/" class="app-breadcrumb">
      <transition-group name="breadcrumb" tag="div" class="breadcrumb-list">
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumbList"
          :key="item.path"
          :class="{ 'no-redirect': item.redirect === 'noRedirect' }"
        >
          <span
            v-if="item.redirect === 'noRedirect' || index === breadcrumbList.length - 1"
            class="no-redirect"
          >
            {{ item.meta?.title || item.name }}
          </span>
          <a
            v-else
            @click.prevent="handleLink(item)"
            class="breadcrumb-link"
          >
            {{ item.meta?.title || item.name }}
          </a>
        </el-breadcrumb-item>
      </transition-group>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteLocationMatched } from 'vue-router'

// 路由
const route = useRoute()
const router = useRouter()

// 面包屑列表
const breadcrumbList = ref<RouteLocationMatched[]>([])

// 是否显示首页
const showHome = computed(() => {
  const first = breadcrumbList.value[0]
  return first && first.name !== 'Dashboard'
})

// 获取面包屑数据
const getBreadcrumb = () => {
  // 过滤掉不需要显示的路由
  let matched = route.matched.filter(item => {
    return item.meta && item.meta.title && item.meta.breadcrumb !== false
  })

  // 如果第一个不是首页，添加首页
  const first = matched[0]
  if (!isDashboard(first)) {
    matched = [
      {
        path: '/dashboard',
        name: 'Dashboard',
        meta: { title: '首页' }
      } as RouteLocationMatched,
      ...matched
    ]
  }

  breadcrumbList.value = matched
}

// 判断是否为首页
const isDashboard = (route?: RouteLocationMatched): boolean => {
  if (!route) return false
  const name = route.name
  return name === 'Dashboard' || name === 'Home'
}

// 处理面包屑点击
const handleLink = (item: RouteLocationMatched) => {
  const { redirect, path } = item
  
  if (redirect) {
    router.push(redirect as string)
    return
  }
  
  router.push(path)
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    getBreadcrumb()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.breadcrumb-container {
  display: flex;
  align-items: center;
  height: 100%;

  .app-breadcrumb {
    display: inline-block;
    font-size: 14px;
    line-height: 50px;

    .breadcrumb-list {
      display: flex;
      align-items: center;
    }

    .no-redirect {
      color: var(--el-text-color-secondary);
      cursor: text;
    }

    .breadcrumb-link {
      color: var(--el-text-color-primary);
      cursor: pointer;
      text-decoration: none;
      transition: color 0.3s;

      &:hover {
        color: var(--el-color-primary);
      }
    }

    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        font-weight: normal;
      }

      &:last-child {
        .el-breadcrumb__inner {
          color: var(--el-text-color-secondary);
        }
      }
    }

    :deep(.el-breadcrumb__separator) {
      margin: 0 8px;
      color: var(--el-text-color-placeholder);
    }
  }
}

// 面包屑动画
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.3s;
}

.breadcrumb-enter-from,
.breadcrumb-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-leave-active {
  position: absolute;
}

// 响应式适配
@media (max-width: 768px) {
  .breadcrumb-container {
    .app-breadcrumb {
      font-size: 13px;

      :deep(.el-breadcrumb__separator) {
        margin: 0 6px;
      }
    }
  }
}
</style>