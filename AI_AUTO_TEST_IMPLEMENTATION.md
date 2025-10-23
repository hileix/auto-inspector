# AI Auto Test 实现文档

## 项目概述

Auto Inspector 是一个开源的 AI Web 测试代理，能够根据用户故事自主测试网站并生成测试结果报告。该项目使用 GPT-4o 驱动的 AI 代理来理解和执行 Web 测试场景。

## 核心架构

### 1. 整体架构设计

Auto Inspector 采用双代理架构：
- **Manager Agent（管理代理）**：负责分析页面、规划动作序列
- **Evaluation Agent（评估代理）**：负责评估测试结果是否满足用户故事

### 2. 项目结构

```
backend/src/
├── core/                          # 核心业务逻辑
│   ├── agents/                    # AI 代理实现
│   │   ├── manager-agent/         # 管理代理
│   │   └── evaluation-agent/      # 评估代理
│   ├── entities/                  # 核心实体
│   ├── services/                  # 核心服务
│   └── interfaces/                # 接口定义
├── infra/                         # 基础设施层
│   └── services/                  # 外部服务实现
├── interfaces/                    # 接口层
│   ├── api/                       # REST API
│   └── cli/                       # 命令行接口
└── app/usecases/                  # 用例层
```

## 核心组件详解

### 1. Manager Agent（管理代理）

**位置**: `backend/src/core/agents/manager-agent/manager-agent.ts`

**职责**:
- 分析当前页面状态和 DOM 结构
- 根据用户故事规划下一步动作
- 执行具体的用户交互操作

**核心功能**:

#### 任务定义 (`defineNextTask`)
- 获取页面截图和 DOM 状态
- 将页面信息转换为结构化文本
- 使用 LLM 分析并生成动作序列

#### 动作执行 (`executeAction`)
支持以下动作类型：
- `clickElement`: 点击元素
- `fillInput`: 填写输入框
- `scrollDown/scrollUp`: 页面滚动
- `takeScreenshot`: 截图
- `goToUrl`: 页面导航
- `triggerSuccess/triggerFailure`: 触发成功/失败

#### DOM 变化检测
- 在执行动作序列前检测 DOM 状态变化
- 如果页面发生变化，重新评估动作序列

### 2. Evaluation Agent（评估代理）

**位置**: `backend/src/core/agents/evaluation-agent/evaluation-agent.ts`

**职责**:
- 评估测试是否成功完成用户故事
- 基于最终页面状态和执行历史做出判断

**评估流程**:
1. 获取最终页面截图
2. 分析任务执行历史
3. 对照用户故事进行评估
4. 返回通过/失败结果和原因

### 3. DOM Service（DOM 服务）

**位置**: `backend/src/infra/services/dom-service.ts`

**职责**:
- 页面 DOM 分析和元素提取
- 交互元素识别和高亮显示
- 元素坐标计算和索引映射

**核心功能**:

#### 交互元素识别
- 识别可交互元素（按钮、输入框、链接等）
- 计算元素可见性和层级关系
- 为可交互元素分配数字索引

#### 视觉高亮
- 为可交互元素添加彩色边框和数字标签
- 支持指针位置高亮显示
- 自动清理高亮元素

#### DOM 状态序列化
- 将 DOM 树转换为结构化文本格式
- 生成 DOM 状态哈希值用于变化检测

### 4. Task Manager（任务管理）

**位置**: `backend/src/core/services/task-manager-service.ts`

**职责**:
- 管理任务执行历史
- 维护测试目标和状态
- 提供任务序列化功能

### 5. Browser Service（浏览器服务）

**位置**: `backend/src/infra/services/chromium-browser.ts`

**职责**:
- 基于 Playwright 的浏览器自动化
- 页面导航和交互执行
- 截图和页面状态管理

## 测试执行流程

### 1. 初始化阶段
```typescript
// 创建服务实例
const browser = new ChromiumBrowser();
const llm = new OpenAI4o();
const domService = new DomService(screenshotService, browser);
const evaluationAgent = new EvaluationAgent(llm, browser, screenshotService, reporter);
const managerAgent = new ManagerAgent(config);
```

### 2. 执行循环
```typescript
while (!this.isCompleted) {
  // 1. 定义下一个任务
  const task = await this.defineNextTask();

  // 2. 执行任务
  await this.executeTask(task);

  // 3. 检查完成状态
  if (this.isFailure) {
    return { status: "failed", reason: this.reason };
  }
}
```

