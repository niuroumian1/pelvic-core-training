import type { TrainingSession } from '../models/training'

export const aiEndpoints = {
  chat: '/api/ai/chat',
  trainingAnalysis: '/api/ai/training-analysis',
} as const

export interface AIChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface TrainingAnalysis {
  summary: string
  suggestion: string
  generatedBy: 'mock'
}

export interface AIService {
  chat(messages: AIChatMessage[]): Promise<AIChatMessage>
  analyzeTraining(session: TrainingSession): Promise<TrainingAnalysis>
}

export class MockAIService implements AIService {
  async chat(messages: AIChatMessage[]): Promise<AIChatMessage> {
    const latestMessage = messages.at(-1)?.content
    return {
      role: 'assistant',
      content: latestMessage
        ? `这是模拟回复：已收到“${latestMessage}”。`
        : '这是模拟训练助手，目前尚未连接真实 AI。',
    }
  }

  async analyzeTraining(session: TrainingSession): Promise<TrainingAnalysis> {
    return {
      summary: `已完成 ${session.completedSets} 组训练，训练记录已保存。`,
      suggestion: '继续保持自然呼吸和稳定节奏，避免过度用力。',
      generatedBy: 'mock',
    }
  }
}

export const aiService: AIService = new MockAIService()

