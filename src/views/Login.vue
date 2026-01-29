<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-form-container">
        <!-- 登录表单头部 -->
        <div class="login-header">
          <div class="logo">
            <img src="/logo.svg" alt="Bing Admin" class="logo-image" />
            <h1 class="logo-text">Bing Admin</h1>
          </div>
          <p class="login-subtitle">管理后台系统</p>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          size="large"
          @keyup.enter="handleLogin"
        >
          <!-- 渠道选择 -->
          <el-form-item prop="channel">
            <el-select
              v-model="loginForm.channel"
              placeholder="请选择登录渠道"
              class="channel-select"
              @change="handleChannelChange"
            >
              <el-option
                v-for="channel in channels"
                :key="channel.value"
                :label="channel.label"
                :value="channel.value"
                :disabled="channel.disabled"
              />
            </el-select>
          </el-form-item>

          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              clearable
              autocomplete="username"
            />
          </el-form-item>

          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              clearable
              autocomplete="current-password"
            />
          </el-form-item>

          <!-- 验证码 -->
          <el-form-item v-if="showCaptcha" prop="captcha">
            <div class="captcha-container">
              <el-input
                v-model="loginForm.captcha"
                placeholder="请输入验证码"
                :prefix-icon="Key"
                clearable
                class="captcha-input"
              />
              <div class="captcha-image-container" @click="refreshCaptcha">
                <img
                  v-if="captchaImage"
                  :src="captchaImage"
                  alt="验证码"
                  class="captcha-image"
                />
                <div v-else class="captcha-placeholder">
                  <el-icon><Refresh /></el-icon>
                  <span>点击获取</span>
                </div>
              </div>
            </div>
          </el-form-item>

          <!-- 记住我 -->
          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <el-link type="primary" :underline="false" @click="handleForgotPassword">
                忘记密码？
              </el-link>
            </div>
          </el-form-item>

          <!-- 登录按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 其他登录方式 -->
        <div v-if="showThirdPartyLogin" class="third-party-login">
          <el-divider>其他登录方式</el-divider>
          <div class="third-party-buttons">
            <el-button
              v-if="enableWechatLogin"
              circle
              size="large"
              class="wechat-login-btn"
              @click="handleWechatLogin"
            >
              <el-icon><ChatDotRound /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 登录页面背景装饰 -->
      <div class="login-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>

    <!-- 页脚信息 -->
    <div class="login-footer">
      <p>&copy; 2024 Bing Admin. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Key, Refresh, ChatDotRound } from '@element-plus/icons-vue'
import { useAuthStore } from '../store/modules/auth'
import type { LoginRequest } from '../types/auth'

// 路由和状态管理
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 响应式数据
const loading = ref(false)
const showCaptcha = ref(false)
const captchaImage = ref('')
const captchaKey = ref('')
const rememberMe = ref(false)

// 登录表单数据
const loginForm = reactive<LoginRequest>({
  username: '',
  password: '',
  channel: 'web',
  captcha: '',
  captchaKey: '',
  captchaType: 'image',
  deviceId: generateDeviceId(),
  deviceInfo: getDeviceInfo(),
  clientVersion: '1.0.0'
})

// 渠道选项
const channels = ref([
  { label: 'Web端', value: 'web', disabled: false },
  { label: '移动端', value: 'mobile', disabled: false },
  { label: '管理端', value: 'admin', disabled: false }
])

// 计算属性
const showThirdPartyLogin = computed(() => enableWechatLogin.value)
const enableWechatLogin = ref(true) // 可以从配置中获取

// 表单验证规则
const loginRules: FormRules = {
  channel: [
    { required: true, message: '请选择登录渠道', trigger: 'change' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 128, message: '密码长度在 6 到 128 个字符', trigger: 'blur' }
  ],
  captcha: [
    { 
      required: true, 
      message: '请输入验证码', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (showCaptcha.value && !value) {
          callback(new Error('请输入验证码'))
        } else {
          callback()
        }
      }
    }
  ]
}

// 生成设备ID
function generateDeviceId(): string {
  const stored = localStorage.getItem('device_id')
  if (stored) return stored
  
  const deviceId = 'web_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  localStorage.setItem('device_id', deviceId)
  return deviceId
}

