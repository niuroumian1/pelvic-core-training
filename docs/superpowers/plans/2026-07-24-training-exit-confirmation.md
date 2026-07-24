# Training Exit Confirmation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pause-aware confirmation panel when the user tries to leave an active training session.

**Architecture:** `TrainingEngine` owns reusable pause/resume timing semantics, `useTrainingSession` exposes controls, and `Training` coordinates navigation with a presentation-only `ExitConfirmation` component. Completion persistence remains unchanged and only runs after SUCCESS.

**Tech Stack:** React 18, TypeScript 5.7, React Router 7, Vite 6, Vitest 3, Testing Library, CSS.

## Global Constraints

- The confirmation pauses READY, CONTRACT, HOLD, or RELAX without advancing elapsed time.
- Continuing resumes from the same phase, set, remaining time, and progress.
- Ending returns home without creating a completion, XP, streak, or history entry.
- SUCCESS keeps the existing result flow and never shows the confirmation.
- Only the training page's own back button is intercepted in V0.1.
- Do not add browser back interception, unfinished-session storage, cloud sync, or a generic route-blocking framework.
- Preserve the existing S23-first layout and `env(safe-area-inset-bottom)` compatibility.

---

## File Map

- Modify `pwa/src/engine/trainingEngine.ts`: add reusable pause/resume state.
- Modify `pwa/src/engine/trainingEngine.test.ts`: prove pause timing and idempotency.
- Modify `pwa/src/hooks/useTrainingSession.ts`: expose snapshot and engine controls.
- Create `pwa/src/components/ExitConfirmation/ExitConfirmation.tsx`: accessible presentation-only dialog.
- Create `pwa/src/components/ExitConfirmation/ExitConfirmation.test.tsx`: verify callbacks and semantics.
- Modify `pwa/src/pages/Training.tsx`: coordinate pause, resume, exit, and navigation.
- Create `pwa/src/pages/Training.test.tsx`: verify page-level coordination and no persistence on exit.
- Modify `pwa/src/styles/global.css`: add mobile bottom-sheet styling.
- Modify `pwa/package.json` and `pwa/package-lock.json`: add Testing Library and jsdom test dependencies.
- Modify `pwa/vite.config.ts`: use jsdom for component tests.
- Modify `docs/PROJECT_STATUS.md`: record the completed behavior and remaining system-back limitation.

---

### Task 1: Add pause and resume semantics to TrainingEngine

**Files:**
- Modify: `pwa/src/engine/trainingEngine.test.ts`
- Modify: `pwa/src/engine/trainingEngine.ts`

**Interfaces:**
- Produces: `TrainingEngine.pause(): void`
- Produces: `TrainingEngine.resume(): void`
- Produces: `TrainingEngine.isPaused(): boolean`
- Preserves: `start()`, `stop()`, `getSnapshot()`, and `subscribe()`

- [ ] **Step 1: Add a controllable scheduler and failing pause/resume tests**

Add a local scheduler helper to `trainingEngine.test.ts`:

```ts
function createScheduler() {
  let now = 0
  let callback: (() => void) | undefined
  let registrations = 0

  return {
    scheduler: {
      now: () => now,
      setInterval: (next: () => void) => {
        callback = next
        registrations += 1
        return registrations
      },
      clearInterval: () => {
        callback = undefined
      },
    },
    advanceBy(ms: number) {
      now += ms
      callback?.()
    },
    get registrations() {
      return registrations
    },
  }
}
```

Add tests whose production break is “pause time leaks into the next tick” and “resume registers duplicate timers”:

```ts
it('does not count elapsed wall time while paused', () => {
  const clock = createScheduler()
  const engine = new TrainingEngine(kegelProtocol, clock.scheduler)

  engine.start()
  clock.advanceBy(1_000)
  engine.pause()
  clock.advanceBy(5_000)
  engine.resume()
  clock.advanceBy(500)

  expect(engine.getSnapshot()).toMatchObject({
    phase: 'READY',
    remainingMs: 1_500,
  })
})

it('keeps pause and resume idempotent', () => {
  const clock = createScheduler()
  const engine = new TrainingEngine(kegelProtocol, clock.scheduler)

  engine.start()
  engine.pause()
  engine.pause()
  engine.resume()
  engine.resume()

  expect(engine.isPaused()).toBe(false)
  expect(clock.registrations).toBe(2)
})
```

