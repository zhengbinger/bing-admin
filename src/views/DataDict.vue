<template>
  <div class="data-dict-management">
    <div class="page-header">
      <h2>数据字典管理</h2>
      <el-button type="primary" @click="handleAddDict">
        <i class="el-icon-plus"></i>
        新增字典
      </el-button>
    </div>

    <div class="table-container">
      <el-table
        :data="dictList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="字典名称" min-width="120"></el-table-column>
        <el-table-column prop="code" label="字典编码" min-width="120"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="1"
              :inactive-value="0"
              @change="handleDictStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleEditDict(scope.row)">
              <i class="el-icon-edit"></i>
              编辑
            </el-button>
            <el-button type="warning" size="small" @click="handleDictItems(scope.row)">
              <i class="el-icon-s-grid"></i>
              字典项
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteDict(scope.row.id)">
              <i class="el-icon-delete"></i>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 数据字典项管理对话框 -->
    <el-dialog
      :title="dictItemDialogTitle"
      :visible.sync="dictItemDialogVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="dict-item-header">
        <h3>{{ currentDict ? currentDict.name : '' }} - 字典项管理</h3>
        <el-button type="primary" size="small" @click="handleAddDictItem">
          <i class="el-icon-plus"></i>
          新增字典项
        </el-button>
      </div>
      
      <el-table
        :data="dictItemList"
        border
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="label" label="标签" min-width="120"></el-table-column>
        <el-table-column prop="value" label="值" min-width="120"></el-table-column>
        <el-table-column prop="sort" label="排序" width="80"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="1"
              :inactive-value="0"
              @change="handleDictItemStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleEditDictItem(scope.row)">
              <i class="el-icon-edit"></i>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteDictItem(scope.row.id)">
              <i class="el-icon-delete"></i>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 新增/编辑数据字典对话框 -->
    <el-dialog
      :title="dictDialogTitle"
      :visible.sync="dictDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="dictForm" :rules="dictRules" ref="dictFormRef" label-width="80px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="dictForm.name" placeholder="请输入字典名称"></el-input>
        </el-form-item>
        <el-form-item label="字典编码" prop="code">
          <el-input v-model="dictForm.code" placeholder="请输入字典编码"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="dictForm.description"
            type="textarea"
            placeholder="请输入描述"
            rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="dictForm.status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
          ></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dictDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitDict">确定</el-button>
      </span>
    </el-dialog>

    <!-- 新增/编辑字典项对话框 -->
    <el-dialog
      :title="dictItemFormTitle"
      :visible.sync="dictItemFormVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="dictItemForm" :rules="dictItemRules" ref="dictItemFormRef" label-width="80px">
        <el-form-item label="标签" prop="label">
          <el-input v-model="dictItemForm.label" placeholder="请输入标签"></el-input>
        </el-form-item>
        <el-form-item label="值" prop="value">
          <el-input v-model="dictItemForm.value" placeholder="请输入值"></el-input>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dictItemForm.sort" :min="0" :max="9999"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="dictItemForm.status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
          ></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dictItemFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitDictItem">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'DataDict',
  data() {
    return {
      dictList: [],
      dictItemList: [],
      selectedRows: [],
      dictDialogVisible: false,
      dictItemDialogVisible: false,
      dictItemFormVisible: false,
      dictDialogTitle: '',
      dictItemDialogTitle: '',
      dictItemFormTitle: '',
      currentDict: null,
      dictForm: {
        id: null,
        name: '',
        code: '',
        description: '',
        status: 1
      },
      dictItemForm: {
        id: null,
        label: '',
        value: '',
        sort: 0,
        status: 1
      },
      dictRules: {
        name: [
          { required: true, message: '请输入字典名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入字典编码', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ]
      },
      dictItemRules: {
        label: [
          { required: true, message: '请输入标签', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '请输入值', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.loadDictList()
  },
  methods: {
    // 加载数据字典列表
    async loadDictList() {
      try {
        const response = await api.dataDict.getDataDictList()
        this.dictList = response.data
      } catch (error) {
        this.$message.error('获取数据字典列表失败')
      }
    },

    // 加载字典项列表
    async loadDictItems(dictCode) {
      try {
        const response = await api.dataDict.getDataDictItems(dictCode)
        this.dictItemList = response.data
      } catch (error) {
        this.$message.error('获取字典项列表失败')
      }
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 处理新增字典
    handleAddDict() {
      this.dictDialogTitle = '新增数据字典'
      this.dictForm = {
        id: null,
        name: '',
        code: '',
        description: '',
        status: 1
      }
      this.dictDialogVisible = true
    },

    // 处理编辑字典
    handleEditDict(row) {
      this.dictDialogTitle = '编辑数据字典'
      this.dictForm = { ...row }
      this.dictDialogVisible = true
    },

    // 处理字典项管理
    handleDictItems(row) {
      this.currentDict = row
      this.dictItemDialogTitle = `${row.name} - 字典项管理`
      this.dictItemDialogVisible = true
      this.loadDictItems(row.code)
    },

    // 处理新增字典项
    handleAddDictItem() {
      this.dictItemFormTitle = '新增字典项'
      this.dictItemForm = {
        id: null,
        label: '',
        value: '',
        sort: 0,
        status: 1
      }
      this.dictItemFormVisible = true
    },

    // 处理编辑字典项
    handleEditDictItem(row) {
      this.dictItemFormTitle = '编辑字典项'
      this.dictItemForm = { ...row }
      this.dictItemFormVisible = true
    },

    // 处理提交字典
    async handleSubmitDict() {
      this.$refs.dictFormRef.validate(async (valid) => {
        if (valid) {
          try {
            if (this.dictForm.id) {
              // 更新字典
              await api.dataDict.updateDataDict(this.dictForm.id, this.dictForm)
              this.$message.success('更新字典成功')
            } else {
              // 创建字典
              await api.dataDict.createDataDict(this.dictForm)
              this.$message.success('创建字典成功')
            }
            this.dictDialogVisible = false
            this.loadDictList()
          } catch (error) {
            this.$message.error('操作失败')
          }
        }
      })
    },

    // 处理提交字典项
    async handleSubmitDictItem() {
      this.$refs.dictItemFormRef.validate(async (valid) => {
        if (valid) {
          try {
            if (this.dictItemForm.id) {
              // 更新字典项
              await api.dataDict.updateDataDictItem(
                this.currentDict.code,
                this.dictItemForm.id,
                this.dictItemForm
              )
              this.$message.success('更新字典项成功')
            } else {
              // 创建字典项
              await api.dataDict.createDataDictItem(this.currentDict.code, this.dictItemForm)
              this.$message.success('创建字典项成功')
            }
            this.dictItemFormVisible = false
            this.loadDictItems(this.currentDict.code)
          } catch (error) {
            this.$message.error('操作失败')
          }
        }
      })
    },

    // 处理字典状态变化
    async handleDictStatusChange(row) {
      try {
        await api.dataDict.updateDataDict(row.id, {
          status: row.status
        })
        this.$message.success('状态更新成功')
      } catch (error) {
        row.status = row.status === 1 ? 0 : 1
        this.$message.error('状态更新失败')
      }
    },

    // 处理字典项状态变化
    async handleDictItemStatusChange(row) {
      try {
        await api.dataDict.updateDataDictItem(
          this.currentDict.code,
          row.id,
          { status: row.status }
        )
        this.$message.success('状态更新成功')
      } catch (error) {
        row.status = row.status === 1 ? 0 : 1
        this.$message.error('状态更新失败')
      }
    },

    // 处理删除字典
    handleDeleteDict(id) {
      this.$confirm('确定要删除该数据字典吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await api.dataDict.deleteDataDict(id)
          this.$message.success('删除成功')
          this.loadDictList()
        } catch (error) {
          this.$message.error('删除失败')
        }
      })
    },

    // 处理删除字典项
    handleDeleteDictItem(id) {
      this.$confirm('确定要删除该字典项吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await api.dataDict.deleteDataDictItem(this.currentDict.code, id)
          this.$message.success('删除成功')
          this.loadDictItems(this.currentDict.code)
        } catch (error) {
          this.$message.error('删除失败')
        }
      })
    }
  }
}
</script>

<style scoped>
.data-dict-management {
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

.dict-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dict-item-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}
</style>