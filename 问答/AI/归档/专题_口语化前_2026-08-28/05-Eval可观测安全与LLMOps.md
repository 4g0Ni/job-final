# 05｜Eval、可观测、安全与 LLMOps（14 题）

记忆链：**先定义成功 → 分层采集证据 → 诊断坏例 → 校准门禁 → 灰度与回滚**。

## EVAL-01｜Agent Eval 应包含哪些指标？

**关键词：** task success、tool accuracy、grounding、latency、cost、safety  
**关联：** RAG-10、EVAL-03、PROJ-13

**参考答案：** 分层看意图/路由、Retriever、工具选择与参数、门禁、答案/引用、循环行为，以及端到端任务成功率。生产指标还包括 P50/P95、token、费用、重试、拒答/澄清、幻觉引用和安全违规。每个指标按场景与失败桶拆分，并与业务失败成本对应，不能用一个平均分代表全部质量。

## EVAL-02｜LLM-as-Judge 有什么问题？如何提高可信度？

**关键词：** bias、position、verbosity、self-preference、rubric、calibration  
**关联：** LLM-07、EVAL-03、PROJ-13

**参考答案：** Judge 会受位置、长度、措辞、模型家族和提示影响，也可能偏爱自己的输出。改进方法是明确 rubric 和锚点样例、随机顺序、隐藏无关元数据、程序化评分客观字段、抽样人工复核，并报告与人工的一致性。它适合规模化辅助，不应替代引用真实性、权限和数值正确性的确定性检查。

## EVAL-03｜如何建立可复现的 Eval Harness？

**关键词：** frozen cases、version、seed、trace、resume、per-case diff  
**关联：** EVAL-01、EVAL-02、PROJ-13

**参考答案：** 冻结 case ID、输入、gold/rubric 和 split；记录 corpus、索引、prompt、模型和代码版本，以及温度/seed（若支持）。Runner 支持并发、超时、重试、断点续跑和逐 case 产物；报告同时给聚合指标与 badcase diff。dev 用于调参，frozen test 只做回归，任何看过 test 后的改动都要产生新版本。

## EVAL-04｜Agent trace 应记录什么？

**关键词：** run/task ID、decision summary、tool、observation、token、version  
**关联：** AGENT-03、AGENT-12、EVAL-05

**参考答案：** 记录 run/task/case、版本、每步结构化决策摘要、候选与通道、门禁、工具及参数摘要、观察状态、重试、token、延迟、费用、结果新颖度、最终引用和失败类型。敏感参数要脱敏；trace 要能重放关键路径，但不能保存密钥、私有思维链或把 gold label 注入 Agent 上下文。

## EVAL-05｜如何建立可行动的 Bad Case 分类？

**关键词：** taxonomy、index、retrieval、routing、tool、generation、policy  
**关联：** AGENT-07、EVAL-04、PROJ-13

**参考答案：** 先定位失败层：数据/索引、意图与过滤、召回、融合/rerank、门禁、工具、生成/引用、循环、系统依赖或策略拒绝；再标注可复现输入、期望、根因和修复 owner。每次修复都把代表性 case 加入回归集。分类若只写“模型效果不好”，就无法形成工程闭环。

## EVAL-06｜离线 Eval 与线上监控如何衔接？

**关键词：** offline、shadow、canary、feedback、drift、counterfactual  
**关联：** EVAL-03、EVAL-13

**参考答案：** 离线集验证已知能力与回归，影子流量检验真实分布但不影响用户，小流量灰度比较成功率、拒答、延迟和成本；上线后收集显式反馈、任务结果和失败桶，经过脱敏/审核回灌 Eval。线上变化要按版本切片，避免把流量、模型和索引同时变化后无法归因。

## EVAL-07｜门禁或拒答阈值如何标定？

**关键词：** precision-recall、业务成本、calibration、Brier、ECE、dev/test  
**关联：** RAG-10、PROJ-10

