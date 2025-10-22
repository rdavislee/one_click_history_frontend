import { apiService } from './api'
import type {
  Coordinates,
  HistoricalContext,
  GenerateContextRequest,
  AnswerQuestionRequest
} from '@/types'

interface AnswerResponse {
  answer: string
}

export const historyService = {
  async generateContext(
    userId: string,
    location: Coordinates,
    radius: number
  ): Promise<HistoricalContext> {
    const data: GenerateContextRequest = {
      user: userId,
      location,
      radius
    }
    const response = await apiService.post<HistoricalContext>(
      '/AIHistoricalContextAgent/generateContext',
      data
    )
    return response
  },

  async answerQuestion(
    sessionId: string,
    userId: string,
    question: string
  ): Promise<string> {
    const data: AnswerQuestionRequest = {
      sessionId,
      user: userId,
      question
    }
    const response = await apiService.post<AnswerResponse>(
      '/AIHistoricalContextAgent/answerQuestion',
      data
    )
    return response.answer
  },

  async clearSession(sessionId: string, userId: string): Promise<void> {
    await apiService.post('/AIHistoricalContextAgent/clearSession', {
      sessionId,
      user: userId
    })
  },

  async getChat(locationName: string): Promise<unknown> {
    return await apiService.post('/AIHistoricalContextAgent/_getChat', {
      locationName
    })
  }
}

