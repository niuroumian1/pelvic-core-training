import { describe, expect, it } from 'vitest'
import { aiEndpoints, MockAIService } from './aiService'

describe('MockAIService', () => {
  it('keeps the future API paths explicit without making a request', async () => {
    const service = new MockAIService()
    const reply = await service.chat([{ role: 'user', content: '如何保持节奏？' }])

    expect(aiEndpoints.chat).toBe('/api/ai/chat')
    expect(aiEndpoints.trainingAnalysis).toBe('/api/ai/training-analysis')
    expect(reply).toMatchObject({ role: 'assistant' })
  })
})

