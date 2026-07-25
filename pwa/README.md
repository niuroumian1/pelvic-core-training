# 男性核心训练 PWA

React + TypeScript + Vite 的移动优先 PWA。V0.1 的六个开发阶段均已完成：
训练页面、状态机、Energy Core 动画、本地记录和移动端平台适配。

临时应用名称、描述、主题色和图标路径集中维护在
`src/config/appConfig.ts`，不要在页面或 PWA 配置中重复硬编码。

## 本地运行

```bash
npm install
npm run dev
```

本地开发保持从 `/` 访问；GitHub Actions 发布时会自动切换为仓库子路径，
不需要修改本地测试网址。

## HTTPS 测试站

- 源代码：<https://github.com/niuroumian1/pelvic-core-training>
- GitHub Pages：<https://niuroumian1.github.io/pelvic-core-training/>
- 推送到 `master` 后，`.github/workflows/deploy-pages.yml` 会先运行测试和
  生产构建，全部通过后才更新 Pages。

## 架构约定

- `pages/`：页面编排
- `components/`：可复用界面组件
- `engine/`：与界面无关的训练状态机
- `animations/`：可替换动画主题及统一动画接口
- `services/`：存储与外部服务适配
- `platform/`：浏览器/Capacitor 平台能力适配
- `models/`：领域数据类型

## 项目文档

- [`PRODUCT.md`](../docs/PRODUCT.md)：当前产品目标和 V0.1 边界
- [`ARCHITECTURE.md`](../docs/ARCHITECTURE.md)：分层、依赖规则和扩展方式
- [`DATA_MODEL.md`](../docs/DATA_MODEL.md)：通用训练及本地存储模型
- [`FUTURE_FEATURES.md`](../docs/FUTURE_FEATURES.md)：未来方向，仅作记录
- [`PROJECT_STATUS.md`](../docs/PROJECT_STATUS.md)：当前实现、测试基线和已知限制
- [`DEVELOPMENT_WORKFLOW.md`](../docs/DEVELOPMENT_WORKFLOW.md)：后续开发流程和 Skills 使用边界
