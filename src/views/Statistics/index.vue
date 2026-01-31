<template>
  <div class="statistics-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-label">项目总数</div>
            <div class="stat-value">{{ statistics.totalProjects }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-label">专家总数</div>
            <div class="stat-value">{{ statistics.totalExperts }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-label">投票总数</div>
            <div class="stat-value">{{ statistics.totalVotes }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-label">活跃会话</div>
            <div class="stat-value">{{ statistics.activeSessions }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>项目类型分布</span>
          </template>
          <div id="projectsChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>投票奖级分布</span>
          </template>
          <div id="votesChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { statisticsApi } from '@/api/statistics';
import type { Statistics } from '@/types';
import * as echarts from 'echarts';

const statistics = ref<Statistics>({
  totalProjects: 0,
  totalExperts: 0,
  totalVotes: 0,
  activeSessions: 0,
  projectsByType: {},
  votesByLevel: {},
  totalLoginLogs: 0,
});

const loadData = async () => {
  try {
    statistics.value = await statisticsApi.getOverview();
    await nextTick();
    renderCharts();
  } catch (error) {
    ElMessage.error('加载数据失败');
  }
};

const renderCharts = () => {
  // 项目类型分布图
  const projectsChart = echarts.init(document.getElementById('projectsChart')!);
  const projectsData = Object.entries(statistics.value.projectsByType).map(([name, value]) => ({
    name,
    value,
  }));
  projectsChart.setOption({
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        type: 'pie',
        data: projectsData,
      },
    ],
  });

  // 投票奖级分布图
  const votesChart = echarts.init(document.getElementById('votesChart')!);
  const votesData = Object.entries(statistics.value.votesByLevel).map(([name, value]) => ({
    name,
    value,
  }));
  votesChart.setOption({
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        type: 'pie',
        data: votesData,
      },
    ],
  });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.statistics-page {
  height: 100%;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}
</style>
