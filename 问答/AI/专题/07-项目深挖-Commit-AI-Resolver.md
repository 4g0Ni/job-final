# 07｜项目深挖：Commit AI Resolver（15 题）

> 对外统一口径：当前公开版本是离线可复现 Demo，不描述为已部署 Azure 的线上生产系统；不泄露微软内部客户、账户、路径和数据。

## PROJ-01｜请用 60 秒和 3 分钟介绍 Commit AI Resolver。

**关键词：** evidence-first、27,646、hybrid retrieval、Evidence Gate、MCP、Eval  
**关联：** PROJ-07、PROJ-08、PROJ-10、PROJ-13

**参考答案：**

**60 秒版：** 这是一个面向跨仓库历史变更与回归调查的 evidence-first 检索 Agent。公开 Demo 对 27,646 条 React Commit 建立可重建索引，通过 Direct SHA、metadata、FTS5、dense 和多查询召回候选，用 weighted RRF 融合；生成前由 Evidence Gate 决定搜索、拒答或澄清，生成后用确定性 scorer 校验引用。能力通过 6 个 MCP 工具复用，并用分层 Eval 诊断索引、召回、融合、门禁、grounding 和重试。

**3 分钟展开顺序：** 业务痛点 → 可审计 JSON 与 SQLite/FTS5/sqlite-vec → 多路召回/RRF → Evidence Gate → 有界重试 → MCP → 75-case 工程回归与 461 RCA cases → 已发现的 RRF/长查询坏例 → 下一步 Agentic 精查。数据和指标口径见 PROJ-11～13。

## PROJ-02｜adocag-server 是 Agent 还是 Pipeline？

**关键词：** Graph RAG、AST、Leiden、固定流程、有界迭代  
**关联：** RAG-12、AGENT-01

**参考答案：** 更准确地说是分层 Graph RAG / deep-research pipeline：AST 分块、实体关系、Leiden 社区、分层检索和 Wiki 生成是明确阶段；deep_research 虽最多迭代五轮，但终止与扩展仍受固定流程约束，不是完全自主 ReAct。这样表述能证明我理解 Pipeline 与 Agent 的边界，而不是为了包装滥用 Agent 一词。

## PROJ-03｜为什么项目没有直接使用 LangGraph/CrewAI？

**关键词：** 最小复杂度、固定角色、有界重试、可调试  
**关联：** AGENT-10、MCP-08

**参考答案：** 当前只有固定职责和一个最多三轮的反馈环，原生函数编排更轻、依赖更少、状态与 trace 更透明。若未来出现长任务持久化、复杂动态分支、人工恢复或跨进程执行，再引入显式状态图。我的原则是框架由运行语义驱动，不把框架名称当项目能力。

## PROJ-04｜如果重做两个 AI 项目，优先改什么？

**关键词：** human review、agent eval、fusion、long query、observability  
**关联：** PROJ-09、PROJ-12、PROJ-13

**参考答案：** Commit AI Resolver 第一优先完成人工四项 rubric、切分 gold dev/frozen test，并接入可用 chat API 跑完整 Agent 多次采样；第二根据等权 RRF 和长查询坏例优化 query condensation、field-aware embedding 与融合；第三补并发/ANN/权限、线上反馈和可回放 trace。adocag-server 则先建立检索 gold 与答案 rubric，再决定是否增加动态规划。

## PROJ-05｜Coding Agent 已能用 `rg + git` 搜索，为什么还需要索引 RAG？

**关键词：** current checkout、cross-repo、reuse、coarse-to-fine、raw evidence  
**关联：** RAG-04、PROJ-08、PROJ-15

**参考答案：** `rg + git log/show/diff` 适合在已有 checkout 的当前仓库中交互式精查源码和调用链，但每次要重新探索。索引层适合跨仓库、长时间跨度、多人重复查询，提供低延迟过滤、稳定排序、拒答和离线回归。最合理的是“索引粗召回 Top-N + Coding Agent 打开原始 diff/源码验证”，二者分层互补。

## PROJ-06｜新增 Commit 是否要每天全量重建向量库？

**关键词：** event、upsert、content hash、dual-write、backfill  
**关联：** RAG-11、PROJ-07

**参考答案：** 不需要。按 `repo + commit SHA` 幂等 upsert，只对新增或语义文本变化的记录生成 embedding；作者、日期、风险、ACL 等 metadata 变化只更新字段。用语义文本、模型、维度和模板版本生成内容哈希并缓存向量。更换模型/schema 时建 v2、历史低优先级回填、新数据双写，Eval 通过后切换并保留回滚。

## PROJ-07｜为什么用 JSON 作为事实源、索引作为派生物？

**关键词：** source of truth、manifest、rebuild、compatibility、audit  
**关联：** RAG-03、EVAL-13、PROJ-06

**参考答案：** daily JSON 保存可审计 Commit 记录，SQLite metadata、FTS5 和 sqlite-vec 可删除重建。manifest 冻结 corpus hash、条数、模型、维度、query instruction、文档模板和索引版本；启动/Eval 检查行数、重复、missing、stale 和向量字节长度。不一致时拒绝比较并要求重建，避免新旧向量空间混写或“指标不可复现”。

## PROJ-08｜Direct SHA、metadata、FTS5、dense 和多查询如何分工？

**关键词：** exact、filter、lexical、semantic、secondary query  
**关联：** RAG-04、RAG-09、PROJ-09

