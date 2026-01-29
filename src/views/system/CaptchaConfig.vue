<template>
  <div class="captcha-config-container">
    <el-card class="captcha-config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>验证码配置管理</span>
          <el-button type="primary" @click="handleAddConfig" size="small">
            <i class="el-icon-plus"></i> 添加配置
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="configList"
        border
        style="width: 100%"
        stripe
        size="small"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="channel" label="登录渠道" width="150" align="center">
          <template #default="scope">
            <el-tag :type="getChannelType(scope.row.channel)">{{ getChannelName(scope.row.channel) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="captchaType" label="验证码类型" width="150" align="center">
          <template #default="scope">
            <el-tag type="info">{{ getCaptchaTypeName(scope.row.captchaType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="是否启用" width="120" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enabled"
              active-value="1"
              inactive-value="0"
              @change="handleEnableChange(scope.row)"
              :active-value="1"
              :inactive-value="0"
            />
          </template>
        </el-table-column>
        <el-table-column prop="expireTime" label="过期时间(秒)" width="150" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center">
          <template #default="scope">
            <span>{{ formatDate(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" align="center">
          <template #default="scope">
            <span>{{ formatDate(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="mini"
              @click="handleEditConfig(scope.row)"
              :disabled="scope.row.locked"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="mini"
              @click="handleDeleteConfig(scope.row)"
              :disabled="scope.row.locked"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-if="total > 0"
          :current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 添加/编辑配置对话框 -->
      <el-dialog
        :title="dialogTitle"
        v-model:visible="dialogVisible"
        width="600px"
        append-to-body
      >
        <el-form
          ref="configFormRef"
          :model="configForm"
          :rules="configRules"
          label-width="120px"
          class="config-form"
        >
          <el-form-item label="登录渠道" prop="channel">
            <el-select
              v-model="configForm.channel"
              placeholder="请选择登录渠道"
              style="width: 100%"
              @change="handleChannelChange"
            >
              <el-option label="网页端" value="WEB" />
              <el-option label="移动端" value="MOBILE" />
              <el-option label="API接口" value="API" />
              <el-option label="第三方登录" value="THIRD_PARTY" />
            </el-select>
          </el-form-item>

          <el-form-item label="验证码类型" prop="captchaType">
            <el-select
              v-model="configForm.captchaType"
              placeholder="请选择验证码类型"
              style="width: 100%"
            >
              <el-option label="图片验证码" value="IMAGE" />
              <el-option label="短信验证码" value="SMS" />
              <el-option label="邮箱验证码" value="EMAIL" />
              <el-option label="行为验证码" value="BEHAVIOR" />
            </el-select>
          </el-form-item>

          <el-form-item label="是否启用" prop="enabled">
            <el-switch
              v-model="configForm.enabled"
              :active-value="1"
              :inactive-value="0"
            />
          </el-form-item>

          <el-form-item label="过期时间(秒)" prop="expireTime">
            <el-input-number
              v-model="configForm.expireTime"
              :min="1"
              :max="3600"
              :step="10"
              style="width: 100%"
              placeholder="请输入验证码过期时间"
            />
          </el-form-item>

          <el-form-item label="配置参数" prop="configParams">
            <el-input
              v-model="configForm.configParams"
              type="textarea"
              :rows="4"
              placeholder='JSON格式的配置参数，例如：{"width":120,"height":40,"length":4}'
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确定</el-button>
          </div>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import captchaApi from '@/api/captcha'
import { formatDate } from '@/utils/index'

// 表格数据
const loading = ref(false)
const configList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])

// 表单数据
const configFormRef = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEditMode = ref(false)

// 配置表单
const configForm = reactive({
  id: null,
  channel: '',
  captchaType: 'IMAGE',
  enabled: 1,
  expireTime: 300,
  configParams: '{"width":120,"height":40,"length":4}'
})

// 表单验证规则
const configRules = {
  channel: [
    { required: true, message: '请选择登录渠道', trigger: 'change' }
  ],
  captchaType: [
    { required: true, message: '请选择验证码类型', trigger: 'change' }
  ],
  expireTime: [
    { required: true, message: '请输入过期时间', trigger: 'blur' },
    { type: 'number', min: 1, message: '过期时间必须大于0', trigger: 'blur' }
  ],
  configParams: [
    { required: true, message: '请输入配置参数', trigger: 'blur' },
    { validator: validateJson, trigger: 'blur' }
  ]
}

// 获取渠道类型
const getChannelType = (channel) => {
  const typeMap = {
    WEB: 'primary',
    MOBILE: 'success',
    API: 'warning',
    THIRD_PARTY: 'info'
  }
  return typeMap[channel] || 'default'
}

// 获取渠道名称
const getChannelName = (channel) => {
  const nameMap = {
    WEB: '网页端',
    MOBILE: '移动端',
    API: 'API接口',
    THIRD_PARTY: '第三方登录'
  }
  return nameMap[channel] || channel
}

// 获取验证码类型名称
const getCaptchaTypeName = (type) => {
  const nameMap = {
    IMAGE: '图片验证码',
    SMS: '短信验证码',
    EMAIL: '邮箱验证码',
    BEHAVIOR: '行为验证码'
  }
  return nameMap[type] || type
}

// 验证JSON格式
const validateJson = (rule, value, callback) => {
  if (!value) {
    return callback()
  }
  try {
    JSON.parse(value)
    callback()
  } catch (error) {
    callback(new Error('配置参数必须是有效的JSON格式'))
  }
}

// 加载配置列表
const loadConfigList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    const response = await captchaApi.getConfigList(params)
    if (response.code === 200) {
      configList.value = response.data.list
      total.value = response.data.total
    }
  } catch (error) {
    console.error('获取验证码配置列表失败:', error)
    ElMessage.error('获取验证码配置列表失败')
  } finally {
    loading.value = false
  }
}

// 选择行变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  loadConfigList()
}

// 当前页变化
const handleCurrentChange = (current) => {
  pageNum.value = current
  loadConfigList()
}

// 显示添加配置对话框
const handleAddConfig = () => {
  isEditMode.value = false
  dialogTitle.value = '添加验证码配置'
  // 重置表单
  Object.assign(configForm, {
    id: null,
    channel: '',
    captchaType: 'IMAGE',
    enabled: 1,
    expireTime: 300,
    configParams: '{"width":120,"height":40,"length":4}'
  })
  dialogVisible.value = true
}

// 显示编辑配置对话框
const handleEditConfig = (row) => {
  isEditMode.value = true
  dialogTitle.value = '编辑验证码配置'
  // 复制行数据到表单
  Object.assign(configForm, { ...row })
  dialogVisible.value = true
}

// 删除配置
const handleDeleteConfig = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该验证码配置吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await captchaApi.deleteConfig(row.id)
    ElMessage.success('删除成功')
    loadConfigList()
  } catch (error) {
    if (error === 'cancel') return
    console.error('删除验证码配置失败:', error)
    ElMessage.error('删除验证码配置失败')
  }
}

// 启用状态变化
const handleEnableChange = async (row) => {
  try {
    await captchaApi.updateConfig({
      id: row.id,
      enabled: row.enabled
    })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('更新验证码配置状态失败:', error)
    ElMessage.error('更新验证码配置状态失败')
    // 恢复原来的状态
    loadConfigList()
  }
}

// 渠道变化处理
const handleChannelChange = (channel) => {
  // 可以根据渠道设置默认的验证码类型和配置
}

// 提交表单
const handleSubmit = async () => {
  try {
    await configFormRef.value.validate()
    
    if (isEditMode.value) {
      // 编辑模式
      await captchaApi.updateConfig(configForm)
      ElMessage.success('编辑成功')
    } else {
      // 添加模式
      await captchaApi.addConfig(configForm)
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
    loadConfigList()
  } catch (error) {
    if (error === false) return
    console.error('提交验证码配置失败:', error)
    ElMessage.error('提交验证码配置失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadConfigList()
})
</script>

<style scoped>
.captcha-config-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.captcha-config-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.config-form {
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>
