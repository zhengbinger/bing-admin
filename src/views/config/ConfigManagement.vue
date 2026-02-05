<template>
  <div class="config-container">
    <div class="page-header">
      <h2>{{ $t('config.management') }}</h2>
      <div class="header-actions">
        <el-button :icon="Download" @click="handleBackup">
          {{ $t('config.backup') }}
        </el-button>
        <el-button :icon="Upload" @click="handleRestore">
          {{ $t('config.restore') }}
        </el-button>
        <el-button :icon="Clock" @click="showChangeHistory">
          {{ $t('config.changeHistory') }}
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          {{ $t('common.save') }}
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 配置分组 -->
      <el-col :span="6">
        <el-card>
          <template #header>
            <span>{{ $t('config.groups') }}</span>
          </template>
          <el-menu
            :default-active="activeGroup"
            @select="handleGroupSelect"
          >
            <el-menu-item
              v-for="group in configGroups"
              :key="group.name"
              :index="group.name"
            >
              {{ group.label }}
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 配置项 -->
      <el-col :span="18">
        <el-card v-if="currentGroup">
          <template #header>
            <div class="group-header">
              <span>{{ currentGroup.label }}</span>
              <el-text type="info" size="small">
                {{ currentGroup.description }}
              </el-text>
            </div>
          </template>
          
          <el-form :model="configValues" label-width="200px">
            <div
              v-for="config in currentGroup.configs"
              :key="config.key"
              class="config-item"
            >
              <el-form-item
                :label="config.key"
                :prop="config.key"
                :required="config.required"
              >
                <template #label>
                  <div class="config-label">
                    <span>{{ config.key }}</span>
                    <el-tooltip v-if="config.description" :content="config.description">
                      <el-icon><QuestionFilled /></el-icon>
                    </el-tooltip>
                  </div>
                </template>
                
                <!-- 字符串类型 -->
                <el-input
                  v-if="config.type === 'string'"
                  v-model="configValues[config.key]"
                  :placeholder="config.defaultValue"
                />
                
                <!-- 数字类型 -->
                <el-input-number
                  v-else-if="config.type === 'number'"
                  v-model="configValues[config.key]"
                  :placeholder="config.defaultValue"
                />
                
                <!-- 布尔类型 -->
                <el-switch
                  v-else-if="config.type === 'boolean'"
                  v-model="configValues[config.key]"
                />
                
                <!-- 选项类型 -->
                <el-select
                  v-else-if="config.options"
                  v-model="configValues[config.key]"
                  :placeholder="config.defaultValue"
                >
                  <el-option
                    v-for="option in config.options"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
                
                <!-- JSON类型 -->
                <el-input
                  v-else-if="config.type === 'json'"
                  v-model="configValues[config.key]"
                  type="textarea"
                  :rows="4"
                  :placeholder="config.defaultValue"
                />
                
                <div class="config-actions">
                  <el-button
                    size="small"
                    @click="handleReset(config)"
                  >
                    {{ $t('config.reset') }}
                  </el-button>
                </div>
              </el-form-item>
            </div>
          </el-form>
        </el-card>
        
        <el-empty v-else :description="$t('config.selectGroup')" />
      </el-col>
    </el-row>

    <!-- 恢复对话框 -->
    <el-dialog v-model="restoreDialogVisible" :title="$t('config.restore')" width="400px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :limit="1"
        accept=".json"
        @change="handleFileChange"
      >
        <el-button type="primary">{{ $t('config.selectFile') }}</el-button>
      </el-upload>
      
      <template #footer>
        <el-button @click="restoreDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmRestore" :loading="restoring">
          {{ $t('config.confirmRestore') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 变更历史对话框 -->
    <el-dialog v-model="historyDialogVisible" :title="$t('config.changeHistory')" width="800px">
      <el-table :data="configLogs" v-loading="loadingLogs">
        <el-table-column prop="timestamp" :label="$t('config.timestamp')" width="180">
          <template #default="{ row }">
            {{ new Date(row.timestamp).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="action" :label="$t('config.action')" width="120">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)">
              {{ $t(`config.actions.${row.action}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="group" :label="$t('config.group')" width="120" />
        <el-table-column :label="$t('config.changes')">
          <template #default="{ row }">
            <div v-if="row.changes" class="changes-list">
              <div v-for="change in row.changes" :key="change.key" class="change-item">
                <strong>{{ change.key }}:</strong>
                <span class="old-value">{{ change.oldValue }}</span>
                →
                <span class="new-value">{{ change.newValue }}</span>
              </div>
            </div>
            <span v-else-if="row.filename">{{ $t('config.restoreFrom', { filename: row.filename }) }}</span>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-if="logTotal > 0"
        v-model:current-page="logPage"
        v-model:page-size="logPageSize"
        :total="logTotal"
        @current-change="loadConfigLogs"
        layout="prev, pager, next, sizes, total"
        :page-sizes="[10, 20, 50]"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Upload, QuestionFilled, Clock } from '@element-plus/icons-vue'
import { configApiService, type ConfigGroup, type ConfigChangeLog } from '@/api/services/config'

const { t } = useI18n()

const configGroups = ref<ConfigGroup[]>([])
const activeGroup = ref('')
const configValues = reactive<Record<string, any>>({})
const saving = ref(false)
const restoreDialogVisible = ref(false)
const restoring = ref(false)
const uploadRef = ref()
const restoreFile = ref<File | null>(null)
const historyDialogVisible = ref(false)
const configLogs = ref<ConfigChangeLog[]>([])
const loadingLogs = ref(false)
const logPage = ref(1)
const logPageSize = ref(20)
const logTotal = ref(0)

const currentGroup = computed(() => 
  configGroups.value.find(g => g.name === activeGroup.value)
)

const loadConfigs = async () => {
  try {
    configGroups.value = await configApiService.getConfigs()
    if (configGroups.value.length > 0) {
      activeGroup.value = configGroups.value[0].name
      loadGroupConfigs()
    }
  } catch (error) {
    ElMessage.error('加载配置失败')
  }
}

const loadGroupConfigs = () => {
  if (!currentGroup.value) return
  
  currentGroup.value.configs.forEach(config => {
    configValues[config.key] = config.value
  })
}

const handleGroupSelect = (groupName: string) => {
  activeGroup.value = groupName
  loadGroupConfigs()
}

const handleSave = async () => {
  if (!currentGroup.value) return
  
  // 检查是否有关键配置修改
  const criticalConfigs = currentGroup.value.configs.filter(c => c.required)
  const criticalChanges = criticalConfigs.filter(config => 
    configValues[config.key] !== config.value
  )
  
  if (criticalChanges.length > 0) {
    try {
      await ElMessageBox.confirm(
        t('config.criticalChangeWarning', { 
          count: criticalChanges.length,
          configs: criticalChanges.map(c => c.key).join(', ')
        }),
        t('common.warning'),
        { 
          type: 'warning',
          confirmButtonText: t('config.confirmChange'),
          cancelButtonText: t('common.cancel')
        }
      )
    } catch {
      return
    }
  }
  
  saving.value = true
  try {
    const updates: Record<string, string> = {}
    const changes: Array<{key: string, oldValue: any, newValue: any}> = []
    
    currentGroup.value.configs.forEach(config => {
      if (configValues[config.key] !== config.value) {
        updates[config.key] = String(configValues[config.key])
        changes.push({
          key: config.key,
          oldValue: config.value,
          newValue: configValues[config.key]
        })
      }
    })
    
    if (Object.keys(updates).length > 0) {
      await configApiService.batchUpdateConfigs(updates)
      
      // 记录配置变更日志
      await logConfigChanges(changes)
      
      ElMessage.success(t('config.saveSuccess'))
      await loadConfigs()
    } else {
      ElMessage.info(t('config.noChanges'))
    }
  } catch (error) {
    ElMessage.error(t('config.saveFailed'))
  } finally {
    saving.value = false
  }
}

const handleReset = async (config: any) => {
  try {
    await ElMessageBox.confirm(
      t('config.resetConfirm', { key: config.key }),
      t('common.confirm'),
      { 
        type: 'warning',
        confirmButtonText: t('config.confirmReset'),
        cancelButtonText: t('common.cancel')
      }
    )
    
    await configApiService.resetConfig(config.key)
    
    // 记录重置操作日志
    await logConfigReset(config.key, config.value, config.defaultValue)
    
    configValues[config.key] = config.defaultValue
    ElMessage.success(t('config.resetSuccess'))
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('config.resetFailed'))
    }
  }
}

// 记录配置重置日志
const logConfigReset = async (key: string, oldValue: any, newValue: any) => {
  try {
    await configApiService.logConfigChanges({
      action: 'reset',
      changes: [{ key, oldValue, newValue }],
      timestamp: new Date().toISOString(),
      group: activeGroup.value
    })
  } catch (error) {
    console.warn('Failed to log config reset:', error)
  }
}

// 显示变更历史
const showChangeHistory = () => {
  historyDialogVisible.value = true
  loadConfigLogs()
}

// 加载配置变更日志
const loadConfigLogs = async () => {
  loadingLogs.value = true
  try {
    const result = await configApiService.getConfigLogs({
      group: activeGroup.value,
      page: logPage.value,
      size: logPageSize.value
    })
    configLogs.value = result.logs
    logTotal.value = result.total
  } catch (error) {
    ElMessage.error(t('config.loadLogsFailed'))
  } finally {
    loadingLogs.value = false
  }
}

// 获取操作类型样式
const getActionType = (action: string) => {
  switch (action) {
    case 'update':
    case 'batch_update':
      return 'primary'
    case 'reset':
      return 'warning'
    case 'restore':
      return 'danger'
    default:
      return 'info'
  }
}

const handleBackup = async () => {
  try {
    const blob = await configApiService.backupConfigs()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `config-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('备份成功')
  } catch (error) {
    ElMessage.error('备份失败')
  }
}

const handleRestore = () => {
  restoreDialogVisible.value = true
}

const handleFileChange = (file: any) => {
  restoreFile.value = file.raw
}

const confirmRestore = async () => {
  if (!restoreFile.value) {
    ElMessage.warning(t('config.selectFileFirst'))
    return
  }
  
  try {
    await ElMessageBox.confirm(
      t('config.restoreWarning'),
      t('common.warning'),
      { 
        type: 'warning',
        confirmButtonText: t('config.confirmRestore'),
        cancelButtonText: t('common.cancel')
      }
    )
  } catch {
    return
  }
  
  restoring.value = true
  try {
    await configApiService.restoreConfigs(restoreFile.value)
    
    // 记录恢复操作日志
    await logConfigRestore(restoreFile.value.name)
    
    ElMessage.success(t('config.restoreSuccess'))
    restoreDialogVisible.value = false
    restoreFile.value = null
    uploadRef.value?.clearFiles()
    await loadConfigs()
  } catch (error) {
    ElMessage.error(t('config.restoreFailed'))
  } finally {
    restoring.value = false
  }
}

// 记录配置变更日志
const logConfigChanges = async (changes: Array<{key: string, oldValue: any, newValue: any}>) => {
  try {
    await configApiService.logConfigChanges({
      action: 'batch_update',
      changes,
      timestamp: new Date().toISOString(),
      group: activeGroup.value
    })
  } catch (error) {
    console.warn('Failed to log config changes:', error)
  }
}

// 记录配置恢复日志
const logConfigRestore = async (filename: string) => {
  try {
    await configApiService.logConfigChanges({
      action: 'restore',
      filename,
      timestamp: new Date().toISOString(),
      group: 'all'
    })
  } catch (error) {
    console.warn('Failed to log config restore:', error)
  }
}

onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.config-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.group-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.config-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.config-actions {
  margin-top: 8px;
}

.changes-list {
  max-height: 100px;
  overflow-y: auto;
}

.change-item {
  margin-bottom: 4px;
  font-size: 12px;
}

.old-value {
  color: var(--el-color-danger);
  text-decoration: line-through;
}

.new-value {
  color: var(--el-color-success);
  font-weight: bold;
}
</style>