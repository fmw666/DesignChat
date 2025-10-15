# CONTRIBUTION GUIDE / 贡献指南

***💡 Some tips for developers / 给开发者的一点小建议***

"We encourage everyone to make full use of AI tools to boost development efficiency. Over 80% of this repository was built with AI assistance—consider AI your coding partner! The project also provides practical Cursor rules and prompts; see [Tips](./docs/some_tips.md) for details."
<br>/<br>
"鼓励大家充分利用各类 AI 工具提升开发效率。本仓库超过 80% 的内容由 AI 协助构建，欢迎将 AI 视为你的开发伙伴。项目还提供了实用的 Cursor 规则和 prompts，详情请参见 [Tips](./docs/some_tips.md)"

## How to Contribute / 如何参与贡献

1. **Fork this repository / Fork 本仓库**
2. **Create a feature branch / 创建特性分支**
   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. **Commit your changes / 提交更改**
   ```bash
   git commit -m 'Add: Your feature description'
   ```
4. **Push to your branch / 推送到分支**
   ```bash
   git push origin feature/YourFeatureName
   ```
5. **Open a Pull Request / 开启 Pull Request**

> 💡 Please use clear commit messages and detailed PR descriptions. / 请使用清晰的提交信息和详细的 PR 描述。

---

## Commit Message Convention / Commit Message 规范

Please follow the commit message format below for better team collaboration and automation.
<br>/<br>
请遵循以下提交信息格式，便于团队协作和自动化工具识别。

- **[feature]** Feature or new requirement / 新功能/需求相关
- **[bugfix]** Bug fix / 修复 bug
- **[doc]** Document related / 文档相关
- **[test]** Test related / 测试相关

**Examples / 示例：**
```
[feature] Support multi-model switching / 支持多模型切换
[bugfix] Fix token invalidation issue during login / 修复登录时的 token 失效问题
[doc] Add README.md LICENSE part / 新增 README.md 许可证部分
[test] Add unit tests for chatService / 增加 chatService 的单元测试
```

> Commit messages can be in either Chinese or English, but please keep them concise and descriptive.
> <br>/<br>
> 提交信息请使用中英文均可，务必简明扼要描述本次更改内容。

---

## Project Structure / 项目结构

This project adopts a modular and layered architecture for easy scalability and maintenance. Each directory has a clear and specific responsibility.
<br>/<br>
本项目采用模块化、分层设计，便于扩展和维护。每个目录均有明确职责。

```text
.
├── docs/
│   ├── tasks/
│   ├── project/
├── public/
│   ├── favicon.svg
│   └── site.webmanifest
├── scripts/                                       # scripts if necessary
│   └── ...
├── src/
│   ├── app/
│   │   ├── router/
│   │   │   └── AppRouter.tsx
│   │   ├── store/
│   │   │   └── index.ts
│   │   ├── providers/
│   │   │   └── AppProvider.tsx
│   ├── examples/
│   │   └── ExampleComponent.tsx
│   ├── features/                                  # UI components / 组件层
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx       # Form component for user authentication
│   │   │   │   └── LogoutButton.tsx    # Button component for session termination
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts          # Custom hook for authentication logic
│   │   │   ├── services/
│   │   │   │   └── authService.ts      # API calls for login/logout operations
│   │   │   ├── store/
│   │   │   │   └── authStore.ts        # x
│   │   │   ├── types/
│   │   │   │   └── authTypes.ts        # Type definitions for auth module
│   │   │   └── index.ts
│   │   ├── task/
│   │   │   ├── components/
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   └── TaskForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useTaskManager.ts
│   │   │   ├── services/
│   │   │   │   └── taskService.ts
│   │   │   ├── store/
│   │   │   │   └── taskStore.ts
│   │   │   ├── types/
│   │   │   │   └── taskTypes.ts
│   │   │   └── index.ts
│   │   ├── others/
│   │   │   └── ...
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── index.ts
│   │   │   ├── layout/                     # 统一布局组件
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── ...                         # 其他共享组件
│   │   ├── hooks/
│   │   │   └── useLocalStorage.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   └── clipboard.ts                # 剪贴板工具
│   │   ├── services/
│   │   │   └── supabase.ts                 # Supabase 初始化
│   │   ├── i18n/                           # 国际化
│   │   │   ├── locales/                    # 国际化
│   │   │   │   ├── en.ts                    # 国际化
│   │   │   │   ├── zh.ts                    # 国际化
│   │   │   │   └── ...                     # 其他语言，如果有需要
│   │   │   └── index.ts                    # Supabase 初始化
│   │   ├── types/
│   │   │   └── sharedTypes.ts
│   ├── styles/
│   │   ├── global.css
│   │   └── tailwind.css
│   ├── tests/                          # 测试文件
│   │   ├── integration/                # 集成测试
│   │   │   ├── taskFlow.test.ts
│   │   │   └── authFlow.test.ts
│   │   ├── unit/                       # 单元测试
│   │   │   ├── features/
│   │   │   │   └── auth/
│   │   │   │       └── useAuth.test.ts
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   │   └── Button.test.tsx
│   │   │   │   └── utils/
│   │   │   │       └── clipboard.test.ts
├── .env
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── jest.config.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

---

> For more details, please refer to the inline comments in each file. / 更多细节请参考各文件内联注释。

---

Welcome for any kind of contribution! / 欢迎任何形式的贡献！
