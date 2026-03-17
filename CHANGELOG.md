# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-03-17

### Added
- 🌐 支持 12+ 主流 AI 编程工具（Claude Code, Cline, Roo-Cline, Windsurf, Aider, Continue, Cursor, GitHub Copilot, Zed, Void, Goose, OpenHands）
- 🛡️ 智能语义陷阱检测系统
  - 27+ 语义陷阱词对覆盖
  - 高危/中危/低危三级风险分类
  - 详细的检测报告和修复建议
- 💎 现代化用户界面
  - 可折叠侧边栏
  - 网格/列表视图切换
  - 暗色主题设计
- 📁 Skill 管理功能
  - 创建、编辑、删除 Skills
  - 收藏和标签过滤
  - 分类浏览（开发工具、AI 生成、数据处理、安全审查、实用工具）
- 🔄 双向同步功能
  - 本地数据库 ↔ Claude 目录同步
  - 多平台批量部署
- 🚀 平台管理功能
  - 自动检测已安装的 AI 工具
  - 一键安装/卸载到多个平台
  - 实时显示部署状态
- 🔍 全文搜索功能
  - 支持名称、描述、标签搜索
  - 实时过滤结果

### Technical
- 基于 Tauri 2.0 构建跨平台桌面应用
- React 19 + TypeScript 前端
- Rust 后端
- Tailwind CSS 4 样式框架
- Vite 7 构建工具

[0.1.0]: https://github.com/wa1ki0g/skill-manager-tauri/releases/tag/v0.1.0
