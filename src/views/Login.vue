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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    // 模拟登录请求
    // 实际项目中应该调用真实的登录接口
    // const response = await axios.post('/api/login', loginForm)
    
    // 模拟成功登录
    setTimeout(() => {
      loading.value = false
      
      // 保存token和用户信息
      const mockToken = 'mock_token_' + Date.now()
      const userInfo = {
        id: 1,
        username: loginForm.username,
        nickname: '管理员',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      }
      
      localStorage.setItem('token', mockToken)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      
      ElMessage.success('登录成功')
      router.push({ name: 'dashboard' })
    }, 1000)
    
  } catch (error) {
    loading.value = false
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('登录失败，请重试')
    }
  }
}
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