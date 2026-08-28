# 04｜MCP、框架与记忆（9 题）

记忆链：**协议解决连接 → Host 决定调用 → Runtime 管权限 → 记忆按生命周期分层**。

## MCP-01｜MCP 解决什么问题？

**关键词：** Model Context Protocol、能力发现、标准接口、Host/Client/Server  
**关联：** MCP-02、MCP-03、PROJ-15

**参考答案：** MCP 用统一协议把模型应用与工具、资源和提示模板连接起来，减少每个 Host 为每个数据源写专用适配器的成本。Server 暴露能力，Client 维护连接，Host 负责用户体验、模型选择和安全策略。MCP 标准化的是交互，不自动保证鉴权、可信或业务正确性。

## MCP-02｜MCP 的基本交互和生命周期是什么？

**关键词：** initialize、capability negotiation、list、call/read、transport  
**关联：** AGENT-04、MCP-01、MCP-04

**参考答案：** Client 与 Server 建连后初始化并协商能力，再列出 tools/resources/prompts；Host 选择后发起调用或读取，Server 返回结构化 content/error。连接还涉及超时、取消、会话和版本兼容。生产中要记录 Server 身份、工具版本和调用 trace，并限制 Host 可见的能力集合。

## MCP-03｜MCP、Tool Calling、Skill 与 CLI 有什么区别？

**关键词：** 协议、模型输出、工作流知识、命令接口  
**关联：** AGENT-06、MCP-01、PROJ-15

**参考答案：** Tool Calling 是模型生成结构化调用意图；MCP 是 Host 与外部能力之间的协议；Skill 是可复用的说明、流程和资产；CLI 是人或程序可调用的命令接口。它们可组合：Skill 教 Agent 何时做，模型发起 tool call，MCP 传输请求，Server 再调用 CLI/API。不要把四者当同一抽象层。

## MCP-04｜MCP 工具如何做安全治理？

**关键词：** 最小权限、allowlist、schema validation、approval、审计  
**关联：** AGENT-04、EVAL-10、EVAL-11

**参考答案：** 只向 Host 暴露任务需要的工具；校验 Server 身份、输入 schema、路径/域名/租户范围和输出大小；读与写权限分离，敏感或不可逆动作要求用户确认；凭据留在执行侧，不进入模型上下文。还需设置超时、速率限制、沙箱和审计，不能因为“用了 MCP”就默认安全。

## MCP-05｜MCP 与 A2A 有什么区别？

**关键词：** tool/resource integration、agent collaboration、task lifecycle、互补  
**关联：** AGENT-11、AGENT-12

**参考答案：** MCP 主要标准化 Agent/模型应用如何访问工具和资源；A2A 类协议更关注不同 Agent 间的能力发现、任务委派、进度和产物交换。一个 Agent 可通过 MCP 使用数据库，同时通过 A2A 把子任务交给另一 Agent。二者互补，但多一层协议就多一层身份、授权和状态一致性问题。

## MCP-06｜短期记忆、长期记忆、会话状态与 RAG 有什么关系？

**关键词：** working memory、episodic、semantic、profile、retrieval  
**关联：** LLM-04、MCP-07、RAG-11

**参考答案：** 会话状态保存当前任务的确定字段；短期记忆是当前窗口和近期摘要；长期记忆可分用户偏好/事实、历史事件和可复用知识；RAG 是按查询检索外部知识的机制。它们可以共用存储技术，但写入策略、时效、权限和删除要求不同，不能把所有历史对话都无筛选向量化。

## MCP-07｜长期记忆如何写入、读取和防止污染？

**关键词：** write policy、confidence、provenance、TTL、dedupe、user control  
**关联：** MCP-06、EVAL-11

**参考答案：** 只写稳定、有未来价值且允许保存的信息，并记录来源、置信度、时间和用户；敏感信息默认不持久化。读取时按任务、用户、时效和权限检索，冲突时保留版本并优先新鲜可信来源；提供查看、纠正和删除能力。模型推断不能未经确认升级成用户事实。

## MCP-08｜LangChain、LangGraph、LlamaIndex、AutoGen、Semantic Kernel 如何选？

**关键词：** 组件生态、状态图、数据/RAG、多Agent、企业SDK  
**关联：** AGENT-10、MCP-09、PROJ-03

**参考答案：** LangChain 偏通用组件与集成；LangGraph 强调有状态图、持久化和恢复；LlamaIndex 强在数据接入和 RAG；AutoGen 偏多 Agent 对话编排；Semantic Kernel 适合 .NET/Java/Python 的企业集成。先按状态复杂度、语言栈、可观测、部署和锁定成本选最小集合，核心业务接口要与框架解耦。

## MCP-09｜Dify / Coze 等低代码 Agent 平台适合什么场景？

**关键词：** workflow、知识库、插件、快速验证、平台边界、私有化  
**关联：** MCP-08、ENG-08

**参考答案：** 适合快速搭建知识库问答、固定工作流、运营可配置应用和 PoC；可借助可视化节点、模型管理、日志和插件降低交付门槛。复杂状态、高性能执行、深度自定义权限或严格测试时，核心 Runtime 仍应代码化。面试应能讲清节点编排、变量作用域、错误分支、插件 schema、私有化部署和何时迁出平台。
