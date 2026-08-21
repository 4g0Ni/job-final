# AI / Agent 面试问题与答案

> 适用：AI 应用工程、Agent 工程、RAG、Coding Agent、LLM 平台岗位。  
> 回答原则：先给结论，再给机制、工程取舍、指标，最后挂到真实项目。凡涉及 `adocag-server` 的 Eval/缓存改进，或 `commit-ai-resolver` 的自动化评测升级，均需按实际完成度表述。

## A. LLM 与上下文基础

### 1. 为什么主流生成式大模型多采用 Decoder-only？
Decoder-only 使用统一的因果语言建模目标预测下一个 token，训练数据易扩展，训练与生成路径一致，也天然适合 few-shot/in-context learning。Encoder–Decoder 更适合输入输出边界明确的条件生成任务，Encoder-only 更适合理解/表征任务。不能简单说 Decoder-only “理论上一定更强”；它的优势主要来自统一目标、规模化工程和生成场景适配。

### 2. Prefix LM 与 Causal LM 有什么区别？
Causal LM 中每个 token 只能关注此前 token；Prefix LM 允许前缀内部双向注意，但生成区仍保持因果遮罩。Prefix LM 能更充分编码给定输入，Causal LM 的训练/推理形式更统一。实际选型还受预训练方式和推理框架支持影响。

### 3. RoPE、上下文长度与“无限长输入”是什么关系？
RoPE 把相对位置信息编码到旋转角中，但模型只在有限长度分布上训练，超出后会出现位置外推和注意力质量下降；KV cache 与注意力计算也带来显存、延迟成本。因此理论上可接收更多 token 不等于有效理解无限长文本。工程上会结合位置插值/YaRN、滑动窗口或稀疏注意力、RAG、层次摘要和任务状态压缩。

### 4. DPO、PPO、GRPO 的核心差异？
- **PPO/RLHF：**通常需要策略、参考、奖励以及 value/critic 等组件，在线采样后按受约束策略优化，灵活但工程复杂。
- **DPO：**直接对偏好对优化分类式目标，绕过显式奖励模型与在线 RL，链路更简单；不要笼统表述为“在所有条件下与 RLHF 完全等价”。
- **GRPO：**对同一问题采样一组回答，以组内相对奖励估计优势，通常省去独立 value model，适合可验证奖励的推理训练。
来源：Hello-Agents 第 11 章；DPO 论文 arXiv:2305.18290。

### 5. 如何处理模型结构化输出不稳定？
优先使用模型原生 tool/function calling 或 JSON Schema constrained decoding；其次使用 Pydantic/Zod 等边界校验。失败时把校验错误作为 observation 反馈模型有限重试，并设置最大次数；不能用脆弱正则静默“修好”后继续。日志要保留原始输出、校验错误和重试结果。

### 6. Context Engineering 与 Prompt Engineering 有何区别？
Prompt Engineering 侧重单次指令如何写；Context Engineering 管理模型在当前步骤能看到的全部信息：系统规则、任务状态、工具定义、检索证据、历史摘要、预算与权限。Agent 失败往往不是提示词不够花哨，而是上下文放错、过期、冲突或超预算。

## B. Agent 架构、规划与工具

### 7. Chatbot、Workflow、Agent、Multi-Agent 如何区分？
关键看决策路径由谁决定：Chatbot 主要决定“说什么”；Workflow 的顺序和分支由人预先写死；Agent 接收目标后在运行时规划、选工具、观察并修正；Multi-Agent 是多个有明确边界的决策单元协作。多角色顺序调用不自动等于多 Agent，固定四阶段 pipeline 更准确地说是 agentic workflow。
来源：Hello-Agents 第 1、4、6 章；Anthropic《Building effective agents》。

### 8. ReAct 的核心机制是什么？
循环执行 Thought/Decision → Action → Observation，工具结果进入下一轮决策，直到完成或触发终止条件。工程实现中不必暴露完整私有思维链，可记录可审计的 decision summary、工具调用与 observation。ReAct 论文：arXiv:2210.03629。

### 9. Agent Harness 是什么？
它是围绕模型的运行时外壳，包括工具注册表、循环控制、状态/会话存储、上下文压缩、权限审批、超时重试、预算、日志与 trace。一次 LLM API 调用只解决推断；Harness 负责让多步执行安全、可恢复、可观测。

### 10. 一个新工具从定义到执行的完整链路？
1) 定义名称、用途、JSON Schema、权限和幂等性；2) 注册到允许当前 Agent 看到的工具集合；3) 模型输出工具名与参数；4) Host 做 schema/权限/路径校验；5) 执行器设置 timeout、重试与输出上限；6) 将结构化 observation 返回模型；7) 记录 trace、成本和副作用。高风险操作必须支持 dry-run 或人工批准。

