import { useEffect, useState } from 'react'
import { kegelProtocol } from '../engine/kegelProtocol'
import { TrainingEngine } from '../engine/trainingEngine'

export function useTrainingSession() {
  const [engine] = useState(() => new TrainingEngine(kegelProtocol))
  const [snapshot, setSnapshot] = useState(engine.getSnapshot)
  const [isPaused, setIsPaused] = useState(engine.isPaused())

  useEffect(() => {
    const unsubscribe = engine.subscribe(setSnapshot)
    engine.start()

    return () => {
      unsubscribe()
      engine.stop()
    }
  }, [engine])

  const pause = () => {
    engine.pause()
    setIsPaused(engine.isPaused())
  }

  const resume = () => {
    engine.resume()
    setIsPaused(engine.isPaused())
  }

  return { snapshot, pause, resume, isPaused }
}

