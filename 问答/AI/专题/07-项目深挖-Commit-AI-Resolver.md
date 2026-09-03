# 07｜项目深挖：Commit AI Resolver（16 题）

> 对外统一口径：当前公开版本是离线可复现 Demo，不描述为已部署 Azure 的线上生产系统；不泄露微软内部客户、账户、路径和数据。

## PROJ-01｜请用 60 秒和 3 分钟介绍 Commit AI Resolver。

**关键词：** **Evidence-first**、**27,646**、**Hybrid Retrieval**、**Evidence Gate**、**MCP**、**Eval**  
**关联：** PROJ-07、PROJ-08、PROJ-10、PROJ-13

**参考答案：**

**60 秒版：** 这个项目叫 **Commit AI Resolver**，主要解决跨仓库历史变更和回归调查的问题。公开 Demo 里，我对 **27,646 条 React Commit** 建了可重建索引。检索时不是只做向量搜索，而是把 Direct SHA、Metadata、FTS5、Dense 和多查询召回结合起来，再用 **Weighted RRF** 融合。生成答案以前还有一层 **Evidence Gate**，证据不够就拒答或者让用户补信息；生成以后再用确定性程序检查引用。整个能力通过 **6 个 MCP 工具**复用，并用分层 Eval 分别评估索引、召回、融合、门禁、引用和重试。

**3 分钟版：** 我当时想解决的是，线上出现回归以后，怎么从很长的 Commit 历史里快速找到可能相关的变更，而且不能让模型拿一个弱相关结果就编成根因。所以离线侧我先把公开 Commit 做成可审计的 JSON 事实源，再构建 SQLite Metadata、FTS5 和 sqlite-vec 这些可重建索引。在线侧根据查询类型分流：SHA 直接查，repo、日期、作者走结构化过滤，错误码和路径走 FTS5，自然语言症状走 Dense，多路结果再用 RRF 融合。

拿到候选以后，我没有直接让 LLM 生成，而是先过 **Evidence Gate**，决定继续搜索、拒答还是向用户澄清。Agent 最多重试三轮，如果结果集合没有变化，就按 **Stale Retry** 停止并返回当前最好结果。系统还通过 MCP 暴露 6 个工具，让 IDE Agent 可以直接复用这些能力。

Prompt 工程上，我把动态业务内容和 System Prompt 隔离，为 4 类 Agent 使用严格 JSON Schema，并在代码侧校验候选 Commit 和 URL。Prompt 由 Registry 统一管理，通过 stable/candidate 确定性分流，支持 kill switch 和连续失败自动回滚；10-case Golden Eval、CI 门禁与逐 Agent token、延迟和错误遥测构成第一版质量闭环，相关自动测试 185 项通过。

评测上我分了两层：一套是 **75-case 工程回归集**，其中 23 条 frozen test 用来防止已知行为退化；另一套是 **461 条 Issue → Closing PR → Fix Commit 的 RCA gold cases**，目前是模型预审版，已经完成全量检索评测，但人工复核前不作为 release gate。针对 Issue-grounded 场景，我只用 Issue 的创建/关闭时间建立 `createdAt - 7d → closedAt + 30d` 窗口，再用本地 LTR 重排四路候选；在 grouped 134-case held-out test 上，Recall@20 从 **70.90% 提高到 94.78%**，Recall@10 为 **92.54%**。这条结果没有使用 LLM reranker，也不能外推到没有 Issue 时间信息的普通文本查询。下一步是人工复核 gold、单独验证开放 Issue，并增加 `git show/diff`、`rg` 和 symbol search 原始证据精查。

## PROJ-02｜adocag-server 是 Agent 还是 Pipeline？

**关键词：** **Graph RAG**、**AST**、**Leiden**、**固定流程**、**有界迭代**  
**关联：** RAG-12、AGENT-01

**参考答案：** 我会比较诚实地说，它现在更像一个分层的 **Graph RAG / Deep-research Pipeline**，还不是完全自主的 Agent。AST 分块、实体关系、Leiden 社区、分层检索和 Wiki 生成都有明确阶段；虽然 deep_research 最多能迭代五轮，但它什么时候扩展、什么时候停止，主要还是固定流程控制的。这样讲反而能说明我理解 **Pipeline 和 Agent 的边界**，而不是为了包装什么都叫 Agent。

