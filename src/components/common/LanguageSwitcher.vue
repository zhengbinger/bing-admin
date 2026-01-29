<template>
  <el-dropdown 
    trigger="click" 
    @command="handleLanguageChange"
    class="language-switcher"
  >
    <el-button text class="language-button">
      <span class="flag">{{ currentLocaleInfo.flag }}</span>
      <span class="name">{{ currentLocaleInfo.shortName }}</span>
      <el-icon class="arrow">
        <ArrowDown />
      </el-icon>
    </el-button>
    
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item 
          v-for="locale in supportedLocales" 
          :key="locale.value"
          :command="locale.value"
          :disabled="locale.value === currentLocale"
          class="language-item"
        >
          <span class="flag">{{ locale.flag }}</span>
          <span class="name">{{ locale.label }}</span>
          <el-icon v-if="locale.value === currentLocale" class="check">
            <Check />
          </el-icon>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ArrowDown, Check } from '@element-plus/icons-vue'
import { useI18n } from '@/composables/useI18n'
import type { SupportLocale } from '@/i18n'

// 使用国际化
const { 
  currentLocale, 
  currentLocaleInfo, 
  supportedLocales, 
  switchLocale,
  t 
} = useI18n()

/**
 * 处理语言切换
 */
const handleLanguageChange = async (locale: SupportLocale) => {
  try {
    await switchLocale(locale)
    ElMessage.success(t('language.switch'))
  } catch (error) {
    console.error('Language switch failed:', error)
    ElMessage.error('Language switch failed')
  }
}
</script>

<style lang="scss" scoped>
.language-switcher {
  .language-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .flag {
      font-size: 16px;
    }

    .name {
      font-size: 14px;
      font-weight: 500;
    }

    .arrow {
      font-size: 12px;
      transition: transform 0.2s;
    }
  }

  &.is-active .language-button .arrow {
    transform: rotate(180deg);
  }
}

.language-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;

  .flag {
    font-size: 16px;
  }

  .name {
    flex: 1;
    font-size: 14px;
  }

  .check {
    font-size: 14px;
    color: var(--el-color-primary);
  }

  &.is-disabled {
    .name {
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }
}
</style>