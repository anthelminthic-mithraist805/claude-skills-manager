# Claude Skills Manager

Claude Agent Skills 的跨平台桌面管理工具，基于 Tauri + React + Tailwind CSS 构建。

## 功能特性

- 查看、创建、编辑、删除 Claude Agent Skills
- 一键将 Skill 同步到 Claude 目录（`~/.claude/skills/`）
- 从 Claude 目录导入 Skills 到管理器
- 搜索过滤 Skills
- 现代化暗色主题 UI
- 轻量级（基于 Tauri，非 Electron）
- Skills 存储在 `~/.agents/skills/`

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Rust（Tauri）

## 开发

```bash
npm install
npm run tauri dev
```

## 构建

```bash
npm run tauri build
```

## Skill 格式

每个 Skill 以目录形式存储，包含一个 `SKILL.md` 文件：

```
~/.agents/skills/
└── my-skill/
    └── SKILL.md
```

`SKILL.md` 格式：

```markdown
---
name: my-skill
description: 这是一个示例 Skill
metadata:
  author: yourname
  version: "1.0.0"
---

# Skill 内容

在这里写 Skill 的具体内容...
```
