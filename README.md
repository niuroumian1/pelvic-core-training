# 核心训练 Demo

一个使用 Flutter 构建的男性盆底肌游戏化训练核心体验。首个场景为“能量核心充能”。

## 运行

需要 Flutter 3.22 或更高版本。首次在没有 Gradle Wrapper 的源码副本中运行时，先让 Flutter 补齐平台生成文件：

```bash
flutter create --platforms=android,web .
flutter pub get
flutter run
```

之后日常运行只需要 `flutter run`。浏览器预览可使用
`flutter run -d chrome`。

## 结构

- `models/`：训练状态及可供未来 AI 分析的数据结构
- `services/`：训练状态机、计分和 AI 接口占位
- `animation/`：可替换的训练场景协议
- `widgets/`：能量核心和 HUD 组件
- `screens/`：首页、训练页与完成页

当前节奏为 3 组训练，每组 5 秒收缩、3 秒保持、5 秒放松。