**参考答案：** SHA 走 direct lookup；repo/date/author/risk 走结构化过滤；错误码、路径和专名走 FTS5；自然语言症状走 dense；secondary query 与工单标题提供补充视角。Intent Extractor 只抽取用户显式约束；窄候选先 SQL pre-filter 再 exact cosine，避免全局 Top-K 后过滤漏召回。各通道分别保留排名供融合和消融。

## PROJ-09｜为什么用 weighted RRF？评测发现了什么？

**关键词：** 异量纲、rank contribution、9 rescued、27 displaced、long query  
**关联：** RAG-05、RAG-13、PROJ-13

**参考答案：** BM25 与 cosine 分数不可直接比较，RRF 按名次融合、简单可解释；但当前等权 RRF 在 461 cases 中只救回 9 条 Dense miss，却把 27 条 Dense Top-10 hit 挤出 Hybrid Top 10，所以混合 Recall@10 低于 Dense。另有 >1200 字符查询 Dense Recall@10 为 0.653，低于中等长度组 0.728。下一步在人工 gold dev 上做 query-aware 权重、condensation 和 field-aware embedding，而不是在 frozen test 上调参。

## PROJ-10｜Evidence Gate 为什么放在生成前？如何标定？

**关键词：** nearest ≠ sufficient、SEARCH、ABSTAIN、ASK_USER、calibration  
**关联：** EVAL-07、PROJ-11

**参考答案：** 向量库对无关问题也会返回最近邻；若直接生成，弱相关候选会被包装成确定答案。Gate 综合 exact hit、用户显式过滤、dense score、多通道一致性和查询约束，输出 SEARCH、ABSTAIN 或 ASK_USER。阈值只在 dev 集按误答/拒答成本标定，frozen test 做回归；线上再观察 precision/recall、Brier/ECE 与拒答成本。

## PROJ-11｜23-case frozen test 达到 100%，为什么不能说“可靠性已解决”？

**关键词：** small sample、fixed corpus、engineering regression、distribution shift  
**关联：** EVAL-14、PROJ-12

**参考答案：** 23 个 test case 样本小、语料固定，部分正例由 Commit 标题派生，且最初集合建设并非严格双盲。Hybrid Recall@10 和 Gate 行为准确率 100% 只说明已知工程行为未回归，不能覆盖真实用户措辞、复杂 RCA、跨仓库漂移、LLM 随机性、延迟和成本。因此对外明确叫 frozen engineering regression test，不叫外部盲测或生产准确率。

## PROJ-12｜如何用公开数据建设可信的 RCA 验证集？

**关键词：** Issue、closing PR、fix commit、corpus hash、human rubric  
**关联：** EVAL-03、EVAL-14、PROJ-11

**参考答案：** 从 GitHub `Issue.closedByPullRequestsReferences` 出发，只保留 closing PR 已合并且 merge/fix commit 位于冻结 corpus 的链路，保存 Issue/PR/Commit URL、关系和 hash。当前 461 条 RCA cases 已模型预审并完成全量 retrieval Eval；下一步逐条人工确认问题忠实度、修复关系、gold 完整性和 query 可用性，再切分 gold dev/frozen test。人工复核前不作为 release gate。

## PROJ-13｜如何评测完整 Agent？Harness 实际抓到了什么问题？

**关键词：** layered eval、end-to-end、full SHA、explicit filter、fusion badcase  
**关联：** EVAL-01、EVAL-03、EVAL-05

**参考答案：** 分层测索引、Intent、Recall/MRR/nDCG、Gate、引用和循环，再让端到端 runner 多次执行，统计任务正确性、幻觉引用、重试、停滞、P95、token 与费用。Harness 已抓到 full SHA 因只存短 SHA 无法命中、默认 30 天窗口被误当用户显式过滤而错误放行、等权 RRF 挤掉 Dense 命中、长查询召回下降，以及 stale retry。它的价值是暴露并固定失败，不是展示漂亮均分。

## PROJ-14｜有界重试如何处理停滞？Evaluator 能看到什么？

**关键词：** max 3、best-so-far、result set fingerprint、PARTIAL、separation  
**关联：** AGENT-08、EVAL-04

**参考答案：** Evaluator 最多建议三轮，可调整关键词和日期窗口；每轮保存候选并维护 best-so-far，用 `repo:id` 集合比较相邻结果，无新证据就判 stale retry，以 PARTIAL 结束。Synthesizer 普通查询最多读取 10 条 commit，工单查询最多 15 条。Answer Evaluator LLM 只看答案与聚合检索元数据，不读逐条 raw commit；引用真实性和 gold evidence coverage 由确定性 scorer 负责。

## PROJ-15｜如何做 grounding、MCP 工具化和下一代架构？

**关键词：** citation validity、6 tools、Streamable HTTP、shared core、agentic verification  
**关联：** MCP-01、MCP-03、PROJ-05

**参考答案：** 程序化抽取回答中的 SHA/引用，核对冻结 corpus、当前 retrieval set 和 required evidence，统计 citation validity、幻觉引用率与 coverage；开放式因果解释再交给 rubric/人工。系统通过 Streamable HTTP 暴露 6 个 MCP 工具，API/UI/MCP 共用检索核心，Host 决定调用和权限。下一步让索引做跨仓库粗召回，再用 `git show/diff`、`rg` 和 symbol search 对 Top-N 做原始证据验证。
