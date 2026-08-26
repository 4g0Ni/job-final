# AI / Agent 面试问题与答案

> 适用：AI 应用工程、Agent 工程、RAG、Coding Agent、LLM 平台岗位。  
> 回答原则：先给结论，再给机制、工程取舍、指标，最后挂到真实项目。对外将 `commit-ai-resolver` 定位为“面向多仓库历史变更与回归调查的 evidence-first 多阶段检索 Agent”，不要只概括成“RAG 项目”。公开语料与自动 Eval Harness 已落地；指标必须明确为工程回归基线，不能外推为外部盲测或生产效果。

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
BM25/FTS 擅长精确标识符、错误码、文件路径和专有名词；向量检索擅长语义改写。分别取 Top-K 后可用 RRF：按各列表排名计算 `weight/(k+rank)` 再求和，避免直接比较不可同尺度的分数。`commit-ai-resolver` 已融合 SQLite FTS5 与 dense cosine，并把短列表的 `k`、secondary/title 权重配置化；当前参数由 dev 集检查，修改后只在 frozen test 做回归，后续新增人工 holdout 才能继续证明泛化。

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
冻结语料、case 与期望证据，并在报告中记录 corpus/case hash、embedding 模型与维度、索引及代码版本；把 index integrity、intent、retrieval、Evidence Gate、answer 和 full-agent 分层评测，避免只看最终平均分。`commit-ai-resolver` 当前基于 10,000 条公开 React Commit 建立 75 个 case，按 52 dev / 23 frozen test 切分，覆盖精确 SHA、语义标题、author/date、risk/date、repo/date、自然 OOD、虚构标识符和歧义请求；输出 Recall@K、MRR、nDCG、拒答/澄清准确率与逐 case diff，并提供 PR smoke 和 baseline candidate gate。完整 Agent runner 支持并发、重复采样、断点续跑和 trace，答案层可程序化检查引用有效性、证据覆盖、幻觉引用以及 Brier/ECE。当前未配置在线 chat API，因此只能说 runner 与评分基础设施已完成、mock 集成已验证，不能声称已完成真实 LLM 全量答案评测。

### 34. Agent trace 应记录什么？
记录 run/task id、case/split、corpus/index/prompt/model 版本、每步 decision summary、检索通道及候选 ID、Evidence Gate 决策与特征、工具名/参数摘要、observation 状态、token、延迟、费用、重试、结果集新颖度、最终引用和失败类型。敏感参数需脱敏；trace 要能重放关键路径但不能泄露密钥或私有思维链。评测 telemetry 应与被评答案隔离，防止把 golden label 泄露给 Agent。

### 35. Prompt Injection 如何防？
将网页/文档内容视为不可信数据，不允许其覆盖系统/开发者规则；工具调用前做能力与参数校验；最小权限和域名/路径 allowlist；敏感读取与外发分离审批；对检索内容标记来源；高风险动作要求用户确认。单靠一句“忽略恶意指令”不够。

### 36. 如何设计 Agent 的成本与延迟预算？
按任务设置最大模型调用数、检索/工具次数、token、wall-clock 和费用；根据复杂度路由模型；并行独立步骤但限制 fan-out；缓存稳定中间结果；预算接近上限时降级为较小模型、减少候选或返回 best-so-far。线上同时观测质量—成本 Pareto，而非只压单一指标。

## F. 结合公司 AI Agent 项目的高频追问

### 37. 3 分钟讲 `commit-ai-resolver`。
**60 秒定位版：**这是一个面向多仓库历史变更与线上回归调查的 evidence-first 多阶段检索 Agent。它不是让模型在整个历史窗口里盲找，也不是只用 embedding 返回 Top-K，而是把 Direct SHA、metadata、FTS5、dense 与多查询检索作为候选生成通道，用 weighted RRF 融合；生成前由 Evidence Gate 决定回答、拒答或澄清，生成后再检查引用与 Commit 真实性。系统通过 MCP 向 IDE Agent 暴露能力，并用版本化 Eval Harness 分别评估索引、召回、融合、拒答、grounding 和 Agent 重试。

**3 分钟展开版：**这个项目解决的是“哪次历史 Commit 可能引入或修复某个问题”。它与 Codex 在当前 checkout 上执行 `rg + git` 的一次性代码调查不同：目标数据跨仓库、跨日期、会被多人重复查询，所以先建立可复用的历史变更索引更经济、更稳定。离线侧以 daily JSON 为可审计 source of truth，对 10,000 条公开 React Commit 建库；语义文本进入 SQLite FTS5 与 sqlite-vec，repo、author、date、risk 等保留为 metadata，并用模型、维度、query instruction、文档模板和索引版本契约保证派生索引可重建。

