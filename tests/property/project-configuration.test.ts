import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Property 1: Technical Stack Compliance
 * For any project configuration file, the system should use the specified technology stack 
 * (Vue 3, Element Plus, Pinia, Vue Router 4, Vite, Axios, SCSS)
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 * 
 * Feature: bing-admin-frontend-rewrite, Property 1: Technical Stack Compliance
 */
describe('Property 1: Technical Stack Compliance', () => {
  const projectRoot = join(process.cwd())
  
  it('should have package.json with required dependencies', () => {
    const packageJsonPath = join(projectRoot, 'package.json')
    expect(existsSync(packageJsonPath)).toBe(true)
    
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    
    // Vue 3 requirement (1.1)
    expect(packageJson.dependencies).toHaveProperty('vue')
    expect(packageJson.dependencies.vue).toContain('3.')
    
    // Element Plus requirement (1.2)
    expect(packageJson.dependencies).toHaveProperty('element-plus')
    expect(packageJson.dependencies).toHaveProperty('@element-plus/icons-vue')
    
    // Pinia requirement (1.3)
    expect(packageJson.dependencies).toHaveProperty('pinia')
    
    // Vue Router 4 requirement (1.4)
    expect(packageJson.dependencies).toHaveProperty('vue-router')
    expect(packageJson.dependencies['vue-router']).toContain('4.')
    
    // Vite requirement (1.5)
    expect(packageJson.devDependencies).toHaveProperty('vite')
    expect(packageJson.devDependencies).toHaveProperty('@vitejs/plugin-vue')
    
    // Axios requirement (1.6)
    expect(packageJson.dependencies).toHaveProperty('axios')
    
    // SCSS requirement (1.7)
    expect(packageJson.devDependencies).toHaveProperty('sass')
  })
  
  it('should have TypeScript configuration', () => {
    const tsconfigPath = join(projectRoot, 'tsconfig.json')
    expect(existsSync(tsconfigPath)).toBe(true)
    
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'))
    expect(tsconfig.compilerOptions).toBeDefined()
    expect(tsconfig.compilerOptions.target).toBeDefined()
    expect(tsconfig.compilerOptions.module).toBeDefined()
  })
  
  it('should have Vite configuration with TypeScript', () => {
    const viteConfigPath = join(projectRoot, 'vite.config.ts')
    expect(existsSync(viteConfigPath)).toBe(true)
    
    const viteConfig = readFileSync(viteConfigPath, 'utf-8')
    expect(viteConfig).toContain('@vitejs/plugin-vue')
    expect(viteConfig).toContain('defineConfig')
  })
  
  it('should have ESLint configuration', () => {
    const eslintConfigPath = join(projectRoot, '.eslintrc.cjs')
    expect(existsSync(eslintConfigPath)).toBe(true)
    
    const eslintConfig = readFileSync(eslintConfigPath, 'utf-8')
    expect(eslintConfig).toContain('vue3-essential')
    expect(eslintConfig).toContain('@vue/eslint-config-typescript')
  })
  
  it('should have Prettier configuration', () => {
    const prettierConfigPath = join(projectRoot, '.prettierrc')
    expect(existsSync(prettierConfigPath)).toBe(true)
    
    const prettierConfig = JSON.parse(readFileSync(prettierConfigPath, 'utf-8'))
    expect(prettierConfig).toHaveProperty('semi')
    expect(prettierConfig).toHaveProperty('singleQuote')
  })
  
  it('should have proper project structure', () => {
    const srcPath = join(projectRoot, 'src')
    expect(existsSync(srcPath)).toBe(true)
    
    // Check for main TypeScript entry point
    const mainTsPath = join(srcPath, 'main.ts')
    expect(existsSync(mainTsPath)).toBe(true)
    
    // Check for type definitions
    const typesPath = join(srcPath, 'types')
    expect(existsSync(typesPath)).toBe(true)
    
    // Check for styles directory with SCSS
    const stylesPath = join(srcPath, 'styles')
    expect(existsSync(stylesPath)).toBe(true)
    
    const variablesScssPath = join(stylesPath, 'variables.scss')
    expect(existsSync(variablesScssPath)).toBe(true)
  })
  
  it('should have environment configuration files', () => {
    const devEnvPath = join(projectRoot, '.env.development')
    const prodEnvPath = join(projectRoot, '.env.production')
    
    expect(existsSync(devEnvPath)).toBe(true)
    expect(existsSync(prodEnvPath)).toBe(true)
    
    const devEnv = readFileSync(devEnvPath, 'utf-8')
    const prodEnv = readFileSync(prodEnvPath, 'utf-8')
    
    expect(devEnv).toContain('VITE_API_BASE_URL')
    expect(prodEnv).toContain('VITE_API_BASE_URL')
  })
  
  it('should have proper npm scripts for development workflow', () => {
    const packageJsonPath = join(projectRoot, 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    
    expect(packageJson.scripts).toHaveProperty('dev')
    expect(packageJson.scripts).toHaveProperty('build')
    expect(packageJson.scripts).toHaveProperty('lint')
    expect(packageJson.scripts).toHaveProperty('format')
    expect(packageJson.scripts).toHaveProperty('test')
    expect(packageJson.scripts).toHaveProperty('type-check')
  })
})