## PROJ-03｜为什么项目没有直接使用 LangGraph/CrewAI？

**关键词：** **最小复杂度**、**固定角色**、**有界重试**、**可调试**  
**关联：** AGENT-10、MCP-08

**参考答案：** 当时我没有直接上 LangGraph，是因为当前流程只有几个固定职责，再加一个最多三轮的反馈环，用普通函数编排反而更轻，状态和 Trace 也更容易看清。如果以后出现**长任务持久化、复杂动态分支、人工恢复或者跨进程执行**，我会考虑引入显式状态图。我的原则是先看运行语义是不是真的需要，而不是把框架名字当成项目能力。

## PROJ-04｜如果重做两个 AI 项目，优先改什么？

**关键词：** **Human Review**、**Open Issue**、**Agent Eval**、**Raw Evidence**、**Observability**
**关联：** PROJ-09、PROJ-12、PROJ-13

**参考答案：** 如果现在重做，我会先把评测做得更扎实。Prompt 隔离、Structured Output、Registry、灰度回滚、第一版 Golden Eval，以及 461-case 上的 Issue 时间窗和本地 LTR 实验都已经完成；下一步先完成 **461 条 case 的人工四项 Rubric**，冻结 release-gate Gold Dev/Test，并优先人工审查最后 7 条 Top-20 failure。然后单独验证开放 Issue 的 `createdAt → now` 时间窗，接入可用 Chat API 跑完整 Agent 多次采样，再补 `git show/diff`、`rg`、symbol search 原始证据精查。最后才是并发、ANN、权限、线上反馈和可回放 Trace。adocag-server 也一样，先有 Gold 和 Rubric，再决定要不要增加动态规划。

## PROJ-05｜Coding Agent 已能用 `rg + git` 搜索，为什么还需要索引 RAG？

**关键词：** **Current Checkout**、**Cross-repo**、**Reuse**、**Coarse-to-fine**、**Raw Evidence**  
**关联：** RAG-04、PROJ-08、PROJ-15

**参考答案：** 我觉得两者不是替代关系。`rg + git log/show/diff` 很适合 Coding Agent 在已经 Checkout 的当前仓库里精查源码、调用链和原始 Diff，但每次都要重新探索。索引层更适合**跨仓库、长时间跨度和多人重复查询**，因为它能提供低延迟过滤、稳定排序、拒答和离线回归。最合理的组合是：索引先做 Top-N 粗召回，Coding Agent 再打开原始 Diff 和源码验证。

## PROJ-06｜新增 Commit 是否要每天全量重建向量库？

**关键词：** **Event**、**Upsert**、**Content Hash**、**Dual-write**、**Backfill**  
**关联：** RAG-11、PROJ-07

**参考答案：** 不需要每天全量重建。我会按 `repo + commit SHA` 做**幂等 Upsert**，只给新增或者语义文本真的变了的记录重新生成 Embedding。作者、日期、风险和 ACL 这种 Metadata 变化，只更新字段就行。向量缓存键里会放语义文本、模型、维度和模板版本。只有换模型或 Schema 时才建 v2，旧数据低优先级 Backfill，新数据 Dual-write，Eval 通过以后再切换，并保留回滚。

## PROJ-07｜为什么用 JSON 作为事实源、索引作为派生物？

**关键词：** **Source of Truth**、**Manifest**、**Rebuild**、**Compatibility**、**Audit**  
**关联：** RAG-03、EVAL-13、PROJ-06

**参考答案：** 我把 daily JSON 当 **Source of Truth**，因为它保存的是可审计、可以重新处理的 Commit 记录；SQLite Metadata、FTS5 和 sqlite-vec 都只是派生索引，坏了可以重建。Manifest 会固定 corpus hash、条数、模型、维度、Query Instruction、文档模板和索引版本。启动和 Eval 时再检查行数、重复、Missing、Stale 和向量字节长度。发现不一致就拒绝比较，避免新旧向量空间混在一起。

## PROJ-08｜Direct SHA、metadata、FTS5、dense 和多查询如何分工？

**关键词：** **Exact**、**Filter**、**Lexical**、**Semantic**、**Secondary Query**  
**关联：** RAG-04、RAG-09、PROJ-09

