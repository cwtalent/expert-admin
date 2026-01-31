import request from './request';
import type { Expert } from '@/types';
import axios from 'axios';
import type { PageResult } from './project';

export interface ExpertSearchParams {
  name?: string;
  phone?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const expertApi = {
  getAll: (params?: ExpertSearchParams) => request.get<PageResult<Expert>>('/experts', { params }),
  getById: (id: number) => request.get<Expert>(`/experts/${id}`),
  getByPhone: (phone: string) => request.get<Expert>(`/experts/by-phone/${phone}`),
  create: (data: Expert) => request.post<Expert>('/experts', data),
  update: (id: number, data: Expert) => request.put<Expert>(`/experts/${id}`, data),
  delete: (id: number) => request.delete(`/experts/${id}`),
  batchDelete: (ids: number[]) => request.post('/experts/batch-delete', ids),
  downloadTemplate: () => {
    return axios.get('/expert-admin-api/experts/template', {
      responseType: 'blob',
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '专家导入模板.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  },
  batchImport: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/experts/batch-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
