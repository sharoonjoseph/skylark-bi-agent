# DECISION LOG

## Monday.com Business Intelligence Agent - Skylark Drones Technical Assignment

This document summarizes the key decisions made while developing the Monday.com Business Intelligence Agent within the six-hour assignment window.

## 1. Key Assumptions

- **Monday.com is the source of truth.** The supplied Deals and Work Orders datasets were imported into Monday.com and are retrieved dynamically through its GraphQL API. The original Excel files are not read or hardcoded at runtime.

- **The integration is read-only.** The agent retrieves business information but does not create, modify, or delete Monday.com records.

- **Active pipeline** consists of deals with Open or On Hold status. This is a prototype assumption because no explicit active-pipeline definition was provided.

- **Missing values are unknown, not zero.** Missing financial values are excluded from relevant aggregations to avoid misleading totals.

- **Data-quality issues remain visible.** Missing values and inconsistent fields are normalized where safe and surfaced as caveats when they affect an answer. Missing business information is never invented.

- **Cross-board analysis is performed only where reliable.** Deals and Work Orders can be compared at aggregate and sector levels; uncertain one-to-one record matches are not presented as facts.

- **AI interprets rather than calculates core metrics.** Business metrics are calculated deterministically in the backend, while Gemini interprets them and produces founder-friendly responses.

## 2. Trade-offs Chosen and Why

### Monday.com GraphQL API instead of MCP

The GraphQL API provided a direct and reliable method for dynamically retrieving both boards. Given the six-hour constraint, I prioritized a complete end-to-end workflow—live retrieval, normalization, analytics, AI interpretation, and deployment—over introducing additional MCP integration complexity.

### Deterministic analytics instead of LLM calculations

Core metrics such as pipeline value, deal counts, sector performance, work-order completion, billing, collections, and receivables are calculated in the Node.js backend. Gemini receives the resulting structured summary for interpretation. This reduces hallucination and arithmetic risk while making calculations reproducible, testable, and easier to explain.

### Reliability over dashboard complexity

I prioritized data integration, normalization, reliable calculations, cross-board context, error handling, and conversational responses over a complex visualization dashboard.

### Conservative handling of messy data

The system normalizes clear formatting and naming inconsistencies but does not infer missing business information. When data is insufficient, the limitation is communicated rather than hidden.

## 3. What I Would Do Differently With More Time

With additional time, I would:

- Add monthly, quarterly, and custom date-range analysis and weighted pipeline calculations.
- Improve Deals-to-Work-Orders matching using stronger identifiers or fuzzy matching.
- Add historical pipeline, billing, collection, and execution trends.
- Make business definitions such as "active pipeline" configurable.
- Add conversation memory, interactive charts, and drill-down analysis.
- Expand data validation and normalization.
- Add automated tests, caching, rate-limit handling, authentication, logging, and monitoring.
- Add exportable leadership reports.

With access to business stakeholders, I would also validate definitions such as active pipeline, completed work order, and other leadership KPIs rather than relying on prototype assumptions.

## 4. Interpretation of "Leadership Updates"

I interpreted a **leadership update** as a concise, decision-oriented executive briefing rather than a raw collection of metrics. It should quickly answer:

1. **What is happening?** — Current state of sales and operations.
2. **Why does it matter?** — Business significance of the metrics.
3. **What requires attention?** — Pipeline, execution, billing, receivable, or data-quality risks.
4. **What should happen next?** — Practical actions leadership may consider.

Therefore, leadership updates are structured as:

- **Executive Summary** — Most important overall observations.
- **Sales / Pipeline** — Pipeline health, sector performance, and opportunities.
- **Operations** — Work-order execution, billing, collections, and receivables.
- **Key Risks** — Important commercial, operational, financial, and data-quality concerns.
- **Recommended Actions** — Practical next steps based on available evidence.

The underlying metrics remain deterministic and traceable to Monday.com data. Gemini converts those metrics into an executive narrative, while recommendations are clearly treated as interpretations rather than additional facts.
