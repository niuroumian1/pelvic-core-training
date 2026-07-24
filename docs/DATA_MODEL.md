# 数据模型

## 设计原则

- 使用稳定 ID 和 ISO 8601 时间字符串
- 存储数据包含 `schemaVersion`
- 领域模型不包含 React 组件、DOM 对象或浏览器 API
- 训练记录保存事实数据，不保存可以重新计算的界面状态
- 本地存储格式应能直接映射到 IndexedDB、SQLite 或远程数据库

## Exercise

描述一种可以执行的运动，不包含具体动画实现。

```ts
type ExerciseMode = 'timed' | 'repetition' | 'hold'

interface Exercise {
  id: string
  name: string
  type: string
  mode: ExerciseMode
  sets: number
  durationSeconds?: number
  repetitions?: number
  animationId: string
}
```

V0.1 仅使用 `kegel-basic`，动画 ID 为 `energy-core`。

## TrainingSession

保存一次训练的最终记录：

```ts
interface TrainingSession {
  id: string
  exerciseId: string
  exerciseType: string
  startedAt: string
  endedAt: string | null
  completed: boolean
  completedSets: number
  score: number
  feedback?: UserFeedback
}
```

`score` 是通用结果字段。V0.1 可以记录简单完成分，不引入完整成长系统。

## UserFeedback

```ts
interface UserFeedback {
  difficulty?: 'easy' | 'moderate' | 'hard'
  note?: string
}
```

## LocalTrainingData

```ts
interface LocalTrainingData {
  schemaVersion: 1
  sessions: TrainingSession[]
  summary: {
    totalCompletions: number
    currentStreakDays: number
    totalExperience: number
    currentLevel: number
  }
}
```

`summary` 用于快速展示，实际训练历史以 `sessions` 为准。将来迁移数据库时，应通过存储服务完成版本升级，不让页面直接转换数据。

## 运行时状态

`READY / CONTRACT / HOLD / RELAX / SUCCESS` 是盆底肌训练协议的运行时状态，不写入 Exercise，也不作为其他运动的通用阶段。

训练进行中可以在内存保存：

- 当前阶段
- 当前组数
- 阶段已用时间
- 阶段总时间
- 暂停状态

V0.1 只需在训练完成时持久化最终会话。

## V0.1 本地实现

设备本地数据通过 `StorageService` 保存，页面不得直接读写 `localStorage`。
存储键为 `pelvic-core-training:data`，根对象包含 `schemaVersion: 1`。训练完成
使用稳定会话 ID 幂等写入，反馈更新同一会话，不创建重复记录。

当前等级采用最小规则：每次完成获得 10 经验，每累计 100 经验提升一级。这只
用于满足基础记录与展示，不代表完整 RPG 系统。
