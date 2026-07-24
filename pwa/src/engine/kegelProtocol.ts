import type { KegelPhase, TimedTrainingProtocol } from '../models/training'

export const kegelProtocol: TimedTrainingProtocol<KegelPhase> = {
  id: 'kegel-energy-core-v1',
  ready: {
    phase: 'READY',
    durationMs: 3_000,
  },
  workPhases: [
    {
      phase: 'CONTRACT',
      durationMs: 5_000,
    },
    {
      phase: 'HOLD',
      durationMs: 3_000,
    },
    {
      phase: 'RELAX',
      durationMs: 5_000,
    },
  ],
  successPhase: 'SUCCESS',
  totalSets: 3,
}

