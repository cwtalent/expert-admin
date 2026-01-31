import axios from 'axios';
import { ElMessage } from 'element-plus';
import type { ApiResponse, AwardsResponse, RealtimeStatisticsResponse } from '@/types';

// 创建专门用于调用 expert-api 的 axios 实例
const expertApiRequest = axios.create({
  baseURL: '/expert-api',
  timeout: 30000,
});

// 请求拦截器
expertApiRequest.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
expertApiRequest.interceptors.response.use(
  (response) => {
    const res: ApiResponse = response.data;
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return res.data;
  },
  (error) => {
    ElMessage.error(error.message || '网络错误');
    return Promise.reject(error);
  }
);

export const votingApi = {
  /**
   * 获取获奖名单
   */
  getAwards: (sessionGuid: string) => 
    expertApiRequest.get<AwardsResponse>(`/voting-sessions/${sessionGuid}/awards`),
  
  /**
   * 获取实时统计
   */
  getRealtimeStatistics: (sessionGuid: string) => 
    expertApiRequest.get<RealtimeStatisticsResponse>(`/voting-sessions/${sessionGuid}/realtime-statistics`),
};