- [ ] **Step 2: Run the targeted tests and verify RED**

Run:

```powershell
npm test -- src/engine/trainingEngine.test.ts
```

Expected: TypeScript/test failure because `pause`, `resume`, and `isPaused` do not exist.

- [ ] **Step 3: Implement the minimal engine behavior**

In `TrainingEngine`, add an explicit flag:

```ts
private paused = false
```

Update `start()` to clear manual pause when starting normally, and add:

```ts
pause = () => {
  if (this.paused || this.snapshot.phaseKind === 'success') return
  this.paused = true
  this.stop()
}

resume = () => {
  if (!this.paused || this.snapshot.phaseKind === 'success') return
  this.paused = false
  this.start()
}

isPaused = () => this.paused
```

Ensure `start()` sets `lastTickAt` from `scheduler.now()` before registering the interval, so paused wall time is excluded.

- [ ] **Step 4: Run targeted and full engine tests**

Run:

```powershell
npm test -- src/engine/trainingEngine.test.ts
```

Expected: all training engine tests pass.

- [ ] **Step 5: Commit**

```powershell
git add pwa/src/engine/trainingEngine.ts pwa/src/engine/trainingEngine.test.ts
git commit -m "feat: pause and resume training engine"
```

---

### Task 2: Expose controls from useTrainingSession

**Files:**
- Modify: `pwa/src/hooks/useTrainingSession.ts`

**Interfaces:**
- Consumes: `TrainingEngine.pause`, `resume`, and `isPaused`
- Produces:

```ts
{
  snapshot: TrainingSnapshot<KegelPhase>
  pause: () => void
  resume: () => void
  isPaused: boolean
}
```

- [ ] **Step 1: Change the Hook return contract**

Track paused UI state while keeping the engine as the source of timing behavior:

```ts
const [isPaused, setIsPaused] = useState(false)

const pause = () => {
  engine.pause()
  setIsPaused(engine.isPaused())
}

const resume = () => {
  engine.resume()
  setIsPaused(engine.isPaused())
}

return { snapshot, pause, resume, isPaused }
```

Keep the existing subscription, initial `engine.start()`, and cleanup `engine.stop()`.

- [ ] **Step 2: Update the existing Training page destructuring only enough to compile**

Use:

```ts
const {
  snapshot: training,
  pause,
  resume,
  isPaused,
} = useTrainingSession()
```

Do not add the dialog behavior in this task.

- [ ] **Step 3: Run type-check/build**

Run:

```powershell
npm run build
```

Expected: production build passes with the new Hook contract.

- [ ] **Step 4: Commit**

```powershell
git add pwa/src/hooks/useTrainingSession.ts pwa/src/pages/Training.tsx
git commit -m "refactor: expose training session controls"
```

---

### Task 3: Add the accessible ExitConfirmation component

**Files:**
- Modify: `pwa/package.json`
- Modify: `pwa/package-lock.json`
- Modify: `pwa/vite.config.ts`
- Create: `pwa/src/components/ExitConfirmation/ExitConfirmation.test.tsx`
- Create: `pwa/src/components/ExitConfirmation/ExitConfirmation.tsx`

**Interfaces:**
- Produces:

```ts
interface ExitConfirmationProps {
  onContinue: () => void
  onExit: () => void
}
```

- [ ] **Step 1: Add the minimal component test environment**

Install development-only dependencies:

```powershell
npm install --save-dev @testing-library/react @testing-library/user-event jsdom
```

Add to `vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

// Keep the existing Vite/PWA configuration below.
test: {
  environment: 'jsdom',
},
```

Replace the existing `defineConfig` import from `vite`; keep `Plugin` as a type-only import from `vite`.

- [ ] **Step 2: Write failing component tests**

