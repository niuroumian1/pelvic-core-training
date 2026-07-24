# 后续开发工作流

## 1. 固定流程

每次开发采用：

```text
规划 → 修改 → 测试 → 总结
```

### 规划

开始前说明：

- 要解决的问题。
- 修改文件和影响范围。
- 明确不修改的功能。
- 是否影响训练引擎、动画、存储或平台适配。
- 如何验收。

多文件或行为变化较大的任务先写实施计划。小范围文案、间距调整可以使用简短计划，
但仍需说明影响范围。

### 修改

- 保留现有目录和分层。
- 优先做最小可验证改动。
- 不因“架构更漂亮”重写可运行模块。
- 不直接让页面调用浏览器存储、震动或通知 API。
- 不把计时推进写进 React 页面或动画组件。
- 不提前创建未使用的 RPG、角色、装备或多运动模块。

### 测试

最低要求：

```powershell
cd "F:\盆底肌训练APP\pwa"
npm test
npm run build
```

涉及 UI、PWA 或平台能力时，还要提供对应的手工审查步骤。三星 S23 是当前主要
真机目标，常用模拟尺寸为 `360 × 780` 和 `360 × 700`。

### 总结

每次完成后说明：

1. 已完成内容。
2. 当前运行效果。
3. 修改文件。
4. 测试结果。
5. 用户如何复测。
6. 已知限制和下一步建议。

## 2. 当前适用 Skills

### 默认使用

- `using-superpowers`：每次开始时判断适用技能。
- `sites:sites-building`：修改当前 React/Vite PWA 时使用。
- `verification-before-completion`：宣称完成前运行实际验证。

### 按任务使用

- `brainstorming`：新增功能、动画主题、交互或视觉方向前使用。
- `writing-plans`：跨多个模块、存在迁移或高风险行为变更时使用。
- `test-driven-development`：新增状态机、存储计算或其他可测试业务逻辑时使用。
- `systematic-debugging`：出现错误、测试失败或行为异常时使用。
- `web-design-guidelines`：明确进行 UI、可访问性或 UX 审查时使用。
- `vercel-react-best-practices`：明确进行 React 性能审查或重构时使用。
- `browser:control-in-app-browser`：用户明确要求浏览器交互测试、截图或页面检查时使用。
- `requesting-code-review`：完成重要里程碑或准备合并前使用。
- `finishing-a-development-branch`：建立 Git 分支工作流并准备集成时使用。
- `sites:sites-hosting` 或部署类 Skill：只有用户明确要求发布时使用。

### 当前不应主动使用

- 多 Agent、并行 Agent 和子 Agent Skills：除非用户明确要求委派或并行开发。
- Git worktree/分支完成 Skills：当前根目录不是 Git 仓库，条件尚不具备。
- React Native Skills：当前主线是 PWA，不是 React Native。
- 完整 AI、Agent、记忆和评估类 Skills：当前产品没有真实 LLM 工作流。
- Vercel 部署 Skills：当前未要求部署，也未选择 Vercel 作为发布平台。
- 图片生成：当前动画使用代码原生视觉，不需要生成位图资产。

## 3. 变更保护边界

以下模块属于当前稳定边界，除非任务直接要求，否则不重写：

- `engine/trainingEngine.ts`
- `engine/kegelProtocol.ts`
- `models/training.ts`
- `animations/animationManager.tsx`
- `services/storageService.ts`
- `platform/`
- `config/appConfig.ts`

涉及这些模块时必须：

- 说明兼容性影响。
- 保持现有公开接口，或提供明确迁移方案。
- 为业务逻辑增加或更新测试。
- 验证现有训练流程和生产构建。

## 4. 文档维护规则

- 产品范围变化：更新 `PRODUCT.md`。
- 分层或依赖关系变化：更新 `ARCHITECTURE.md`。
- 数据结构或存储版本变化：更新 `DATA_MODEL.md`。
- 未来方向变化：更新 `FUTURE_FEATURES.md`。
- 已实现功能、测试和已知限制变化：更新 `PROJECT_STATUS.md`。

