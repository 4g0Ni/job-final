# 03｜Agent 架构与工具调用（13 题）

记忆链：**是否需要 Agent → 如何决策 → 如何执行工具 → 如何恢复 → 如何受控结束**。

## AGENT-01｜Chatbot、Workflow、Agent、Multi-Agent 如何区分？

**关键词：** **固定路径**、**动态决策**、**环境反馈**、**角色边界**  
**关联：** AGENT-02、AGENT-11、AGENT-13

**参考答案：** 我会看“下一步到底是谁决定的”。**Chatbot** 主要负责生成对话；**Workflow** 的步骤和分支是代码提前写好的；**Agent** 会根据当前状态和工具结果动态决定下一步；**Multi-Agent** 则把任务拆给多个有独立职责的决策主体。判断它是不是 Agent，不是看有没有调用 LLM，而是看**运行路径会不会被模型动态改变**。能用固定流程解决的，我会优先用 Workflow。

## AGENT-02｜ReAct 的核心机制是什么？

**关键词：** **Reason-Act-Observe**、**反馈闭环**、**停止条件**、**可观测**  
**关联：** AGENT-03、AGENT-08、PROJ-14

**参考答案：** **ReAct** 可以理解成一个“想一下、做一步、看结果、再决定”的反馈循环。它的好处是能根据工具返回实时调整，缺点是容易循环、变慢、变贵，还可能被工具内容里的恶意指令影响。生产里我不会保存或暴露私有思维链，而是记录**结构化决策摘要、动作、观察和停止原因**，并由 Runtime 强制限制轮数、时间、token 和权限。

## AGENT-03｜Agent Runtime / Harness 应包含哪些组件？

**关键词：** **State**、**Planner**、**Tool Registry**、**Policy**、**Memory**、**Trace**、**Eval**  
**关联：** LLM-05、AGENT-04、EVAL-04

**参考答案：** 我理解的 **Agent Runtime/Harness** 不是给模型包一层 prompt，而是给它补齐工程边界。至少要有模型网关、上下文构建、状态或编排、工具注册与执行、权限策略、记忆、重试恢复、流式事件、Trace、预算和 Eval 接口。Commit AI Resolver 里，Agents SDK 负责 agent loop 和 agents-as-tools；我写的 Harness 负责 request-local state、工具白名单、Candidate Ledger、Agent/Tool/Diff/时间预算、去重、超时、输出校验和 fallback。这个分层把“模型如何选择下一步”与“系统允许它做什么”分开。

### 进一步理解：什么是 Harness？

**Harness 是包裹在 LLM Agent 外面的、由确定性代码控制的运行环境。** Agent 负责根据目标和 Observation 判断“下一步做什么”；Harness 负责约束“它能做什么、最多做多少、产生的结果能不能被系统接受”。它不是某个框架的专有名词，面试时最好先说明自己采用的边界。

可以用驾驶来类比：LLM Agent 是驾驶员，Tools 是方向盘、油门和刹车，Agent Framework 是发动机和传动系统，而 Harness 是安全带、限速器、仪表盘、行车记录仪和紧急制动系统。它允许驾驶员根据路况改变路线，但不会把车辆权限和安全边界交给驾驶员自己定义。

| 概念 | 主要职责 |
|---|---|
| Agent | 理解目标，根据状态和工具反馈决定下一步动作 |
| Agent Framework / SDK | 提供 Agent Loop、Tool Calling、Handoff 或 Agents-as-tools 等基础执行能力 |
| Orchestrator / Supervisor | 在当前任务中决定调用哪个 Agent、是否继续或停止 |
| Workflow | 用代码预先规定步骤、分支和执行顺序 |
| Harness | 管理整个执行环境，强制执行状态、权限、预算、校验、观测和恢复策略 |

一个生产级 Harness 通常包含以下能力：

1. **请求级状态：** 保存目标、历史、工具 Observation、Candidate/Artifact Ledger、假设、错误和阶段产物，并规定字段所有权与合并规则。
2. **工具治理：** Tool Registry、输入输出 Schema、最小权限、审批、副作用隔离、幂等、结果裁剪和敏感信息过滤。
3. **执行控制：** Agent/Tool/Token/费用/总时长预算，单工具超时、并发上限、重复调用缓存、Stale Retry 检测和强制停止条件。
4. **证据与输出校验：** 检查结构化输出、引用、业务规则、证据来源和置信度；模型说“完成”不代表系统必须接受。
5. **可观测性与 Eval：** 记录结构化的 Action、Observation、路由、耗时、用量、停止原因和降级原因，用于回放、Bad Case 定位和离线评测；不记录或暴露私有思维链。
6. **恢复与降级：** 根据错误类型选择重试、重新规划、澄清、Best-so-far、固定 Workflow Fallback 或 Human-in-the-loop，并正确传播客户端取消。

