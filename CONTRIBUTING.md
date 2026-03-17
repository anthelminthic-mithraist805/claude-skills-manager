# 贡献指南

感谢你对 Claude Skills Manager 的关注！我们欢迎任何形式的贡献。

## 如何贡献

### 报告 Bug

如果你发现了 Bug，请在 [Issues](../../issues) 页面创建一个新的 Issue，并包含以下信息：

- Bug 的详细描述
- 复现步骤
- 预期行为
- 实际行为
- 系统环境（操作系统、版本等）
- 截图（如果适用）

### 提出新功能

如果你有新功能的想法，请在 [Issues](../../issues) 页面创建一个 Feature Request，并描述：

- 功能的详细说明
- 使用场景
- 为什么这个功能有用
- 可能的实现方案（可选）

### 提交代码

1. **Fork 仓库**
   ```bash
   # 点击页面右上角的 Fork 按钮
   ```

2. **克隆你的 Fork**
   ```bash
   git clone https://github.com/your-username/skill-manager-tauri.git
   cd skill-manager-tauri
   ```

3. **创建特性分支**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **安装依赖**
   ```bash
   npm install
   ```

5. **进行修改**
   - 遵循现有的代码风格
   - 添加必要的注释
   - 确保代码可以正常运行

6. **测试你的修改**
   ```bash
   npm run tauri dev
   ```

7. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   提交信息格式：
   - `feat:` 新功能
   - `fix:` Bug 修复
   - `docs:` 文档更新
   - `style:` 代码格式调整
   - `refactor:` 代码重构
   - `test:` 测试相关
   - `chore:` 构建/工具相关

8. **推送到你的 Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

9. **创建 Pull Request**
   - 访问你的 Fork 页面
   - 点击 "New Pull Request"
   - 填写 PR 描述，说明你的修改
   - 等待审核

## 开发指南

### 项目结构

```
skill-manager-tauri/
├── src/                    # React 前端
│   ├── components/         # 组件
│   ├── App.tsx            # 主应用
│   └── main.tsx           # 入口
├── src-tauri/             # Rust 后端
│   ├── src/lib.rs         # Tauri 命令
│   └── Cargo.toml         # Rust 依赖
└── .github/               # GitHub Actions
```

### 代码规范

- **TypeScript**: 使用 TypeScript 编写前端代码
- **React**: 使用函数组件和 Hooks
- **Rust**: 遵循 Rust 官方代码规范
- **命名**: 使用有意义的变量和函数名
- **注释**: 为复杂逻辑添加注释

### 技术栈

- **前端**: React 19 + TypeScript + Tailwind CSS 4
- **后端**: Rust + Tauri 2.0
- **构建**: Vite 7

## 行为准则

- 尊重所有贡献者
- 保持友好和专业
- 接受建设性的批评
- 关注对项目最有利的事情

## 问题？

如果你有任何问题，可以：

- 在 [Issues](../../issues) 中提问
- 查看 [README](README.md) 文档
- 查看现有的 Pull Requests

再次感谢你的贡献！🎉
