<template>
  <div class="vote-statistics-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>计票</span>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 选项卡1：获奖名单 -->
        <el-tab-pane label="获奖名单" name="awards">
          <div class="awards-header">
            <el-button @click="refreshAwards" :loading="loadingAwards">刷新</el-button>
            <el-switch
              v-model="autoRefreshAwards"
              active-text="自动刷新"
              inactive-text="手动刷新"
              style="margin-left: 10px;"
            />
            <span v-if="autoRefreshAwards" class="refresh-tip">每5秒自动刷新</span>
          </div>
          
          <div v-if="loadingAwards" class="loading-container">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-else-if="awardsError" class="error-container">
            <el-alert type="error" :title="awardsError" :closable="false" />
          </div>
          <div v-else>
            <el-table :data="awardsData" border>
              <el-table-column prop="sortOrder" label="排序号" width="100" align="center" />
              <el-table-column prop="projectName" label="项目名称" min-width="300" />
              <el-table-column prop="awardLevel" label="获奖等级" width="120">
                <template #default="{ row }">
                  <el-tag v-if="row.awardLevel === '1st'" type="danger">一等奖</el-tag>
                  <el-tag v-else-if="row.awardLevel === '2nd'" type="warning">二等奖</el-tag>
                  <el-tag v-else-if="row.awardLevel === '3rd'" type="success">三等奖</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="获奖时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <!-- 选项卡2：实时统计 -->
        <el-tab-pane label="实时统计" name="realtime">
          <div class="realtime-header">
            <el-button @click="refreshRealtime" :loading="loadingRealtime">刷新</el-button>
            <el-switch
              v-model="autoRefresh"
              active-text="自动刷新"
              inactive-text="手动刷新"
              style="margin-left: 10px;"
            />
            <span v-if="autoRefresh" class="refresh-tip">每5秒自动刷新</span>
          </div>
          
          <div v-if="loadingRealtime" class="loading-container">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-else-if="realtimeError" class="error-container">
            <el-alert type="error" :title="realtimeError" :closable="false" />
          </div>
          <div v-else>
            <div v-if="roundGroups.length === 0" class="empty-container">
              <el-empty description="暂无投票数据" />
            </div>
            <div v-else>
              <!-- 嵌套选项卡：按轮次分组 -->
              <el-tabs v-model="activeRoundTab" type="card" class="round-tabs">
                <el-tab-pane 
                  v-for="roundGroup in roundGroups" 
                  :key="`round-${roundGroup.roundNumber}`"
                  :label="roundGroup.label" 
                  :name="`round-${roundGroup.roundNumber}`"
                >
                  <!-- 按奖级分组显示 -->
                  <el-tabs 
                    :model-value="getAwardTabName(roundGroup.roundNumber)" 
                    @update:model-value="(val) => setAwardTabName(roundGroup.roundNumber, val)"
                    type="border-card" 
                    class="award-tabs"
                  >
                    <el-tab-pane 
                      v-for="awardGroup in roundGroup.awardGroups" 
                      :key="`${roundGroup.roundNumber}-${awardGroup.awardLevel}`"
                      :label="awardGroup.awardLevelName" 
                      :name="`${roundGroup.roundNumber}-${awardGroup.awardLevel}`"
                    >
                      <el-table :data="awardGroup.projects" border>
                        <el-table-column type="index" label="序号" width="80" align="center">
                          <template #default="{ row }">
                            {{ row.sortOrder }}
                          </template>
                        </el-table-column>
                        <el-table-column prop="projectName" label="项目名称" min-width="300" />
                        <el-table-column 
                          v-if="roundGroup.roundNumber === 1"
                          prop="firstCount" 
                          label="一等票" 
                          width="100" 
                          align="center"
                        >
                          <template #default="{ row }">
                            <span class="vote-count first">{{ row.firstCount || 0 }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column 
                          v-if="roundGroup.roundNumber === 1"
                          prop="secondCount" 
                          label="二等票" 
                          width="100" 
                          align="center"
                        >
                          <template #default="{ row }">
                            <span class="vote-count second">{{ row.secondCount || 0 }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column 
                          v-if="roundGroup.roundNumber === 1"
                          prop="thirdCount" 
                          label="三等票" 
                          width="100" 
                          align="center"
                        >
                          <template #default="{ row }">
                            <span class="vote-count third">{{ row.thirdCount || 0 }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column 
                          v-if="roundGroup.roundNumber === 1"
                          label="总票数" 
                          width="100" 
                          align="center"
                        >
                          <template #default="{ row }">
                            <span class="vote-count total">
                              {{ (row.firstCount || 0) + (row.secondCount || 0) + (row.thirdCount || 0) }}
                            </span>
                          </template>
                        </el-table-column>
                        <el-table-column 
                          v-if="roundGroup.roundNumber > 1"
                          prop="voteCount" 
                          label="得票数" 
                          width="120" 
                          align="center"
                        >
                          <template #default="{ row }">
                            <span class="vote-count total">{{ row.voteCount || 0 }}</span>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-tab-pane>
                  </el-tabs>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { votingApi } from '@/api/voting';
import type { Award, RealtimeStatistic, NewRealtimeStatisticsResponse, RealtimeRoundData } from '@/types';
import { formatDateTime } from '@/utils/date';

const route = useRoute();
const router = useRouter();

const sessionGuid = ref<string>('');
const activeTab = ref('awards');
const activeRoundTab = ref('round-1');
const awardTabMap = ref<Record<number, string>>({});

// 获奖名单相关
const loadingAwards = ref(false);
const awardsError = ref('');
const awardsData = ref<Award[]>([]);
const autoRefreshAwards = ref(false);
let awardsRefreshTimer: number | null = null;

// 实时统计相关
const loadingRealtime = ref(false);
const realtimeError = ref('');
const realtimeData = ref<RealtimeStatistic[]>([]);
const realtimeRoundsData = ref<RealtimeRoundData[]>([]);
const autoRefresh = ref(false);
let realtimeRefreshTimer: number | null = null;

// 加载获奖名单
const loadAwards = async () => {
  if (!sessionGuid.value) return;
  
  loadingAwards.value = true;
  awardsError.value = '';
  try {
    const response = await votingApi.getAwards(sessionGuid.value);
    awardsData.value = response.awards || [];
  } catch (error: any) {
    awardsError.value = error.message || '加载获奖名单失败';
    ElMessage.error(awardsError.value);
  } finally {
    loadingAwards.value = false;
  }
};

// 加载实时统计
const loadRealtimeStatistics = async () => {
  if (!sessionGuid.value) return;
  
  loadingRealtime.value = true;
  realtimeError.value = '';
  try {
    const response = await votingApi.getRealtimeStatistics(sessionGuid.value) as any;
    // 检查是否是新格式（有 rounds 字段）
    if (response.rounds && Array.isArray(response.rounds)) {
      realtimeRoundsData.value = response.rounds || [];
      // 初始化第一个轮次和奖级的选项卡
      if (realtimeRoundsData.value.length > 0) {
        const firstRound = realtimeRoundsData.value[0];
        activeRoundTab.value = `round-${firstRound.roundNumber}`;
        // 初始化奖级选项卡会在 watch 中处理
      }
    } else {
      // 兼容旧格式
      realtimeData.value = response.statistics || [];
    }
  } catch (error: any) {
    realtimeError.value = error.message || '加载实时统计失败';
    ElMessage.error(realtimeError.value);
  } finally {
    loadingRealtime.value = false;
  }
};

// 按轮次分组数据
const roundGroups = computed(() => {
  const groups: Array<{
    roundNumber: number;
    label: string;
    awardGroups: Array<{
      awardLevel: string;
      awardLevelName: string;
      projects: any[];
    }>;
  }> = [];
  
  // 按轮次分组
  const roundsMap = new Map<number, RealtimeRoundData[]>();
  for (const roundData of realtimeRoundsData.value) {
    const roundNum = roundData.roundNumber;
    if (!roundsMap.has(roundNum)) {
      roundsMap.set(roundNum, []);
    }
    roundsMap.get(roundNum)!.push(roundData);
  }
  
  // 转换为分组结构
  for (const [roundNum, roundDataList] of roundsMap.entries()) {
    const awardGroups = roundDataList.map(roundData => ({
      awardLevel: roundData.awardLevel,
      awardLevelName: roundData.awardLevelName,
      projects: roundData.projects || []
    }));
    
    groups.push({
      roundNumber: roundNum,
      label: roundNum === 1 ? '第一轮' : `第${roundNum}轮`,
      awardGroups: awardGroups.sort((a, b) => {
        // 按奖级排序：1st < 2nd < 3rd
        const levelOrder: Record<string, number> = { '1st': 1, '2nd': 2, '3rd': 3 };
        return (levelOrder[a.awardLevel] || 999) - (levelOrder[b.awardLevel] || 999);
      })
    });
  }
  
  // 按轮次排序
  return groups.sort((a, b) => a.roundNumber - b.roundNumber);
});

// 刷新获奖名单
const refreshAwards = () => {
  loadAwards();
};

// 刷新实时统计
const refreshRealtime = () => {
  loadRealtimeStatistics();
};

// 返回
const handleBack = () => {
  router.push({ name: 'ProjectTypes' });
};

// 自动刷新
onMounted(() => {
  sessionGuid.value = route.params.sessionGuid as string;
  if (sessionGuid.value) {
    loadAwards();
    loadRealtimeStatistics();
  }
});

// 监听获奖名单自动刷新开关
const watchAutoRefreshAwards = () => {
  if (autoRefreshAwards.value) {
    awardsRefreshTimer = window.setInterval(() => {
      if (activeTab.value === 'awards') {
        loadAwards();
      }
    }, 5000);
  } else {
    if (awardsRefreshTimer !== null) {
      clearInterval(awardsRefreshTimer);
      awardsRefreshTimer = null;
    }
  }
};

// 监听实时统计自动刷新开关
const watchAutoRefresh = () => {
  if (autoRefresh.value) {
    realtimeRefreshTimer = window.setInterval(() => {
      if (activeTab.value === 'realtime') {
        loadRealtimeStatistics();
      }
    }, 5000);
  } else {
    if (realtimeRefreshTimer !== null) {
      clearInterval(realtimeRefreshTimer);
      realtimeRefreshTimer = null;
    }
  }
};

// 使用 watch 监听自动刷新开关
watch(autoRefreshAwards, watchAutoRefreshAwards);
watch(autoRefresh, watchAutoRefresh);

// 获取指定轮次的奖级选项卡名称
const getAwardTabName = (roundNumber: number): string => {
  return awardTabMap.value[roundNumber] || '';
};

// 设置指定轮次的奖级选项卡名称
const setAwardTabName = (roundNumber: number, tabName: string) => {
  awardTabMap.value[roundNumber] = tabName;
};

// 监听轮次选项卡变化，自动切换到该轮次的第一个奖级
watch(activeRoundTab, (newRoundTab) => {
  if (newRoundTab && newRoundTab.startsWith('round-')) {
    const roundNum = parseInt(newRoundTab.replace('round-', ''), 10);
    const roundGroup = roundGroups.value.find(g => g.roundNumber === roundNum);
    if (roundGroup && roundGroup.awardGroups.length > 0) {
      const firstAward = roundGroup.awardGroups[0];
      if (!awardTabMap.value[roundNum]) {
        awardTabMap.value[roundNum] = `${roundNum}-${firstAward.awardLevel}`;
      }
    }
  }
});

// 监听轮次数据变化，初始化奖级选项卡
watch(roundGroups, (newGroups) => {
  if (newGroups.length > 0) {
    for (const roundGroup of newGroups) {
      if (!awardTabMap.value[roundGroup.roundNumber] && roundGroup.awardGroups.length > 0) {
        const firstAward = roundGroup.awardGroups[0];
        awardTabMap.value[roundGroup.roundNumber] = `${roundGroup.roundNumber}-${firstAward.awardLevel}`;
      }
    }
    // 如果当前没有选中的轮次，初始化第一个轮次
    if (!activeRoundTab.value || !activeRoundTab.value.startsWith('round-')) {
      activeRoundTab.value = `round-${newGroups[0].roundNumber}`;
    }
  }
}, { immediate: true });

onUnmounted(() => {
  if (awardsRefreshTimer !== null) {
    clearInterval(awardsRefreshTimer);
  }
  if (realtimeRefreshTimer !== null) {
    clearInterval(realtimeRefreshTimer);
  }
});
</script>

<style scoped>
.vote-statistics-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-container,
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 10px;
}

.realtime-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
}

.awards-header,
.realtime-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
}

.refresh-tip {
  color: #909399;
  font-size: 12px;
}

.vote-count {
  font-weight: bold;
}

.vote-count.first {
  color: #f56c6c;
}

.vote-count.second {
  color: #e6a23c;
}

.vote-count.third {
  color: #67c23a;
}

.vote-count.total {
  color: #409eff;
}

.round-tabs {
  margin-top: 10px;
}

.award-tabs {
  margin-top: 10px;
}

.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
</style>
