<template>
  <div class="white-list-management">
    <div class="page-header">
      <h2>白名单管理</h2>
      <div class="header-buttons">
        <el-button type="primary" @click="handleAdd">
          <i class="el-icon-plus"></i>
          新增白名单
        </el-button>
        <el-button type="warning" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          <i class="el-icon-delete"></i>
          批量删除
        </el-button>
        <el-button type="success" @click="refreshCache">
          <i class="el-icon-refresh"></i>
          刷新缓存
        </el-button>
      </div>
    </div>

    <div class="search-container">
      <el-form :model="searchForm" label-width="80px" inline>
        <el-form-item label="IP地址">
          <el-input v-model="searchForm.ip" placeholder="请输入IP地址"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="searchForm.description" placeholder="请输入描述"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <i class="el-icon-search"></i>
            查询
          </el-button>
          <el-button @click="handleReset">
            <i class="el-icon-refresh"></i>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table
        :data="whiteList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="ip" label="IP地址" min-width="150"></el-table-column>
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
        <el-table-column prop="createTime" label="创建时间" min-width="180"></el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
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

    <!-- 新增/编辑白名单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model:visible="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="formData.ip" placeholder="请输入IP地址"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入描述"
            rows="3"
          ></el-input>
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
  name: 'WhiteList',
  data() {
    return {
      whiteList: [],
      selectedRows: [],
      searchForm: {
        ip: '',
        description: ''
      },
      dialogVisible: false,
      dialogTitle: '',
      formData: {
        id: null,
        ip: '',
        description: '',
        status: 1
      },
      rules: {
        ip: [
          { required: true, message: '请输入IP地址', trigger: 'blur' },
          { pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/, message: '请输入有效的IP地址', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.loadWhiteList()
  },
  methods: {
    // 加载白名单列表
    async loadWhiteList() {
      try {
        const response = await api.whiteList.getWhiteList()
        this.whiteList = response.data
      } catch (error) {
        this.$message.error('获取白名单列表失败')
      }
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 处理查询
    async handleSearch() {
      try {
        const response = await api.whiteList.getWhiteList(this.searchForm)
        this.whiteList = response.data
      } catch (error) {
        this.$message.error('查询失败')
      }
    },

    // 处理重置
    handleReset() {
      this.searchForm = {
        ip: '',
        description: ''
      }
      this.loadWhiteList()
    },

    // 处理新增
    handleAdd() {
      this.dialogTitle = '新增白名单'
      this.formData = {
        id: null,
        ip: '',
        description: '',
        status: 1
      }
      this.dialogVisible = true
    },

    // 处理编辑
    handleEdit(row) {
      this.dialogTitle = '编辑白名单'
      this.formData = { ...row }
      this.dialogVisible = true
    },

    // 处理提交
    async handleSubmit() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          try {
            if (this.formData.id) {
              // 更新白名单
              await api.whiteList.updateWhiteList(this.formData.id, this.formData)
              this.$message.success('更新白名单成功')
            } else {
              // 创建白名单
              await api.whiteList.createWhiteList(this.formData)
              this.$message.success('创建白名单成功')
            }
            this.dialogVisible = false
            this.loadWhiteList()
          } catch (error) {
            this.$message.error('操作失败')
          }
        }
      })
    },

    // 处理状态变化
    async handleStatusChange(row) {
      try {
        await api.whiteList.updateWhiteList(row.id, {
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
      this.$confirm('确定要删除该白名单吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await api.whiteList.deleteWhiteList(id)
          this.$message.success('删除成功')
          this.loadWhiteList()
        } catch (error) {
          this.$message.error('删除失败')
        }
      })
    },

    // 处理批量删除
    handleBatchDelete() {
      this.$confirm('确定要批量删除选中的白名单吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const ids = this.selectedRows.map(row => row.id)
          await api.whiteList.batchDeleteWhiteList(ids)
          this.$message.success('批量删除成功')
          this.loadWhiteList()
        } catch (error) {
          this.$message.error('批量删除失败')
        }
      })
    },

    // 刷新缓存
    async refreshCache() {
      try {
        await api.whiteList.refreshWhiteListCache()
        this.$message.success('缓存刷新成功')
      } catch (error) {
        this.$message.error('缓存刷新失败')
      }
    }
  }
}
</script>

<style scoped>
.white-list-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.search-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.table-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 10px;
}
</style>