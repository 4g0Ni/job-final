# 刘启仁（Qiren Liu）

**AI Agent / 后端软件工程师**  
电话：13382183295｜邮箱：lqr_ld@163.com

## 个人概述

4 年微软 Microsoft Advertising 软件工程经验，工作主线覆盖 **AI Agent 与广告后端系统**。在公司内设计并实现分层图 RAG 代码知识库与多智能体 Commit 分析系统，具备检索、Agent 编排、MCP、评测与可观测性的端到端实践；同时负责图片资产治理、Deal 同步、异步推荐视频及第三方测量等后端链路，并具备大型 Campaign UI 的端到端交付经验。

## 核心技能

- **AI / Agent：** RAG、Hierarchical/Graph RAG、Embedding、混合/多查询检索、RRF、LLM-as-Judge、Agent 编排、MCP、Prompt/Context Engineering、SSE
- **后端：** C#、Python、Cosmos
- **前端：** JavaScript、React、Fluent UI
- **存储与工程化：** sqlite-vec、Azure Blob/Table、Kubernetes、Kusto/KQL、Azure DevOps CI/CD

## 教育背景

- **电子科技大学｜硕士，网络工程学院**｜2019.09 – 2022.06
- **电子科技大学｜本科，信息与通信工程学院**｜2015.09 – 2019.06

## 工作经历

### Microsoft｜软件工程师，Microsoft Advertising / Microsoft AI
**2022.08 – 2026.08**

#### AI Agent 核心项目：Commit AI Resolver｜多智能体 Commit 语义分析系统

**JavaScript / SQLite FTS5 / sqlite-vec / RRF / MCP**

- 设计并实现有界多智能体流水线：**Intent Extractor → RAG Retriever → Answer Synthesizer → Answer Evaluator**；Evaluator 可返回检索改写策略，最多迭代 3 轮，并以结果停滞信号提前终止。
- 以 JSON 为可审计源数据、SQLite metadata/FTS5 与 sqlite-vec 为可重建索引；在约 2,300 条、34 天窗口的内部样本上融合关键词与稠密召回，并以加权 RRF 排序。
- 将 embedding 模型/维度/query instruction 与索引版本配置化，支持 OpenAI-compatible 本地端点和公开 JSONL 离线数据；保留检索证据护栏及 18 个手工 badcase，自动化 Eval Harness 仍在规划。
- 通过 Streamable HTTP 暴露 6 个 MCP 工具，覆盖语义检索、精确 Commit、日期/工单摘要、Diff 与条件查询，使 IDE Agent 可直接复用检索能力。

#### AI Agent 核心项目：adocag-server｜HiRAG 代码知识库与 Wiki 生成服务

**Python / FastAPI / tree-sitter / Leiden / Graph RAG / SSE**

- 基于分层图 RAG 构建代码知识服务：通过 tree-sitter 做 AST 语义分块，抽取实体/关系，使用 Leiden 完成社区聚类与摘要，支持从函数级到架构级的多粒度问题。
- 提供 hi_local、hi_global、hi_bridge 等分层检索模式，通过 FastAPI/SSE 输出 Wiki 与研究结果，并支持多 LLM 后端、Blob/Table 存储及索引刷新。
- 将 deep_research 设计为最多 5 轮的有界关键词扩展 pipeline；围绕 Recall@K/MRR golden set、LLM 缓存及 token/latency 观测设计后续评测与优化方案。

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

##### 广告曝光与第三方测量服务

- 将 Ad Impression Tracking 迁移至 Task Engine，支持展示/视频广告及 IAS、MOAT、ISPOT 等第三方追踪，并补齐动态节奏控制、校验和变更历史审计。
