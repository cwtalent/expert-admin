import axios from 'axios';
import { ElMessage } from 'element-plus';
import type { ApiResponse } from '@/types';

const request = axios.create({
  baseURL: '/expert-admin-api',
  timeout: 30000,
});

// 请求拦截器
request.interceptors.request.use(
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
request.interceptors.response.use(
  (response) => {
    const res: ApiResponse = response.data;
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return res.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      const baseUrl = import.meta.env.BASE_URL;
      window.location.href = `${baseUrl}login`.replace(/\/+/g, '/');
    }
    ElMessage.error(error.message || '网络错误');
    return Promise.reject(error);
  }
);

export default request;