在线侧由 Intent Extractor 保留用户的 repo、日期、作者、风险与 SHA 约束。精确 SHA 走 direct lookup；错误码、路径和专有名词走 FTS5；自然语言症状走 dense；secondary query 与工单标题独立召回，再由 weighted RRF 融合不同量纲的排名。窄 metadata 条件先过滤后精确 cosine，避免全局 Top-K 后过滤造成漏召回。Retriever 后加入确定性 Evidence Gate，因为向量库面对无关问题也会返回最近邻；Gate 综合 exact hit、显式过滤、dense score 和多通道一致性，输出 SEARCH、ABSTAIN 或 ASK_USER。只有通过门禁的候选才能进入 Synthesizer；Evaluator 最多重试三轮，可调整关键词和日期窗口，并比较结果 ID 集合检测 stale retry、保留 best-so-far。六个 MCP 工具让 IDE Agent 能复用语义检索、精确 Commit、日期/工单摘要与 Diff 能力。

评测侧建立 75-case、52 dev / 23 frozen test 的版本化 Harness，按 Index、Intent、Retrieval、RRF、Evidence Gate、Answer Grounding 和 Agent Loop 分层诊断。当前 23-case frozen regression test 的 Hybrid Recall@10 与 Evidence Gate 行为准确率为 100%，但我会明确它只证明已知行为没有回归，不代表真实 RCA 准确率已经达到 100%。下一步不是推翻 RAG，而是增加第二阶段原始证据调查：让 Agent 对 Top-N 候选调用 `git show/diff`、`rg` 和 symbol search，形成“索引粗召回 + Agentic 精查”的组合。

### 38. `adocag-server` 是 Agent 还是 Pipeline？
当前更准确地说是分层图 RAG pipeline：AST 分块、实体关系、Leiden 社区、分层检索和 Wiki 生成。deep_research 虽可最多迭代五轮，但终止与扩展仍有固定流程，不是完全自主 ReAct。诚实说明边界反而能展示架构判断；下一步是在先有 eval 的前提下引入 `need_more_search` 决策。

### 39. 为什么 `commit-ai-resolver` 不直接用 LangGraph/CrewAI？
当前只有四个固定角色和一个有界重试环，原生函数编排更轻、更易调试、依赖更少。只有当动态路由、长任务持久化、复杂分支或人工恢复需求明显增加时，引入显式状态图才有收益。框架选型要由复杂度驱动。

### 40. 如果重做两个 AI 项目，优先改什么？
`commit-ai-resolver` 的检索与 Evidence Gate 回归基线已经建立，所以第一优先会从“搭 Eval”转为补真实人工 RCA holdout，并接入可用 chat API 跑完整 Agent 多次采样，验证引用忠实度、校准度、重试收益、P95 与成本；第二是把 badcase、trace 和线上反馈形成持续数据闭环；第三是压力测试 ANN、并发、增量索引与权限边界。`adocag-server` 仍应先补检索 golden set 和回答 rubric，再增加动态规划。共同原则是先验证瓶颈，再增加自主性或替换框架。

### 41. Codex / Claude Code 已经能用 `rg + git` 做 agentic search，为什么还需要 BM25 + 向量检索 + RRF？
结论是两者适用层级不同，不应互相替代。`rg + git log/show/diff` 适合 Agent 在已有完整 checkout 的当前仓库里交互式调查：它能根据线索打开原始源码、追调用链和验证假设，精度高，但每次都要重新探索。Commit AI Resolver 面向多仓库、长时间跨度、多人重复查询的历史变更：预计算索引可以统一检索无须同时 checkout 的仓库，以较低延迟执行日期、作者、风险和 repo 过滤，并提供稳定排序、拒答与离线回归。

具体分工是：Direct/FTS/dense/RRF 作为十万级候选空间的低成本粗召回；`rg + git` 作为 Top-N 候选的原始 diff 与源码精查。前者解决规模、复用和可评估性，后者解决 summary 丢失、symbol/call-chain 和因果验证。若数据很小、只查当前仓库或结果必须查看最新工作树，我会直接使用 agentic search；若是跨仓库历史检索与持续服务，我会保留索引层。最完整的架构是“RAG 候选生成 + Agentic 原始证据验证”，而不是声称 RAG 比 Coding Agent 更先进。