**参考答案：** 构造有证据、自然 OOD、虚构 ID、歧义和权限拒绝样本，在 dev 集观察特征分布与 PR 曲线，按“误答成本 vs 过度拒答成本”选阈值；frozen test 只验证泛化。若输出置信度，还要看 reliability diagram、Brier/ECE。上线后基于真实流量重新校准，但必须版本化。

## EVAL-08｜如何设计 Agent 的成本与延迟预算？

**关键词：** max calls、token、wall-clock、fan-out、best-so-far、Pareto  
**关联：** LLM-09、RAG-06、AGENT-08

**参考答案：** 按任务设置模型调用、检索/工具次数、token、并行 fan-out、wall-clock 和费用上限；接近预算时切小模型、减少候选、跳过非关键步骤或返回 best-so-far。缓存只用于稳定且权限安全的结果。评估质量—P95—成本 Pareto，并监控按租户/任务的异常消耗。

## EVAL-09｜语义缓存怎样做才不会返回错误或越权结果？

**关键词：** exact/semantic cache、version、tenant、TTL、similarity、invalidation  
**关联：** RAG-11、EVAL-08、EVAL-11

**参考答案：** 缓存键至少包含规范化输入、模型/prompt/知识库版本、租户和权限上下文；高风险、强时效、个性化和副作用任务默认不做语义缓存。相似度命中后仍验证约束与引用有效期，设置 TTL 和变更失效。必须统计错误命中率，而不只看 hit rate。

## EVAL-10｜Prompt Injection 如何防？

**关键词：** untrusted content、instruction hierarchy、least privilege、egress、approval  
**关联：** MCP-04、EVAL-11、ENG-03

**参考答案：** 把网页、文档和工具输出视为不可信数据，明确分隔来源，禁止其覆盖系统规则；工具层实施最小权限、allowlist、参数校验和读写隔离，敏感外发/不可逆动作要求确认；检测只是辅助。真正的防线在执行边界和数据流控制，不是一句“忽略恶意指令”。

## EVAL-11｜如何防止数据泄露、越权与敏感信息进入模型？

**关键词：** classification、ACL、redaction、DLP、data residency、audit  
**关联：** RAG-11、MCP-04、EVAL-10

**参考答案：** 入模前按数据级别和用途授权，做字段裁剪、脱敏/DLP 与租户 ACL；凭据和内部标识不进入 prompt，工具结果按最小必要返回；选择满足数据驻留和保留策略的模型端点。日志、缓存、评测集和人工标注同样执行访问控制与删除策略，并保留审计链。

## EVAL-12｜模型网关应提供哪些能力？

**关键词：** routing、quota、retry、fallback、policy、usage、version  
**关联：** LLM-09、EVAL-08、EVAL-13

**参考答案：** 统一不同模型的请求/响应、鉴权、配额、限流、超时、重试、降级、内容策略、token/成本统计和 trace；按任务、租户和数据级别路由，并固定可复现版本。网关不应吞掉供应商差异，structured output、工具能力和错误语义需要显式暴露。

## EVAL-13｜Prompt、模型、索引如何做版本、灰度和回滚？

**关键词：** manifest、experiment、canary、dual-write、rollback、compatibility  
**关联：** EVAL-06、EVAL-12、PROJ-07

**参考答案：** 用 manifest 绑定代码、prompt、模型、embedding、索引 schema、corpus 和 Eval 集；离线通过后做影子/小流量灰度，按版本对比质量、P95、成本与安全。索引升级采用 v2 构建、新数据双写、验证后切读并保留回滚窗口；禁止在无兼容检查时把新 embedding 写进旧空间。

## EVAL-14｜如何避免评测数据泄漏和“为了指标调题”？

**关键词：** split discipline、label isolation、case hash、holdout、audit  
**关联：** EVAL-03、PROJ-11、PROJ-12

**参考答案：** dev/test 来源与规则先冻结，gold label 和 judge telemetry 不进入 Agent 上下文；只在 dev 调参，test 只在里程碑运行并保留访问记录。公开构建过程、case hash、排除规则和人工复核状态；发现 test 已影响设计时，应升级版本并诚实把旧 test 降为回归集。
