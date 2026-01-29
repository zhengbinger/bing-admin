<template>
  <div class="system-config-management">
    <div class="page-header">
      <h2>系统配置管理</h2>
      <el-button type="primary" @click="handleAdd">
        <i class="el-icon-plus"></i>
        新增配置
      </el-button>
    </div>

    <div class="table-container">
      <el-table
        :data="configList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="key" label="配置键" min-width="150"></el-table-column>
        <el-table-column prop="value" label="配置值" min-width="200"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template v-slot="scope">
            <el-switch
              v-model="scope.row.status"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="isEncrypted" label="是否加密" width="100">
          <template v-slot="scope">
            <el-tag :type="scope.row.isEncrypted ? 'success' : 'info'">
              {{ scope.row.isEncrypted ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isGlobal" label="是否全局" width="100">
          <template v-slot="scope">
            <el-tag :type="scope.row.isGlobal ? 'warning' : 'info'">
              {{ scope.row.isGlobal ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template v-slot="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">
              <i class="el-icon-edit"></i>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">
              <i class="el-icon-delete"></i>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑系统配置对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model:visible="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="配置键" prop="key">
          <el-input v-model="formData.key" placeholder="请输入配置键"></el-input>
        </el-form-item>
        <el-form-item label="配置值" prop="value">
          <el-input
            v-model="formData.value"
            :type="formData.isEncrypted ? 'password' : 'text'"
            placeholder="请输入配置值"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入描述"
            rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="是否加密">
          <el-switch
            v-model="formData.isEncrypted"
            active-color="#13ce66"
            inactive-color="#ff4949"
          ></el-switch>
        </el-form-item>
        <el-form-item label="是否全局">
          <el-switch
            v-model="formData.isGlobal"
            active-color="#13ce66"
            inactive-color="#ff4949"
          ></el-switch>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="formData.status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
          ></el-switch>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
<span  class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
</template>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'SystemConfig',
  data() {
    return {
      configList: [],
      selectedRows: [],
      dialogVisible: false,
      dialogTitle: '',
      formData: {
        id: null,
        key: '',
        value: '',
        description: '',
        status: 1,
        isEncrypted: false,
        isGlobal: false
      },
      rules: {
        key: [
          { required: true, message: '请输入配置键', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '请输入配置值', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.loadConfigList()
  },
  methods: {
    // 加载系统配置列表
    async loadConfigList() {
      try {
        const response = await api.systemConfig.getConfigList()
        this.configList = response.data
      } catch (error) {
        this.$message.error('获取系统配置列表失败')
      }
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 处理新增
    handleAdd() {
      this.dialogTitle = '新增系统配置'
      this.formData = {
        id: null,
        key: '',
        value: '',
        description: '',
        status: 1,
        isEncrypted: false,
        isGlobal: false
      }
      this.dialogVisible = true
    },

    // 处理编辑
    handleEdit(row) {
      this.dialogTitle = '编辑系统配置'
      this.formData = { ...row }
      this.dialogVisible = true
    },

    // 处理提交
    async handleSubmit() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          try {
            if (this.formData.id) {
              // 更新系统配置
              await api.systemConfig.updateConfig(this.formData.id, this.formData)
              this.$message.success('更新系统配置成功')
            } else {
              // 创建系统配置
              await api.systemConfig.createConfig(this.formData)
              this.$message.success('创建系统配置成功')
            }
            this.dialogVisible = false
            this.loadConfigList()
          } catch (error) {
            this.$message.error('操作失败')
          }
        }
      })
    },

    // 处理状态变化
    async handleStatusChange(row) {
      try {
        await api.systemConfig.updateConfig(row.id, {
          status: row.status
        })
        this.$message.success('状态更新成功')
      } catch (error) {
        row.status = row.status === 1 ? 0 : 1
        this.$message.error('状态更新失败')
      }
    },

    // 处理删除
    handleDelete(id) {
      this.$confirm('确定要删除该系统配置吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await api.systemConfig.deleteConfig(id)
          this.$message.success('删除成功')
          this.loadConfigList()
        } catch (error) {
          this.$message.error('删除失败')
        }
      })
    },

    // 刷新缓存
    async refreshCache() {
      try {
        await api.systemConfig.refreshConfigCache()
        this.$message.success('缓存刷新成功')
      } catch (error) {
        this.$message.error('缓存刷新失败')
      }
    }
  }
}
</script>

<style scoped>
.system-config-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 10px;
}
</style>