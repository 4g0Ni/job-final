# AI / Agent 仅问题清单（84 题）

## 01｜LLM 与上下文工程（9）

1. **LLM-01** 为什么主流生成式大模型多采用 Decoder-only？
2. **LLM-02** Causal LM、Prefix LM 与 Encoder-Decoder 有什么区别？
3. **LLM-03** RoPE、上下文窗口和“无限长输入”是什么关系？
4. **LLM-04** 长对话怎样做 Context Engineering？
5. **LLM-05** Context Engineering 与 Prompt Engineering 有何区别？
6. **LLM-06** 如何处理结构化输出不稳定？
7. **LLM-07** DPO、PPO、GRPO 的核心差异是什么？
8. **LLM-08** SFT、LoRA/PEFT、偏好对齐与 RAG 应如何选？
9. **LLM-09** 生产系统如何选择和路由模型？

## 02｜RAG 与知识工程（13）

10. **RAG-01** 请讲清一个完整的生产 RAG 链路。
11. **RAG-02** 文档和代码为什么不能只做固定长度分块？
12. **RAG-03** Embedding、向量库和索引参数怎么选？
13. **RAG-04** BM25 与向量检索为什么要混合？
14. **RAG-05** RRF 是什么，为什么常用于多路融合？
15. **RAG-06** Rerank 为什么可能提高质量却拖慢 P95？
16. **RAG-07** HyDE、Multi-query 和 Query Rewrite 如何取舍？
17. **RAG-08** Parent-Child / Small-to-Big Retrieval 是什么？
18. **RAG-09** 为什么 metadata 过滤应尽量前置？
19. **RAG-10** 如何评估 Retriever，而不是只看最终答案？
20. **RAG-11** RAG 如何处理更新、删除、多租户和权限？
21. **RAG-12** GraphRAG / 知识图谱什么时候值得用？
22. **RAG-13** 长查询为何可能让 Dense Retrieval 变差？如何处理？

## 03｜Agent 架构与工具调用（13）

23. **AGENT-01** Chatbot、Workflow、Agent、Multi-Agent 如何区分？
24. **AGENT-02** ReAct 的核心机制是什么？
25. **AGENT-03** Agent Runtime / Harness 应包含哪些组件？
26. **AGENT-04** 一个新工具从定义到执行的完整链路是什么？
27. **AGENT-05** Agent 如何判断是否调用工具？
28. **AGENT-06** 如何设计 Tool / Function Calling 的 schema？
29. **AGENT-07** 工具失败时如何恢复？
30. **AGENT-08** 如何避免无限循环和过度调用工具？
31. **AGENT-09** 规划失败时有哪些回退策略？
32. **AGENT-10** 什么时候该用 LangGraph/状态机，而不是普通函数编排？
33. **AGENT-11** 多 Agent 为什么可能不如单 Agent？什么时候值得用？
34. **AGENT-12** 多 Agent 的状态如何传递？
35. **AGENT-13** 什么时候不该用 Agent？

## 04｜MCP、框架与记忆（9）

36. **MCP-01** MCP 解决什么问题？
37. **MCP-02** MCP 的基本交互和生命周期是什么？
38. **MCP-03** MCP、Tool Calling、Skill 与 CLI 有什么区别？
39. **MCP-04** MCP 工具如何做安全治理？
40. **MCP-05** MCP 与 A2A 有什么区别？
41. **MCP-06** 短期记忆、长期记忆、会话状态与 RAG 有什么关系？
42. **MCP-07** 长期记忆如何写入、读取和防止污染？
43. **MCP-08** LangChain、LangGraph、LlamaIndex、AutoGen、Semantic Kernel 如何选？
44. **MCP-09** Dify / Coze 等低代码 Agent 平台适合什么场景？

## 05｜Eval、可观测、安全与 LLMOps（14）

45. **EVAL-01** Agent Eval 应包含哪些指标？
46. **EVAL-02** LLM-as-Judge 有什么问题？如何提高可信度？
47. **EVAL-03** 如何建立可复现的 Eval Harness？
48. **EVAL-04** Agent trace 应记录什么？
49. **EVAL-05** 如何建立可行动的 Bad Case 分类？
50. **EVAL-06** 离线 Eval 与线上监控如何衔接？
51. **EVAL-07** 门禁或拒答阈值如何标定？
52. **EVAL-08** 如何设计 Agent 的成本与延迟预算？
53. **EVAL-09** 语义缓存怎样做才不会返回错误或越权结果？
54. **EVAL-10** Prompt Injection 如何防？
55. **EVAL-11** 如何防止数据泄露、越权与敏感信息进入模型？
56. **EVAL-12** 模型网关应提供哪些能力？
57. **EVAL-13** Prompt、模型、索引如何做版本、灰度和回滚？
58. **EVAL-14** 如何避免评测数据泄漏和“为了指标调题”？

## 06｜生产工程与部署（10）

59. **ENG-01** Python/FastAPI 的生产服务要注意什么？
60. **ENG-02** SSE、WebSocket 和普通 HTTP 如何选？
61. **ENG-03** 多租户 Agent/RAG 如何隔离？
62. **ENG-04** Agent 工具的副作用、幂等和事务怎样设计？
63. **ENG-05** 自托管模型用 vLLM/TGI 时要关注什么？
64. **ENG-06** 什么时候用微调，什么时候用 RAG 或工具？
65. **ENG-07** 如何对 Prompt/Agent 策略做 A/B 测试？
66. **ENG-08** 怎样设计一个企业级 Agent 平台？
67. **ENG-09** 如何做容量、性能与稳定性设计？
68. **ENG-10** AI 应用如何做测试与发布？

## 07｜Commit AI Resolver 项目深挖（20）

69. **PROJ-01** 请用 60 秒和 3 分钟介绍 Commit AI Resolver。
70. **PROJ-02** adocag-server 是 Agent 还是 Pipeline？
71. **PROJ-03** 为什么选择 OpenAI Agents SDK，而不是 LangGraph 或 CrewAI？
72. **PROJ-04** 如果重做两个 AI 项目，优先改什么？
73. **PROJ-05** Coding Agent 已能用 `rg + git` 搜索，为什么还需要索引 RAG？
74. **PROJ-06** 新增 Commit 是否要每天全量重建向量库？
75. **PROJ-07** 为什么用 JSON 作为事实源、索引作为派生物？
76. **PROJ-08** Direct SHA、metadata、FTS5、dense 和多查询如何分工？
77. **PROJ-09** 为什么用 weighted RRF？评测发现了什么？
78. **PROJ-10** Evidence Gate 为什么放在生成前？如何标定？
79. **PROJ-11** 23-case frozen test 达到 100%，为什么不能说“可靠性已解决”？
80. **PROJ-12** 如何用公开数据建设可信的 RCA 验证集？
81. **PROJ-13** 如何评测完整 Agent？Harness 实际抓到了什么问题？
82. **PROJ-14** Multi-Agent 如何避免循环、过度调用和无证据结论？
83. **PROJ-15** 如何做 grounding、MCP 工具化和下一代架构？
84. **PROJ-16** 新的 Issue 时间窗和本地 LTR 到底如何工作？
85. **PROJ-17** Commit AI Resolver 暴露了哪 6 个 MCP 工具？它们怎样提供给 IDE Agent？
86. **PROJ-18** 为什么 RCA Retrieval 改完以后必须重做 Evidence Gate？
87. **PROJ-19** 为什么现在可以称为真正的 Multi-Agent，而不是把 Workflow 换了名字？
88. **PROJ-20** 真实 RCA 跑出了什么结果？如何评价它的质量、成本和边界？