### 42. 新增 Commit 后需要每天重新生成向量数据库吗？如何平衡成本？
不需要。原始 Commit 是 source of truth，向量库只是可重建的派生索引；日常链路按 Commit 事件增量处理，以 `repo + commit SHA` 幂等 upsert，只为新增或语义内容真正变化的记录生成 embedding，BM25 与向量索引同步更新，RRF 在查询时计算，不需要重建。用 `normalized semantic text + model + dimensions + template version` 生成内容哈希并缓存向量；作者、日期、风险、ACL 等仅作 metadata 的字段变化时只更新字段，不重新 embedding。只有更换模型/维度、修改文本模板或索引 schema 时才全量回填，此时建立 v2 索引、历史低优先级批处理、新数据双写，离线评测通过后再切换并保留短期回滚。成本同时通过去重、微批、冷热/分层索引和基于 Recall@K—P95—费用的模型与维度选型控制。Demo 中的 rebuild 命令用于升级、恢复和实验，不代表生产环境每天全量执行。

### 43. 向量检索总能返回 Top-K，为什么还需要 Evidence Gate？
Top-K 只表示“数据库里相对最像”，不表示“证据足够回答”。对不存在的 SHA、库外问题或过于模糊的请求，向量库仍会给出候选；若直接生成，系统就会把弱相关结果包装成确定答案。Evidence Gate 在生成前综合精确 SHA 命中、显式 metadata 过滤、dense top score、多通道一致性和 query 是否含有效约束，决定 SEARCH、ABSTAIN 或 ASK_USER。它把“是否有权回答”从生成模型的自由发挥变成可测试的系统决策。

### 44. Evidence Gate 的阈值如何标定，并避免在测试集上过拟合？
先按业务失败成本构造正例、自然 OOD、虚构标识符和歧义请求，在 dev 集观察正负样本的 score 分布与多通道一致性，优先选择可解释规则和满足目标误答率的阈值；只在 dev 上调参，frozen test 只做回归确认。阈值、特征、case hash 与 corpus hash 都进入报告，任何看过 test 后的修改都必须产生新版本，不能继续把原 test 称为盲测。上线后还要用真实流量校准 precision/recall、拒答成本、Brier 与 ECE。

### 45. frozen test 指标达到 100%，为什么不能说系统已经解决了 RAG 可靠性？
因为它只有 23 个 test case，来自固定公开语料和当前任务分布，其中部分正例由 Commit 标题派生；而且最初阈值开发与集合建设并非严格双盲。100% 能说明代码改动没有破坏已知行为，也能验证 exact lookup、过滤和门禁链路，但不能覆盖真实用户措辞、跨仓库分布漂移、复杂 RCA、LLM 随机性或线上延迟成本。因此简历称其为 frozen regression test，面试中主动补充样本构成和限制。

### 46. 无法继续使用公司内部 case 时，如何重新生成可信的验证集？
先选择许可清晰、可复现的公开仓库并冻结 corpus hash；再按能力矩阵分层生成 case，而不是只做标题改写：精确 SHA、语义查询、author/date、risk/date、repo/date、自然 OOD、虚构 ID 和需澄清请求都要覆盖。标签尽量由可验证事实产生，例如 Commit ID、结构化字段和明确相关文档；自然语言 OOD 与歧义样本由人工撰写并复核。程序生成适合扩大覆盖，但要去重、查泄漏、保留生成 provenance，并另建真正未见的人工 RCA holdout，避免“用同一套规则出题又判卷”。

### 47. 如何评测完整 Agent，而不只评 Retriever？
采用分层诊断和端到端回放两条线。分层测 intent 字段、Recall@K/MRR/nDCG、Evidence Gate 决策、引用有效性与证据覆盖；端到端 runner 对每个 case 多次执行，保存版本化 trace，统计答案正确性、幻觉引用、Brier/ECE、重试次数、停滞终止、P50/P95、token 与成本，并支持并发、resume 和逐 case diff。客观字段先程序化评分，开放式结论再用 rubric/人工或经过校准的 judge。评测标签与 telemetry 不进入 Agent 上下文，防止数据泄漏。

### 48. Eval Harness 实际发现了哪些问题？如何证明它不是“为了展示而写的测试”？
它已经捕获两类会改变真实行为的问题：一是数据库只保存短 SHA 时，full SHA lookup 不能正确命中，随后补成完整值精确匹配与 7/8 位前缀兼容；二是 orchestrator 注入的默认 30 天窗口被误当成用户显式过滤条件，导致 Evidence Gate 对无关查询错误放行，随后改为只传递 intent 中显式提取的约束。它还把“重试是否有新证据”定义为比较结果 ID 集合，而不是只比较数量，并验证最大迭代参数不再被硬编码。能先暴露失败、再以固定 case 防复发，才是回归 Harness 的价值；用例数量或漂亮均分本身不是证明。

