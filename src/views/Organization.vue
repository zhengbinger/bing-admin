<template>
  <div class="organization-management">
    <div class="page-header">
      <h2>组织管理</h2>
      <el-button type="primary" @click="handleAdd">
        <i class="el-icon-plus"></i>
        新增组织
      </el-button>
    </div>

    <div class="table-container">
      <el-table
        :data="organizationList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="组织名称" min-width="120"></el-table-column>
        <el-table-column prop="code" label="组织代码" min-width="120"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
        <el-table-column prop="parentId" label="父组织ID" width="100"></el-table-column>
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

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>

    <!-- 新增/编辑组织对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model:visible="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="组织名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入组织名称"></el-input>
        </el-form-item>
        <el-form-item label="组织代码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入组织代码"></el-input>
        </el-form-item>
        <el-form-item label="父组织ID">
          <el-input v-model="formData.parentId" placeholder="请输入父组织ID"></el-input>
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
  name: 'Organization',
  data() {
    return {
      organizationList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      selectedRows: [],
      dialogVisible: false,
      dialogTitle: '',
      formData: {
        id: null,
        name: '',
        code: '',
        parentId: null,
        description: '',
        status: 1
      },
      rules: {
        name: [
          { required: true, message: '请输入组织名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入组织代码', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.loadOrganizationList()
  },
  methods: {
    // 加载组织列表
    async loadOrganizationList() {
      try {
        const response = await api.organization.getOrganizationList()
        this.organizationList = response.data
        this.total = response.data.length
      } catch (error) {
        this.$message.error('获取组织列表失败')
      }
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 处理新增
    handleAdd() {
      this.dialogTitle = '新增组织'
      this.formData = {
        id: null,
        name: '',
        code: '',
        parentId: null,
        description: '',
        status: 1
      }
      this.dialogVisible = true
    },

    // 处理编辑
    handleEdit(row) {
      this.dialogTitle = '编辑组织'
      this.formData = { ...row }
      this.dialogVisible = true
    },

    // 处理提交
    async handleSubmit() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          try {
            if (this.formData.id) {
              // 更新组织
              await api.organization.updateOrganization(this.formData.id, this.formData)
              this.$message.success('更新组织成功')
            } else {
              // 创建组织
              await api.organization.createOrganization(this.formData)
              this.$message.success('创建组织成功')
            }
            this.dialogVisible = false
            this.loadOrganizationList()
          } catch (error) {
            this.$message.error('操作失败')
          }
        }
      })
    },

    // 处理状态变化
    async handleStatusChange(row) {
      try {
        await api.organization.updateOrganization(row.id, {
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
      this.$confirm('确定要删除该组织吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await api.organization.deleteOrganization(id)
          this.$message.success('删除成功')
          this.loadOrganizationList()
        } catch (error) {
          this.$message.error('删除失败')
        }
      })
    },

    // 处理页码变化
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage
      this.loadOrganizationList()
    },

    // 处理每页条数变化
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.currentPage = 1
      this.loadOrganizationList()
    }
  }
}
</script>

<style scoped>
.organization-management {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>