### 11. Agent 如何判断是否调用工具？
模型根据目标、当前证据和工具描述决策，但工程上应加规则边界：实时事实必须检索、写操作必须审批、已有确定答案时不重复调用。评测时单独度量 tool selection accuracy 与 argument accuracy，不能只看最终答案。

### 12. 工具失败如何恢复？
先分类：瞬时错误可指数退避重试；参数错误让模型基于明确错误修正；权限错误不得绕过，应请求授权或降级；资源不存在可换检索路径；结果过大则分页、过滤或摘要。每类都要有重试上限、总预算和可解释终止。

### 13. 如何避免无限循环和过度调用工具？
设置 max_steps、每工具重试上限、总 token/时间/费用预算；检测重复 action+arguments、连续无新增证据、检索结果集合不变等停滞信号；保留 best-so-far，在预算耗尽时返回当前结果与未完成项。`commit-ai-resolver` 的最多 3 轮与“结果未变”提前终止就是可讲的实例。

### 14. 规划失败如何回退？
将计划视为可更新假设而不是不可变脚本。每步后验证前置条件和产物；失败时先局部重试，再重规划剩余步骤；重大副作用前设 checkpoint。Coding Agent 还需要保存 diff、运行测试、失败时回滚工作树或补丁。

### 15. 什么时候不该用 Agent？
路径稳定、规则明确、错误成本高且可用普通代码可靠解决时，优先 workflow/传统程序。Agent 适合路径难预定义、需要跨工具探索且能通过反馈验证的任务。自主性越高，成本、延迟、不可预测性和安全面越大。

## C. RAG 与检索

### 16. 讲清一个完整 RAG 链路。
离线：采集 → 解析/清洗 → 分块 → 元数据 → embedding → 索引。在线：query 理解/改写 → 召回 → 过滤 → 融合/rerank → 构造带引用上下文 → 生成 → 事实/引用校验。生产系统还需增量更新、删除传播、版本、权限过滤、缓存、评测和 badcase 回流。

### 17. 代码 RAG 为什么不能只做固定长度分块？
代码的语义边界是函数、类、文件和调用关系。固定窗口可能切断签名与实现或把无关符号混在一起。可用 tree-sitter AST 分块，并保留文件路径、符号、调用/依赖和父级摘要；过大的函数再用 token 窗口兜底。`adocag-server` 的 AST + 图社区就是实际例子。

### 18. BM25 与向量检索如何融合？
BM25/FTS 擅长精确标识符、错误码、文件路径和专有名词；向量检索擅长语义改写。分别取 Top-K 后可用 RRF：按各列表排名计算 `weight/(k+rank)` 再求和，避免直接比较不可同尺度的分数。`commit-ai-resolver` 已融合 SQLite FTS5 与 dense cosine，并把短列表的 `k`、secondary/title 权重配置化；当前默认值只是工程起点，仍需用 golden set 调参。

### 19. Rerank 为什么提高质量却可能拖慢 P95？如何优化？
Cross-encoder/LLM reranker 对每个 query-document 对做更贵的联合推理。优化方式：先粗召回缩小候选、限制文档长度、批处理/并发、缓存稳定查询、只对低置信查询 rerank，并用 Recall@K/NDCG 与 P95/成本共同决策。

### 20. HyDE 的原理与风险？
先生成假设答案，再用假设答案 embedding 检索真实文档，以缩小 query 与答案文档的语义差异。风险是模型假设错误会把检索带偏，因此应与原 query 多路召回并融合，而不是只依赖 HyDE。

### 21. Small-to-Big / Parent-Child Retrieval 是什么？
用小块 embedding 提高命中精度，但返回其父级段落/函数/文件给模型，兼顾精确召回和上下文完整性。代码库中可用符号级 chunk 命中后扩展到类或文件摘要。

### 22. 如何评估检索而不是只评估最终回答？
建立 query → relevant doc/chunk 的 golden set，计算 Recall@K、MRR、NDCG、过滤正确率；按具体函数题、架构题、时间敏感题分桶。最终回答再评 faithfulness、answer correctness、citation precision/recall、拒答正确率。这样才能区分“没检到”与“检到了但生成错了”。

### 23. RAG 如何处理实时更新、删除与权限？
使用增量索引和事件版本；文档更新时写新版本并原子切换，删除时传播 tombstone；检索必须在存储层带 tenant/ACL 过滤，不能先召回敏感内容再在应用层过滤。答案携带来源版本和时间戳，对“最新”问题做 freshness 检查。

