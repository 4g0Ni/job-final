# AI Agent 知识思维导图

目标：先记住“系统链路”，再把专题题号挂到链路上。主干口诀：

> **模型承载上下文 → RAG 找证据 → Agent 做决策 → 工具/MCP 执行动作 → Eval 与安全控风险 → 工程平台保交付。**

```mermaid
mindmap
  root((AI Agent 应用工程))
    LLM与上下文
      生成机制
        Decoder-only
        Causal与Prefix
        RoPE与长上下文
      上下文工程
        指令
        会话状态
        检索证据
        工具结果
      对齐与选型
        SFT与LoRA
        DPO/PPO/GRPO
        模型路由
      题号 LLM-01~09
    RAG知识工程
      数据侧
        解析清洗
        结构化分块
        版本与权限
      召回侧
        Direct与Metadata
        BM25/FTS
        Dense
        Multi-query/HyDE
      排序侧
        RRF
        Rerank
        Parent-Child
      可信回答
        Evidence Gate
        引用校验
        拒答与澄清
      评测
        Recall@K
        MRR/nDCG
        分桶与消融
      题号 RAG-01~13
    Agent运行时
      任务边界
        Chatbot
        Workflow
        Agent
        Multi-Agent
      决策循环
        Plan
        Act
        Observe
        Replan/Stop
      工具执行
        Schema
        权限与审批
        幂等与事务
        失败恢复
      受控运行
        状态机
        预算
        Stale Retry
        Best-so-far
      题号 AGENT-01~13
    MCP框架与记忆
      MCP
        Host/Client/Server
        Tools/Resources/Prompts
        能力发现
        最小权限
      框架
        LangGraph
        LlamaIndex
        AutoGen
        Semantic Kernel
        Dify/Coze
      记忆
        会话状态
        短期摘要
        长期偏好与事实
        RAG外部知识
      题号 MCP-01~09
    Eval安全与LLMOps
      分层评测
        Intent与Routing
        Retrieval
        Tool与Gate
        Answer与Grounding
        Agent Loop
      可观测
        Trace/Metric/Log
        Token/Cost/Latency
        Bad Case Taxonomy
      安全
        Prompt Injection
        ACL与租户
        脱敏与审计
        人工确认
      LLMOps
        Version Manifest
        Shadow/Canary
        Calibration
        Rollback
      题号 EVAL-01~14
    生产工程
      API
        FastAPI Async
        SSE/WebSocket
        Timeout/Cancel
      平台
        Model Gateway
        Tool Registry
        RAG Service
        Policy与Tenant
      部署
        Docker/K8s
        vLLM/TGI
        Queue与Backpressure
        Rate Limit/Circuit Breaker
      发布
        Unit/Contract
        Golden/E2E
        Load Test
        Gray Release
      题号 ENG-01~10
    项目证据链
      Commit AI Resolver
        27646条公开Commit
        Direct+FTS5+Dense+RRF
        Evidence Gate
        6个MCP工具
      两层数据集
        75-case工程回归
        23-case frozen test
        461 RCA cases模型预审版
      关键Bad Case
        RRF救9挤27
        长查询召回下降
        Full SHA
        默认日期误放行
      下一代
        索引粗召回
        rg/git/symbol原始证据精查
      题号 PROJ-01~15
```

## 一张图记住问题之间的因果关系

```mermaid
flowchart LR
  A[用户任务] --> B[Context Engineering]
  B --> C{需要外部知识?}
  C -- 是 --> D[Hybrid RAG]
  C -- 否 --> E{需要外部动作?}
  D --> F[Evidence Gate]
  F -- 证据足 --> E
  F -- 不足 --> G[拒答或澄清]
  E -- 否 --> H[结构化生成]
  E -- 是 --> I[Agent Runtime]
  I --> J[Tool/MCP]
  J --> K[校验 权限 幂等 沙箱]
  K --> L[Observation]
  L --> M{有新证据且预算足?}
  M -- 是 --> I
  M -- 否 --> H
  H --> N[Grounding与引用校验]
  N --> O[用户结果]
  B -. 版本与Trace .-> P[Eval与LLMOps]
  D -. Recall/RRF/Rerank .-> P
  I -. 成功率/循环/成本 .-> P
  K -. 安全与审计 .-> P
  P -. 灰度/校准/回滚 .-> B
```

## 复习节奏

- **第一遍（骨架）：** 每个一级分支只说 30 秒，先回答“解决什么问题”。
- **第二遍（连接）：** 每条虚线或箭头说出一个失败案例，例如“召回有结果但证据不足，所以需要 Gate”。
- **第三遍（证据）：** 把 Commit AI Resolver 的数字和坏例挂到对应节点，不单独背亮点。
- **第四遍（岗位化）：** 根据 JD 只展开 2～3 个分支；其他分支用一句边界说明收住。
