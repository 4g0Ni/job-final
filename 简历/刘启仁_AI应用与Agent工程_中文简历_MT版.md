# 刘启仁（Qiren Liu）

**AI Agent / 后端软件工程师**  
电话：13382183295｜邮箱：lqr_ld@163.com

## 个人概述

4 年微软 Microsoft Advertising 软件工程经验，工作主线覆盖 **AI Agent 与广告后端系统**。设计并实现面向多仓库历史变更与回归调查的 evidence-first 检索 Agent，具备混合召回、Agent 编排、MCP、拒答门禁、分层评测与可观测性的端到端实践；同时负责图片资产治理、Deal 同步及异步推荐视频等后端链路，并具备大型 Campaign UI 的端到端交付经验。

## 核心技能

- **AI / Agent：** Agentic RAG、Embedding、FTS/Dense/Exact 混合检索、RRF、Evidence Grounding、Agent Eval、MCP、Prompt/Context Engineering、SSE
- **后端：** C#、Python、Cosmos
- **前端：** JavaScript、React、Fluent UI
- **存储与工程化：** sqlite-vec、Azure Blob/Table、Kubernetes、Kusto/KQL、Azure DevOps CI/CD

## 教育背景

- **电子科技大学｜硕士，网络工程学院**｜2019.09 – 2022.06
- **电子科技大学｜本科，信息与通信工程学院**｜2015.09 – 2019.06

## 工作经历

### Microsoft｜软件工程师，Microsoft Advertising / Microsoft AI
**2022.08 – 2026.08**

#### AI Agent 核心项目：Commit AI Resolver｜历史变更检索与回归调查 Agent

**JavaScript / SQLite FTS5 / sqlite-vec / RRF / MCP**

- 面向多仓库、长时间跨度的 Commit 检索与线上回归定位，设计 **Intent Extractor → Hybrid Retriever → Evidence Gate → Answer Synthesizer → Answer Evaluator** 有界调查链路，将预计算历史索引用作低成本候选生成层，而非仅依赖模型读取整个时间窗口。
- 构建内部多仓库版本与外部公开复现版本：以 daily JSON 为可审计 source of truth，以 SQLite metadata/FTS5 与 sqlite-vec 为可重建派生索引；公开版本对 27,646 条 React Commit 补齐 changed files、affected areas 与完整 message，并将 embedding 模型、1024 维度、query instruction、文档模板与索引版本纳入一致性契约。
- 构建 **Direct SHA + FTS5 + Dense + Multi-query** 多路召回：精确标识符直接命中、结构化条件 pre-filter、语义改写与工单标题独立检索，再以 weighted RRF 融合不同量纲排名，并保留通道贡献用于诊断。
- 在生成前加入确定性 Evidence Gate，综合精确命中、显式 metadata 约束、dense score 与多通道一致性，输出 SEARCH / ABSTAIN / ASK_USER，避免将“最近邻”误当成“足够证据”；答案层校验引用与 Commit 真实性。
- 通过 Evaluator 驱动最多 3 轮有界重试，支持关键词/日期窗口调整，并以结果 ID 集合检测 stale retry、保留 best-so-far；通过 Streamable HTTP 暴露 6 个 MCP 工具，使 IDE Agent 可复用检索、Diff 与摘要能力。
- 将动态业务内容与 System Prompt 隔离，为 4 类 Agent 引入严格 JSON Schema、候选 Commit/URL 确定性校验与兼容降级，降低 Prompt Injection、格式漂移和证据幻觉风险。
- 建立 Prompt Registry、stable/candidate 确定性分流、kill switch 与连续失败自动回滚；以 10-case Golden Eval、CI 门禁和 SQLite 逐 Agent token/延迟/错误遥测形成 Prompt 质量闭环，相关自动测试 185 项通过。
- 建立 75-case 版本化工程回归 Harness，并基于真实 GitHub Issue → closing PR → fix commit 构建、全量评测 461 条 RCA gold cases（模型预审版）；分层输出 Recall@K、MRR、nDCG、Brier/ECE 与逐 case trace，支持检索/RRF badcase 诊断及人工复核后冻结 release gate。

#### 广告 UI 项目

- 在大型 Microsoft Advertising Campaign UI 中累计完成 490+ 次生产合并，通过系统性性能优化将关键页面 P95 降低 **40%–72%**，并交付图片素材质量预测、第三方监测、Media Deal、广告推荐、A11y/i18n 与线上 DRI。

#### 广告后端项目

**C#/.NET / WCF / SOAP / Bulk API / Task Engine / SQL Server / Azure Queue / Cosmos/ADLS**

##### 图片资产生命周期治理

- 端到端设计并落地孤立图片资产的识别、清理与恢复链路，通过数据层多账户清理/激活存储过程和中间层 Kubernetes CronJob 完成批量治理。
- 建设 WCF 邮件通知服务与邮件模板，为受影响账户提供通知，并通过错误处理、失败告警和多环境配置保障任务稳定运行。
- 补充广告扩展与 Smart Page 的图片校验及功能测试，处理误报问题，并将 OSManagementDAM 相关能力迁移至中间层统一维护。

##### 程序化 Deal 同步与投放治理

- 从 0 主导 Xandr Deal 到 MS Deal 的自动同步，完成 API 分页拉取、模型映射与校验、SOAP/Bulk/WCF 多入口一致性、定向约束、分市场灰度 GA 及旧版本安全下线。

##### 视频推荐与创意生成任务链路

- 每日按配置批量捞取指定数量的广告，读取存储在 Cosmos/ADLS 中的数据库映射数据并为其生成推荐视频，同时通过 Azure Queue 限流、黑白名单、批量降级与部分成功机制保障外部生成 API 的稳定调用。
