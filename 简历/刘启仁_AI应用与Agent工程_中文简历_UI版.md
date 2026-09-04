# 刘启仁（Qiren Liu）

**AI Agent / 前端软件工程师**  
电话：13382183295｜邮箱：lqr_ld@163.com

## 个人概述

4 年微软 Microsoft Advertising 软件工程经验，工作主线覆盖 **AI Agent 与大型广告 UI**。设计并实现面向多仓库历史变更与回归调查的 evidence-first 多 Agent 系统，由 LLM Supervisor 动态委派检索、Diff 调查和证据审查，外围 Harness 负责权限、预算、证据授权、校验与回退；同时在 Campaign UI 中长期负责性能、素材、监测、Deal、推荐与质量工程，并拥有广告后端项目的完整协作与交付经验。

## 核心技能

- **AI / Agent：** Multi-Agent Orchestration、OpenAI Agents SDK、Agent Harness、Agentic RAG、混合检索、本地 LTR、Evidence Grounding、Agent Eval、MCP、SSE
- **前端：** JavaScript、React、Fluent UI
- **后端：** C#、Python、Cosmos
- **存储与工程化：** sqlite-vec、Azure Blob/Table、Kubernetes、Kusto/KQL、Azure DevOps CI/CD

## 教育背景

- **电子科技大学｜硕士，网络工程学院**｜2019.09 – 2022.06
- **电子科技大学｜本科，信息与通信工程学院**｜2015.09 – 2019.06

## 工作经历

### Microsoft｜软件工程师，Microsoft Advertising / Microsoft AI
**2022.08 – 2026.08**

#### AI Agent 核心项目：Commit AI Resolver｜历史变更检索与回归调查 Agent

**JavaScript / OpenAI Agents SDK / SQLite FTS5 / sqlite-vec / Local LTR / MCP**

- 先以普通函数落地固定 **Intent → Retrieval → Evidence Gate → Synthesis → Evaluation** workflow；Gate 在生成前决定 SEARCH / ABSTAIN / ASK_USER，Evaluator 最多驱动 3 轮有界重检索，并以 result-set fingerprint 阻断重复结果，形成可回归 baseline。
- 在此基础上以 OpenAI Agents SDK 的 manager/agents-as-tools 模式重构为 **Incident Commander、Retrieval、Diff Investigator、Evidence Critic** 四类 Agent；相较固定顺序，Supervisor 可依据查询、工具 Observation 与剩余预算，动态选择只检索、读取 Top-N Diff、调用独立 Critic、澄清或停止，Specialist 以独立 prompt、tool allowlist 与结构化输出隔离职责和权限；旧 workflow 保留为 feature-flag baseline 与故障回退。
- 构建内部多仓库版本与外部公开复现版本：以 daily JSON 为可审计 source of truth，以 SQLite metadata/FTS5 与 sqlite-vec 为可重建派生索引；公开版本对 27,646 条 React Commit 补齐 changed files、affected areas 与完整 message，并将 embedding 模型、1024 维度、query instruction、文档模板与索引版本纳入一致性契约。
- 将检索拆成通用查询与 Issue-grounded RCA 两条路径：通用查询保留 **Direct SHA + FTS5 + Dense + Multi-query + weighted RRF**；RCA 路径仅使用 Issue 生命周期 metadata 做 `createdAt - 7d → closedAt + 30d` SQL pre-filter，再合并 raw/compact × Dense/Lexical 四路 Top-100 候选，并以 35 个可解释特征的本地 LTR 重排。
- 在生成前加入确定性 Evidence Gate，输出 SEARCH / ABSTAIN / ASK_USER；随 RCA 检索升级完成 Gate v2 设计，区分用户显式过滤与系统推导时间窗，新增四路共识、LTR top-1/margin、候选分布和 Diff 证据，避免生命周期日期被误当成用户强约束而自动放行。v1 已在通用链路运行，v2 待用 hard negative/OOD 数据校准后接入。
- 在 SDK 外实现 request-local **Agent Harness**：工具白名单、Candidate Ledger、Agent/Tool/Diff/时间预算、调用去重与超时、引用/输出校验、bounded trajectory 和 legacy fallback；通过 Streamable HTTP 暴露 6 个 MCP 工具。
- 建立 75-case 版本化工程回归 Harness，并基于真实 GitHub Issue → closing PR → fix commit 构建、全量评测 461 条 RCA gold cases（模型预审版）；通过 Issue 生命周期时间窗与 dev-trained 本地 LTR，将 grouped 134-case held-out test 的 Recall@20 从 70.90% 提升至 94.78%，并保留逐 case trace、人工复核与 release-gate 边界。

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

- 负责图片资产生命周期治理、Xandr Deal 自动同步及每日批量推荐视频生成，覆盖 C#/.NET、WCF/SOAP/Bulk API、Task Engine、SQL Server、Azure Queue 与 Kubernetes。
