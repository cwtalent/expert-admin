import request from './request';
import type { Statistics } from '@/types';

export const statisticsApi = {
  getOverview: () => request.get<Statistics>('/statistics/overview'),
  getByType: (typeId: number) => request.get<Statistics>(`/statistics/by-type/${typeId}`),
};
