import request from './request';
import type { Project } from '@/types';
import axios from 'axios';

export interface ProjectSearchParams {
  projectTypeId?: number;
  projectName?: string;
  applicantName?: string;
  applicantDepartment?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const projectApi = {
  getAll: (params?: ProjectSearchParams) => request.get<PageResult<Project>>('/projects', { params }),
  getByType: (typeId: number) => request.get<Project[]>(`/projects/by-type/${typeId}`),
  getById: (id: number) => request.get<Project>(`/projects/${id}`),
  create: (data: Project) => request.post<Project>('/projects', data),
  update: (id: number, data: Project) => request.put<Project>(`/projects/${id}`, data),
  delete: (id: number) => request.delete(`/projects/${id}`),
  batchDelete: (ids: number[]) => request.post('/projects/batch-delete', ids),
  downloadTemplate: () => {
    return axios.get('/expert-admin-api/projects/template', {
      responseType: 'blob',
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '项目导入模板.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  },
  batchImport: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/projects/batch-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
