<div align="center"><img src="./images/top_image.png" alt="License" width="800px" /></div>

<br />

<p align="center">
  <a href="./README.md"><img alt="README in English" src="https://img.shields.io/badge/English-d9d9d9?style=for-the-badge&color=0078D4"></a>
  <a href="./README_CN.md"><img alt="简体中文版自述文件" src="https://img.shields.io/badge/简体中文-d9d9d9?style=for-the-badge&color=1AAD19"></a>
</p>

`DesignChat AI` 是一个强大的 AI 图像生成平台，支持多种模型和自定义提示词，助力高效创作。

| Node.js | NPM |
| :-----  | :-- |
| v22.14.0 | v11.2.0 |

## ✨ 功能特点

- 🎨 多模型 AI 图像生成
- 🔄 实时生成预览
- 📱 移动优先响应式设计
- 🔒 用户认证和授权
- 💾 历史记录保存
- 🗃️ 图片远端存储

## 🛠️ 技术栈

| 技术 | 版本 | 描述 |
|------|------|------|
| ![React](https://img.shields.io/badge/React-18.2.0-20232a?logo=react&logoColor=61DAFB&labelColor=20232a) | 18.2.0 | 用户界面构建库 |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript&logoColor=white&labelColor=3178C6) | 5.2.2 | JavaScript 类型安全扩展 |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-0ea5e9?logo=tailwindcss&logoColor=white&labelColor=0ea5e9) | 3.4.1 | 实用优先的 CSS 框架 |
| ![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?logo=vite&logoColor=FFD62E&labelColor=646CFF) | 6.3.5 | 下一代前端构建工具 |
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=3ECF8E&labelColor=222) | - | 开源 Firebase 替代方案 |
| ![Vercel](https://img.shields.io/badge/Vercel-Deploy-222222?logo=vercel&logoColor=white&labelColor=111111) | - | 前端部署平台 |

## 🚀 快速开始

💡 本项目基于 `supabase` 构建后端，因此需要您创建 `supabase` 项目并配置环境变量。

### 🖥️ 本地开发

#### 1. 克隆仓库

```bash
git clone https://github.com/fmw666/DesignChat.git
cd DesignChat
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 初始化 Supabase 项目

- 登录 [Supabase](https://supabase.com/) 并创建项目。
- 分别参考以下文档获取各类密钥：
  - **数据库（db）密钥获取**：[查看 db 密钥获取文档](./docs/supabase/db/README.md)
  - **认证（auth）密钥获取**：[查看 auth 密钥获取文档](./docs/supabase/auth/README.md)
  - **存储（storage）密钥获取**：[查看 storage 密钥获取文档](./docs/supabase/storage/README.md)
- 推荐使用脚本一键完成 Supabase 所有表、认证、存储等初始化配置。
  - 本地执行：
    ```bash
    npm install && npm run init
    ```
  - 使用 Docker 执行（无需本地 Node 环境）：
    ```bash
    docker run --rm -v %cd%:/app -w /app node:20 npm run init
    ```
- 脚本详情及更多用法请参见 [初始化脚本说明](./scripts/README.md)

#### 4. 配置环境变量

> 请在 Supabase 项目中获取相关密钥

```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的环境变量
```

#### 5. 启动开发服务器

```bash
npm run dev
```

#### 6. lint 测试

```bash
npm run lint
```

### ☁️ 一键部署

| 方式 | 适用场景与说明 |
|------|------|
| [![Deploy with Vercel by clone](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffmw666%2FDesignChat) | 直接克隆本仓库到你的 `Vercel` 账号，适合首次部署或想要完整复制项目的用户 |
| [![Deploy with Vercel by import](https://vercel.com/button)](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2Ffmw666%2FDesignChat&teamSlug=maovos-projects) | 通过导入方式将本仓库添加到你的 `Vercel` 项目，适合已有 `Vercel` 项目或团队协作场景 |

点击上方按钮，按照以下步骤部署：

1. 登录或注册 `Vercel` 账号
2. 导入 GitHub 仓库
3. 配置环境变量
4. 点击部署

## 📝 TODO

> 已完成但未移除的条目，前面添加 ✅ 标记。

### 🧩 功能设计

1. 用户协议和隐私：补充登录框中的用户协议与隐私内容
1. 模型配置信息：完善模型信息文档
1. 模型配置支持：支持更多模型 API
1. 图生图功能：优化图生图体验，支持模型配置
1. 素材库重构：优化素材库加载与交互
1. 生图 API 管理：错误码与消息多语言管理
1. 模型配置联动：配置变更实时影响 modelStore
1. 系统提示词：增加模型系统提示词功能
1. 模型测试：支持模型测试功能
1. 豆包 API 管理：区分 3.0 模型与基础模型的 ark/apiKey 管理
1. API 代理协议：开发环境用 vite proxy，生产环境直连 API

### ⚡ 性能优化

1. 接口请求合并：用 Supabase Edge Functions 合并数据库请求
1. 打包分割：rollupOptions 精细化 chunk
1. 图片资源优化：缩略图、懒加载、渐进加载、预加载
1. 代码精简：删除冗余代码，优化结构
1. IndexedDB：使用浏览器 IndexedDB 优化查询性能

### 🎬 动画与主题

1. 动画性能优化
1. 主题管理：全局暗色主题配置，减少样式重复

### 🎈 Lint

1. 处理 `npm run lint` 中存在的错误

## 🤝 Contributing

对于那些想要贡献代码的人，请参阅我们的 [贡献指南](./CONTRIBUTING.md)。

**贡献者**

<a href="https://github.com/fmw666/DesignChat/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fmw666/DesignChat" />
</a>

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
