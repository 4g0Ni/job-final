# 05｜Eval、可观测、安全与 LLMOps（14 题）

记忆链：**先定义成功 → 分层采集证据 → 诊断坏例 → 校准门禁 → 灰度与回滚**。

## EVAL-01｜Agent Eval 应包含哪些指标？

**关键词：** **Task Success**、**Tool Accuracy**、**Grounding**、**Latency**、**Cost**、**Safety**  
**关联：** RAG-10、EVAL-03、PROJ-13

**参考答案：** 我不会只看“最终答案像不像对”，而是分层评。前面看**意图和路由、Retriever、工具选择和参数、门禁**，后面看答案、引用和循环行为，最后再看端到端任务有没有完成。上线以后还要加上 **P50/P95、token、费用、重试、拒答、幻觉引用和安全违规**。每个指标都要按场景和失败类型拆开，因为一个平均分很容易把严重问题藏起来。

## EVAL-02｜LLM-as-Judge 有什么问题？如何提高可信度？

**关键词：** **Bias**、**Position**、**Verbosity**、**Self-preference**、**Rubric**、**Calibration**  
**关联：** LLM-07、EVAL-03、PROJ-13

**参考答案：** **LLM-as-Judge** 最大的问题是它并不客观，答案顺序、长度、措辞，甚至是不是同一家模型，都会影响判断。我的做法是先把 **Rubric 和锚点样例**写清楚，随机答案顺序，隐藏无关信息，能程序化评分的字段就不用 LLM，再抽样做人工复核，并报告和人工的一致性。它适合批量辅助，但引用真实性、权限和数值正确性还是要靠确定性检查。

## EVAL-03｜如何建立可复现的 Eval Harness？

**关键词：** **Frozen Cases**、**Version**、**Seed**、**Trace**、**Resume**、**Per-case Diff**  
**关联：** EVAL-01、EVAL-02、PROJ-13

**参考答案：** 要做到可复现，我会先冻结 **Case ID、输入、Gold/Rubric 和数据划分**，然后把 corpus、索引、prompt、模型、代码版本，以及温度和 seed 都记下来。Runner 要支持并发、超时、重试、断点续跑，还要保留每个 case 的产物和 diff。**Dev 集用来调参，Frozen Test 只做回归**；如果看过 test 以后又改了规则，那就应该升级版本，不能继续把它当没见过的测试集。

## EVAL-04｜Agent trace 应记录什么？

**关键词：** **Run / Task ID**、**Decision Summary**、**Tool**、**Observation**、**Token**、**Version**  
**关联：** AGENT-03、AGENT-12、EVAL-05

**参考答案：** 我希望一条 Trace 能回答“这次任务到底怎么走到这个结果的”。所以会记录 **Run/Task/Case ID、各层版本、结构化决策摘要、候选和通道、门禁、工具参数摘要、Observation、重试、token、延迟、费用、结果新颖度、最终引用和失败类型**。敏感字段要脱敏。Trace 要能重放关键路径，但不会保存密钥、私有思维链，也不会把 Gold Label 泄漏进 Agent 上下文。

## EVAL-05｜如何建立可行动的 Bad Case 分类？

**关键词：** **Taxonomy**、**Index**、**Retrieval**、**Routing**、**Tool**、**Generation**、**Policy**  
**关联：** AGENT-07、EVAL-04、PROJ-13

**参考答案：** Bad Case 不能只写一句“模型效果不好”。我会先定位它坏在哪一层：**数据或索引、意图和过滤、召回、融合/Rerank、门禁、工具、生成和引用、循环、系统依赖，还是策略拒绝**。然后补上可复现输入、期望结果、根因和修复负责人。修完以后把代表性 case 加回回归集，这样 Bad Case 才能真正推动工程改进。

## EVAL-06｜离线 Eval 与线上监控如何衔接？

**关键词：** **Offline**、**Shadow**、**Canary**、**Feedback**、**Drift**、**Counterfactual**  
**关联：** EVAL-03、EVAL-13

**参考答案：** 我会把离线和线上做成一条闭环。**离线 Eval** 先检查已知能力和回归；**Shadow Traffic** 用真实分布验证，但不影响用户；再用小流量 **Canary** 比较成功率、拒答、延迟和成本。上线以后收集用户反馈、任务结果和失败类型，脱敏审核以后回灌到 Eval。所有线上数据都要按版本切片，否则模型、Prompt、索引一起变了，最后根本没法归因。

## EVAL-07｜门禁或拒答阈值如何标定？

**关键词：** **Precision-Recall**、**业务成本**、**Calibration**、**Brier**、**ECE**、**Dev / Test**  
**关联：** RAG-10、PROJ-10

**参考答案：** 我会先在 Dev 集准备几类样本：有充分证据、自然 OOD、虚构 ID、歧义请求和权限拒绝。然后看特征分布和 **Precision-Recall 曲线**，根据业务里“误答有多贵、拒答有多贵”来选阈值。Frozen Test 只验证泛化，不再调参。如果系统还输出置信度，我会看 Reliability Diagram、**Brier 和 ECE**。上线后可以用真实流量重新校准，但阈值一定要版本化。

