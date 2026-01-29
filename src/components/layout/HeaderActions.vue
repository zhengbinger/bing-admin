<!--
  头部操作组件
  包含用户信息、通知、主题切换、语言选择等功能
-->
<template>
  <div class="header-actions">
    <!-- 搜索 -->
    <div class="action-item search-item">
      <el-tooltip content="搜索" placement="bottom">
        <el-button
          :icon="Search"
          circle
          text
          @click="handleSearch"
        />
      </el-tooltip>
    </div>

    <!-- 全屏切换 -->
    <div class="action-item">
      <el-tooltip :content="isFullscreen ? t('layout.exitFullscreen') : t('layout.fullscreen')" placement="bottom">
        <el-button
          :icon="isFullscreen ? Aim : FullScreen"
          circle
          text
          @click="toggleFullscreen"
        />
      </el-tooltip>
    </div>

    <!-- 主题切换 -->
    <div class="action-item">
      <el-tooltip :content="isDarkTheme ? t('theme.light') : t('theme.dark')" placement="bottom">
        <el-button
          :icon="isDarkTheme ? Sunny : Moon"
          circle
          text
          @click="toggleTheme"
        />
      </el-tooltip>
    </div>

    <!-- 语言切换 -->
    <div class="action-item">
      <LanguageSwitcher />
    </div>

    <!-- 通知 -->
    <div class="action-item">
      <el-badge :value="notificationCount" :hidden="notificationCount === 0">
        <el-button
          :icon="Bell"
          circle
          text
          @click="handleNotification"
        />
      </el-badge>
    </div>

    <!-- 用户菜单 -->
    <div class="action-item user-item">
      <el-dropdown @command="handleUserCommand">
        <div class="user-info">
          <el-avatar
            :size="32"
            :src="userAvatar"
            :icon="UserFilled"
            class="user-avatar"
          />
          <span class="user-name">{{ userName }}</span>
          <el-icon class="user-arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              <span>{{ t('auth.profile') }}</span>
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              <span>{{ t('auth.settings') }}</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              <span>{{ t('auth.logout') }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  FullScreen,
  Aim,
  Moon,
  Sunny,
  Bell,
  UserFilled,
  User,
  Setting,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'
import { useAuthStore } from '../../store/modules/auth'
import { useLayoutStore } from '../../store/modules/layout'
import LanguageSwitcher from '../common/LanguageSwitcher.vue'
import { useI18n } from '@/composables/useI18n'

// 路由和状态
const router = useRouter()
const authStore = useAuthStore()
const layoutStore = useLayoutStore()
const { t } = useI18n()

// 全屏状态
const isFullscreen = ref(false)

// 通知数量（模拟数据）
const notificationCount = ref(3)

// 计算属性
const isDarkTheme = computed(() => layoutStore.isDarkTheme)
const userName = computed(() => authStore.user?.nickname || authStore.user?.username || t('auth.profile'))
const userAvatar = computed(() => authStore.user?.avatar)

// 搜索处理
const handleSearch = () => {
  ElMessage.info(t('message.info'))
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 主题切换
const toggleTheme = () => {
  layoutStore.toggleTheme()
}

// 语言切换 - 移除旧的处理函数，现在由 LanguageSwitcher 组件处理

// 通知处理
const handleNotification = () => {
  ElMessage.info(t('message.info'))
}

// 用户菜单处理
const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      t('message.exitConfirm'),
      t('message.confirm'),
      {
        confirmButtonText: t('app.confirm'),
        cancelButtonText: t('app.cancel'),
        type: 'warning'
      }
    )

    await authStore.logout()
    router.push('/login')
  } catch (error) {
    // 用户取消操作
  }
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 生命周期
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style lang="scss" scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;

  .action-item {
    display: flex;
    align-items: center;

    &.search-item {
      margin-right: 8px;
    }

    &.user-item {
      margin-left: 8px;
    }

    .el-button {
      width: 36px;
      height: 36px;
      color: var(--el-text-color-primary);

      &:hover {
        background: var(--el-fill-color-light);
      }
    }

    .el-badge {
      :deep(.el-badge__content) {
        top: 8px;
        right: 8px;
      }
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background: var(--el-fill-color-light);
    }

    .user-avatar {
      margin-right: 8px;
    }

    .user-name {
      font-size: 14px;
      color: var(--el-text-color-primary);
      margin-right: 4px;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-arrow {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      transition: transform 0.3s;
    }

    &:hover .user-arrow {
      transform: rotate(180deg);
    }
  }

  .language-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .flag {
      font-size: 16px;
    }
  }

  :deep(.el-dropdown-menu__item) {
    &.is-active {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .el-icon {
      margin-right: 8px;
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .header-actions {
    gap: 4px;

    .action-item {
      &.search-item {
        display: none;
      }

      .el-button {
        width: 32px;
        height: 32px;
      }
    }

    .user-info {
      .user-name {
        display: none;
      }
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .header-actions {
    .action-item {
      .el-button {
        &:hover {
          background: var(--el-fill-color-dark);
        }
      }
    }

    .user-info {
      &:hover {
        background: var(--el-fill-color-dark);
      }
    }
  }
}
</style>