**参考答案：** 我是按信号类型分工的：**SHA 直接查**；repo、日期、作者、风险做结构化过滤；错误码、路径和专有名词走 FTS5；自然语言症状走 Dense；Secondary Query 和工单标题补充不同视角。Intent Extractor 只提取用户明确说出的条件。候选范围很窄时先 SQL Pre-filter，再做 Exact Cosine，避免全局 Top-K 后过滤造成漏召回。每个通道的排名都会保留下来，方便融合和消融分析。

## PROJ-09｜为什么用 weighted RRF？评测发现了什么？

**关键词：** **异量纲**、**Rank Contribution**、**Candidate Ceiling**、**时间窗**、**LTR**
**关联：** RAG-05、RAG-13、PROJ-13

**参考答案：** 我选 RRF 是因为 BM25 和 cosine 的分数不是一个量纲，按排名融合比较容易解释。但 Eval 证明 RRF 不是天然有收益：早期等权 RRF 只救回 **9 条 Dense miss**，却挤出 **27 条 Dense Top-10 hit**。我先改成 Dense-primary 权重，把结果修到“救回 6 条、挤出 0 条”，然后继续分析候选上限。第一版 raw/compact 四路 Top-100 pool 在 test 上只覆盖 85.82% gold，所以无论本地 LTR 还是 LLM 都不可能把 Recall@20 做到 90%。最终我利用输入中合法的 Issue 生命周期 metadata 做时间预过滤，把 test candidate availability 提到 97.76%，再用本地 LTR 将 Recall@10/20 提到 **92.54%/94.78%**。这个过程说明：先分清 candidate miss 和 ranking miss，再决定优化召回还是重排，不能只盯一个平均分。

## PROJ-10｜Evidence Gate 为什么放在生成前？如何标定？

**关键词：** **Nearest ≠ Sufficient**、**SEARCH**、**ABSTAIN**、**ASK_USER**、**Calibration**  
**关联：** EVAL-07、PROJ-11

**参考答案：** 向量库对任何问题都能找出最近邻，但**最近不等于证据足够**。如果直接让模型生成，很容易把弱相关结果讲成确定结论。所以我在生成前加了 Evidence Gate，综合 Exact Hit、用户显式过滤、Dense Score、多通道一致性和查询约束，输出 **SEARCH、ABSTAIN 或 ASK_USER**。阈值只在 Dev 集按误答和拒答成本标定，Frozen Test 做回归，线上再继续看 Precision/Recall、Brier/ECE 和拒答成本。

## PROJ-11｜23-case frozen test 达到 100%，为什么不能说“可靠性已解决”？

**关键词：** **Small Sample**、**Fixed Corpus**、**Engineering Regression**、**Distribution Shift**  
**关联：** EVAL-14、PROJ-12

**参考答案：** 这个 100% 我会主动解释边界。Frozen Test 只有 **23 条**，语料是固定的，部分正例还是从 Commit 标题派生的，而且最初建集合时也不是严格双盲。所以 Hybrid Recall@10 和 Gate 行为准确率 100%，只能说明**已知工程行为没有退化**，不能代表真实用户措辞、复杂 RCA、跨仓库漂移、LLM 随机性、延迟和成本都解决了。对外我只叫它 **Frozen Engineering Regression Test**，不会叫生产准确率。

## PROJ-12｜如何用公开数据建设可信的 RCA 验证集？

**关键词：** **Issue**、**Closing PR**、**Fix Commit**、**Corpus Hash**、**Human Rubric**  
**关联：** EVAL-03、EVAL-14、PROJ-11

**参考答案：** 我是从 GitHub 的 `Issue.closedByPullRequestsReferences` 关系开始构建，只保留 Closing PR 已合并，而且 Merge/Fix Commit 确实存在于冻结 Corpus 的链路，同时保存 Issue、PR、Commit 的 URL、关系和 Hash。现在有 **461 条 RCA gold cases**，当前为模型预审版；按 shared fix commit 连通组稳定切成 327 dev / 134 held-out test，避免同一修复跨 split。它们已经完成全量 Retrieval Eval，以及 Issue 时间窗 + 本地 LTR 实验。下一步还要人工逐条确认问题是否忠实、修复关系是否成立、Gold 是否完整、Query 是否可用。人工复核完成前，我不会把它当 Release Gate。

## PROJ-13｜如何评测完整 Agent？Harness 实际抓到了什么问题？

