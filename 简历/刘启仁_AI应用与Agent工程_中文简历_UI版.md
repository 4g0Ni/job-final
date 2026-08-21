# 刘启仁（Qiren Liu）

**AI Agent / 前端软件工程师**  
电话：13382183295｜邮箱：lqr_ld@163.com

## 个人概述

4 年微软 Microsoft Advertising 软件工程经验，工作主线覆盖 **AI Agent 与大型广告 UI**。在公司内设计并实现分层图 RAG 代码知识库与多智能体 Commit 分析系统，具备检索、Agent 编排、MCP、评测与可观测性的端到端实践；同时在 Campaign UI 中长期负责性能、素材、监测、Deal、推荐与质量工程，并拥有广告后端项目的完整协作与交付经验。

## 核心技能

- **AI / Agent：** RAG、Hierarchical/Graph RAG、Embedding、混合/多查询检索、RRF、LLM-as-Judge、Agent 编排、MCP、Prompt/Context Engineering、SSE
- **前端：** JavaScript、React、Fluent UI
- **后端：** C#、Python、Cosmos
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

**TypeScript / React / Fluent UI / OData / pnpm Monorepo / Selenium / Kusto**  
在大型广告投放管理平台中累计完成 490+ 次生产合并，负责素材、监测、Deal、推荐、性能与质量工程等模块，并与 MT 后端和数据团队协作完成端到端交付。

##### UI 性能优化

- 作为性能专项核心贡献者，系统优化 Native 广告组创建/编辑及 Native 广告创建等高延迟向导，将核心页面生产 P95 降低 **40%–72%**。
- 通过生产性能 marker 和 React Profiler 区分 UI 渲染、网络及 MT/MDS 后端耗时，并采用隐藏面板懒渲染、React 重渲染治理、请求缓存预热/拆分及非必要初始 API 裁剪缩短关键路径。
- 最终将广告组编辑页 P95 从 **10s 降至 2.8s（-72%）**、创建页从 **8s 降至 2.7s（-66%）**、Native 广告创建页从 **6s 降至 3.6s（-40%）**，并持续通过生产遥测验证效果。

##### 图片广告素材质量预测与图片优化

- 集成 AIGC 团队提供的图片生成/重塑 API，完成素材质量建议、候选图片增量展示、交互状态、遥测及可访问性闭环。

##### 广告第三方监测（IAS / DoubleVerify / ISPOT / MOAT）

- 主导多家第三方监测厂商在展示、视频和原生广告中的接入，覆盖追踪设置、业务校验、批量编辑及前后端错误契约。

##### Media Deal / Netflix 版权广告与 Xandr 视频广告

- 交付 Media Deal 广告创建/编辑、竞价与地域校验，并在 GA 后跨仓库安全下线创建入口、保留编辑链路。

##### 广告推荐（Recommendations）

- 交付受众、视频及原生广告推荐，将动态配置、推荐卡片、素材应用、本地化与测试整合进广告创建和编辑流程。

##### 可访问性、国际化与质量工程 / DRI

- 持续负责 A11y、i18n、测试框架迁移、CI/CD 稳定性与线上 DRI，保障复杂广告 UI 的全球化交付质量。

#### 广告后端项目

- 负责图片资产生命周期治理、Xandr Deal 自动同步、每日批量推荐视频生成及广告曝光/第三方测量服务，覆盖 C#/.NET、WCF/SOAP/Bulk API、Task Engine、SQL Server、Azure Queue 与 Kubernetes。
