<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- 左侧品牌区域 -->
      <div class="login-brand">
        <div class="brand-content">
          <h1>Bing Admin</h1>
          <p>企业级后台管理系统解决方案</p>
        </div>
      </div>
      
      <!-- 右侧登录表单区域 -->
      <div class="login-form-container">
        <div class="login-form-wrapper">
          <div class="form-header">
            <h2>欢迎回来</h2>
            <p>请登录您的账号</p>
          </div>
          
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <el-form-item prop="username" class="login-input-item">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                prefix-icon="el-icon-user"
                class="login-input"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="channel" class="login-input-item">
              <el-select
                v-model="loginForm.channel"
                placeholder="请选择登录渠道"
                :disabled="loading"
                class="login-input"
                size="large"
                style="width: 100%"
              >
                <el-option label="网页端" :value="'WEB'" />
                <el-option label="移动端" :value="'MOBILE'" />
                <el-option label="API接口" :value="'API'" />
                <el-option label="第三方登录" :value="'THIRD_PARTY'" />
              </el-select>
            </el-form-item>
            
            <el-form-item prop="password" class="login-input-item">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="el-icon-lock"
                show-password
                class="login-input"
                size="large"
              />
            </el-form-item>
            
            <!-- 验证码输入区域，根据配置决定是否显示 -->
            <el-form-item v-if="isCaptchaEnabled" prop="captcha" class="login-input-item">
              <div class="captcha-container">
                <el-input
                  v-model="loginForm.captcha"
                  placeholder="请输入验证码"
                  prefix-icon="el-icon-key"
                  class="login-input captcha-input"
                  size="large"
                />
                <div class="captcha-image-wrapper">
                  <img
                    v-if="captchaImage"
                    :src="captchaImage"
                    alt="验证码"
                    class="captcha-image"
                    @click="refreshCaptcha"
                    :title="'点击刷新验证码'"
                  />
                  <el-skeleton v-else animated />
                  <div
                    v-if="captchaLoading"
                    class="captcha-loading"
                  />
                </div>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                @click="handleLogin"
                class="login-button"
                :disabled="loading"
                size="large"
              >
                登录系统
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/modules/user'
import userApi from '../api/user'
import captchaApi from '../api/captcha'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  channel: 'WEB',
  captcha: '',
  captchaKey: '',
  captchaType: ''
})

// 验证码相关状态
const captchaImage = ref('')
const captchaLoading = ref(false)
const captchaConfig = ref(null)
const isCaptchaEnabled = ref(false)

// 动态登录表单规则
const loginRules = computed(() => {
  const rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' }
    ],
    channel: [
      { required: true, message: '请选择登录渠道', trigger: 'change' }
    ]
  }
  
  // 根据验证码配置动态添加验证码验证规则
  if (isCaptchaEnabled.value) {
    rules.captcha = [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { min: 4, max: 6, message: '验证码长度在 4 到 6 个字符', trigger: 'blur' }
    ]
  }
  
  return rules
})

// 获取重定向地址
const redirectPath = computed(() => {
  return route.query.redirect || '/'
})

// 获取验证码配置
const getCaptchaConfig = async () => {
  try {
    const response = await captchaApi.getCaptchaConfig(loginForm.channel)
    if (response.code === 200) {
      captchaConfig.value = response.data
      isCaptchaEnabled.value = response.data.enabled || false
      
      // 如果启用了验证码，则获取验证码
      if (isCaptchaEnabled.value) {
        await getCaptcha()
      } else {
        // 如果未启用验证码，则清空验证码相关信息
        captchaImage.value = ''
        loginForm.captcha = ''
        loginForm.captchaKey = ''
      }
    }
  } catch (error) {
    console.error('获取验证码配置失败:', error)
    // 如果获取配置失败，默认不启用验证码
    isCaptchaEnabled.value = false
  }
}

// 获取验证码
const getCaptcha = async () => {
  if (!isCaptchaEnabled.value || !captchaConfig.value) return
  
  try {
    captchaLoading.value = true
    // 从配置中获取验证码类型，如果没有配置则使用默认值'image'
    const captchaType = captchaConfig.value.captchaType || 'IMAGE'
    const response = await captchaApi.generateCaptcha(loginForm.channel, captchaType)
    
    if (response.code === 200) {
      if (captchaType === 'IMAGE') {
        captchaImage.value = response.data.captchaContent
      } else {
        // 非图片验证码类型，显示提示信息
        captchaImage.value = ''
        ElMessage.success('验证码已发送')
      }
      loginForm.captchaKey = response.data.captchaKey
      loginForm.captchaType = captchaType
    } else {
      ElMessage.error('获取验证码失败')
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败，请重试')
  } finally {
    captchaLoading.value = false
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  getCaptcha()
}

// 监听渠道变化，重新获取验证码配置
watch(
  () => loginForm.channel,
  (newChannel) => {
    getCaptchaConfig()
  },
  { immediate: true }
)

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    // 使用封装的API进行登录
    const response = await userStore.login(loginForm)
    
    loading.value = false
    ElMessage.success('登录成功')
    
    // 登录成功后跳转到目标页面
    router.push(redirectPath.value)
    
  } catch (error) {
    loading.value = false
    
    // 登录失败后自动刷新验证码
    refreshCaptcha()
    
    const errorMsg = error.response?.data?.message || error.message || '登录失败，请重试'
    ElMessage.error(errorMsg)
    
    console.error('登录失败:', error)
  }
}

