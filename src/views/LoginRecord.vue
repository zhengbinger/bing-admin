<template>
  <div class="login-record-management">
    <div class="page-header">
      <h2>登录记录管理</h2>
      <el-button type="danger" @click="handleCleanExpired">
        <i class="el-icon-delete"></i>
        清理过期记录
      </el-button>
    </div>

    <div class="search-container">
      <el-form :model="searchForm" label-width="80px" inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="searchForm.ip" placeholder="请输入IP地址"></el-input>
        </el-form-item>
        <el-form-item label="登录状态">
          <el-select v-model="searchForm.loginStatus" placeholder="请选择登录状态">
            <el-option label="成功" :value="1"></el-option>
            <el-option label="失败" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="登录时间">
          <el-date-picker
            v-model="searchForm.loginTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
          ></el-date-picker>
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
        :data="loginRecords"
        border
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120"></el-table-column>
        <el-table-column prop="ip" label="IP地址" min-width="150"></el-table-column>
        <el-table-column prop="loginTime" label="登录时间" min-width="180"></el-table-column>
        <el-table-column prop="loginStatus" label="登录状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.loginStatus ? 'success' : 'danger'">
              {{ scope.row.loginStatus ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userAgent" label="浏览器信息" min-width="200"></el-table-column>
        <el-table-column prop="errorMessage" label="错误信息" min-width="200">
          <template slot-scope="scope">
            <el-popover
              placement="top"
              width="400"
              trigger="hover"
            >
              <p>{{ scope.row.errorMessage }}</p>
              <span slot="reference">
                {{ scope.row.errorMessage ? scope.row.errorMessage.substring(0, 20) + '...' : '-' }}
              </span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleView(scope.row)">
              <i class="el-icon-view"></i>
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 登录记录详情对话框 -->
    <el-dialog
      title="登录记录详情"
      :visible.sync="detailVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detailData.username }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailData.ip }}</el-descriptions-item>
        <el-descriptions-item label="登录时间">{{ detailData.loginTime }}</el-descriptions-item>
        <el-descriptions-item label="登录状态">
          <el-tag :type="detailData.loginStatus ? 'success' : 'danger'">
            {{ detailData.loginStatus ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="浏览器信息">{{ detailData.userAgent }}</el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2">
          <el-input
            v-model="detailData.errorMessage"
            type="textarea"
            rows="4"
            readonly
          ></el-input>
        </el-descriptions-item>
      </el-descriptions>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'LoginRecord',
  data() {
    return {
      loginRecords: [],
      searchForm: {
        username: '',
        ip: '',
        loginStatus: null,
        loginTimeRange: null
      },
      detailVisible: false,
      detailData: {}
    }
  },
  created() {
    this.loadLoginRecords()
  },
  methods: {
    // 加载登录记录列表
    async loadLoginRecords() {
      try {
        const response = await api.loginRecord.getLoginRecords()
        this.loginRecords = response.data
      } catch (error) {
        this.$message.error('获取登录记录列表失败')
      }
    },

    // 处理查询
    async handleSearch() {
      try {
        const params = { ...this.searchForm }
        if (params.loginTimeRange) {
          params.startTime = params.loginTimeRange[0]
          params.endTime = params.loginTimeRange[1]
          delete params.loginTimeRange
        }
        const response = await api.loginRecord.getLoginRecords(params)
        this.loginRecords = response.data
      } catch (error) {
        this.$message.error('查询失败')
      }
    },

    // 处理重置
    handleReset() {
      this.searchForm = {
        username: '',
        ip: '',
        loginStatus: null,
        loginTimeRange: null
      }
      this.loadLoginRecords()
    },

    // 处理行点击
    handleRowClick(row) {
      this.detailData = { ...row }
      this.detailVisible = true
    },

    // 处理查看
    handleView(row) {
      this.detailData = { ...row }
      this.detailVisible = true
    },

    // 清理过期记录
    handleCleanExpired() {
      this.$confirm('确定要清理过期登录记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await api.loginRecord.cleanExpiredRecords()
          this.$message.success('清理成功')
          this.loadLoginRecords()
        } catch (error) {
          this.$message.error('清理失败')
        }
      })
    }
  }
}
</script>

<style scoped>
.login-record-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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