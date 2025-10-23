# AI Auto Inspector 架构与执行流程图

## 整体架构图

```mermaid
graph TB
    subgraph "用户接口层"
        CLI[CLI接口]
        GUI[Web GUI界面]
        API[REST API]
    end

    subgraph "AI代理层"
        Manager[Manager Agent<br/>管理代理]
        Evaluation[Evaluation Agent<br/>评估代理]
    end

    subgraph "核心服务层"
        TaskManager[Task Manager<br/>任务管理器]
        DOMService[DOM Service<br/>DOM服务]
        BrowserService[Browser Service<br/>浏览器服务]
        ScreenshotService[Screenshot Service<br/>截图服务]
        Reporter[Reporter<br/>报告生成器]
    end

    subgraph "基础设施层"
        OpenAI[OpenAI GPT-4o]
        Playwright[Playwright浏览器]
        FileSystem[文件系统]
    end

    subgraph "核心实体"
        Variable[Variable<br/>变量实体]
        VariableString[VariableString<br/>变量字符串]
        Task[Task<br/>任务实体]
        Action[Action<br/>动作实体]
    end

    CLI --> Manager
    GUI --> API
    API --> Manager

    Manager --> TaskManager
    Manager --> DOMService
    Manager --> BrowserService
    Manager --> OpenAI

    Evaluation --> TaskManager
    Evaluation --> ScreenshotService
    Evaluation --> OpenAI

    TaskManager --> Variable
    TaskManager --> Task

    DOMService --> BrowserService
    DOMService --> ScreenshotService
    DOMService --> VariableString

    BrowserService --> Playwright
    ScreenshotService --> BrowserService

    Reporter --> TaskManager
    Reporter --> FileSystem

    style Manager fill:#e1f5fe
    style Evaluation fill:#f3e5f5
    style DOMService fill:#e8f5e8
    style TaskManager fill:#fff3e0
```

## 执行流程图

```mermaid
sequenceDiagram
    participant User as 用户
    participant CLI as CLI/GUI
    participant Manager as Manager Agent
    participant LLM as GPT-4o
    participant DOM as DOM Service
    participant Browser as Browser Service
    participant Eval as Evaluation Agent
    participant Reporter as 报告生成器

    User->>CLI: 启动测试
    CLI->>Manager: 初始化管理代理

    loop 测试执行循环
        Manager->>Browser: 获取页面截图
        Manager->>DOM: 分析DOM结构
        DOM->>Browser: 提取页面元素
        DOM-->>Manager: 返回结构化DOM信息

        Manager->>LLM: 分析页面状态，规划动作序列
        LLM-->>Manager: 返回动作序列JSON

        alt DOM是否变化？
            Manager->>DOM: 检查DOM变化
            DOM-->>Manager: DOM已变化，重新评估
            Manager->>LLM: 重新规划动作序列
            LLM-->>Manager: 返回新动作序列
        end

        Manager->>Browser: 执行动作序列
        Browser-->>Manager: 返回执行结果

        alt 是否完成？
            Manager->>Manager: 设置完成状态
        else 是否失败？
            Manager->>Manager: 设置失败状态
        end
    end

    Manager->>Eval: 请求评估测试结果
    Eval->>Browser: 获取最终截图
    Eval->>TaskManager: 获取执行历史
    Eval->>LLM: 评估测试是否成功
    LLM-->>Eval: 返回评估结果
    Eval-->>Manager: 返回最终评估

    Manager->>Reporter: 生成测试报告
    Reporter-->>CLI: 返回测试报告
    Reporter-->>User: 显示测试结果
```

## DOM Service 工作流程图

```mermaid
flowchart TD
    Start([开始]) --> GetPage[获取页面信息]
    GetPage --> AnalyzeDOM[分析DOM结构]
    AnalyzeDOM --> ExtractElements[提取交互元素]
    ExtractElements --> HighlightElements[高亮显示元素]
    HighlightElements --> CalculateCoords[计算元素坐标]
    CalculateCoords --> AssignIndexes[分配数字索引]
    AssignIndexes --> GenerateHash[生成DOM哈希]
    GenerateHash --> SerializeDOM[序列化DOM结构]
    SerializeDOM --> ReturnResult[返回结构化数据]
    ReturnResult --> End([结束])

    subgraph "交互元素类型"
        Button[按钮]
        Input[输入框]
        Link[链接]
        Select[下拉框]
        TextArea[文本域]
        Checkbox[复选框]
        Radio[单选框]
    end

    ExtractElements --> Button
    ExtractElements --> Input
    ExtractElements --> Link
    ExtractElements --> Select
    ExtractElements --> TextArea
    ExtractElements --> Checkbox
    ExtractElements --> Radio
```

