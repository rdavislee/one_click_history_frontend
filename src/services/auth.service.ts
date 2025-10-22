import { apiService } from './api'
import type { LoginRequest, RegisterRequest } from '@/types'

interface AuthResponse {
  userId: string
}

export const authService = {
  async register(username: string, password: string): Promise<string> {
    const data: RegisterRequest = { username, password }
    const response = await apiService.post<AuthResponse>(
      '/UserAuthentication/register',
      data
    )
    return response.userId
  },

  async login(username: string, password: string): Promise<string> {
    const data: LoginRequest = { username, password }
    const response = await apiService.post<AuthResponse>(
      '/UserAuthentication/login',
      data
    )
    return response.userId
  },

  async changePassword(
    username: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiService.post('/UserAuthentication/changePassword', {
      username,
      oldPassword,
      newPassword
    })
  }
}

