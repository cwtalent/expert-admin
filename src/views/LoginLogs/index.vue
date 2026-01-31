<template>
  <div class="login-logs-page">
    <el-card>
      <template #header>
        <span>登录日志</span>
      </template>
      
      <el-table :data="tableData" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="expertName" label="专家姓名" />
        <el-table-column prop="loginTime" label="登录时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.loginTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="ipAddress" label="IP地址" />
        <el-table-column prop="device" label="设备" />
        <el-table-column prop="loginStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.loginStatus === 'success' ? 'success' : 'danger'">
              {{ row.loginStatus === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="failureReason" label="失败原因" />
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { loginLogApi } from '@/api/loginLog';
import type { ExpertLoginLog } from '@/types';
import type { PageResult } from '@/api/project';
import { formatDateTime } from '@/utils/date';

const tableData = ref<ExpertLoginLog[]>([]);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const loadData = async () => {
  try {
    const result: PageResult<ExpertLoginLog> = await loginLogApi.getAll({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
    tableData.value = result.content;
    pagination.total = result.totalElements;
  } catch (error) {
    ElMessage.error('加载数据失败');
  }
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  loadData();
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.login-logs-page {
  height: 100%;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
