import api from '@/lib/api';
import { LoginData, RegisterData, AuthResponse } from '@/types/auth';

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/sessions', data);
    return response.data;
  },

  async register(data: RegisterData): Promise<void> {
    const response = await api.post('/accounts', data);
    return response.data;
  },
};