## EVAL-08｜如何设计 Agent 的成本与延迟预算？

**关键词：** **Max Calls**、**Token**、**Wall-clock**、**Fan-out**、**Best-so-far**、**Pareto**  
**关联：** LLM-09、RAG-06、AGENT-08

**参考答案：** 成本和延迟不能等跑完以后再统计，我会在任务开始前就设好**模型调用次数、检索和工具次数、token、并行 fan-out、总时间和费用上限**。接近上限时，可以切小模型、减少候选、跳过非关键步骤，或者直接返回 **Best-so-far**。缓存只用在稳定、权限安全的结果上。最后看的是质量、P95 和成本的 **Pareto 平衡**，还要监控哪个租户或任务突然烧得特别多。

## EVAL-09｜语义缓存怎样做才不会返回错误或越权结果？

**关键词：** **Exact / Semantic Cache**、**Version**、**Tenant**、**TTL**、**Similarity**、**Invalidation**  
**关联：** RAG-11、EVAL-08、EVAL-11

**参考答案：** 语义缓存最怕“看起来相似，其实不是同一个问题”。所以缓存键至少要带**规范化输入、模型/Prompt/知识库版本、租户和权限上下文**。高风险、强时效、个性化或者有副作用的任务，我默认不做语义缓存。命中以后还要检查约束和引用有没有过期，并配好 TTL 和变更失效。指标上除了 Hit Rate，我更关心**错误命中率**。

## EVAL-10｜Prompt Injection 如何防？

**关键词：** **Untrusted Content**、**Instruction Hierarchy**、**Least Privilege**、**Egress**、**Approval**  
**关联：** MCP-04、EVAL-11、ENG-03

**参考答案：** 我会默认网页、文档和工具输出都是 **Untrusted Content**，它们只能作为数据，不能覆盖系统规则。工具层再做**最小权限、Allowlist、参数校验和读写隔离**，涉及敏感外发或者不可逆动作时要求用户确认。模型侧检测可以加，但只是辅助。真正可靠的防线是执行边界和数据流控制，不是 Prompt 里写一句“忽略恶意指令”。

## EVAL-11｜如何防止数据泄露、越权与敏感信息进入模型？

**关键词：** **Data Classification**、**ACL**、**Redaction**、**DLP**、**Data Residency**、**Audit**  
**关联：** RAG-11、MCP-04、EVAL-10

**参考答案：** 数据进模型以前，我会先按级别和用途授权，再做字段裁剪、脱敏、**DLP 和租户 ACL**。凭据和内部标识不进 Prompt，工具结果只返回最小必要内容，模型端点也要满足数据驻留和保留要求。还有一点经常被漏掉：**日志、缓存、评测集和人工标注**也属于数据链路，同样要做权限、删除和审计。

## EVAL-12｜模型网关应提供哪些能力？

**关键词：** **Routing**、**Quota**、**Retry**、**Fallback**、**Policy**、**Usage**、**Version**  
**关联：** LLM-09、EVAL-08、EVAL-13

**参考答案：** 我理解模型网关的价值，是把不同供应商共性的东西统一起来，比如**请求响应、鉴权、配额、限流、超时、重试、降级、内容策略、token/成本统计和 Trace**。它还要按任务、租户和数据级别做路由，并固定可复现的模型版本。但我不会把差异全抹平，Structured Output、工具能力和错误语义这些供应商差异，还是要明确暴露给上层。

## EVAL-13｜Prompt、模型、索引如何做版本、灰度和回滚？

**关键词：** **Manifest**、**Experiment**、**Canary**、**Dual-write**、**Rollback**、**Compatibility**  
**关联：** EVAL-06、EVAL-12、PROJ-07

**参考答案：** 我会用一个 **Manifest** 把代码、Prompt、模型、Embedding、索引 Schema、Corpus 和 Eval 集绑在一起。离线通过以后先跑 Shadow，再做小流量 Canary，按版本比较质量、P95、成本和安全。索引升级时建 v2，新数据 **Dual-write**，验证通过再切读，并保留回滚窗口。最忌讳的是没有兼容检查，就把新 Embedding 直接写进旧向量空间。

## EVAL-14｜如何避免评测数据泄漏和“为了指标调题”？

**关键词：** **Split Discipline**、**Label Isolation**、**Case Hash**、**Holdout**、**Audit**  
**关联：** EVAL-03、PROJ-11、PROJ-12

**参考答案：** 为了避免“为了指标调题”，我会先冻结 Dev/Test 的来源和规则，**Gold Label 和 Judge Telemetry 绝不进 Agent 上下文**。只在 Dev 上调参，Test 只在里程碑运行，并保留访问记录。同时公开 Case Hash、排除规则和人工复核状态。如果 Test 已经影响过设计，就应该升级版本，诚实地把旧 Test 降成回归集，而不是继续叫盲测。
