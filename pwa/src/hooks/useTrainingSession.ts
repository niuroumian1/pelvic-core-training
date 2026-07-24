import { useEffect, useState } from 'react'
import { kegelProtocol } from '../engine/kegelProtocol'
import { TrainingEngine } from '../engine/trainingEngine'

export function useTrainingSession() {
  const [engine] = useState(() => new TrainingEngine(kegelProtocol))
  const [snapshot, setSnapshot] = useState(engine.getSnapshot)

  useEffect(() => {
    const unsubscribe = engine.subscribe(setSnapshot)
    engine.start()

    return () => {
      unsubscribe()
      engine.stop()
    }
  }, [engine])

  return snapshot
}