## G. Commit AI Resolver 亮点拆解：是什么、为什么、怎么做

### 49. 亮点一：evidence-first 历史变更调查系统是什么？为什么这样定位？怎么实现？

- **是什么：**系统目标不是泛化的“和代码聊天”，而是从跨仓库、跨日期的历史变更中找出可能相关的 Commit，并给出可追溯证据、置信边界和下一步调查方向。
- **为什么：**事故定位最危险的不是答案不够流畅，而是把弱相关 Commit 说成根因；同时历史变更会被多人反复查询，不能每次都从零遍历所有仓库。
- **怎么做：**把链路拆成 Intent、Hybrid Retrieval、Evidence Gate、Synthesis、Evaluation；先限制候选和验证证据，再允许模型归纳。对无证据和信息不足分别 ABSTAIN、ASK_USER，而不是强行回答。

### 50. 亮点二：可审计 source of truth 与可重建索引是什么？为什么需要？怎么实现？

- **是什么：**daily JSON 保存原始、可审计的 Commit 记录；SQLite metadata、FTS5 和 sqlite-vec 都是可丢弃、可重建的派生索引。
- **为什么：**embedding 模型、维度或文本模板变化会导致向量空间不兼容；若把向量库当唯一真相，就很难复现指标、排查 stale row 或安全升级。
- **怎么做：**manifest 冻结 corpus hash、Commit 数量、模型、维度、query instruction、模板与索引版本；启动和 Eval 检查 metadata/FTS/vector 行数、重复、missing、stale 与向量字节长度，不一致就拒绝比较并要求重建。

### 51. 亮点三：Direct SHA、metadata、FTS5、dense 多路召回是什么？为什么不能只用向量检索？怎么实现？

- **是什么：**不同信号走不同检索通道：SHA 精确查找，repo/date/author/risk 做结构化过滤，FTS5 找错误码、路径与专有名词，dense 找自然语言症状和语义改写，secondary query/工单标题补充查询视角。
- **为什么：**向量检索不擅长精确标识符，而且全局 KNN 后过滤会漏掉满足条件但未进全局 Top-K 的记录；单一 lexical 又难处理用户描述与 Commit 摘要之间的语义差距。
- **怎么做：**Intent Extractor 只抽取用户显式约束；窄候选先 SQL pre-filter，再对候选做 exact cosine；full SHA 与 7/8 位前缀走 direct lookup；各通道分别返回排名供后续融合和消融评测。

### 52. 亮点四：weighted RRF 是什么？为什么选它？怎么实现和诊断？

- **是什么：**Reciprocal Rank Fusion 按 `weight / (k + rank)` 累加多个排名列表的贡献，以名次而不是原始分数融合结果。
- **为什么：**FTS BM25、cosine 和不同 query 的分数不在同一量纲，直接线性相加需要脆弱的分数校准；RRF 简单、稳健、可解释，也能奖励被多个通道共同支持的候选。
- **怎么做：**以 `repo + commit ID` 去重，对 primary dense、FTS5、secondary dense 与 bug title 通道配置权重，记录每个候选的 `_rrfScore` 和 `_retrievalChannels`；用单通道与 Hybrid 的 Recall/MRR/nDCG、逐 case contribution 分析参数，而不是只看最终回答。

### 53. 亮点五：Evidence Gate 是什么？为什么放在生成前？怎么标定与执行？

- **是什么：**Retriever 与 Synthesizer 之间的确定性证据充分性门禁，输出 SEARCH、ABSTAIN 或 ASK_USER。
- **为什么：**向量数据库对任何 query 都会返回最近邻，但“相对最近”不等于“足够相关”；如果先生成再让 LLM 自评，弱证据已经可能被包装成确定叙事。
- **怎么做：**优先处理 exact SHA、虚构标识符、模糊请求与零结果，再综合用户显式 metadata 约束、top dense score 和 lexical/dense overlap。阈值只在 dev 集按误答/拒答成本标定，frozen test 做回归，上线后再用真实流量校准。

### 54. 亮点六：有界 Agent 编排是什么？为什么不做无限自主搜索？怎么处理重试停滞？

