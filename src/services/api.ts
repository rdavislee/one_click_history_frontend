import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type { ApiError } from '@/types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    // Use environment variable for production, default to '/api' for local development
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
    
    this.api = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error)
        }
        throw error
      }
    )
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(endpoint, data)
    return response.data
  }

  // Helper method to check if response is an error
  isError(response: unknown): response is ApiError {
    return (response as ApiError).error !== undefined
  }
}

export const apiService = new ApiService()

