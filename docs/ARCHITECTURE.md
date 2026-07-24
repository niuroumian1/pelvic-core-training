# 技术架构

## 当前技术栈

- React
- TypeScript
- Vite
- `vite-plugin-pwa`
- CSS 动画，必要时辅以 Canvas

PWA 工程位于 `pwa/`。现有 Flutter/Android 原型暂时保留，两者互不依赖。

## 应用元信息

临时显示名称、短名称、描述、主题色和图标路径统一维护在
`pwa/src/config/appConfig.ts`。内部 ID 独立于显示名称，正式命名时不得修改
已经发布的内部 ID，除非明确进行应用迁移。

## 分层

```text
pages / components
        ↓
training engine
        ↓
models

animations   services   platform
```

- `pages/`：页面编排和导航
- `components/`：可复用界面组件
- `engine/`：训练状态推进、计时和结果计算
- `animations/`：把训练状态转换为视觉反馈
- `services/`：本地存储和 AI 等外部服务适配
- `platform/`：震动、通知等平台能力适配
- `models/`：不依赖 UI 的领域类型

## 依赖规则

- 训练引擎不得导入 React、DOM、动画组件或浏览器 API。
- 页面不得直接调用 `localStorage`、Vibration 或 Notification API。
- 动画只能读取训练状态和进度，不能推进训练计时。
- 服务和平台层通过接口提供能力，未来可以替换为 Capacitor 实现。
- 当前只为实际使用的功能创建模块，不建立空的未来系统。

## 通用训练与当前协议

通用训练模型描述运动、训练方式和训练结果。

盆底肌训练协议负责当前 V0.1 的阶段：

```text
READY → CONTRACT → HOLD → RELAX
                 ↑          |
                 └── 下一组 ┘
```

完成全部组数后进入 `SUCCESS`。这些阶段属于盆底肌协议，不要求未来所有运动复用。

未来增加次数型或保持型运动时，应新增相应训练协议，同时复用通用的训练会话和结果模型。

分阶段计时由 `trainingEngine.ts` 实现，协议仅提供准备阶段、工作阶段序列、
组数和完成状态。`kegelProtocol.ts` 保存 V0.1 的具体阶段与时长。React 通过
`useTrainingSession` 订阅快照，不直接执行计时或状态转换。

## 动画边界

训练引擎只输出：

- 当前阶段
- 阶段进度
- 当前组数
- 总组数
- 运行状态

`AnimationProvider` 根据这些数据渲染动画。`animationManager.tsx` 通过
`animationId` 选择 Provider。V0.1 仅注册 Energy Core；新增动画时新增并注册
Provider，不修改训练引擎或训练页面。

## 视觉系统边界

- 应用外壳使用深石墨蓝、暖白和低饱和健康绿，依靠块面与留白建立层次。
- 通用 `AnimationStage` 只负责尺寸、安全边距、裁切和主题承载，不包含固定装饰。
- 动画区域通过 `animation-theme--{themeId}` 提供独立的主题色和场景背景。
- Energy Core 的蓝绿色只属于 `animation-theme--energy-core`，不得成为所有动画的全局依赖。
- 新动画主题可以覆盖主色、辅助色、柔光和高光变量，不需要修改页面布局。
- 页面容器不依赖工业网格、扫描线、仪表轨道或固定科幻装饰，以兼容气球、花朵、锻造和机关等不同情绪的主题。

## Capacitor 迁移原则

- UI 和训练引擎保持 Web 技术实现
- 震动、通知和持久化通过适配层切换
- 不在业务组件中判断 Web 或 Native 平台
- PWA 与 Capacitor 使用同一套领域模型和训练引擎

V0.1 的 `platform/` 包含 Web 震动、Web Notification 和 PWA 安装提示适配。
业务层只调用端口接口；未来可分别替换为 Capacitor Haptics、Local
Notifications，并在原生容器中隐藏 Web 安装入口。

`AIService` 当前仅提供 `/api/ai/chat` 和 `/api/ai/training-analysis` 的接口
形状与模拟返回，不发送网络请求。