## D. MCP、多 Agent 与记忆

### 24. MCP 解决什么问题？
Model Context Protocol 标准化 AI Host/Client 与工具、资源、提示模板之间的连接和能力发现，降低每个 Agent 对每个数据源单独适配的成本。协议标准化的是连接与调用，不自动保证工具安全、正确或高质量。
官方参考：https://modelcontextprotocol.io/

### 25. MCP 的基本交互是什么？
Client 与 Server 初始化并协商能力，随后可发现并调用 tools、读取 resources、获取 prompts；消息采用 JSON-RPC 语义，常见传输包括本地 stdio 与远程 Streamable HTTP。面试时应再讲 Host 负责权限、用户同意、会话和上下文注入。

### 26. MCP、Tool Calling、Skill、CLI 有什么区别？
Tool Calling 是模型输出结构化调用意图的机制；MCP 是连接/发现外部能力的协议；Skill 是教 Agent 如何完成一类任务的说明与配套脚本；CLI 是一种可被人或 Agent 调用的执行界面。四者处在不同层，可以组合使用。

### 27. MCP 与 A2A 有什么区别？
MCP 主要连接 Agent/Host 与工具、资源；A2A 主要描述 Agent 之间的能力发现、任务和消息协作。实际系统可用 MCP 给每个 Agent 接工具，再用 A2A 或自定义任务协议协调多个 Agent。不要把两者说成互斥框架。

### 28. 多 Agent 为什么可能不如单 Agent？
角色间传递会损失上下文并增加 token、延迟和冲突；如果任务边界不清，多角色只是重复思考。只有当任务可按专业能力或并行子问题清晰拆分、每个产物可验证时，多 Agent 才值得。先以单 Agent+工具建立基线，再比较成功率与成本。

### 29. 多 Agent 状态如何传递？
共享的是结构化任务状态与产物引用，而不是无限复制聊天历史：task id、输入约束、已完成步骤、证据链接、artifact URI、版本、owner、deadline、置信度。每个 Agent 只拿完成当前职责所需的最小上下文，协调器负责状态机、重试和终止。

### 30. 短期记忆、长期记忆和 RAG 的关系？
短期记忆保存当前任务状态和最近交互；长期记忆保存跨会话的稳定事实/偏好；RAG 是按需检索外部知识的机制。它们可使用相似向量技术，但生命周期、可信度和写入策略不同。长期记忆必须支持来源、时间、覆盖和删除，防止错误结论持续污染。

## E. 评测、可观测性与安全

### 31. Agent Eval 应包含哪些指标？
任务成功率/部分完成率、答案正确性与引用忠实度、tool selection/argument accuracy、步骤数、重复调用率、P50/P95 延迟、token/费用、安全违规率和人工升级率。要按任务类型与失败原因分桶，否则平均分掩盖问题。

### 32. LLM-as-Judge 有什么问题？如何提高可信度？
会受位置偏差、措辞、模型偏好和自评偏差影响。改进：明确 rubric 与参考答案；交换候选顺序；多次/多 judge 校验；用程序化客观指标兜底；抽样人工复核并测 judge 与人的一致性。不能用“再找一个 LLM”当唯一验证。

### 33. 如何建立可复现 Eval Harness？
冻结版本化数据集与期望证据，记录模型/prompt/index/代码版本；固定温度或多次采样报告均值与置信区间；每次改动输出逐 case diff 与失败分类；设质量、延迟、成本三类 gate。`commit-ai-resolver` 已有 18 个手工质量案例，可诚实表述为自动化回归的输入，而非已完成的自动 Eval。

### 34. Agent trace 应记录什么？
记录 run/task id、模型与 prompt 版本、每步 decision summary、工具名/参数摘要、observation 大小与状态、token、延迟、费用、重试、权限审批、最终结果和失败类型。敏感参数需脱敏；trace 要能重放关键路径但不能泄露密钥或私有思维链。

### 35. Prompt Injection 如何防？
将网页/文档内容视为不可信数据，不允许其覆盖系统/开发者规则；工具调用前做能力与参数校验；最小权限和域名/路径 allowlist；敏感读取与外发分离审批；对检索内容标记来源；高风险动作要求用户确认。单靠一句“忽略恶意指令”不够。

### 36. 如何设计 Agent 的成本与延迟预算？
按任务设置最大模型调用数、检索/工具次数、token、wall-clock 和费用；根据复杂度路由模型；并行独立步骤但限制 fan-out；缓存稳定中间结果；预算接近上限时降级为较小模型、减少候选或返回 best-so-far。线上同时观测质量—成本 Pareto，而非只压单一指标。