Create `ExitConfirmation.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ExitConfirmation } from './ExitConfirmation'

describe('ExitConfirmation', () => {
  it('continues the paused training through its primary action', () => {
    const onContinue = vi.fn()
    render(<ExitConfirmation onContinue={onContinue} onExit={() => undefined} />)

    expect(screen.getByRole('dialog', { name: '结束本次训练？' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '继续训练' }))

    expect(onContinue).toHaveBeenCalledOnce()
  })

  it('confirms ending the current training', () => {
    const onExit = vi.fn()
    render(<ExitConfirmation onContinue={() => undefined} onExit={onExit} />)

    fireEvent.click(screen.getByRole('button', { name: '结束训练' }))

    expect(onExit).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 3: Run the targeted test and verify RED**

Run:

```powershell
npm test -- src/components/ExitConfirmation/ExitConfirmation.test.tsx
```

Expected: module-not-found failure for `./ExitConfirmation`.

- [ ] **Step 4: Implement the minimal presentation component**

Create `ExitConfirmation.tsx`:

```tsx
import { useEffect, useRef } from 'react'

interface ExitConfirmationProps {
  onContinue: () => void
  onExit: () => void
}

export function ExitConfirmation({ onContinue, onExit }: ExitConfirmationProps) {
  const continueButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    continueButton.current?.focus()
  }, [])

  return (
    <div className="exit-confirmation" role="presentation">
      <section
        className="exit-confirmation__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-confirmation-title"
      >
        <span className="exit-confirmation__eyebrow">TRAINING PAUSED</span>
        <h2 id="exit-confirmation-title">结束本次训练？</h2>
        <p>当前进度不会保存，你也可以继续完成本组训练。</p>
        <button ref={continueButton} className="primary-action" onClick={onContinue}>
          继续训练
        </button>
        <button className="exit-confirmation__exit" onClick={onExit}>
          结束训练
        </button>
      </section>
    </div>
  )
}
```

- [ ] **Step 5: Run the targeted test and verify GREEN**

Run:

```powershell
npm test -- src/components/ExitConfirmation/ExitConfirmation.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit**

```powershell
git add pwa/package.json pwa/package-lock.json pwa/vite.config.ts pwa/src/components/ExitConfirmation
git commit -m "feat: add training exit confirmation panel"
```

---

### Task 4: Coordinate pause, continue, and exit in Training

**Files:**
- Create: `pwa/src/pages/Training.test.tsx`
- Modify: `pwa/src/pages/Training.tsx`

**Interfaces:**
- Consumes: `ExitConfirmation`
- Consumes: `{ snapshot, pause, resume, isPaused }` from `useTrainingSession`
- Preserves: completion persistence only when `snapshot.phase === 'SUCCESS'`

- [ ] **Step 1: Write a failing page behavior test**

Mock only the session boundary and persistence boundary; render the real page and real dialog:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Training } from './Training'

const { pause, resume, recordCompletion } = vi.hoisted(() => ({
  pause: vi.fn(),
  resume: vi.fn(),
  recordCompletion: vi.fn(),
}))

vi.mock('../hooks/useTrainingSession', () => ({
  useTrainingSession: () => ({
    snapshot: {
      phase: 'CONTRACT',
      phaseKind: 'work',
      phaseIndex: 0,
      currentSet: 1,
      totalSets: 3,
      durationMs: 5_000,
      remainingMs: 4_000,
      phaseProgress: 0.2,
    },
    pause,
    resume,
    isPaused: false,
  }),
}))

vi.mock('../services/storageService', () => ({
  createTrainingSessionId: () => 'test-session',
  storageService: {
    recordCompletion,
    updateFeedback: vi.fn(),
  },
}))

