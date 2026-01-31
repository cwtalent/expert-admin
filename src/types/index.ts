export interface ProjectType {
  id?: number;
  name: string;
  code: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  firstPrizeCount?: number;
  secondPrizeCount?: number;
  thirdPrizeCount?: number;
  currentSessionGuid?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id?: number;
  projectTypeId: number;
  projectTypeName?: string;
  applicantName?: string;
  applicantDepartment?: string;
  projectName: string;
  mainCompleters?: string;
  chiefEngineer?: string;
  preliminaryExpert1Name?: string;
  preliminaryLevel1?: string;
  preliminaryExpert2Name?: string;
  preliminaryLevel2?: string;
  status: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expert {
  id?: number;
  name: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpertLoginLog {
  id?: number;
  expertId: number;
  expertName?: string;  // 专家姓名
  loginTime: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;  // 设备类型
  loginStatus: string;
  failureReason?: string;
  createdAt?: string;
}

export interface Vote {
  id?: number;
  sessionGuid: string;
  projectTypeId: number;
  projectTypeName?: string;  // 项目类型名称
  roundNumber: number;
  projectId: number;
  projectName?: string;
  expertId: number;
  expertName?: string;
  awardLevel: string;
  voteTime: string;
  createdAt?: string;
  startedAt?: string;  // 投票会话开始时间
  closedAt?: string;   // 投票会话结束时间
}

export interface VotingSession {
  id?: number;
  sessionGuid: string;
  projectTypeId: number;
  qrCodeUrl?: string;
  votingUrl: string;
  status: string;
  startedAt?: string;
  closedAt?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Statistics {
  totalProjects: number;
  totalExperts: number;
  totalVotes: number;
  activeSessions: number;
  projectsByType: Record<string, number>;
  votesByLevel: Record<string, number>;
  totalLoginLogs: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface Award {
  id: number;
  sessionGuid: string;
  projectId: number;
  projectName: string;
  sortOrder?: number;
  awardLevel: '1st' | '2nd' | '3rd';
  createdAt: string;
}

export interface AwardsResponse {
  sessionGuid: string;
  awards: Award[];
  totalAwards: number;
}

export interface RealtimeStatistic {
  projectId: number;
  projectName: string;
  sortOrder?: number;
  firstCount: number;
  secondCount: number;
  thirdCount: number;
  rejectCount: number;
  totalVotes: number;
  roundStats?: Record<number, {
    firstCount: number;
    secondCount: number;
    thirdCount: number;
    rejectCount: number;
    totalVotes: number;
  }>;
  awardCategory?: number; // 1=一等奖候选, 2=二等奖候选, 3=三等奖候选, 4=未获奖
}

export interface RealtimeStatisticsResponse {
  sessionGuid: string;
  projectTypeId: number;
  statistics: RealtimeStatistic[];
  totalProjects: number;
}

// 新的实时统计数据结构（按轮次和奖级分组）
export interface RealtimeRoundData {
  roundNumber: number;
  awardLevel: '1st' | '2nd' | '3rd';
  awardLevelName: string;
  projects: Array<{
    projectId: number;
    projectName: string;
    sortOrder: number;
    voteCount: number;
    firstCount?: number; // 第一轮专用
    secondCount?: number; // 第一轮专用
    thirdCount?: number; // 第一轮专用
  }>;
}

export interface NewRealtimeStatisticsResponse {
  sessionGuid: string;
  projectTypeId: number;
  rounds: RealtimeRoundData[];
}