## F. 结合公司 AI Agent 项目的高频追问

### 37. 3 分钟讲 `commit-ai-resolver`。
这是一个回答“哪次 Commit 可能引入或修复某问题”的有界 Agentic RAG 系统。离线侧以 daily JSON 为可审计 source of truth，把语义文本写入 sqlite-vec 与 FTS5，把 repo/author/date/risk 保留为 metadata；在线侧由 Intent Extractor 抽取过滤条件，融合 dense、关键词、secondary query 和工单标题等排名，再用加权 RRF 合并。对窄日期/作者条件先 SQL 过滤再精确算 cosine，避免全局 Top-K 挤掉过滤范围内的结果；历史离线数据的相对日期锚定到最新索引日。Synthesizer 只依据证据回答，Evaluator 最多重试三轮并检测停滞，六个 MCP 工具复用同一检索能力。模型、维度、query instruction 和索引版本均可配置，支持公开 JSONL + 本地 OpenAI-compatible embedding 的断网 demo。已保留 18 个手工 badcase，但自动化 Eval Harness 和更大规模 ANN benchmark 仍是后续工作。

### 38. `adocag-server` 是 Agent 还是 Pipeline？
当前更准确地说是分层图 RAG pipeline：AST 分块、实体关系、Leiden 社区、分层检索和 Wiki 生成。deep_research 虽可最多迭代五轮，但终止与扩展仍有固定流程，不是完全自主 ReAct。诚实说明边界反而能展示架构判断；下一步是在先有 eval 的前提下引入 `need_more_search` 决策。

### 39. 为什么 `commit-ai-resolver` 不直接用 LangGraph/CrewAI？
当前只有四个固定角色和一个有界重试环，原生函数编排更轻、更易调试、依赖更少。只有当动态路由、长任务持久化、复杂分支或人工恢复需求明显增加时，引入显式状态图才有收益。框架选型要由复杂度驱动。

### 40. 如果重做两个 AI 项目，优先改什么？
第一优先是评测：检索 golden set、最终回答 rubric、badcase 回归；第二是可观测性：模型/prompt/index 版本、token/latency/cost trace；第三是安全和数据边界；最后再做更复杂的自主规划。没有评测时增加 Agent 自主性，只会放大不确定性。

### 41. 为什么采用 BM25 + 向量检索 + RRF + RAG，而不让模型直接读取并搜索整个时间窗口？
直接读取整个窗口本质上是 context stuffing：数据增长后，输入 token、延迟和费用随窗口扩大，而且更长的上下文不等于更可靠的定位，关键信息可能被噪声和位置偏差淹没。混合 RAG 先压缩证据空间：BM25 命中 Commit SHA、错误码、文件路径等精确词，向量检索处理语义改写，RRF 按名次融合不同量纲的结果，再让模型只对少量候选做因果归纳和引用。检索与生成拆开后，还能分别评 Recall@K/MRR 和答案正确率，并在召回前执行 repo、时间与权限过滤。若过滤后只剩很少文本，我会直接交给模型；全窗口读取也可作为小数据 baseline 或低置信度 fallback，而不是默认主链路。

### 42. 新增 Commit 后需要每天重新生成向量数据库吗？如何平衡成本？
不需要。原始 Commit 是 source of truth，向量库只是可重建的派生索引；日常链路按 Commit 事件增量处理，以 `repo + commit SHA` 幂等 upsert，只为新增或语义内容真正变化的记录生成 embedding，BM25 与向量索引同步更新，RRF 在查询时计算，不需要重建。用 `normalized semantic text + model + dimensions + template version` 生成内容哈希并缓存向量；作者、日期、风险、ACL 等仅作 metadata 的字段变化时只更新字段，不重新 embedding。只有更换模型/维度、修改文本模板或索引 schema 时才全量回填，此时建立 v2 索引、历史低优先级批处理、新数据双写，离线评测通过后再切换并保留短期回滚。成本同时通过去重、微批、冷热/分层索引和基于 Recall@K—P95—费用的模型与维度选型控制。Demo 中的 rebuild 命令用于升级、恢复和实验，不代表生产环境每天全量执行。

## 参考

- ReAct: arXiv:2210.03629
- DPO: arXiv:2305.18290
- Reflexion: arXiv:2303.11366
- AutoGen: arXiv:2308.08155
- AgentBench: arXiv:2308.03688
- Anthropic, Building effective agents: https://www.anthropic.com/research/building-effective-agents
- MCP 官方文档: https://modelcontextprotocol.io/
- Hello-Agents：第 4、8、9、10、11、12 章
