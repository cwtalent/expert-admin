<template>
  <div class="experts-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>专家管理</span>
          <div>
            <el-button @click="handleDownloadTemplate">
              <el-icon><Download /></el-icon>
              下载模板
            </el-button>
            <el-button @click="handleImport">
              <el-icon><Upload /></el-icon>
              批量导入
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
            <el-button 
              type="danger" 
              :disabled="selectedIds.length === 0"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="姓名">
              <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="手机号">
              <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-select v-model="searchForm.isActive" placeholder="全部" clearable style="width: 100%">
                <el-option label="启用" :value="true" />
                <el-option label="禁用" :value="false" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8" :offset="16">
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <el-table 
        :data="tableData" 
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.lastLoginAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="批量导入" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        accept=".xlsx,.xls"
      >
        <el-button type="primary">选择文件</el-button>
        <template #tip>
          <div class="el-upload__tip">只能上传 Excel 文件</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImportSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Upload, Download, Delete } from '@element-plus/icons-vue';
import { expertApi, type ExpertSearchParams } from '@/api/expert';
import type { Expert } from '@/types';
import type { PageResult } from '@/api/project';
import { formatDateTime } from '@/utils/date';

const tableData = ref<Expert[]>([]);
const dialogVisible = ref(false);
const importDialogVisible = ref(false);
const dialogTitle = ref('新增专家');
const selectedIds = ref<number[]>([]);
const form = ref<Expert>({
  name: '',
  phone: '',
  isActive: true,
});
const editingId = ref<number | null>(null);
const uploadFile = ref<File | null>(null);

const searchForm = reactive<ExpertSearchParams>({
  name: '',
  phone: '',
  isActive: undefined,
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
    const params: ExpertSearchParams = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    const result: PageResult<Expert> = await expertApi.getAll(params);
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
  searchForm.name = '';
  searchForm.phone = '';
  searchForm.isActive = undefined;
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

const handleSelectionChange = (selection: Expert[]) => {
  selectedIds.value = selection.map(item => item.id!);
};

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的专家');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个专家吗？`, '提示', {
      type: 'warning',
    });
    await expertApi.batchDelete(selectedIds.value);
    ElMessage.success('批量删除成功');
    selectedIds.value = [];
    loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

const handleAdd = () => {
  editingId.value = null;
  form.value = {
    name: '',
    phone: '',
    isActive: true,
  };
  dialogTitle.value = '新增专家';
  dialogVisible.value = true;
};

const handleEdit = (row: Expert) => {
  editingId.value = row.id!;
  form.value = { ...row };
  dialogTitle.value = '编辑专家';
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    // 如果手机号是空字符串，转换为null
    const submitData = {
      ...form.value,
      phone: form.value.phone && form.value.phone.trim() ? form.value.phone.trim() : null,
    };
    
    if (editingId.value) {
      await expertApi.update(editingId.value, submitData);
      ElMessage.success('更新成功');
    } else {
      await expertApi.create(submitData);
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    loadData();
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
};

const handleDelete = async (row: Expert) => {
  try {
    await ElMessageBox.confirm('确定要删除该专家吗？', '提示', {
      type: 'warning',
    });
    await expertApi.delete(row.id!);
    ElMessage.success('删除成功');
    loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

const handleDownloadTemplate = async () => {
  try {
    await expertApi.downloadTemplate();
    ElMessage.success('模板下载成功');
  } catch (error: any) {
    ElMessage.error(error.message || '下载失败');
  }
};

const handleImport = () => {
  importDialogVisible.value = true;
};

const handleFileChange = (file: any) => {
  uploadFile.value = file.raw;
};

const handleImportSubmit = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请选择文件');
    return;
  }
  try {
    await expertApi.batchImport(uploadFile.value);
    ElMessage.success('导入成功');
    importDialogVisible.value = false;
    loadData();
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败');
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.experts-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
