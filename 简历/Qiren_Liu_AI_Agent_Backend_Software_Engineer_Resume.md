# Qiren Liu

**AI Agent / Backend Software Engineer**  
Phone: 13382183295 | Email: lqr_ld@163.com

## Professional Summary

Software engineer with 4 years of experience at Microsoft Advertising, focused on AI agents and advertising backend systems. Designed and built an evidence-first multi-agent system for multi-repository change history and regression investigation. An LLM supervisor dynamically delegates retrieval, diff investigation, and evidence critique, while an application harness enforces permissions, budgets, evidence authorization, validation, and fallback. Also delivered backend systems for image asset governance, Deal synchronization, and asynchronous video recommendations, as well as large-scale Campaign UI features.

## Core Skills

- **AI / Agents:** Multi-Agent Orchestration, OpenAI Agents SDK, Agent Harness, Agentic RAG, Hybrid Retrieval, Local LTR, Evidence Grounding, Agent Evaluation, MCP, SSE
- **Backend:** C#, Python, Cosmos DB
- **Frontend:** JavaScript, React, Fluent UI
- **Data and Engineering:** sqlite-vec, Azure Blob/Table Storage, Kubernetes, Kusto/KQL, Azure DevOps CI/CD

## Education

- **University of Electronic Science and Technology of China | M.S., School of Network Engineering** | 2019.09 - 2022.06
- **University of Electronic Science and Technology of China | B.E., School of Information and Communication Engineering** | 2015.09 - 2019.06

## Professional Experience

### Microsoft | Software Engineer, Microsoft Advertising / Microsoft AI
**2022.08 - 2026.08**

#### Core AI Agent Project: Commit AI Resolver | Change History Retrieval and Regression Investigation

**JavaScript / OpenAI Agents SDK / SQLite FTS5 / sqlite-vec / Local LTR / MCP**

- Built the initial control plane as a fixed **Intent -> Retrieval -> Evidence Gate -> Synthesis -> Evaluation** workflow. Before generation, the gate returns SEARCH, ABSTAIN, or ASK_USER; the evaluator permits at most three bounded retrieval retries and uses result-set fingerprints to stop duplicate loops, establishing a regression-testable baseline.
- On top of that baseline, refactored the control plane into four OpenAI Agents SDK roles using the manager and agents-as-tools pattern: Incident Commander, Retrieval, Diff Investigator, and Evidence Critic. Instead of following a fixed sequence, the supervisor uses the query, tool observations, and remaining budget to choose retrieval only, inspect Top-N diffs, invoke an independent critic, clarify, or stop. Independent prompts, tool allowlists, and structured outputs isolate specialist responsibilities and permissions; the original workflow remains a feature-flagged baseline and failure fallback.
- Built internal multi-repository and public reproducible versions. Daily JSON is the auditable source of truth, while SQLite metadata/FTS5 and sqlite-vec are rebuildable indexes. Enriched 27,646 React commits with changed files, affected areas, and complete messages, and versioned the embedding model, 1,024 dimensions, query instructions, document template, and index format as a compatibility contract.
- Implemented Direct SHA + FTS5 + Dense + Multi-query retrieval with structured pre-filters and weighted RRF. Retained channel-level contributions for diagnosis and added issue-lifecycle time windows plus a locally trained learning-to-rank model for issue-grounded RCA.
- Added a deterministic Evidence Gate before generation to return SEARCH, ABSTAIN, or ASK_USER. Designed Gate v2 for the issue-grounded retrieval path to distinguish user filters from inferred lifecycle windows and incorporate four-channel consensus, LTR margin, candidate distribution, and raw diff evidence; v2 remains pending hard-negative and OOD calibration.
- Built a request-local Agent Harness outside the SDK with tool allowlists, a Candidate Ledger, agent/tool/diff/time budgets, deduplication, timeouts, citation and output validation, bounded trajectories, and legacy fallback. Exposed six read-only MCP tools over Streamable HTTP.
- Built a versioned 75-case engineering regression harness and fully evaluated 461 RCA cases derived from real GitHub Issue -> closing PR -> fix commit chains. Issue-lifecycle filtering and a dev-trained local ranker improved Recall@20 from 70.90% to 94.78% on a grouped 134-case held-out test, with explicit limits on generalization and release-gate use.

#### Advertising UI Projects

- Delivered 490+ production merges in the Microsoft Advertising Campaign UI. Reduced P95 latency on key pages by 40%-72% through systematic performance optimization and shipped image asset quality prediction, third-party tracking, Media Deal, and ad recommendation features.

#### Advertising Backend Projects

**C#/.NET / WCF / SOAP / Bulk API / Task Engine / SQL Server / Azure Queue / Cosmos DB/ADLS**

##### Image Asset Lifecycle Governance

- Designed and delivered an end-to-end workflow for identifying, cleaning up, and restoring orphaned image assets, using multi-account stored procedures and a middle-tier Kubernetes CronJob for batch governance.
- Built a WCF email notification service and templates with error handling, failure alerts, and multi-environment configuration.
- Added image validation and functional tests for ad extensions and Smart Pages, resolved false positives, and migrated related capabilities to the middle tier for centralized maintenance.

##### Programmatic Deal Synchronization and Delivery Governance

- Led automated Xandr Deal to MS Deal synchronization from inception, including paginated API ingestion, model mapping and validation, consistent SOAP/Bulk/WCF behavior, targeting constraints, staged market rollout, and safe retirement of the legacy version.

##### Video Recommendation and Creative Generation Pipeline

- Built a configuration-driven daily batch pipeline that selected ads, read mapping data from Cosmos DB/ADLS, and generated recommended videos. Used Azure Queue rate limiting, allow/deny lists, batch degradation, and partial-success handling to protect external generation API calls.