// 组件挂载时获取验证码配置
onMounted(() => {
  getCaptchaConfig()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.login-wrapper {
  display: flex;
  width: 900px;
  height: 500px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 左侧品牌区域 */
.login-brand {
  width: 50%;
  background: linear-gradient(135deg, #6266ed 0%, #7c4dff 50%, #ff4081 100%);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.login-brand::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(5%, 5%) rotate(5deg);
  }
  50% {
    transform: translate(0, 10%) rotate(0deg);
  }
  75% {
    transform: translate(-5%, 5%) rotate(-5deg);
  }
}

.brand-content {
  text-align: center;
}

.brand-content h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 20px 0;
  line-height: 1.2;
}

.brand-content p {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
}

/* 右侧登录表单区域 */
.login-form-container {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 320px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #6266ed;
  margin: 0 0 10px 0;
}

.form-header p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.login-form {
  width: 100%;
}

/* 登录表单项目样式 */
.login-input-item {
  margin-bottom: 24px;
  width: 100%;
}

/* 登录输入框样式 */
:deep(.login-input) {
  width: 100%;
}

:deep(.login-input .el-input__wrapper) {
  border-radius: 12px;
  height: 52px;
  padding: 0 18px;
  background-color: #ffffff;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

:deep(.login-input .el-input__wrapper:hover) {
  border-color: #6266ed;
  box-shadow: 0 4px 12px rgba(98, 102, 237, 0.2);
  background-color: #fafbff;
}

:deep(.login-input .el-input__wrapper.is-focus) {
  border-color: #6266ed;
  box-shadow: 0 0 0 3px rgba(98, 102, 237, 0.3);
  background-color: #ffffff;
}

:deep(.login-input .el-input__inner) {
  height: 52px;
  font-size: 16px;
  color: #1f2937;
  line-height: 52px;
}

/* 优化图标样式 */
:deep(.login-input .el-input__prefix-inner) {
  margin-right: 12px;
}

:deep(.login-input .el-input__prefix-inner .el-icon) {
  color: #6266ed;
  font-size: 18px;
  transition: color 0.3s ease;
}

:deep(.login-input .el-input__suffix-inner) {
  margin-left: 12px;
}

:deep(.login-input .el-input__suffix-inner .el-icon) {
  color: #6266ed;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.login-input .el-input__suffix-inner .el-icon:hover) {
  transform: scale(1.1);
}

/* 响应式设计 - 验证码调整 */
@media (max-width: 768px) {
  .captcha-container {
    flex-direction: column;
    gap: 12px;
  }
  
  .captcha-input {
    width: 100%;
  }
  
  .captcha-image-wrapper {
    width: 100%;
    height: 48px;
  }
}

/* 验证码容器 */
.captcha-container {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.captcha-input {
  flex: 1;
}

.captcha-image-wrapper {
  position: relative;
  width: 120px;
  height: 52px;
  border-radius: 12px;
  overflow: hidden;
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.captcha-image:hover {
  transform: scale(1.02);
}

.captcha-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTIiIGZpbGw9IiM2MjY2ZWQiLz48cGF0aCBkPSJNMCAxNWgxMXYxNUgwVjE1em0zMCAxNWgxMXYxNUgzMFYxNXoiIGZpbGw9IiM2MjY2ZWQiLz48cGF0aCBkPSJNMCAxNWgxMXYxNUgwVjE1em0zMCAxNWgxMXYxNUgzMFYxNXoiIGZpbGw9IiM2MjY2ZWQiIG9wYWNpdHk9IjAuMyIvPjxwYXRoIGQ9Ik0wIDE1aDEwdjE1SDBWMTV6bTMwIDE1aDEwdjE1SDMwVjE1eiIgZmlsbD0iIzYyNjZlZCIgb3BhY2l0eT0iMC42Ii8+PC9zdmc+');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 24px 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 50px;
  font-size: 18px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #6266ed 0%, #7c4dff 100%);
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: all 0.6s;
  z-index: -1;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(98, 102, 237, 0.4);
}

.login-button:hover::before {
  left: 100%;
}

.login-button:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
    width: 90%;
    height: auto;
    min-height: 500px;
  }
  
  .login-brand {
    width: 100%;
    height: 220px;
    padding: 20px;
  }
  
  .brand-content h1 {
    font-size: 28px;
  }
  
  .brand-content p {
    font-size: 16px;
  }
  
  .login-form-container {
    width: 100%;
    padding: 30px 20px;
  }
  
  .login-form-wrapper {
    max-width: 100%;
  }
  
  .form-header {
    margin-bottom: 30px;
  }
  
  .form-header h2 {
    font-size: 24px;
  }
  
  :deep(.login-input .el-input__wrapper) {
    height: 48px;
    padding: 0 16px;
  }
  
  :deep(.login-input .el-input__inner) {
    height: 48px;
    font-size: 15px;
    line-height: 48px;
  }
  
  :deep(.login-input .el-input__prefix-inner) {
    margin-right: 10px;
  }
  
  :deep(.login-input .el-input__prefix-inner .el-icon) {
    font-size: 16px;
  }
  
  :deep(.login-input .el-input__suffix-inner) {
    margin-left: 10px;
  }
  
  :deep(.login-input .el-input__suffix-inner .el-icon) {
    font-size: 15px;
  }
  
  .login-button {
    height: 46px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 20px;
  }
  
  .login-wrapper {
    width: 100%;
  }
}
</style>