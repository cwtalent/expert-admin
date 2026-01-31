import request from './request';
import type { Vote } from '@/types';
import type { PageResult } from './project';

export interface VoteSearchParams {
  projectTypeId?: number;
  startedAtFrom?: string;
  startedAtTo?: string;
  closedAtFrom?: string;
  closedAtTo?: string;
  roundNumber?: number;
  projectName?: string;
  expertName?: string;
  awardLevel?: string;
  page?: number;
  pageSize?: number;
}

export const voteApi = {
  getAll: (params?: VoteSearchParams) => request.get<PageResult<Vote>>('/votes', { params }),
  getBySession: (sessionGuid: string) => request.get<Vote[]>(`/votes/by-session/${sessionGuid}`),
  getBySessionAndRound: (sessionGuid: string, roundNumber: number) =>
    request.get<Vote[]>(`/votes/by-session/${sessionGuid}/round/${roundNumber}`),
  getByProject: (projectId: number) => request.get<Vote[]>(`/votes/by-project/${projectId}`),
  getByExpert: (expertId: number) => request.get<Vote[]>(`/votes/by-expert/${expertId}`),
  getStatistics: () => request.get('/votes/statistics'),
};
