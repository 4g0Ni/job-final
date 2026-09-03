# Job / final 交付说明

## 交付内容

### 1. 双版本简历

- `简历/刘启仁_AI应用与Agent工程_中文简历_UI版.md`
- `简历/刘启仁_AI应用与Agent工程_中文简历_UI版.html`
- `简历/刘启仁_AI应用与Agent工程_中文简历_MT版.md`
- `简历/刘启仁_AI应用与Agent工程_中文简历_MT版.html`

两个版本都以 Commit AI Resolver 作为 AI Agent 核心项目，已暂时移除 adocag-server：

1. **UI 版**完整保留广告 UI 的六个小节，将广告后端项目压缩为一句话；
2. **MT 版**完整保留广告后端的四个小节，将广告 UI 项目压缩为一句话；
3. 两版均保留相同联系方式、教育背景和 Commit AI Resolver，并分别调整岗位标题与个人概述。

### 2. 分类问答库（共 539 题）

| 大类 | 仅问题 | 问题与答案 | 题数 |
|---|---|---|---:|
| UI / 前端 | `问答/UI/UI-问题.md` | `问答/UI/UI-问题与答案.md` | 166 |
| MT / 后端 / 中间层 | `问答/MT/MT-问题.md` | `问答/MT/MT-问题与答案.md` | 112 |
| AI / Agent | `问答/AI/AI-Agent-问题.md` | `问答/AI/AI-Agent-问题与答案.md`（专题入口） | 84 |
| Metrics / 数据 / 统计 | `问答/Metrics/Metrics-问题.md` | `问答/Metrics/Metrics-问题与答案.md` | 132 |
| 系统设计 / 工程化 | `问答/系统设计/系统设计-问题.md` | `问答/系统设计/系统设计-问题与答案.md` | 23 |
| 行为面 / 项目复盘 | `问答/行为面/行为面-问题.md` | `问答/行为面/行为面-问题与答案.md` | 22 |

“仅问题”文件适合闭卷模拟；“问题与答案”适合复盘。AI 问答已按 7 个专题拆分，统一加入关键词、关联题和重写答案，并合并 RRF、Evidence Gate、Eval Harness、MCP 工具化等重复问题。新增题覆盖岗位 JD 高频出现的 Dify、LangGraph、FastAPI/SSE、K8s、LLMOps、多租户、vLLM、微调边界，以及 System Prompt 隔离、Structured Output、版本实验、回滚和可观测性。

### 2.1 AI 知识地图

- `AI知识地图/AI-Agent知识思维导图.md`

思维导图把 LLM、RAG、Agent Runtime、MCP/记忆、Eval/安全/LLMOps、生产工程和项目证据串成一条端到端链路，适合先搭骨架再回到专题题目。

### 3. 面经研究

- `面经研究/面经来源与访问记录.md`
- `面经研究/AI-Agent公开面经研究补充-2026-08-06.md`（完整阅读 7 份 AI 材料，并进一步核验牛客、Anthropic、MCP、OpenAI Function Calling、A2A、OWASP、Google SRE 及相关论文）

本次实际读取牛客公开搜索接口，分别检索：

- AI Agent 面经
- 前端 React 面经
- 后端 / 系统设计面经
- 数据工程 / A/B 面经

报告保存了可访问的牛客帖子标题、公开详情 URL 与摘要，并记录了检索日期。小红书搜索页虽返回 HTTP 200，但动态结果受签名/登录与 IP 风控限制，浏览器错误码为 300012；因此没有伪造无法访问的小红书正文。

### 4. 材料审计与口径风险

- `审计/材料读取清单与口径冲突.md`

已清点并读取四个指定目录中的全部 **22 个文件、492,952 字节**，保存逐文件 SHA-256。审计文件列出姓名、入职时间、岗位包装、提交数量、AI 项目完成度、向量库、部署方式等冲突及处理方式。

## 投递前请本人确认

1. 2022.08 是否为准确入职时间。
2. 如有可公开作品，再增加 GitHub / 作品集；公司内部仓库不要公开。
3. Commit AI Resolver 对外统一为“当前公开离线实现 + 历史内部背景”：当前已完成 27,646 条公开 React Commit 的完整 metadata/路径增强、混合检索、Evidence Gate、75-case 版本化工程回归集，以及 461 条由真实 GitHub Issue → closing PR → corpus fix commit 构成的 RCA gold cases（当前为模型预审版）全量检索 Eval。75-case 中 23-case frozen test 的 Hybrid Recall@10 和 Evidence Gate 行为准确率均为 100%；针对带 Issue 生命周期 metadata 的 461-case 检索实验，采用 `createdAt - 7d → closedAt + 30d` 时间窗和 dev-trained 本地 LTR 后，在 grouped 134-case held-out test 上达到 Recall@10 92.54%、Recall@20 94.78%、MRR@10 0.6887、nDCG@10 0.7462。该结果没有使用 LLM reranker，只适用于 Issue-grounded 离线条件；461 条完成人工复核后再冻结为 release-gate gold。两组指标都不表述为外部盲测或生产效果；在线全链路评测与大规模 ANN benchmark 仍是下一阶段。
4. 对外讲述时不要泄露微软内部客户、账户、路径和未公开数据。

### Commit AI Resolver 统一术语

- **75-case engineering regression set：**程序化/固定样例组成的工程回归集，用来防止已知行为退化。
- **461 RCA gold cases：**来自真实 GitHub Issue → closing PR → corpus fix commit 的完整 gold-case 建设集；当前版本已完成模型预审和全量 retrieval Eval。
- **Issue 时间窗 + 本地 LTR：**仅用于带 `createdAt/closedAt` 的 Issue-grounded 离线检索；时间窗在 dev 上选择，LTR 在 327 dev 内完成 grouped 训练/选型，134 held-out test 只报告结果。不能把该数字外推到任意 text-only 查询。
- **release-gate gold：**461 条中完成人工四项 rubric、切分并冻结后的版本。对外可以把完整 461 条称为 gold cases，但提到当前指标时应保留“模型预审版”这一阶段说明。

## 建议使用顺序

1. 先看新简历与审计文件，统一事实口径。
2. 每天从“仅问题”文件抽题口述，再对照答案。
3. 优先准备 AI 84 题中的岗位高频链路、系统设计 23 题，以及 UI/MT/Metrics 中与目标 JD 最相关的部分。
4. 每个项目准备 60 秒、3 分钟、10 分钟三种版本，并准备一条失败/复盘故事。