**关键词：** **Layered Eval**、**End-to-end**、**Full SHA**、**Explicit Filter**、**Fusion Bad Case**  
**关联：** EVAL-01、EVAL-03、EVAL-05

**参考答案：** 我的 Eval 是两条线：一条分层测索引、Intent、Recall/MRR/nDCG、Gate、引用和循环；另一条让端到端 Runner 多次执行，看任务正确性、幻觉引用、重试、停滞、P95、token 和费用。这个 Harness 确实抓到过几类真实问题：只存短 SHA 导致 **Full SHA 查不到**，默认 30 天窗口被误当用户显式条件而错误放行，等权 RRF 挤掉 Dense 命中，长查询召回下降，还有 **Stale Retry**。最近它又用 candidate availability 证明 Top-100 pool 的 85.82% 上限才是 Recall@20 的主要瓶颈，从而把优化方向从“继续换 reranker”改成 Issue 时间预过滤。它的价值是先暴露失败、定位层级，再把失败固定住，不是为了展示一个漂亮均分。

## PROJ-14｜有界重试如何处理停滞？Evaluator 能看到什么？

**关键词：** **最多 3 轮**、**Best-so-far**、**Result-set Fingerprint**、**PARTIAL**、**职责分离**  
**关联：** AGENT-08、EVAL-04

**参考答案：** 我的设计是让 Evaluator 最多只能建议 **3 轮**，它可以调整关键词或者日期窗口。每一轮都保存候选并维护 Best-so-far，再用 `repo:id` 集合比较相邻结果；如果没有新证据，就判成 Stale Retry，以 **PARTIAL** 结束。Synthesizer 普通查询最多看 10 条 Commit，工单查询最多 15 条。还有一个职责边界：Answer Evaluator LLM 只看答案和聚合检索元数据，不看逐条 Raw Commit；引用真实性和 Gold Evidence Coverage 由确定性 Scorer 检查。

## PROJ-15｜如何做 grounding、MCP 工具化和下一代架构？

**关键词：** **Citation Validity**、**6 个工具**、**Streamable HTTP**、**Shared Core**、**Agentic Verification**  
**关联：** MCP-01、MCP-03、PROJ-05

**参考答案：** Grounding 这块我会先程序化抽取答案里的 SHA 和引用，再去核对冻结 Corpus、当前 Retrieval Set 和 Required Evidence，统计 **Citation Validity、幻觉引用率和 Coverage**；开放式因果解释再交给 Rubric 或人工。系统通过 **Streamable HTTP** 暴露 6 个 MCP 工具，API、UI 和 MCP 共用同一套检索核心，Host 决定什么时候调、能调什么。下一步就是让索引做跨仓库粗召回，再用 `git show/diff`、`rg` 和 Symbol Search 对 Top-N 做原始证据验证。

## PROJ-16｜新的 Issue 时间窗和本地 LTR 到底如何工作？

**关键词：** **Lifecycle Metadata**、**SQL Pre-filter**、**四路候选池**、**35 Features**、**No LLM**
**关联：** PROJ-08、PROJ-09、EVAL-03、RAG-11

**参考答案：** 这条链路只用于输入本身带 `createdAt/closedAt` 的 Issue。时间窗不是看 gold commit 倒推，而是只在 dev 上比较多个固定窗口，最后选择最小的达标配置：`createdAt - 7 天` 到 `closedAt + 30 天`，它在 dev 上覆盖 98.78% relevant commits。检索时先用 repo 和 commit 日期做 SQL pre-filter，再在窗内分别跑 raw/compact × Dense/Lexical Top 100，合并去重后平均约 153 个候选。

本地 LTR 不生成答案，也不调用 LLM。它读取 35 个可解释 feature，包括四个通道是否命中、排名和相对分、多路共识、word/char TF-IDF，以及 query 对 title、summary、changed files、affected areas 的 overlap。327 dev 内再按 shared fix commit 分成 229 train / 98 validation，比较 Logistic、HistGradientBoosting 和 ExtraTrees，选出 `hist-depth3` 后在全部 dev 重训，最后评估 134 test。结果是 candidate availability 97.76%，Recall@10/20 为 92.54%/94.78%。开放 Issue 没有 `closedAt`，只能暂用 now，并且必须单独评测；普通 text-only 查询也不能引用这组指标。
