import { apiService } from './api'
import type { ChatSession, RecordChatRequest, Coordinates } from '@/types'

export const chatService = {
  async recordChat(
    sessionId: string,
    userId: string,
    location: Coordinates,
    radius: number,
    mainLocation: string
  ): Promise<void> {
    const data: RecordChatRequest = {
      sessionId,
      user: userId,
      location,
      radius,
      mainLocation
    }
    await apiService.post('/LocationChatLedger/recordChat', data)
  },

  async getUserChats(userId: string): Promise<ChatSession[]> {
    const response = await apiService.post<ChatSession[]>(
      '/LocationChatLedger/_getUserChats',
      { user: userId }
    )
    return response
  },

  async getChat(sessionId: string, userId: string): Promise<ChatSession> {
    const response = await apiService.post<ChatSession>(
      '/LocationChatLedger/_getChat',
      { sessionId, user: userId }
    )
    return response
  }
}

