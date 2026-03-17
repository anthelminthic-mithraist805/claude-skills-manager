# 🚀 Claude Skills Manager

<div align="center">

**一站式 AI Coding Agent Skills 管理平台**

支持 12+ 主流 AI 编程工具 | 智能语义陷阱检测 | 跨平台桌面应用

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-blue.svg)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org)

[下载安装](#-安装) · [功能特性](#-核心特性) · [使用文档](#-使用指南) · [开发指南](#-开发)

</div>

---

## ✨ 核心特性

### 🌐 多平台支持
一次创建，随处部署。支持 **12+ 主流 AI 编程工具**：
- **Claude Code** - Anthropic 官方 CLI
- **Cline** - VS Code 中的 AI 助手
- **Roo-Cline** - Cline 的增强版本
- **Windsurf** - 新一代 AI IDE
- **Aider** - 命令行 AI 编程助手
- **Continue** - 开源 AI 代码助手
- **Cursor** - AI-first 代码编辑器
- **GitHub Copilot** - GitHub 官方 AI 助手
- **Zed** - 高性能代码编辑器
- **Void** - 轻量级 AI 工具
- **Goose** - 终端 AI 助手
- **OpenHands** - 开源 AI 编程框架

### 🛡️ 智能质量检测
基于 **Semantic Trap Detector** 理论的语义陷阱检测系统：
- ✅ **27+ 语义陷阱词对** - 覆盖高危/中危/低危三级风险
- ✅ **四步检测流程** - 关键词提取 → 词典匹配 → 风险评估 → 替换建议
- ✅ **可视化报告** - 详细的检测结果展示，包含行号、上下文和修复建议
- ✅ **批量检测** - 一键检查所有 Skills 的质量问题

### 💎 现代化体验
- 🎨 **精美 UI** - 暗色主题 + 流畅动画 + 响应式设计
- 📁 **智能管理** - 收藏、标签过滤、分类浏览
- 🔄 **双向同步** - 本地数据库 ↔ Claude 目录无缝同步
- 🚀 **轻量高效** - 基于 Tauri，体积小、启动快、内存占用低
- 🔍 **全文搜索** - 快速查找 Skills（支持名称、描述、标签）
- 📊 **多视图模式** - 网格视图 / 列表视图自由切换

### 🎯 便捷操作
- **一键部署** - 将 Skill 安装到多个平台
- **平台扫描** - 自动发现系统中已安装的 AI 工具
- **状态追踪** - 实时显示 Skill 的部署状态
- **批量操作** - 支持批量同步、检测、管理

---

## 📸 界面预览

> 截图待添加

---

## 📦 安装

### 从 Release 下载（推荐）

前往 [Releases](../../releases) 页面下载适合你系统的安装包：

- **macOS**: `.dmg` 或 `.app.tar.gz`
- **Windows**: `.msi` 或 `.exe`
- **Linux**: `.AppImage`, `.deb`, 或 `.rpm`

---

## 🎯 使用指南

### 快速开始

1. **创建 Skill**
   - 点击侧边栏"新建 Skill"
   - 填写名称、描述、作者、版本
   - 选择分类和标签
   - 编写 Skill 内容（支持 Markdown）

2. **同步到 Claude**
   - 在 Skill 卡片上点击"同步到 Claude"
   - Skill 将自动复制到 `~/.claude/skills/` 目录

3. **部署到多平台**
   - 点击"安装到多个平台"按钮
   - 选择目标平台（支持多选）
   - 一键部署到所有选中的平台

4. **质量检测**
   - 点击侧边栏"检查所有 Skills"
   - 查看详细的语义陷阱检测报告
   - 根据建议优化 Skill 内容

### Skill 存储位置

- **本地数据库**: `~/.agents/skills/`
- **Claude 目录**: `~/.claude/skills/`
- **各平台目录**: 自动检测并安装到对应位置

### Skill 格式

每个 Skill 以目录形式存储，包含一个 `SKILL.md` 文件：

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

# Skill 内容

在这里写 Skill 的具体内容...
```

---


## 🔧 开发

### 环境要求

- Node.js 18+
- Rust 1.70+
- 系统依赖（根据平台）:
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Microsoft C++ Build Tools
  - **Linux**: `build-essential`, `libwebkit2gtk-4.0-dev`, 等



## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🙏 致谢

- [Tauri](https://tauri.app) - 跨平台桌面应用框架
- [Semantic Trap Detector](https://github.com/yourusername/semantic-trap-detector) - 语义陷阱检测理论
- 所有贡献者和用户

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！**

</div>
