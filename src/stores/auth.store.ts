import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const userId = ref<string | null>(null)
  const username = ref<string | null>(null)
  const isAuthenticated = computed(() => userId.value !== null)

  // Load from localStorage on initialization
  const storedUserId = localStorage.getItem('userId')
  const storedUsername = localStorage.getItem('username')
  if (storedUserId && storedUsername) {
    userId.value = storedUserId
    username.value = storedUsername
  }

  async function login(user: string, password: string) {
    try {
      const id = await authService.login(user, password)
      userId.value = id
      username.value = user
      localStorage.setItem('userId', id)
      localStorage.setItem('username', user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }
    }
  }

  async function register(user: string, password: string) {
    try {
      const id = await authService.register(user, password)
      userId.value = id
      username.value = user
      localStorage.setItem('userId', id)
      localStorage.setItem('username', user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      }
    }
  }

  function logout() {
    userId.value = null
    username.value = null
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
  }

  return {
    userId,
    username,
    isAuthenticated,
    login,
    register,
    logout
  }
})

