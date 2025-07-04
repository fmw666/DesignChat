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
src/
├── App.tsx                                    # App root component / 应用根组件
├── main.tsx                                   # App entry file / 应用入口文件
├── setupTests.ts                              # Test setup / 测试配置
├── config/                                    # Model list / 模型列表
│   ├── models.types.ts                        # Model type definitions / 模型类型定义
│   └── modelsLoader.ts                        # Model loader logic / 模型加载逻辑
├── components/                                # UI components / 组件层
│   ├── features/                              # Feature modules / 业务功能组件
│   │   ├── auth/                              # Auth UI / 认证相关组件
│   │   │   ├── SignInModal.tsx                # Sign-in modal / 登录模态框
│   │   │   └── ProtectedRoute.tsx             # Route protection / 路由保护
│   │   ├── chat/                              # Chat UI / 聊天相关组件
│   │   │   ├── ChatMessage.tsx                # Chat message / 聊天消息
│   │   │   ├── ChatHistory.tsx                # Chat history / 聊天历史
│   │   │   ├── ChatTitle.tsx                  # Chat title / 聊天标题
│   │   │   ├── ModelDrawer.tsx                # Model selector / 模型选择抽屉
│   │   │   ├── ChatInput.tsx                  # Chat input / 聊天输入
│   │   │   ├── SuccessToast.tsx               # Success toast / 成功提示
│   │   │   ├── ArchivedChatInterface.tsx      # Archived chat / 聊天归档
│   │   │   ├── NewChatGuide.tsx               # New chat guide / 新聊天引导
│   │   │   └── TextModal.tsx                  # Text modal / 文本模态框
│   │   ├── user/                              # User UI / 用户相关组件
│   │   │   ├── UserProfileModal.tsx           # User profile / 用户资料
│   │   │   ├── SettingsModal.tsx              # Settings / 设置
│   │   │   ├── ModelConfigModal.tsx           # Model config / 模型配置
│   │   │   ├── ModelDetailModal.tsx           # Model detail / 模型详情
│   │   │   └── ArchivedChatsModal.tsx         # Archived chats / 聊天归档
│   │   ├── assets/                            # Asset UI / 素材库相关组件
│   │   │   ├── CardAssetsGrid.tsx             # Card grid / 卡片网格
│   │   │   ├── AssetsCategory.tsx             # Asset category / 素材分类
│   │   │   └── FlatAssetsGrid.tsx             # Flat grid / 扁平网格
│   ├── shared/                                # Shared UI / 通用组件
│   │   ├── layout/                            # Layouts / 布局
│   │   │   ├── BaseLayout.tsx                 # Base layout / 基础布局
│   │   │   ├── BaseSidebar.tsx                # Base sidebar / 基础侧边栏
│   │   │   ├── Sidebar.tsx                    # Sidebar / 侧边栏
│   │   │   ├── UserMenu.tsx                   # User menu / 用户菜单
│   │   │   ├── UserMenuItems.tsx              # User menu items / 用户菜单项
│   │   ├── common/                            # Common widgets / 通用小组件
│   │   │   ├── ConfirmDialog/                 # Confirm dialog / 确认对话框
│   │   │   │   ├── ConfirmDialogOptimized.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   └── types.ts
│   │   │   ├── ContextMenu.tsx                # Context menu / 右键菜单
│   │   │   ├── CustomToaster.tsx              # Toast / 全局提示
│   │   │   ├── EmptyState.tsx                 # Empty state / 空状态
│   │   │   ├── ImageLoader.tsx                # Image loader / 图片加载
│   │   │   ├── ImagePreview/                  # Image preview / 图片预览
│   │   │   │   └── index.tsx
│   │   │   ├── ImageViewer/                   # Image viewer / 图片查看
│   │   │   │   └── index.tsx
│   │   │   ├── Logo/                          # Logo / 标志
│   │   │   │   └── index.tsx
│   │   │   ├── Modal/                         # Modal / 模态框
│   │   │   │   ├── index.tsx
│   │   │   │   └── modalStack.ts
│   │   ├── modals/                            # Other modals / 其他模态框
│   │   │   └── RenameChatModal.tsx
│   ├── tests/                                 # Test UI / 测试组件
│   │   ├── chat/                              # Chat test / 聊天测试
│   │   │   ├── DoubaoTest.tsx
│   │   │   ├── Gpt4oTest.tsx
│   │   │   └── TestLayout.tsx
│   │   ├── storage/                           # Storage test / 存储测试
│   │   │   └── StorageTestComponent.tsx
├── pages/                                     # Pages / 页面
│   ├── Chat/                                  # Chat pages / 聊天页面
│   │   ├── index.tsx
│   │   ├── ChatLayout.tsx
│   │   └── ChatInterface/
│   │       ├── index.tsx
│   │       ├── ScrollingOverlay.tsx
│   │       └── ChatLoading.tsx
│   ├── Assets/                                # Asset pages / 素材页面
│   │   ├── AssetsInterface.tsx
│   │   ├── AssetsLayout.tsx
│   │   ├── AssetsLoading.tsx
│   │   └── index.tsx
│   ├── Tests/                                 # Test pages / 测试页面
│   │   ├── index.tsx
│   │   ├── SupabaseTest.tsx
│   │   ├── ChatTest.tsx
│   │   └── StorageTest.tsx
│   └── NotFound.tsx                           # 404 page / 404 页面
├── services/                                  # Service layer / 服务层
│   ├── api/                                   # API services / API 服务
│   │   ├── index.ts
│   │   ├── modelApiManager.ts
│   │   └── supabase.ts
│   ├── auth/                                  # Auth services / 认证服务
│   │   ├── authService.ts
│   │   ├── authMiddleware.ts
│   │   └── index.ts
│   ├── chat/                                  # Chat services / 聊天服务
│   │   ├── chatService.ts
│   │   └── index.ts
│   ├── model/                                 # Model services / 模型服务
│   │   ├── baseService.ts
│   │   ├── doubaoService.ts
│   │   ├── gpt4oService.ts
│   │   ├── index.ts
│   │   ├── modelManager.ts
│   │   └── modelService.ts
│   ├── storage/                               # Storage services / 存储服务
│   │   ├── imageUtils.ts
│   │   ├── index.ts
│   │   └── storageService.ts
│   ├── assets/                                # Asset services / 素材服务
│   │   ├── assetsServices.ts
│   │   └── index.ts
├── hooks/                                     # Custom hooks / 自定义 Hooks
│   ├── index.ts
│   ├── chat/                                  # Chat hooks / 聊天相关
│   ├── model/                                 # Model hooks / 模型相关
│   ├── ui/                                    # UI hooks / UI 相关
│   ├── auth/                                  # Auth hooks / 认证相关
│   └── assets/                                # Asset hooks / 素材相关
├── store/                                     # State management / 状态管理
│   ├── modelStore.ts
│   ├── authStore.ts
│   ├── chatStore.ts
│   └── assetsStore.ts
├── utils/                                     # Utilities / 工具函数
│   ├── avatar.ts
│   ├── clipboard.ts
│   ├── corsProxy.ts
│   ├── eventBus.ts
│   └── modelUtils.ts
├── providers/                                 # Providers / 全局 Provider
│   ├── AuthProvider.tsx
│   ├── ContextMenuProvider.tsx
│   └── ThemeProvider.tsx
├── styles/                                    # Styles / 样式
│   ├── index.css
│   └── theme.ts
├── i18n/                                      # Internationalization / 国际化
│   ├── index.ts
│   └── locales/
│       ├── en.ts
│       └── zh.ts
├── types/                                     # Type definitions / 类型定义
│   ├── chat.ts
│   └── env.d.ts
├── examples/                                  # Example code / 示例代码
│   └── StreamGenerationExample.tsx
```

---

> For more details, please refer to the inline comments in each file. / 更多细节请参考各文件内联注释。

---

Welcome for any kind of contribution! / 欢迎任何形式的贡献！
