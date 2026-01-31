<template>
  <div class="projects-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目管理</span>
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
            <el-form-item label="项目名称">
              <el-input v-model="searchForm.projectName" placeholder="请输入项目名称" clearable style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申报人">
              <el-input v-model="searchForm.applicantName" placeholder="请输入申报人" clearable style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="申报部门">
              <el-input v-model="searchForm.applicantDepartment" placeholder="请输入申报部门" clearable style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 100%">
                <el-option label="草稿" value="draft" />
                <el-option label="已提交" value="submitted" />
                <el-option label="已批准" value="approved" />
                <el-option label="已拒绝" value="rejected" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
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
        <el-table-column prop="projectTypeName" label="项目类型" />
        <el-table-column prop="sortOrder" label="排序号" width="100" />
        <el-table-column prop="projectName" label="项目名称" min-width="200" />
        <el-table-column prop="applicantName" label="申报人" />
        <el-table-column prop="applicantDepartment" label="申报部门" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
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
      width="800px"
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="项目类型">
          <el-select v-model="form.projectTypeId" placeholder="请选择">
            <el-option
              v-for="type in projectTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序号">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="form.projectName" />
        </el-form-item>
        <el-form-item label="申报人">
          <el-input v-model="form.applicantName" />
        </el-form-item>
        <el-form-item label="申报部门">
          <el-input v-model="form.applicantDepartment" />
        </el-form-item>
        <el-form-item label="主要完成人员">
          <el-input v-model="form.mainCompleters" type="textarea" />
        </el-form-item>
        <el-form-item label="主管总工">
          <el-input v-model="form.chiefEngineer" />
        </el-form-item>
        <el-form-item label="初评专家1">
          <el-input v-model="form.preliminaryExpert1Name" />
        </el-form-item>
        <el-form-item label="初评等级1">
          <el-input v-model="form.preliminaryLevel1" />
        </el-form-item>
        <el-form-item label="初评专家2">
          <el-input v-model="form.preliminaryExpert2Name" />
        </el-form-item>
        <el-form-item label="初评等级2">
          <el-input v-model="form.preliminaryLevel2" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="草稿" value="draft" />
            <el-option label="已提交" value="submitted" />
            <el-option label="已批准" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
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
import { projectApi, type ProjectSearchParams } from '@/api/project';
import { projectTypeApi } from '@/api/projectType';
import type { Project, ProjectType } from '@/types';
import type { PageResult } from '@/api/project';

const tableData = ref<Project[]>([]);
const projectTypes = ref<ProjectType[]>([]);
const dialogVisible = ref(false);
const importDialogVisible = ref(false);
const dialogTitle = ref('新增项目');
const selectedIds = ref<number[]>([]);
const form = ref<Project>({
  projectTypeId: 0,
  projectName: '',
  applicantName: '',
  applicantDepartment: '',
  mainCompleters: '',
  chiefEngineer: '',
  preliminaryExpert1Name: '',
  preliminaryLevel1: '',
  preliminaryExpert2Name: '',
  preliminaryLevel2: '',
  status: 'draft',
  sortOrder: 0,
});
const editingId = ref<number | null>(null);
const uploadFile = ref<File | null>(null);

const searchForm = reactive<ProjectSearchParams>({
  projectTypeId: undefined,
  projectName: '',
  applicantName: '',
  applicantDepartment: '',
  status: undefined,
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
    const params: ProjectSearchParams = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    const result: PageResult<Project> = await projectApi.getAll(params);
    tableData.value = result.content;
    pagination.total = result.totalElements;
    projectTypes.value = await projectTypeApi.getAll();
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
  searchForm.projectName = '';
  searchForm.applicantName = '';
  searchForm.applicantDepartment = '';
  searchForm.status = undefined;
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

const handleSelectionChange = (selection: Project[]) => {
  selectedIds.value = selection.map(item => item.id!);
};

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的项目');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个项目吗？`, '提示', {
      type: 'warning',
    });
    await projectApi.batchDelete(selectedIds.value);
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
    projectTypeId: 0,
    projectName: '',
    applicantName: '',
    applicantDepartment: '',
    mainCompleters: '',
    chiefEngineer: '',
    preliminaryExpert1Name: '',
    preliminaryLevel1: '',
    preliminaryExpert2Name: '',
    preliminaryLevel2: '',
    status: 'draft',
    sortOrder: 0,
  };
  dialogTitle.value = '新增项目';
  dialogVisible.value = true;
};

const handleEdit = (row: Project) => {
  editingId.value = row.id!;
  form.value = { ...row };
  dialogTitle.value = '编辑项目';
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    if (editingId.value) {
      await projectApi.update(editingId.value, form.value);
      ElMessage.success('更新成功');
    } else {
      await projectApi.create(form.value);
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    loadData();
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
};

const handleDelete = async (row: Project) => {
  try {
    await ElMessageBox.confirm('确定要删除该项目吗？', '提示', {
      type: 'warning',
    });
    await projectApi.delete(row.id!);
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
    await projectApi.downloadTemplate();
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
    await projectApi.batchImport(uploadFile.value);
    ElMessage.success('导入成功');
    importDialogVisible.value = false;
    loadData();
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败');
  }
};

// 状态映射：英文 -> 中文
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'draft': '草稿',
    'submitted': '已提交',
    'approved': '已批准',
    'rejected': '已拒绝',
  };
  return statusMap[status] || status;
};

// 状态标签类型：根据状态返回不同的标签颜色
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'draft': 'info',
    'submitted': 'warning',
    'approved': 'success',
    'rejected': 'danger',
  };
  return typeMap[status] || '';
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.projects-page {
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