### 3. 结果评估
```typescript
const { status, reason } = await this.evaluator.evaluateTestResult(
  this.taskManager.getSerializedTasks(),
  this.taskManager.getEndGoal()
);
```

## Prompt 工程

### Manager Agent Prompt

**系统提示**包含：
- 响应格式规范（JSON Schema）
- 动作执行规则和限制
- 元素交互指南
- 错误处理策略
- 视觉上下文使用说明

**关键规则**:
- 最多支持 N 个动作 per task（可配置）
- 成功/失败动作必须单独执行
- 滚动动作后需要重新评估
- 支持变量替换 `{{variable_name}}`

### Evaluation Agent Prompt

**评估标准**:
- 基于用户故事判断任务完成度
- 优先使用截图信息进行评估
- 在信息不足时做出合理假设
- 返回结构化的评估结果

## 变量和密钥管理

### Variable 类
**位置**: `backend/src/core/entities/variable.ts`

支持两种类型的变量：
- **普通变量**: 可在日志和提示中显示
- **密钥变量**: 不在日志中显示，不发送给 LLM

### VariableString 类
**位置**: `backend/src/core/entities/variable-string.ts`

处理变量字符串替换：
- `{{user_email}}` → 实际邮箱地址
- 支持安全和不安全两种替换模式

## 使用方式

### 1. CLI 模式
```bash
# 运行示例测试
npm run example:voyager

# 运行自定义测试
npm run scenario -- --url="https://example.com" --user-story="As a user, I can login to my account"
```

### 2. GUI 模式
```bash
# 启动 Web 界面
make up
```

### 3. 测试文件格式
```json
{
  "context": {
    "variables": [
      {
        "name": "user_email",
        "value": "demo@example.com",
        "is_secret": false
      }
    ]
  },
  "cases": [
    {
      "start_url": "https://example.com",
      "user_story": "Given I am on the login page\nWhen I enter my credentials\nThen I should see my dashboard"
    }
  ]
}
```

## 技术栈

### 后端
- **框架**: NestJS (TypeScript)
- **AI**: OpenAI GPT-4o via LangChain
- **浏览器自动化**: Playwright
- **DOM 解析**: 自定义 DOM 服务
- **截图**: Playwright Screenshotter

### 前端
- **框架**: Svelte
- **构建工具**: Vite
- **UI**: 自定义组件

### 基础设施
- **容器化**: Docker & Docker Compose
- **浏览器服务**: 独立的 Playwright 服务器

## 核心特性

### 1. 智能元素识别
- 自动识别可交互元素
- 视觉高亮和数字索引
- 支持 Shadow DOM 和 iframe

### 2. 自适应执行
- DOM 变化检测和重新规划
- 错误恢复和重试机制
- 动作序列优化

### 3. 多模态理解
- 页面截图视觉分析
- DOM 结构文本分析
- 上下文信息融合

### 4. 安全性
- 密钥变量保护
- 敏感信息过滤
- 安全的变量替换

## 配置选项

### Manager Agent 配置
```typescript
{
  maxActionsPerTask: 10,    // 每个任务最大动作数
  maxRetries: 3,           // 最大重试次数
  variables: [],           // 变量列表
}
```

### 环境变量
```bash
OPENAI_API_KEY=your_openai_api_key
```

## 局限性和改进方向

### 当前局限性
1. 依赖单一 LLM 提供商（OpenAI）
2. 复杂交互场景的处理能力有限
3. 多标签页支持不完善
4. 测试结果持久化待改进

### 改进方向
1. 支持更多 LLM 提供商
2. 增强复杂交互处理能力
3. 添加多标签页管理
4. 完善测试报告和持久化
5. 增加更多动作类型支持
6. 优化性能和稳定性

## 总结

Auto Inspector 通过创新的 AI 驱动架构，实现了 Web 测试的自动化和智能化。其核心优势在于：

1. **双代理协作**: Manager 和 Evaluation 代理分工明确，确保测试执行的准确性和评估的客观性
2. **多模态理解**: 结合视觉和文本信息，提升页面理解能力
3. **自适应执行**: 实时检测页面变化，动态调整执行策略
4. **开发者友好**: 提供 CLI 和 GUI 两种接口，支持灵活的使用方式

该项目代表了 AI 在软件测试领域的前沿探索，为传统的自动化测试提供了新的思路和解决方案。