<template>
  <div class="votes-page">
    <el-card>
      <template #header>
        <span>投票管理</span>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="项目类型">
              <el-select v-model="searchForm.projectTypeId" placeholder="全部" clearable style="width: 100%">
                <el-option
                  v-for="type in projectTypes"
                  :key="type.id"
                  :label="type.name"
                  :value="type.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开始投票时间">
              <el-date-picker
                v-model="startedAtRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结束投票时间">
              <el-date-picker
                v-model="closedAtRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="轮次">
              <el-input-number
                v-model="searchForm.roundNumber"
                :min="1"
                placeholder="轮次"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目名称">
              <el-input v-model="searchForm.projectName" placeholder="请输入项目名称" clearable style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="专家姓名">
              <el-input v-model="searchForm.expertName" placeholder="请输入专家姓名" clearable style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="奖级">
              <el-select v-model="searchForm.awardLevel" placeholder="全部" clearable style="width: 100%">
                <el-option label="一等" value="1st" />
                <el-option label="二等" value="2nd" />
                <el-option label="三等" value="3rd" />
                <el-option label="未选" value="reject" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="8">
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <el-table :data="tableData" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="projectTypeName" label="项目类型" />
        <el-table-column prop="startedAt" label="开始投票时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.startedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="closedAt" label="结束投票时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.closedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="roundNumber" label="轮次" width="80" />
        <el-table-column prop="projectName" label="项目名称" />
        <el-table-column prop="expertName" label="专家姓名" />
        <el-table-column prop="awardLevel" label="奖级" width="100">
          <template #default="{ row }">
            <el-tag>{{ getAwardLevelText(row.awardLevel) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="voteTime" label="投票时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.voteTime) }}
          </template>
        </el-table-column>
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
import { voteApi, type VoteSearchParams } from '@/api/vote';
import { projectTypeApi } from '@/api/projectType';
import type { Vote } from '@/types';
import type { ProjectType } from '@/types';
import type { PageResult } from '@/api/project';
import { formatDateTime, getAwardLevelText } from '@/utils/date';

const tableData = ref<Vote[]>([]);
const projectTypes = ref<ProjectType[]>([]);
const startedAtRange = ref<[string, string] | null>(null);
const closedAtRange = ref<[string, string] | null>(null);

const searchForm = reactive<VoteSearchParams>({
  projectTypeId: undefined,
  startedAtFrom: undefined,
  startedAtTo: undefined,
  closedAtFrom: undefined,
  closedAtTo: undefined,
  roundNumber: undefined,
  projectName: '',
  expertName: '',
  awardLevel: undefined,
  page: 1,
  pageSize: 10,
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const loadData = async () => {
  try {
    const params: VoteSearchParams = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    
    // 处理开始投票时间范围
    if (startedAtRange.value && startedAtRange.value.length === 2) {
      params.startedAtFrom = startedAtRange.value[0];
      params.startedAtTo = startedAtRange.value[1];
    } else {
      params.startedAtFrom = undefined;
      params.startedAtTo = undefined;
    }
    
    // 处理结束投票时间范围
    if (closedAtRange.value && closedAtRange.value.length === 2) {
      params.closedAtFrom = closedAtRange.value[0];
      params.closedAtTo = closedAtRange.value[1];
    } else {
      params.closedAtFrom = undefined;
      params.closedAtTo = undefined;
    }
    
    const result: PageResult<Vote> = await voteApi.getAll(params);
    tableData.value = result.content;
    pagination.total = result.totalElements;
  } catch (error) {
    ElMessage.error('加载数据失败');
  }
};

const handleSearch = () => {
  pagination.page = 1;
  loadData();
};

const handleReset = () => {
  searchForm.projectTypeId = undefined;
  searchForm.roundNumber = undefined;
  searchForm.projectName = '';
  searchForm.expertName = '';
  searchForm.awardLevel = undefined;
  startedAtRange.value = null;
  closedAtRange.value = null;
  pagination.page = 1;
  loadData();
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

onMounted(async () => {
  try {
    projectTypes.value = await projectTypeApi.getAll();
  } catch (error) {
    ElMessage.error('加载项目类型失败');
  }
  loadData();
});
</script>

<style scoped>
.votes-page {
  height: 100%;
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.search-form .el-form-item {
  margin-bottom: 18px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