在 Commit AI Resolver 中，OpenAI Agents SDK 是 Framework，Incident Commander 是 Orchestrator，`api/agents/harness/` 是应用自己的 Harness。所有 Agent/Tool 调用都经过 Harness：Retrieval 只能搜索；Diff Investigator 只能读取已经通过 Evidence Gate 并进入 Candidate Ledger 的 Commit；Critic 可以找反证但不能直接生成最终答复；Supervisor 只能委派 Specialist，不能绕过它们直接访问底层搜索或 Diff。最终引用必须来自授权 Ledger，因果答案没有通过 Critic 时置信度还会被代码限制。

**面试一句话：** Harness 是把概率性的模型决策放进确定性的工程边界——模型拥有路径决策权，但系统保留权限、预算、证据、校验、观测和恢复权。

## AGENT-04｜一个新工具从定义到执行的完整链路是什么？

**关键词：** **Schema**、**发现**、**选择**、**校验**、**授权**、**执行**、**Observation**  
**关联：** AGENT-05、AGENT-06、MCP-02

**参考答案：** 这条链路我会从工具定义讲起：先定义名称、用途、输入输出 **Schema**、权限和副作用；Host 只把当前允许的工具给模型看；模型返回结构化调用以后，Runtime 再做 schema、业务规则、权限和审批检查。真正执行时还要有超时、幂等键和隔离。结果回来后做裁剪和脱敏，作为 **Observation** 交回模型。Commit AI Resolver 的 `get_commit_diff` 还会验证 repo/SHA、检查 Candidate Ledger 授权、扣减 Diff budget、缓存重复请求并限制响应大小，因此合法 JSON 并不等于有权执行。

## AGENT-05｜Agent 如何判断是否调用工具？

**关键词：** **能力边界**、**实时信息**、**外部动作**、**置信度**、**策略路由**  
**关联：** AGENT-04、AGENT-13

**参考答案：** 我不会完全把这个决定交给模型。系统先规定哪些信息必须查工具、哪些动作需要审批，模型只在这个范围里选。像**实时数据、用户私有数据、精确计算和外部副作用**，我会强制走工具；普通、低风险的解释可以直接回答。关键任务还可以用规则或分类器先路由，再看 **Tool Selection Accuracy** 和不必要调用率，判断模型是不是乱用工具。

## AGENT-06｜如何设计 Tool / Function Calling 的 schema？

**关键词：** **单一职责**、**强类型**、**枚举**、**清晰描述**、**最小参数**、**版本化**  
**关联：** LLM-06、AGENT-04、MCP-03

**参考答案：** 我会让一个工具只做一件容易验证的事，参数名和描述尽量没有歧义，并多用**枚举、范围、必填和互斥约束**，少让模型塞大段自由文本。输出最好包含稳定业务 ID、明确状态和可诊断错误。Schema 也要有版本和兼容策略。尤其是写操作，我会把它和查询工具分开，避免一个描述模糊的工具既能查又能改。

## AGENT-07｜工具失败时如何恢复？

**关键词：** **错误分类**、**Retryable**、**Backoff**、**Fallback**、**Best-so-far**  
**关联：** AGENT-08、EVAL-05、PROJ-14

**参考答案：** 工具失败以后，我会先判断它属于哪一类：参数错、鉴权失败、限流、临时网络问题、业务拒绝，还是彻底不可恢复。只有真正 **Retryable** 的错误才做带退避和 jitter 的重试。参数问题可以把结构化错误交给模型修一次，服务挂了就走备用工具或降级；有副作用的调用一定带幂等键。预算用完以后返回 **Best-so-far** 和未完成项，不会一直试下去。

## AGENT-08｜如何避免无限循环和过度调用工具？

**关键词：** **Max Steps**、**预算**、**状态指纹**、**Stale Retry**、**停止原因**  
**关联：** AGENT-02、AGENT-07、PROJ-14

