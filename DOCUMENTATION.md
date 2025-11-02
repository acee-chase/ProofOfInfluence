# 📚 文档导航

> ProofOfInfluence 项目完整文档索引

**最后更新**: 2025-11-02

---

## 🚀 快速开始

**第一次使用？** → [docs/QUICK_START.md](docs/QUICK_START.md)

**开始协作开发？** → [collaboration/README.md](collaboration/README.md)

---

## 📂 文档分类

### 🤝 AI协作系统（流程文档）

协作开发流程、方法论和最佳实践

| 文档 | 说明 | 何时查看 |
|------|------|---------|
| [collaboration/README.md](collaboration/README.md) | 协作系统概览 | 快速了解4方协作 |
| [collaboration/DAILY_CHECKLIST.md](collaboration/DAILY_CHECKLIST.md) | 每日工作清单 | **每天开始工作时** ⭐ |
| [collaboration/GUIDE.md](collaboration/GUIDE.md) | 完整协作指南 | 详细了解各角色职责 |
| [collaboration/SCENARIOS.md](collaboration/SCENARIOS.md) | 场景案例 | 学习实际应用 |

---

### 🏗️ 项目文档（技术文档）

项目架构、技术栈和开发指南

| 文档 | 说明 | 何时查看 |
|------|------|---------|
| [README.md](README.md) | 项目概览 | 了解项目整体 |
| [docs/PROJECT.md](docs/PROJECT.md) | 技术文档 | 查看架构和API |
| [docs/QUICK_START.md](docs/QUICK_START.md) | 快速开始 | 首次配置环境 |
| [docs/ENV_SETUP.md](docs/ENV_SETUP.md) | 环境配置 | 配置环境变量 |
| [design_guidelines.md](design_guidelines.md) | 设计规范 | 开发UI组件时 |
| [.cursorrules](.cursorrules) | 开发规范 | Cursor自动读取 |

---

### 📦 归档文档

旧版本或已合并的文档（仅供参考）

| 文档 | 说明 |
|------|------|
| [docs/archive/WORKFLOW.md](docs/archive/WORKFLOW.md) | 旧版工作流（已合并到 GUIDE.md） |
| [docs/archive/HANDOFF_SUMMARY.md](docs/archive/HANDOFF_SUMMARY.md) | 交接总结（历史记录） |
| [docs/archive/SETUP_COMPLETE.md](docs/archive/SETUP_COMPLETE.md) | 配置完成文档（已归档） |
| [docs/archive/4WAY_COLLABORATION_SETUP.md](docs/archive/4WAY_COLLABORATION_SETUP.md) | 协作设置（已归档） |

---

## 🎯 按场景查找文档

### 我想...

#### 🆕 第一次使用这个项目
1. 阅读 [README.md](README.md) 了解项目
2. 跟随 [docs/QUICK_START.md](docs/QUICK_START.md) 配置环境
3. 阅读 [collaboration/README.md](collaboration/README.md) 了解协作方式

#### 💼 开始每天的工作
1. 打开 [collaboration/DAILY_CHECKLIST.md](collaboration/DAILY_CHECKLIST.md)
2. 按照清单逐项执行

