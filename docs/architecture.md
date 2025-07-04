# AI模型配置管理架构设计

## 目标

- 实现高效、响应式、可维护的模型配置管理。
- 只在页面首次加载时通过接口获取模型配置列表，后续所有操作均在本地 store 中完成。
- 所有模型配置的变更（如 enable、API key、testStatus 等）都只更新 store，并在本地变更后异步调用接口，无需全量刷新。
- 组件和 hooks 只通过 store 读写模型配置，不直接操作后端 service。

---

## 架构核心原则

1. **单次拉取，持久本地**
   - 仅在页面首次加载时（如 useModelStore.initialize）通过接口拉取模型配置列表。
   - 拉取后所有配置都保存在本地 store，后续所有操作均基于本地数据。

2. **本地优先，异步提交**
   - 任何模型配置的变更（如 enable、API key、testStatus、systemPrompt）都先本地 set，再异步调用接口提交。
   - 接口调用失败时可选择回滚本地状态或仅做提示，不影响主流程响应。

3. **解耦 UI 与 Service**
   - 组件和 hooks 只通过 useModel/useModelStore 获取和操作模型配置。
   - 不允许在组件、hooks 中直接 import modelConfigService。
   - Modal、设置页等所有模型配置相关 UI 只依赖 store。

4. **增量更新，无需全量刷新**
   - 配置变更后不再全量刷新列表，只本地变更。
   - 仅在用户主动刷新或页面首次加载时才重新 fetch。

---

## 主要流程

### 1. 首次加载
- 页面或应用启动时，调用 useModelStore.initialize(userId)
- store 内部调用 modelConfigService.getAllModelConfigs(userId)
- 拉取到的配置存入 store，availableModels、modelConfigs 等全部本地化

### 2. 配置变更（如 enable、API key、testStatus）
- 组件通过 useModel/useModelStore 调用如 toggleModelEnabled、updateModelTestStatus、updateModelApiKey 等方法
- 这些方法先本地 set，再异步 await modelConfigService.updateModelConfig 或 createModelConfig
- 接口失败时可回滚或 toast 提示
- 不再全量刷新，只本地变更

### 3. 组件与 hooks
- 组件和 hooks 只通过 useModel/useModelStore 获取和操作模型配置
- 不直接 import modelConfigService
- Modal 组件、设置页等均通过 store 读写

---

## 关键接口设计

### Store 层

```ts
// 仅首次加载 fetch
initialize: async (userId: string) => { ... }

// 本地变更 + 异步提交
async toggleModelEnabled(modelId: string, enabled: boolean) { ... }
async updateModelTestStatus(modelId: string, testStatus: TestStatus) { ... }
async updateModelApiKey(modelId: string, apiKey: string) { ... }
// ... 其他字段同理
```

### Hooks 层

```ts
const { availableModels, toggleModelEnabled } = useModel();
toggleModelEnabled(modelId, true);
```

### 组件层

```tsx
// 只用 useModel/useModelStore
const { availableModels, toggleModelEnabled } = useModel();
<Button onClick={() => toggleModelEnabled(model.id, !model.enabled)} />
```

---

## 典型调用链

1. 用户切换 enable：
   - UI 调用 store.toggleModelEnabled
   - store 先本地 set，再异步提交接口
   - UI 立即响应，无需等待接口

2. 用户修改 API key：
   - UI 调用 store.updateModelApiKey
   - store 先本地 set，再异步提交接口
   - UI 立即响应

3. 用户刷新：
   - UI 调用 store.refreshModels
   - store 重新 fetch 列表，覆盖本地

---

## 优势

- 响应快，用户体验好
- 代码解耦，易维护
- 支持离线/弱网场景
- 便于扩展和测试

---

## 适用场景

- 需要频繁本地交互、低延迟响应的模型配置管理
- 需要支持多端同步但又希望本地优先的场景
- 需要解耦 UI 与 Service、便于单元测试的前端架构

---

## 总结

本架构方案通过"首次拉取+本地优先+异步提交"的模式，实现了高效、解耦、易维护的模型配置管理。所有组件和 hooks 只依赖 store，后端 service 只在 store 内部被调用，极大提升了前端代码的健壮性和用户体验。