**参考答案：** 我会从两方面防循环。第一是硬预算：限制**最大轮数、总时间、token、费用、Agent 调用、Tool 调用、Diff 次数、同一工具次数和并行 fan-out**。第二是看有没有新进展：对参数、结果 ID 集合和关键状态做指纹，如果连续几轮都没新信息，就判成 **Stale Retry** 并停止。Commit AI Resolver 会缓存参数相同的 Tool 调用；有实质新信息时允许再次委派 Retrieval 或 Critic，但受总预算、单工具上限和 Supervisor turns 限制。接近上限时应基于现有证据降级、澄清或返回 PARTIAL；如果整体运行失败，则由 Harness 按策略回退到旧 workflow。停止条件由 Runtime 强制，不能只靠 prompt 提醒。

## AGENT-09｜规划失败时有哪些回退策略？

**关键词：** **Replan**、**Decompose**、**Clarify**、**Workflow Fallback**、**Human-in-the-loop**  
**关联：** AGENT-10、AGENT-13

**参考答案：** 规划失败时，我不会直接让模型重新写一份更长的计划。先确认目标、约束和工具是不是完整；任务太大就拆成可验证的小步骤，观察和假设冲突时只做局部 **Replan**，信息不够就直接向用户 **Clarify**。如果任务高风险或者连续失败，我会切回固定 Workflow 或人工审批。回退方式应该由失败类型决定，而不是随机重来。

## AGENT-10｜什么时候该用 LangGraph/状态机，而不是普通函数编排？

**关键词：** **显式状态**、**动态分支**、**持久化**、**恢复**、**人审节点**、**复杂度**  
**关联：** MCP-08、PROJ-03

**参考答案：** 如果只是几步固定流程加一个短重试环，我更倾向普通函数，因为更直接、也更好调试。出现**动态分支、长任务持久化、暂停恢复、人审节点、多次回放或者跨进程状态**时，LangGraph 这类显式状态图才真正有价值。它解决的是状态和运行语义，不会让模型凭空变聪明。选框架前我会先画状态转移图，再看复杂度是不是值得。

## AGENT-11｜多 Agent 为什么可能不如单 Agent？什么时候值得用？

**关键词：** **协调成本**、**上下文丢失**、**角色重叠**、**并行**、**隔离**  
**关联：** AGENT-01、AGENT-12、MCP-05

**参考答案：** 多 Agent 并不天然更强，它会多出调用次数、状态同步、冲突合并和错误归因；角色没分清时，其实只是让几个模型重复想一遍。只有任务需要权限或上下文隔离、步骤会根据证据变化，或者 Specialist 产物可以独立验证时，我才会拆。Commit AI Resolver 把检索、原始 Diff 调查和反证审查拆开，是因为三者工具权限与输入不同；一次真实 RCA 因此用了 12 次工具调用和 92.4 秒，说明协调成本很实际。是否保留拆分，要继续和固定 workflow 比任务成功率、P95 与每成功任务成本。

## AGENT-12｜多 Agent 的状态如何传递？

**关键词：** **Shared State**、**Message**、**Artifact**、**Schema**、**Ownership**  
**关联：** AGENT-11、MCP-05、EVAL-04

**参考答案：** 我会把共享状态做成一个版本化 **Schema**，里面放目标、约束、输入引用、阶段产物、证据 ID、错误和状态版本。Commit AI Resolver 每个请求创建独立 Run Context，保存 Candidate Ledger、检索尝试、Diff cache、Hypothesis、Critique、预算和 bounded trajectory。Specialist 只返回结构化 candidate key 与结论，完整 Diff 留在 Harness state 中，避免反复复制。每个字段要明确谁能写、怎么合并和如何校验；Agent 之间传结论必须带证据和不确定性，不能只传一句自然语言总结。

## AGENT-13｜什么时候不该用 Agent？

**关键词：** **确定性**、**高风险**、**低容错**、**可测试**、**成本**  
**关联：** AGENT-01、AGENT-05、ENG-08

**参考答案：** 如果规则稳定、路径很短、输入结构化，而且出错代价高，我会优先用规则、SQL、普通服务或者 Workflow。批量高吞吐、强事务、严格实时的核心链路，也不适合交给自由决策模型。Agent 更适合的是**输入开放、步骤没法提前穷举、需要根据工具反馈调整，而且允许在受控范围内探索**的任务。
