<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <img src="/logo.jpg" alt="Logo" class="logo-img" />
        <span class="logo-text">管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="sidebar-menu"
      >
        <el-menu-item :index="menuPaths.projectTypes">
          <el-icon><Document /></el-icon>
          <span>项目类型</span>
        </el-menu-item>
        <el-menu-item :index="menuPaths.projects">
          <el-icon><Folder /></el-icon>
          <span>项目管理</span>
        </el-menu-item>
        <el-menu-item :index="menuPaths.experts">
          <el-icon><User /></el-icon>
          <span>专家管理</span>
        </el-menu-item>
        <el-menu-item :index="menuPaths.loginLogs">
          <el-icon><Clock /></el-icon>
          <span>登录日志</span>
        </el-menu-item>
        <el-menu-item :index="menuPaths.votes">
          <el-icon><Tickets /></el-icon>
          <span>投票管理</span>
        </el-menu-item>
        <el-menu-item :index="menuPaths.statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>统计分析</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-title">院科技进步暨优秀成果奖评审管理系统</div>
        <div class="header-user">
          <span>{{ username }}</span>
          <el-button type="text" @click="handleLogout" style="margin-left: 10px;">退出</el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { Document, Folder, User, Clock, Tickets, DataAnalysis } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const username = ref('');

const activeMenu = computed(() => route.path);

const menuPaths = computed(() => ({
  projectTypes: router.resolve({ name: 'ProjectTypes' }).path,
  projects: router.resolve({ name: 'Projects' }).path,
  experts: router.resolve({ name: 'Experts' }).path,
  loginLogs: router.resolve({ name: 'LoginLogs' }).path,
  votes: router.resolve({ name: 'Votes' }).path,
  statistics: router.resolve({ name: 'Statistics' }).path,
}));

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning',
    });
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push({ name: 'Login' });
  } catch (error) {
    // 用户取消
  }
};

onMounted(() => {
  username.value = localStorage.getItem('username') || '';
});
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  color: #fff;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 10px;
  background-color: #2b3a4a;
}

.logo-img {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.sidebar-menu {
  border: none;
  background-color: #304156;
}

.sidebar-menu .el-menu-item {
  color: #bfcbd9;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #263445;
  color: #fff;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #409eff;
  color: #fff;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.header-user {
  display: flex;
  align-items: center;
  color: #606266;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