- **是什么：**固定职责的 agentic workflow 加有限反馈循环，而不是无限 ReAct；Evaluator 可以建议扩展日期或关键词，但总迭代最多三轮。
- **为什么：**事故调查需要一定适应性，但无限自主搜索会放大延迟、费用、不可复现性和循环风险。当前状态图并不复杂，原生函数编排比引入重型框架更透明。
- **怎么做：**每轮保存 intent、候选、门禁、答案和 evaluation trace；跟踪 best-so-far；用 `repo:id` 集合比较相邻轮结果，若候选集合不变则判为 stale retry 并以 PARTIAL 结束；同时受 max iterations、token 与时间预算约束。

### 55. 亮点七：答案 grounding 与引用校验是什么？为什么只评语言质量不够？怎么做？

- **是什么：**保证回答里的 Commit、SHA 和引用来自当前 corpus 与实际检索证据，并衡量 gold evidence coverage 和幻觉引用率。
- **为什么：**回答可以语言流畅却引用不存在的 SHA，或者检索到了正确 Commit 但生成阶段遗漏；只用 LLM-as-Judge 会混淆检索失败、生成失败和自评偏差。
- **怎么做：**程序化抽取答案中的 SHA/引用，核对 frozen corpus、当前 retrieval set 和 required evidence；统计 citation validity、hallucinated citation rate、coverage 与 negative case 错误引用，开放式因果解释再交给 rubric/人工或校准后的 judge。

### 56. 亮点八：分层 Eval Harness 是什么？为什么要分层？怎么防止漂亮指标误导？

- **是什么：**把系统拆成 L0 Index、L1 Intent、L2 Retrieval、L3 Fusion、L4 Answer/Grounding、L5 Agent Loop/Calibration 六层独立评分，并保留端到端 batch runner。
- **为什么：**只看最终答案无法知道是索引缺行、过滤漏召回、RRF 排错、引用幻觉还是无效重试；平均分也会掩盖 negative、SHA 和跨条件等失败桶。
- **怎么做：**冻结 corpus/case hash，52 dev 用于调参、23 frozen test 只做回归；输出逐 case 排名、通道贡献、Recall@K、MRR、nDCG、拒答/澄清准确率、Brier/ECE、重试新颖度和 CI gate。主动说明单仓库、小 test、标题派生 case 与尚缺真实 RCA holdout，绝不把 100% 回归指标外推成生产准确率。

### 57. 亮点九：MCP 工具化是什么？为什么不是只做一个聊天 UI？怎么复用同一检索能力？

- **是什么：**通过 Streamable HTTP 暴露语义检索、精确 Commit、日期/工单摘要、Diff 与条件查询等六个工具，让 IDE Agent 能发现并调用能力。
- **为什么：**聊天 UI 只能服务单一入口；工具协议可以把检索系统变成 Coding Agent 的长期历史记忆层，同时保持 host 侧的权限、参数校验和调用 trace。
- **怎么做：**API、UI 和 MCP 共用同一 vector store、rank fusion 与查询逻辑，避免各入口复制算法；每个工具定义明确 schema、边界和结构化结果，Host 决定何时调用，Server 不把协议标准化误当成安全保证。

### 58. 亮点十：如何把 RAG/RRF 与 `rg + git` agentic search 组合成下一代架构？

- **是什么：**两阶段调查：索引层从大规模历史 Commit 中粗召回，Agent 再对 Top-N 候选读取原始 diff、当前代码和调用关系做精查。
- **为什么：**RAG 的优势是跨仓库历史复用、低延迟、结构化过滤和可回归；`rg + git` 的优势是查看未经摘要压缩的证据、symbol/call-chain 与当前工作树。单独使用任一侧都存在盲区。
- **怎么做：**第一阶段用 Direct/metadata/FTS/dense/RRF 生成候选并通过 Evidence Gate；第二阶段给 Agent 受限的 `git show/log/diff`、`rg` 和 symbol search 工具，只围绕候选 Commit 扩展调查；每次工具 observation 写入 trace，若获得新证据可重排，否则停止。最终答案只引用经过原始 diff 验证的证据，并分别评粗召回 Recall、精查成功率、P95、token 与成本。

## 参考

- ReAct: arXiv:2210.03629
- DPO: arXiv:2305.18290
- Reflexion: arXiv:2303.11366
- AutoGen: arXiv:2308.08155
- AgentBench: arXiv:2308.03688
- Anthropic, Building effective agents: https://www.anthropic.com/research/building-effective-agents
- MCP 官方文档: https://modelcontextprotocol.io/
- Hello-Agents：第 4、8、9、10、11、12 章
