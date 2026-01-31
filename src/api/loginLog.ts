import request from './request';
import type { ExpertLoginLog } from '@/types';
import type { PageResult } from './project';

export interface LoginLogSearchParams {
  page?: number;
  pageSize?: number;
}

export const loginLogApi = {
  getAll: (params?: LoginLogSearchParams) => request.get<PageResult<ExpertLoginLog>>('/loginlogs', { params }),
  getByExpertId: (expertId: number) => request.get<ExpertLoginLog[]>(`/loginlogs/expert/${expertId}`),
};