function renderTraining() {
  return render(
    <MemoryRouter initialEntries={['/training']}>
      <Routes>
        <Route path="/" element={<p>首页</p>} />
        <Route path="/training" element={<Training />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Training exit confirmation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('pauses before asking whether to exit and resumes when continuing', () => {
    renderTraining()

    fireEvent.click(screen.getByRole('button', { name: '返回首页' }))
    expect(screen.getByRole('dialog', { name: '结束本次训练？' })).toBeTruthy()
    expect(pause).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: '继续训练' }))
    expect(resume).toHaveBeenCalledOnce()
  })

  it('returns home without recording an incomplete session', () => {
    renderTraining()

    fireEvent.click(screen.getByRole('button', { name: '返回首页' }))
    fireEvent.click(screen.getByRole('button', { name: '结束训练' }))

    expect(screen.getByText('首页')).toBeTruthy()
    expect(recordCompletion).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run:

```powershell
npm test -- src/pages/Training.test.tsx
```

Expected: no `button` named “返回首页” and no dialog.

- [ ] **Step 3: Implement minimal page coordination**

In `Training.tsx`:

```tsx
import { useNavigate } from 'react-router-dom'
import { ExitConfirmation } from '../components/ExitConfirmation/ExitConfirmation'
```

Add:

```ts
const navigate = useNavigate()
const [showExitConfirmation, setShowExitConfirmation] = useState(false)

const handleRequestExit = () => {
  pause()
  setShowExitConfirmation(true)
}

const handleContinue = () => {
  setShowExitConfirmation(false)
  resume()
}

const handleExit = () => {
  navigate('/')
}
```

Replace the active-training back link with:

```tsx
<button className="back-button" type="button" onClick={handleRequestExit} aria-label="返回首页">
  ‹
</button>
```

Render the panel after the training guidance:

```tsx
{showExitConfirmation ? (
  <ExitConfirmation onContinue={handleContinue} onExit={handleExit} />
) : null}
```

Retain `isPaused` as observable session state for future consumers; do not delay the dialog with a timer.

- [ ] **Step 4: Run targeted tests and verify GREEN**

Run:

```powershell
npm test -- src/pages/Training.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 5: Run the full test suite**

Run:

```powershell
npm test
```

Expected: all existing and new tests pass.

- [ ] **Step 6: Commit**

```powershell
git add pwa/src/pages/Training.tsx pwa/src/pages/Training.test.tsx
git commit -m "feat: confirm before leaving active training"
```

---

### Task 5: Style and verify the S23 bottom sheet

**Files:**
- Modify: `pwa/src/styles/global.css`

**Interfaces:**
- Consumes: `.exit-confirmation`, `.exit-confirmation__panel`, `.exit-confirmation__eyebrow`, `.exit-confirmation__exit`

- [ ] **Step 1: Add mobile-first dialog styling**

Add:

```css
.exit-confirmation {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: grid;
  align-items: end;
  padding: 1rem;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  background: rgba(3, 10, 13, 0.72);
  backdrop-filter: blur(8px);
}

.exit-confirmation__panel {
  width: min(100%, 28rem);
  margin-inline: auto;
  padding: 1.35rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  background: var(--surface-raised);
  box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.38);
}

.exit-confirmation__eyebrow {
  color: var(--health);
  font-size: 0.62rem;
  font-weight: 750;
  letter-spacing: 0.12em;
}

.exit-confirmation__panel h2 {
  margin: 0.45rem 0 0.55rem;
  font-size: 1.55rem;
}

.exit-confirmation__panel p {
  margin-bottom: 1.2rem;
  color: var(--text-muted);
  line-height: 1.65;
}

.exit-confirmation__panel button {
  width: 100%;
}

.exit-confirmation__exit {
  margin-top: 0.65rem;
  border: 0;
  background: transparent;
  color: var(--text-muted);
}
```

- [ ] **Step 2: Run automated verification**

Run:

```powershell
npm test
npm run build
```

Expected: all tests pass; TypeScript and production PWA build pass.

- [ ] **Step 3: Run browser verification at S23 viewport**

Start:

```powershell
npm run dev -- --port 4173 --strictPort
```

At 360 × 780:

1. Start training.
2. Click the top-left return button.
3. Confirm the dialog is visible, focused on “继续训练,” and clear of the bottom safe area.
4. Wait five seconds and choose “继续训练.”
5. Confirm phase and countdown resume from the paused position.
6. Open the dialog again, choose “结束训练,” and confirm Home/history counts do not change.

- [ ] **Step 4: Update project status**

In `docs/PROJECT_STATUS.md`, record:

- Active-training back button now uses pause-aware confirmation.
- Browser/system back interception remains outside V0.1 scope.
- Add the new test count observed from the final test run.

- [ ] **Step 5: Commit**

```powershell
git add pwa/src/styles/global.css docs/PROJECT_STATUS.md
git commit -m "docs: record training exit confirmation"
```

---

## Final Verification

- [ ] Run `npm test` and record the exact number of passing test files and tests.
- [ ] Run `npm run build` and confirm `dist/sw.js` is generated.
- [ ] Run `git diff --check`.
- [ ] Confirm `git status --short` contains no generated build output or temporary server logs.
- [ ] Review the spec acceptance criteria against the implementation.
- [ ] Report modified files, runtime behavior, automated evidence, S23 test steps, and remaining system-back limitation.
