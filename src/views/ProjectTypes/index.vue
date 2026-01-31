<template>
  <div class="project-types-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目类型管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </template>
      
      <el-table :data="tableData" border>
        <el-table-column prop="sortOrder" label="排序" width="100" />
        <el-table-column prop="name" label="类型名称" />
        <el-table-column prop="firstPrizeCount" label="一等奖数量" width="120" />
        <el-table-column prop="secondPrizeCount" label="二等奖数量" width="120" />
        <el-table-column prop="thirdPrizeCount" label="三等奖数量" width="120" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="380">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
            <el-button size="small" type="warning" @click="handleRestartVoting(row)">重新创建投票</el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="handleVoteStatistics(row)"
              :disabled="!row.currentSessionGuid"
            >
              计票
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" />
        </el-form-item>
        <el-form-item label="类型名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.isActive" />
        </el-form-item>
        <el-divider />
        <el-form-item label="奖项数量设置">
          <div style="width: 100%;">
            <el-alert
              type="info"
              :closable="false"
              style="margin-bottom: 15px;"
            >
              <template #title>
                <div style="font-size: 12px; line-height: 1.5;">
                  <div>参考规则：</div>
                  <div>• 一等奖数量不超过总项目数的20%</div>
                  <div>• 二等奖数量不超过总项目数的50%</div>
                  <div>• 一、二、三等奖总数不超过总项目数的80%</div>
                  <div style="margin-top: 5px; color: #909399;">（此规则仅供参考，实际以手填为准）</div>
                </div>
              </template>
            </el-alert>
            <div class="award-counts-container">
              <el-form-item label="一等奖数量" class="award-form-item">
                <el-input-number v-model="form.firstPrizeCount" :min="0" style="width: 100%" />
              </el-form-item>
              <el-form-item label="二等奖数量" class="award-form-item">
                <el-input-number v-model="form.secondPrizeCount" :min="0" style="width: 100%" />
              </el-form-item>
              <el-form-item label="三等奖数量" class="award-form-item">
                <el-input-number v-model="form.thirdPrizeCount" :min="0" style="width: 100%" />
              </el-form-item>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { projectTypeApi } from '@/api/projectType';
import type { ProjectType } from '@/types';

const router = useRouter();

const tableData = ref<ProjectType[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('新增项目类型');
const form = ref<ProjectType>({
  name: '',
  code: '',
  description: '',
  sortOrder: 0,
  isActive: true,
  firstPrizeCount: undefined,
  secondPrizeCount: undefined,
  thirdPrizeCount: undefined,
});
const editingId = ref<number | null>(null);

const loadData = async () => {
  try {
    tableData.value = await projectTypeApi.getAll();
  } catch (error) {
    ElMessage.error('加载数据失败');
  }
};

const handleAdd = () => {
  editingId.value = null;
  form.value = {
    name: '',
    code: '',
    description: '',
    sortOrder: 0,
    isActive: true,
    firstPrizeCount: undefined,
    secondPrizeCount: undefined,
    thirdPrizeCount: undefined,
  };
  dialogTitle.value = '新增项目类型';
  dialogVisible.value = true;
};

const handleEdit = (row: ProjectType) => {
  editingId.value = row.id!;
  form.value = { ...row };
  dialogTitle.value = '编辑项目类型';
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    if (editingId.value) {
      await projectTypeApi.update(editingId.value, form.value);
      ElMessage.success('更新成功');
    } else {
      await projectTypeApi.create(form.value);
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    loadData();
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
};

const handleDelete = async (row: ProjectType) => {
  try {
    await ElMessageBox.confirm('确定要删除该项目类型吗？', '提示', {
      type: 'warning',
    });
    await projectTypeApi.delete(row.id!);
    ElMessage.success('删除成功');
    loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

const handleRestartVoting = async (row: ProjectType) => {
  try {
    await ElMessageBox.confirm(
      '确定要重新开始投票吗？这将创建新的投票会话并关闭旧的会话。',
      '提示',
      {
        type: 'warning',
      }
    );
    await projectTypeApi.restartVoting(row.id!);
    ElMessage.success('投票会话已重新创建');
    loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '重新开始投票失败');
    }
  }
};

const handleVoteStatistics = (row: ProjectType) => {
  if (!row.currentSessionGuid) {
    ElMessage.warning('该项目类型还没有投票会话');
    return;
  }
  router.push({
    name: 'VoteStatistics',
    params: { sessionGuid: row.currentSessionGuid },
  });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.project-types-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.award-counts-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.award-form-item {
  margin: 0;
  width: 100%;
}

.award-form-item :deep(.el-form-item__label) {
  width: 100px !important;
}

.award-form-item :deep(.el-form-item__content) {
  margin-left: 100px !important;
  flex: 1;
}
</style>
