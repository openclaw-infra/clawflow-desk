# ClawFlow Desk — 全链路 AI 自动化 Motion 视频脚本

## 视频信息
- **时长**: 90-120 秒
- **风格**: 暗色科技感，Discord 风格 UI 动效
- **配乐**: Lo-fi electronic / ambient tech
- **字幕**: 中英双语

---

## SCENE 1 — 开场 (0:00 - 0:08)

**画面**: 黑屏 → ClawFlow logo 渐入（⚡ 图标 + "ClawFlow Desk" 文字）
**动效**: 粒子汇聚成 logo
**文案**: 

> "从需求到上线，全程 AI 驱动"
> "From idea to production — fully AI-powered"

---

## SCENE 2 — 需求提出 (0:08 - 0:18)

**画面**: Telegram 聊天界面
**动效**: 用户发送一条消息，气泡弹入

```
Ken: "加个 Agent Instance 创建表单，支持选 CLI 类型和 Provider"
```

**画面切换**: 消息自动变成 GitHub Issue
**动效**: 消息卡片 morph 成 Issue 卡片，飞入 GitHub 界面

```
#1 feat: Add Agent Instance creation form UI
Labels: enhancement
```

**旁白**: "一句话需求，自动创建 Issue"

---

## SCENE 3 — AI 接单 (0:18 - 0:30)

**画面**: ClawFlow Desk 的 Discord 风格界面
**动效**: 
1. Agent Rail 上 Claude 图标亮起绿灯（脉冲动画）
2. Channel sidebar 出现新 session "#issue-1"
3. 聊天区域出现 System 消息

```
System: 🔌 New issue assigned: #1 — Agent Instance creation form
Claude [BOT]: 分析需求中...
```

**动效**: Claude 头像旁出现 typing indicator（三个跳动的点）

**旁白**: "AI Agent 自动接单，开始分析代码库"

---

## SCENE 4 — 自动编码 (0:30 - 0:48)

**画面**: 分屏 — 左边 ClawFlow 终端，右边代码编辑器
**动效**: 
1. 终端快速滚动（grep 搜索、文件读取）
2. 代码编辑器中文件自动打开、代码自动写入（打字机效果）
3. 文件树高亮变化的文件

```
Claude [BOT]: 
✅ 分析完成 — 需要修改 3 个文件
📝 创建 AgentForm.tsx
📝 更新 Sidebar.tsx  
📝 更新 store/index.ts
```

**代码片段快闪**:
```tsx
export function AgentForm() {
  const [name, setName] = useState("");
  const [cli, setCli] = useState<CLIType>("claude");
  // ...
}
```

**旁白**: "自动定位代码、编写实现、遵循项目规范"

---

## SCENE 5 — 自动测试 (0:48 - 0:58)

**画面**: 终端运行测试
**动效**: 测试结果逐行弹出，绿色 ✓ 快速滚动

```
bun test v1.3.9

✓ Agent Instance CRUD > saves and retrieves agent [8ms]
✓ Agent Instance CRUD > updates existing agent [11ms]
✓ buildAgentEnv > claude env with API key only [6ms]
✓ buildAgentEnv > different providers produce different envs [6ms]
...

 129 pass | 0 fail | 217 expect() calls
```

**动效**: 数字跳动 → 最终定格 "129 pass ✅"
**旁白**: "自动运行测试套件，129 个测试全部通过"

---

## SCENE 6 — 自动 PR (0:58 - 1:10)

**画面**: GitHub PR 界面
**动效**: 
1. Branch 创建动画（从 main 分叉出 fix/issue-1）
2. PR 自动创建，标题和描述自动填充
3. CI 检查开始运行（4 个平台图标旋转）

```
fix: Add Agent Instance creation form UI

✅ Test — passed
✅ Build (macOS arm64) — passed  
✅ Build (macOS x64) — passed
✅ Build (Linux x64) — passed
✅ Build (Windows x64) — passed
```

**动效**: 5 个绿色 ✓ 依次弹出
**旁白**: "自动开 PR，4 平台 CI 全绿"

---