## Manager Agent 决策流程图

```mermaid
flowchart TD
    Start([开始任务定义]) --> GetContext[获取页面上下文]
    GetContext --> GetScreenshot[获取页面截图]
    GetScreenshot --> GetDOMState[获取DOM状态]
    GetDOMState --> BuildPrompt[构建提示词]
    BuildPrompt --> CallLLM[调用LLM分析]
    CallLLM --> ParseResponse[解析响应]

    ParseResponse --> HasActions{是否有动作?}
    HasActions -->|否| NoActions[无动作，可能完成]
    HasActions -->|是| ValidateActions[验证动作有效性]

    ValidateActions --> IsValid{动作有效?}
    IsValid -->|否| CallLLM[重新调用LLM]
    IsValid -->|是| CheckForSpecial[检查特殊动作]

    CheckForSpecial --> IsSuccess{是成功动作?}
    IsSuccess -->|是| TriggerSuccess[触发成功状态]
    CheckForSpecial --> IsFailure{是失败动作?}
    IsFailure -->|是| TriggerFailure[触发失败状态]
    CheckForSpecial --> RegularActions[常规动作序列]

    RegularActions --> ExecuteActions[执行动作序列]
    TriggerSuccess --> End([结束])
    TriggerFailure --> End
    NoActions --> End
    ExecuteActions --> End

    subgraph "支持的动作类型"
        Click[clickElement]
        Fill[fillInput]
        ScrollDown[scrollDown]
        ScrollUp[scrollUp]
        Screenshot[takeScreenshot]
        Navigate[goToUrl]
    end

    ExecuteActions --> Click
    ExecuteActions --> Fill
    ExecuteActions --> ScrollDown
    ExecuteActions --> ScrollUp
    ExecuteActions --> Screenshot
    ExecuteActions --> Navigate
```

## 数据流图

```mermaid
graph LR
    subgraph "输入数据"
        UserStory[用户故事]
        URL[起始URL]
        Variables[变量配置]
    end

    subgraph "处理过程"
        Analysis[页面分析]
        Planning[动作规划]
        Execution[动作执行]
        Evaluation[结果评估]
    end

    subgraph "输出数据"
        Report[测试报告]
        Screenshots[截图记录]
        ActionsLog[动作日志]
        EvaluationResult[评估结果]
    end

    UserStory --> Planning
    URL --> Analysis
    Variables --> Execution

    Analysis --> Planning
    Planning --> Execution
    Execution --> Evaluation

    Evaluation --> Report
    Execution --> Screenshots
    Execution --> ActionsLog
    Evaluation --> EvaluationResult

    style UserStory fill:#e3f2fd
    style Report fill:#e8f5e8
    style Analysis fill:#fff3e0
    style Planning fill:#fce4ec
    style Execution fill:#f3e5f5
    style Evaluation fill:#e0f2f1
```

## 变量管理系统流程图

```mermaid
flowchart TD
    Start([开始变量处理]) --> LoadVars[加载变量配置]
    LoadVars --> ClassifyVars[分类变量类型]

    ClassifyVars --> IsSecret{是否为密钥?}
    IsSecret -->|是| SecretVar[密钥变量]
    IsSecret -->|否| NormalVar[普通变量]

    SecretVar --> NoDisplay[不在日志中显示]
    NormalVar --> CanDisplay[可在日志中显示]

    NoDisplay --> SafeReplace[安全替换模式]
    CanDisplay --> SafeReplace

    SafeReplace --> ProcessVarString[处理变量字符串]
    ProcessVarString --> FindPatterns[查找{{变量}}模式]
    FindPatterns --> ReplaceValues[替换实际值]
    ReplaceValues --> ValidateResult[验证替换结果]
    ValidateResult --> Success([替换成功])
    ValidateResult --> Failed([替换失败])

    subgraph "变量类型示例"
        Email["user_email (普通)"]
        Password["password (密钥)"]
        Token["api_token (密钥)"]
        Username["username (普通)"]
    end

    ClassifyVars --> Email
    ClassifyVars --> Password
    ClassifyVars --> Token
    ClassifyVars --> Username
```

这些图表展示了AI Auto Inspector的核心架构和执行流程，包括：

1. **整体架构图** - 展示系统各层组件之间的关系
2. **执行流程图** - 描述从初始化到结果输出的完整流程
3. **DOM Service工作流程** - 详细说明DOM分析和元素处理过程
4. **Manager Agent决策流程** - 展示AI代理的思考和决策过程
5. **数据流图** - 描述数据在系统中的流转过程
6. **变量管理系统流程** - 说明变量配置和安全处理机制

每个图表都采用了Mermaid格式，可以轻松集成到文档中或使用支持Mermaid的工具查看。