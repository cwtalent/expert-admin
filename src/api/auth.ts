import request from './request';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}

export const authApi = {
  login: (data: LoginRequest) => request.post<LoginResponse>('/auth/login', data),
};