## SCENE 7 — 自动 Review (1:10 - 1:22)

**画面**: PR Review 界面
**动效**: 
1. Reviewer 留下评论（代码行内批注弹出）

```
@reviewer: "这个表单缺少 workDir 的路径校验"
```

2. Claude 自动回复 + 推送修复

```
Claude [BOT]: Addressed in commit abc123f — 
添加了 workDir 路径校验，支持 ~ 展开和绝对路径检查
```

3. Review 状态变为 "Approved ✅"

**旁白**: "Review 评论自动处理，推送修复，直到通过"

---

## SCENE 8 — 自动部署 (1:22 - 1:32)

**画面**: 
1. PR merge 动画（两条线合并）
2. GitHub Actions release workflow 触发
3. 4 个平台的安装包同时构建

**动效**: 
```
v0.2.0 Released 🎉

📦 macOS arm64  — 61 MB
📦 macOS x64    — 61 MB  
📦 Linux x64    — 111 MB
📦 Windows x64  — 114 MB
```

4. 官网自动更新（GitHub Pages 部署动画）

**旁白**: "合并即发布，4 平台同时构建，官网自动更新"

---

## SCENE 9 — 用户反馈闭环 (1:32 - 1:42)

**画面**: Telegram 通知
**动效**: 手机推送弹出

```
🤖 ClawFlow Bot:
✅ Issue #1 已修复并发布
PR: github.com/.../pull/4
版本: v0.2.0
下载: openclaw-infra.github.io/clawflow-desk
```

**画面切换**: 用户在 Telegram 回复

```
Ken: "表单加个颜色选择器"
```

**动效**: 新 Issue 自动创建 → 循环回到 Scene 3

**旁白**: "反馈即需求，闭环自动运转"

---

## SCENE 10 — 全链路总览 (1:42 - 1:52)

**画面**: 流程图动画，从左到右展开

```
💬 需求        →  📋 Issue      →  🤖 AI 编码    →  🧪 自动测试
(Telegram)       (GitHub)         (Claude Code)     (bun test)
     ↑                                                   ↓
📱 反馈        ←  🚀 发布      ←  ✅ CI/CD      ←  📝 PR + Review
(Telegram)       (4 platforms)    (GitHub Actions)   (Auto-fix)
```

**动效**: 每个节点依次亮起，连线流动，形成闭环
**旁白**: "全链路 AI 自动化 — 从一句话到四平台发布，零人工干预"

---

## SCENE 11 — 结尾 (1:52 - 2:00)

**画面**: ClawFlow Desk 的 Discord 风格界面全景
**动效**: 界面缩小 → 嵌入 MacBook 屏幕 → 渐隐

**文案**:
> ⚡ ClawFlow Desk
> AI CLI Configuration Manager
> 
> github.com/openclaw-infra/clawflow-desk

**配乐**: 渐弱收尾

---

## 技术实现建议

### 工具选择
- **Motion 动画**: After Effects / Motion (Apple) / Rive
- **UI 录屏**: 用 Playwright 自动化截图序列 → 合成视频
- **代码动效**: Carbon.sh 风格 + 打字机效果
- **流程图**: Framer Motion / Lottie 动画

### 素材清单
| 素材 | 来源 | 状态 |
|------|------|------|
| ClawFlow UI 截图 | docs/designs/*.png | ✅ 已有 |
| Discord 风格界面 | discord-full.png | ✅ 已有 |
| GitHub Issue/PR 截图 | 实际 repo | ✅ 可截 |
| CI 运行截图 | GitHub Actions | ✅ 可截 |
| Telegram 通知截图 | 实际对话 | ✅ 可截 |
| 终端测试输出 | bun test 录屏 | ✅ 可录 |
| Logo + 品牌素材 | 需设计 | ⏳ 待做 |

### 配色方案
- 背景: #0a0a0a → #1e1f22 (Discord 暗色)
- 主色: #5865f2 (Discord 蓝)
- 强调: #23a559 (成功绿) / #d97757 (Claude 橙)
- 文字: #f2f3f5 / #949ba4