#### 🎨 开发新功能
1. 查看 [collaboration/SCENARIOS.md](collaboration/SCENARIOS.md#场景a-开发新功能)
2. 参考 [design_guidelines.md](design_guidelines.md) 设计UI
3. 使用 [.cursorrules](.cursorrules) 保证代码规范

#### 🐛 修复Bug
1. 查看 [collaboration/SCENARIOS.md](collaboration/SCENARIOS.md#场景b-快速修复)
2. 快速定位和修复

#### 🔍 了解项目架构
1. 阅读 [docs/PROJECT.md](docs/PROJECT.md)
2. 查看数据库设计和API文档

#### ⚙️ 配置环境变量
1. 参考 [docs/ENV_SETUP.md](docs/ENV_SETUP.md)
2. 获取数据库连接和密钥

#### 🤔 不知道该怎么做
1. 查看 [collaboration/GUIDE.md](collaboration/GUIDE.md) 的常见问题
2. 或者直接问 ChatGPT

---

## 📊 文档结构图

```
ProofOfInfluence/
│
├── 📋 DOCUMENTATION.md (本文件) - 文档导航
├── 📖 README.md - 项目概览
│
├── 🤝 collaboration/ (协作流程)
│   ├── README.md - 协作系统概览
│   ├── DAILY_CHECKLIST.md - 每日工作清单 ⭐
│   ├── GUIDE.md - 完整协作指南
│   └── SCENARIOS.md - 场景案例
│
├── 📂 docs/ (项目文档)
│   ├── PROJECT.md - 技术文档
│   ├── QUICK_START.md - 快速开始
│   ├── ENV_SETUP.md - 环境配置
│   └── archive/ (归档)
│       ├── WORKFLOW.md
│       ├── HANDOFF_SUMMARY.md
│       ├── SETUP_COMPLETE.md
│       └── 4WAY_COLLABORATION_SETUP.md
│
├── 🎨 design_guidelines.md - UI/UX设计规范
├── ⚙️ .cursorrules - Cursor AI开发规范
└── 🚀 replit.yaml - Replit部署配置
```

---

## 🔄 文档更新规则

### 何时更新文档

1. **添加新功能** → 更新 `docs/PROJECT.md` 和 `README.md`
2. **改变工作流程** → 更新 `collaboration/` 下的文档
3. **修改配置** → 更新相应的配置文档
4. **发现文档错误** → 立即修正

### 如何更新文档

```bash
# 1. 编辑相关文档
# 2. 提交更改
git add [文档文件]
git commit -m "docs: [描述更改]"
git push origin main
```

---

## 💡 文档编写规范

### Markdown 格式
- 使用清晰的标题层级（##, ###）
- 代码块指定语言（```bash, ```typescript）
- 使用表格展示对比信息
- 添加 emoji 提高可读性（适度）

### 内容组织
- **先总后分**: 先概览再细节
- **实例驱动**: 提供实际代码示例
- **链接完整**: 确保文档间链接有效
- **保持更新**: 代码变化及时更新文档

---

## 🆘 找不到需要的文档？

### 搜索建议

1. **使用 GitHub 搜索**: 在仓库页面使用搜索功能
2. **关键词搜索**: 使用 Ctrl+F 在本文件搜索
3. **询问 ChatGPT**: "ProofOfInfluence 项目的 [某功能] 文档在哪里？"

### 常见问题快速链接

| 问题 | 文档链接 |
|------|---------|
| 如何配置开发环境？ | [docs/QUICK_START.md](docs/QUICK_START.md) |
| 如何使用 ChatGPT 规划功能？ | [collaboration/GUIDE.md](collaboration/GUIDE.md#chatgpt-使用技巧) |
| Cursor 快捷键是什么？ | [collaboration/GUIDE.md](collaboration/GUIDE.md#cursor-快捷键) |
| 数据库 Schema 是什么样的？ | [docs/PROJECT.md](docs/PROJECT.md#数据库设计) |
| API 接口有哪些？ | [docs/PROJECT.md](docs/PROJECT.md#api-接口) |
| 如何部署到 Replit？ | [docs/QUICK_START.md](docs/QUICK_START.md#配置-replit) |
| 设计规范是什么？ | [design_guidelines.md](design_guidelines.md) |

---

## 📞 获取帮助

1. **查阅文档**: 按照本文导航查找相关文档
2. **搜索归档**: 检查 `docs/archive/` 是否有相关历史文档
3. **询问 ChatGPT**: 提供完整的上下文和具体问题
4. **查看代码**: 代码本身也是最好的文档

---

**维护者**: ProofOfInfluence 团队  
**创建时间**: 2025-11-02  
**文档版本**: v2.0 (重组后)

---

> 💡 **提示**: 建议将本文件添加到浏览器书签，作为文档的入口点。

