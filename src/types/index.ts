// Type definitions based on API documentation

export interface Coordinates {
  lat: number
  lng: number
}

export interface User {
  userId: string
  username: string
}

export interface ChatSession {
  sessionId: string
  user: string
  location: Coordinates
  radius: number
  mainLocation: string
  timestamp: string
}

export interface HistoricalContext {
  context: string
  mainLocation: string
  sessionId: string
}

export interface ApiError {
  error: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface GenerateContextRequest {
  user: string
  location: Coordinates
  radius: number
}

export interface AnswerQuestionRequest {
  sessionId: string
  user: string
  question: string
}

export interface RecordChatRequest {
  sessionId: string
  user: string
  location: Coordinates
  radius: number
  mainLocation: string
}

