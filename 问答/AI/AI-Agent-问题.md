# AI / Agent 问题

> 仅含问题，用于闭卷练习；对应答案见同目录“问题与答案”文件。

## A. LLM 与上下文基础

- [ ] 1. 为什么主流生成式大模型多采用 Decoder-only？

- [ ] 2. Prefix LM 与 Causal LM 有什么区别？

- [ ] 3. RoPE、上下文长度与“无限长输入”是什么关系？

- [ ] 4. DPO、PPO、GRPO 的核心差异？

- [ ] 5. 如何处理模型结构化输出不稳定？

- [ ] 6. Context Engineering 与 Prompt Engineering 有何区别？

## B. Agent 架构、规划与工具

- [ ] 7. Chatbot、Workflow、Agent、Multi-Agent 如何区分？

- [ ] 8. ReAct 的核心机制是什么？

- [ ] 9. Agent Harness 是什么？

- [ ] 10. 一个新工具从定义到执行的完整链路？

- [ ] 11. Agent 如何判断是否调用工具？

- [ ] 12. 工具失败如何恢复？

- [ ] 13. 如何避免无限循环和过度调用工具？

- [ ] 14. 规划失败如何回退？

- [ ] 15. 什么时候不该用 Agent？

## C. RAG 与检索

- [ ] 16. 讲清一个完整 RAG 链路。

- [ ] 17. 代码 RAG 为什么不能只做固定长度分块？

- [ ] 18. BM25 与向量检索如何融合？

- [ ] 19. Rerank 为什么提高质量却可能拖慢 P95？如何优化？

- [ ] 20. HyDE 的原理与风险？

- [ ] 21. Small-to-Big / Parent-Child Retrieval 是什么？

- [ ] 22. 如何评估检索而不是只评估最终回答？

- [ ] 23. RAG 如何处理实时更新、删除与权限？

## D. MCP、多 Agent 与记忆

- [ ] 24. MCP 解决什么问题？

- [ ] 25. MCP 的基本交互是什么？

- [ ] 26. MCP、Tool Calling、Skill、CLI 有什么区别？

- [ ] 27. MCP 与 A2A 有什么区别？

- [ ] 28. 多 Agent 为什么可能不如单 Agent？

- [ ] 29. 多 Agent 状态如何传递？

- [ ] 30. 短期记忆、长期记忆和 RAG 的关系？

## E. 评测、可观测性与安全

- [ ] 31. Agent Eval 应包含哪些指标？

- [ ] 32. LLM-as-Judge 有什么问题？如何提高可信度？

- [ ] 33. 如何建立可复现 Eval Harness？

- [ ] 34. Agent trace 应记录什么？

- [ ] 35. Prompt Injection 如何防？

- [ ] 36. 如何设计 Agent 的成本与延迟预算？

## F. 结合公司 AI Agent 项目的高频追问

- [ ] 37. 3 分钟讲 `commit-ai-resolver`。

- [ ] 38. `adocag-server` 是 Agent 还是 Pipeline？

- [ ] 39. 为什么 `commit-ai-resolver` 不直接用 LangGraph/CrewAI？

- [ ] 40. 如果重做两个 AI 项目，优先改什么？

- [ ] 41. Codex / Claude Code 已经能用 `rg + git` 做 agentic search，为什么还需要 BM25 + 向量检索 + RRF？

- [ ] 42. 新增 Commit 后需要每天重新生成向量数据库吗？如何平衡成本？

- [ ] 43. 向量检索总能返回 Top-K，为什么还需要 Evidence Gate？

- [ ] 44. Evidence Gate 的阈值如何标定，并避免在测试集上过拟合？

- [ ] 45. frozen test 指标达到 100%，为什么不能说系统已经解决了 RAG 可靠性？

- [ ] 46. 无法继续使用公司内部 case 时，如何重新生成可信的验证集？

- [ ] 47. 如何评测完整 Agent，而不只评 Retriever？

- [ ] 48. Eval Harness 实际发现了哪些问题？如何证明它不是“为了展示而写的测试”？

## G. Commit AI Resolver 亮点拆解：是什么、为什么、怎么做

- [ ] 49. 亮点一：evidence-first 历史变更调查系统是什么？为什么这样定位？怎么实现？

- [ ] 50. 亮点二：可审计 source of truth 与可重建索引是什么？为什么需要？怎么实现？

- [ ] 51. 亮点三：Direct SHA、metadata、FTS5、dense 多路召回是什么？为什么不能只用向量检索？怎么实现？

- [ ] 52. 亮点四：weighted RRF 是什么？为什么选它？怎么实现和诊断？

- [ ] 53. 亮点五：Evidence Gate 是什么？为什么放在生成前？怎么标定与执行？

- [ ] 54. 亮点六：有界 Agent 编排是什么？为什么不做无限自主搜索？怎么处理重试停滞？

- [ ] 55. 亮点七：答案 grounding 与引用校验是什么？为什么只评语言质量不够？怎么做？

- [ ] 56. 亮点八：分层 Eval Harness 是什么？为什么要分层？怎么防止漂亮指标误导？

- [ ] 57. 亮点九：MCP 工具化是什么？为什么不是只做一个聊天 UI？怎么复用同一检索能力？

- [ ] 58. 亮点十：如何把 RAG/RRF 与 `rg + git` agentic search 组合成下一代架构？

## 参考
