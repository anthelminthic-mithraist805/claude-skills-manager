# 使用指南

欢迎使用 Claude Skills Manager！本指南将帮助你快速上手。

## 目录

- [快速开始](#快速开始)
- [创建 Skill](#创建-skill)
- [管理 Skills](#管理-skills)
- [多平台部署](#多平台部署)
- [质量检测](#质量检测)
- [高级功能](#高级功能)

---

## 快速开始

### 1. 安装应用

从 [Releases](../../releases) 页面下载适合你系统的安装包并安装。

### 2. 首次启动

启动应用后，你会看到主界面，包含：
- **侧边栏**: 导航菜单和快捷操作
- **主区域**: Skills 列表和详情
- **顶部栏**: 搜索和视图切换

### 3. 扫描现有 Skills

点击侧边栏底部的"扫描所有平台"按钮，应用会自动检测：
- 本地数据库中的 Skills (`~/.agents/skills/`)
- Claude 目录中的 Skills (`~/.claude/skills/`)
- 其他已安装 AI 工具的 Skills

---

## 创建 Skill

### 方法一：使用界面创建

1. 点击侧边栏的"新建 Skill"按钮
2. 填写基本信息：
   - **名称**: Skill 的唯一标识符（小写字母、数字、连字符）
   - **描述**: 简短描述 Skill 的功能
   - **作者**: 你的名字或用户名
   - **版本**: 遵循语义化版本（如 1.0.0）
3. 选择分类：
   - 开发工具
   - AI 生成
   - 数据处理
   - 安全审查
   - 实用工具
4. 添加标签（可选）：用逗号分隔，如 `react, typescript, hooks`
5. 编写 Skill 内容：支持 Markdown 格式
6. 点击"创建"按钮

### 方法二：从 Claude 目录导入

1. 切换到"Claude 目录"标签
2. 找到要导入的 Skill
3. 点击"同步到本地"按钮

### Skill 内容格式

```markdown
---
name: my-skill
description: 这是一个示例 Skill
metadata:
  author: yourname
  version: "1.0.0"
  category: dev
  tags: [react, typescript]
---

# 我的 Skill

## 功能说明

这个 Skill 可以帮助你...

## 使用方法

1. 第一步...
2. 第二步...

## 示例

\`\`\`typescript
// 示例代码
\`\`\`
```

---

## 管理 Skills

### 查看 Skills

- **网格视图**: 以卡片形式展示，适合浏览
- **列表视图**: 以列表形式展示，信息更详细

切换视图：点击顶部栏的网格/列表图标

### 搜索 Skills

在顶部搜索框中输入关键词，支持搜索：
- Skill 名称
- 描述内容
- 标签

### 过滤 Skills

**按分类过滤**：
点击分类标签（全部、开发工具、AI 生成等）

**按状态过滤**：
- **全部**: 显示所有 Skills
- **收藏**: 只显示收藏的 Skills
- **已部署**: 只显示已部署到平台的 Skills

**按标签过滤**：
1. 点击侧边栏的"标签过滤"
2. 选择一个或多个标签
3. 只显示包含选中标签的 Skills

### 收藏 Skills

点击 Skill 卡片右上角的星标图标，可以将 Skill 添加到收藏夹。

### 编辑 Skills

1. 找到要编辑的 Skill
2. 点击编辑图标（铅笔）
3. 修改内容
4. 点击"更新"按钮

### 删除 Skills

1. 找到要删除的 Skill
2. 点击删除图标（垃圾桶）
3. 确认删除

---

## 多平台部署

### 支持的平台

Claude Skills Manager 支持 12+ 主流 AI 编程工具：

| 平台 | 说明 | 默认路径 |
|------|------|----------|
| Claude Code | Anthropic 官方 CLI | `~/.claude/skills/` |
| Cline | VS Code AI 助手 | `~/.cline/skills/` |
| Roo-Cline | Cline 增强版 | `~/.roo-cline/skills/` |
| Windsurf | 新一代 AI IDE | `~/.windsurf/skills/` |
| Aider | 命令行 AI 助手 | `~/.aider/skills/` |
| Continue | 开源 AI 助手 | `~/.continue/skills/` |
| Cursor | AI-first 编辑器 | `~/.cursor/skills/` |
| GitHub Copilot | GitHub AI 助手 | `~/.github-copilot/skills/` |
| Zed | 高性能编辑器 | `~/.zed/skills/` |
| Void | 轻量级 AI 工具 | `~/.void/skills/` |
| Goose | 终端 AI 助手 | `~/.goose/skills/` |
| OpenHands | 开源 AI 框架 | `~/.openhands/skills/` |

### 部署到单个平台

1. 找到要部署的 Skill
2. 点击"同步到 Claude"按钮
3. Skill 将被复制到 Claude 目录

### 部署到多个平台

1. 找到要部署的 Skill
2. 点击"安装到多个平台"按钮
3. 在弹出的对话框中：
   - 查看已检测到的平台（绿色勾选）
   - 选择要安装的平台（可多选）
   - 点击"安装"按钮
4. 等待安装完成

### 查看部署状态

- **已部署标记**: 已部署的 Skills 会显示在"已部署"过滤器中
- **平台状态**: 在多平台安装对话框中可以看到每个平台的安装状态

---

## 质量检测

### 什么是语义陷阱？

语义陷阱是指在 Skill 内容中使用了语义边界过宽的词汇，导致 AI 模型产生超出预期范围的输出。

例如：
- ❌ "分析代码中的**问题**" → AI 可能输出代码风格、性能优化等
- ✅ "检测代码中的**漏洞**" → AI 只输出安全漏洞

### 检测所有 Skills

1. 点击侧边栏底部的"检查所有 Skills"按钮
2. 等待检测完成
3. 查看检测报告

### 理解检测报告

检测报告包含：

**概览统计**：
- 检测的 Skills 数量
- 发现的陷阱总数
- 高危/中危/低危陷阱数量

**详细信息**：
- **陷阱词**: 检测到的宽边界词
- **推荐替换**: 建议使用的窄边界词
- **风险等级**: 高危🔴 / 中危🟡 / 低危🟢
- **行号**: 陷阱所在的行
- **上下文**: 陷阱周围的文本
- **原因**: 为什么这是一个陷阱

### 修复陷阱

1. 查看检测报告中的建议
2. 点击"编辑"按钮打开 Skill
3. 根据建议修改内容：
   - 将宽边界词替换为窄边界词
   - 添加明确的约束条件
   - 使用更精确的表达
4. 保存修改
5. 重新检测验证

### 常见陷阱词对

| 宽边界词 ⚠️ | 窄边界词 ✅ | 风险等级 |
|------------|-----------|---------|
| 风险 | 漏洞 | 高危 |
| 问题 | 缺陷 | 中危 |
| 审查 | 检查 | 中危 |
| 描述 | 列出 | 中危 |
| 分析 | 总结 | 高危 |
| 建议 | 要求 | 高危 |
| 应该 | 必须 | 低危 |

---

## 高级功能

### 批量操作

**批量同步**：
1. 在"本地数据库"标签中
2. 为每个 Skill 点击"同步到 Claude"
3. 所有 Skills 将被同步到 Claude 目录

**批量检测**：
点击"检查所有 Skills"按钮，一次性检测所有 Skills 的质量。

### 自定义存储位置

Skills 默认存储在：
- 本地数据库: `~/.agents/skills/`
- Claude 目录: `~/.claude/skills/`

如果你想使用自定义位置，可以创建符号链接：

```bash
# 将本地数据库链接到自定义位置
ln -s /path/to/your/skills ~/.agents/skills

# 将 Claude 目录链接到自定义位置
ln -s /path/to/claude/skills ~/.claude/skills
```

### 导入导出（即将推出）

未来版本将支持：
- 导出 Skills 为 JSON 文件
- 从 JSON 文件导入 Skills
- 批量导入/导出

---

## 常见问题

### Q: 为什么我的 Skill 没有显示在 Claude 中？

A: 确保：
1. 已点击"同步到 Claude"按钮
2. Claude 目录路径正确（`~/.claude/skills/`）
3. Skill 格式正确（包含 SKILL.md 文件）
4. 重启 Claude 应用

### Q: 如何备份我的 Skills？

A: Skills 存储在 `~/.agents/skills/` 目录，你可以：
1. 直接复制整个目录
2. 使用 Git 进行版本控制
3. 使用云同步服务（如 Dropbox、iCloud）

### Q: 检测到的陷阱一定要修复吗？

A: 不一定。检测报告只是建议：
- **高危陷阱**: 强烈建议修复
- **中危陷阱**: 建议修复
- **低危陷阱**: 可选修复

根据你的实际需求决定是否修复。

### Q: 如何卸载应用？

A:
- **macOS**: 将应用拖到废纸篓
- **Windows**: 在控制面板中卸载
- **Linux**: 使用包管理器卸载

注意：卸载应用不会删除 Skills 数据（`~/.agents/skills/`）。

---

## 获取帮助

如果你遇到问题或有建议：

- 📖 查看 [README](README.md)
- 🐛 提交 [Issue](../../issues)
- 💬 参与 [Discussions](../../discussions)
- 📧 联系作者

---

**祝你使用愉快！** 🎉
