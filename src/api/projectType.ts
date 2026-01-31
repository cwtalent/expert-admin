import request from './request';
import type { ProjectType } from '@/types';

export const projectTypeApi = {
  getAll: () => request.get<ProjectType[]>('/projecttypes'),
  getActive: () => request.get<ProjectType[]>('/projecttypes/active'),
  getById: (id: number) => request.get<ProjectType>(`/projecttypes/${id}`),
  create: (data: ProjectType) => request.post<ProjectType>('/projecttypes', data),
  update: (id: number, data: ProjectType) => request.put<ProjectType>(`/projecttypes/${id}`, data),
  delete: (id: number) => request.delete(`/projecttypes/${id}`),
  restartVoting: (id: number) => request.post<ProjectType>(`/projecttypes/${id}/restart-voting`),
};