// 获取设备信息
function getDeviceInfo(): string {
  const userAgent = navigator.userAgent
  const platform = navigator.platform
  const language = navigator.language
  
  return JSON.stringify({
    userAgent,
    platform,
    language,
    screen: {
      width: screen.width,
      height: screen.height
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
}

// 获取验证码
const getCaptcha = async (): Promise<void> => {
  try {
    // 这里应该调用获取验证码的API
    // const response = await captchaApi.getCaptcha()
    // captchaImage.value = response.data.image
    // captchaKey.value = response.data.key
    
    // 模拟验证码获取
    captchaKey.value = 'captcha_' + Date.now()
    captchaImage.value = `data:image/svg+xml;base64,${btoa(`
      <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="40" fill="#f0f0f0"/>
        <text x="60" y="25" text-anchor="middle" font-family="Arial" font-size="16" fill="#333">
          ${Math.random().toString(36).substr(2, 4).toUpperCase()}
        </text>
      </svg>
    `)}`
    
    loginForm.captchaKey = captchaKey.value
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败')
  }
}

// 刷新验证码
const refreshCaptcha = async (): Promise<void> => {
  await getCaptcha()
}

// 处理渠道变化
const handleChannelChange = (channel: string): void => {
  console.log('渠道变化:', channel)
  
  // 根据渠道显示不同的验证码策略
  if (channel === 'web') {
    showCaptcha.value = true
    nextTick(() => {
      getCaptcha()
    })
  } else {
    showCaptcha.value = false
    captchaImage.value = ''
    captchaKey.value = ''
    loginForm.captcha = ''
  }
}

// 处理登录
const handleLogin = async (): Promise<void> => {
  if (!loginFormRef.value) return

  try {
    // 表单验证
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true

    // 执行登录
    await authStore.login(loginForm)

    // 记住我功能
    if (rememberMe.value) {
      localStorage.setItem('remember_username', loginForm.username)
      localStorage.setItem('remember_channel', loginForm.channel)
    } else {
      localStorage.removeItem('remember_username')
      localStorage.removeItem('remember_channel')
    }

    // 登录成功，跳转到目标页面
    const redirect = (route.query.redirect as string) || '/dashboard'
    await router.push(redirect)

  } catch (error: any) {
    console.error('登录失败:', error)
    
    // 登录失败后刷新验证码
    if (showCaptcha.value) {
      await refreshCaptcha()
      loginForm.captcha = ''
    }
    
    // 显示错误信息
    const message = error.message || '登录失败，请检查用户名和密码'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

// 处理忘记密码
const handleForgotPassword = (): void => {
  ElMessageBox.alert('请联系系统管理员重置密码', '忘记密码', {
    confirmButtonText: '确定',
    type: 'info'
  })
}

// 处理微信登录
const handleWechatLogin = (): void => {
  ElMessage.info('微信登录功能开发中...')
}

// 初始化记住我功能
const initRememberMe = (): void => {
  const rememberedUsername = localStorage.getItem('remember_username')
  const rememberedChannel = localStorage.getItem('remember_channel')
  
  if (rememberedUsername) {
    loginForm.username = rememberedUsername
    rememberMe.value = true
  }
  
  if (rememberedChannel) {
    loginForm.channel = rememberedChannel
  }
}

// 组件挂载时的初始化
onMounted(() => {
  // 如果已经登录，直接跳转
  if (authStore.isAuthenticated) {
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
    return
  }

  // 初始化记住我功能
  initRememberMe()
  
  // 初始化验证码
  if (loginForm.channel === 'web') {
    showCaptcha.value = true
    getCaptcha()
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 2;
}

.login-form-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  position: relative;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    
    .logo-image {
      width: 48px;
      height: 48px;
      margin-right: 12px;
    }
    
    .logo-text {
      font-size: 28px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0;
    }
  }
  
  .login-subtitle {
    color: #7f8c8d;
    font-size: 16px;
    margin: 0;
  }
}

.login-form {
  .channel-select {
    width: 100%;
  }
  
  .captcha-container {
    display: flex;
    gap: 12px;
    
    .captcha-input {
      flex: 1;
    }
    
    .captcha-image-container {
      width: 120px;
      height: 40px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f7fa;
      transition: all 0.3s;
      
      &:hover {
        border-color: #409eff;
        background: #ecf5ff;
      }
      
      .captcha-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 3px;
      }
      
      .captcha-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #909399;
        font-size: 12px;
        
        .el-icon {
          font-size: 16px;
          margin-bottom: 2px;
        }
      }
    }
  }
  
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .login-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 8px;
  }
}

.third-party-login {
  margin-top: 24px;
  
  .el-divider {
    margin: 20px 0;
    
    :deep(.el-divider__text) {
      color: #909399;
      font-size: 14px;
    }
  }
  
  .third-party-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    
    .wechat-login-btn {
      width: 48px;
      height: 48px;
      background: #07c160;
      border-color: #07c160;
      color: white;
      
      &:hover {
        background: #06ad56;
        border-color: #06ad56;
      }
    }
  }
}

.login-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  
  .decoration-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;
    
    &.circle-1 {
      width: 200px;
      height: 200px;
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }
    
    &.circle-2 {
      width: 150px;
      height: 150px;
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }
    
    &.circle-3 {
      width: 100px;
      height: 100px;
      bottom: 20%;
      left: 20%;
      animation-delay: 4s;
    }
  }
}

.login-footer {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  z-index: 2;
  position: relative;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-form-container {
    padding: 24px;
    margin: 16px;
    max-width: none;
  }
  
  .login-header {
    .logo {
      .logo-text {
        font-size: 24px;
      }
    }
    
    .login-subtitle {
      font-size: 14px;
    }
  }
  
  .captcha-container {
    flex-direction: column;
    
    .captcha-image-container {
      width: 100%;
      height: 50px;
    }
  }
}

@media (max-width: 480px) {
  .login-wrapper {
    padding: 16px;
  }
  
  .login-form-container {
    padding: 20px;
  }
  
  .login-header {
    margin-bottom: 24px;
    
    .logo {
      .logo-image {
        width: 40px;
        height: 40px;
      }
      
      .logo-text {
        font-size: 20px;
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .login-form-container {
    background: rgba(30, 30, 30, 0.95);
    color: #e0e0e0;
    
    .login-header {
      .logo-text {
        color: #e0e0e0;
      }
      
      .login-subtitle {
        color: #b0b0b0;
      }
    }
  }
}
</style>