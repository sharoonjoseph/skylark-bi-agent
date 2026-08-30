# Skylark Drones — Monday.com Business Intelligence Agent

A conversational Business Intelligence agent that dynamically retrieves Deals and Work Orders data from monday.com, handles messy and incomplete business data, calculates key business metrics, and uses Google Gemini to provide founder-level insights.

## Live Prototype

**Frontend (Vercel):**  
https://skylark-bi-agent-tau-black.vercel.app/

**Backend API (Render):**  
https://skylark-bi-agent-97ci.onrender.com

---

## 1. Overview

Founders and executives often need quick answers to business questions such as:

- How is our sales pipeline looking?
- Which sector has the strongest pipeline?
- How are our work orders performing?
- What are the major operational risks?
- What data-quality issues should leadership know about?
- Can you prepare a leadership update?

Answering these questions manually requires collecting information from multiple boards, cleaning inconsistent data, calculating metrics, and interpreting the results.

This project automates that workflow.

The application:

1. Dynamically reads Deals and Work Orders from monday.com.
2. Normalizes inconsistent and missing data.
3. Calculates business metrics in the backend.
4. Sends structured business context to Google Gemini.
5. Returns concise, founder-level insights through a conversational React interface.

The supplied Excel datasets are **not hardcoded into the application**. After being imported, monday.com acts as the live source of business data.

---

## 2. Architecture Overview

```text
                    Founder / Executive
                            │
                            ▼
                 ┌────────────────────┐
                 │       Vercel       │
                 │   React + Vite UI  │
                 │ Conversational BI  │
                 └─────────┬──────────┘
                           │
                           │ HTTPS
                           ▼
                 ┌────────────────────┐
                 │       Render       │
                 │ Node.js + Express  │
                 │      Backend       │
                 └─────────┬──────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
       ┌─────────────────┐    ┌─────────────────┐
       │   monday.com    │    │ Google Gemini   │
       │   GraphQL API   │    │       API       │
       └────────┬────────┘    └────────▲────────┘
                │                      │
         ┌──────┴──────┐               │
         ▼             ▼               │
   ┌───────────┐ ┌─────────────┐       │
   │   Deals   │ │ Work Orders │       │
   │   Board   │ │    Board    │       │
   └─────┬─────┘ └──────┬──────┘       │
         │              │              │
         └──────┬───────┘              │
                ▼                      │
       ┌───────────────────┐           │
       │ Data Normalization│           │
       └─────────┬─────────┘           │
                 ▼                     │
       ┌───────────────────┐           │
       │ Deterministic BI  │           │
       │     Analytics     │───────────┘
       └───────────────────┘
```

### Request Flow

```text
Founder Question
       ↓
React Frontend
       ↓
Express Backend
       ↓
Read Live monday.com Data
       ↓
Normalize Messy Data
       ↓
Calculate Business Metrics
       ↓
Provide Structured Context to Gemini
       ↓
Founder-Level Response
```

---

## 3. Key Architecture Decision

The application separates **business calculations** from **AI interpretation**.

Core metrics are calculated deterministically in JavaScript rather than asking the language model to calculate them directly.

Examples include:

- Pipeline value
- Active deal count
- Pipeline by sector
- Work-order completion rate
- Total order value
- Total billed value
- Total collected amount
- Total receivables
- Data-quality counts

Google Gemini is then used for:

- Understanding founder-level questions
- Interpreting calculated metrics
- Explaining business context
- Highlighting risks
- Communicating data-quality caveats
- Generating leadership-friendly summaries

This design reduces hallucination risk and makes numerical results easier to verify and explain.

---

## 4. Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- Axios

### AI

- Google Gemini API
- `@google/genai`

### Business Data Integration

- monday.com
- monday.com GraphQL API

### Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Data Source:** monday.com
- **AI Provider:** Google Gemini

---

# 5. monday.com Configuration

## Step 1 — Create the Boards

Create two separate boards in monday.com:

```text
Deals
Work Orders
```

---

## Step 2 — Import Deals Data

Import:

```text
Deal funnel Data.xlsx
```

into the **Deals** board.

Use:

```text
Deal Name
```

as the primary item column.

The remaining spreadsheet fields are imported as monday.com columns.

Important fields include:

- Deal Name
- Owner Code
- Client Code
- Deal Status
- Close Date
- Closure Probability
- Masked Deal Value
- Tentative Close Date
- Deal Stage
- Product
- Sector / Service
- Created Date

---

## Step 3 — Import Work Orders Data

Import:

```text
Work_Order_Tracker Data.xlsx
```

into the **Work Orders** board.

Use:

```text
Deal name masked
```

as the primary item column.

Important fields include:

- Deal Name
- Customer Code
- Nature of Work
- Execution Status
- PO / LOI Date
- Probable Start Date
- Probable End Date
- Sector
- Order Value
- Billed Value
- Collected Amount
- Receivable Amount
- Billing Status

After the import, monday.com becomes the application's source of truth.

The application does not read business data from hardcoded CSV/XLSX files.

---

## Step 4 — Obtain a monday.com API Token

In monday.com, navigate to:

```text
Profile
   ↓
Developers
   ↓
API / Personal Token
   ↓
Generate or Copy Token
```

The token is used only by the backend to authenticate with the monday.com GraphQL API.

Never place the token directly inside the source code.

---

## Step 5 — Find the Board IDs

The backend requires the IDs of both boards.

From the backend directory:

```bash
cd backend
```

Load the environment variables:

```bash
set -a
source .env
set +a
```

Query monday.com:

```bash
curl -X POST https://api.monday.com/v2 \
-H "Authorization: $MONDAY_API_TOKEN" \
-H "Content-Type: application/json" \
-d '{"query":"query { boards { id name } }"}'
```

The response will contain entries similar to:

```json
{
  "id": "YOUR_DEALS_BOARD_ID",
  "name": "Deals"
},
{
  "id": "YOUR_WORK_ORDERS_BOARD_ID",
  "name": "Work Orders"
}
```

Copy the corresponding IDs and store them as environment variables.

---

## Step 6 — Configure Backend Environment Variables

Create:

```text
backend/.env
```

Add:

```env
PORT=5000

MONDAY_API_TOKEN=your_monday_api_token

DEALS_BOARD_ID=your_deals_board_id
WORK_ORDERS_BOARD_ID=your_work_orders_board_id

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
```

Do not commit this file to GitHub.

---

## Step 7 — Test monday.com Authentication

Load the environment variables:

```bash
set -a
source .env
set +a
```

Run:

```bash
curl -X POST https://api.monday.com/v2 \
-H "Authorization: $MONDAY_API_TOKEN" \
-H "Content-Type: application/json" \
-d '{"query":"query { me { id name } }"}'
```

A successful response confirms that the monday.com API connection is working.

---

## Step 8 — Test Live Board Data

Start the backend:

```bash
npm run dev
```

Then test:

```bash
curl http://localhost:5000/api/summary
```

The endpoint retrieves live information from:

```text
Deals
   +
Work Orders
   ↓
monday.com GraphQL API
   ↓
Normalization
   ↓
Business Analytics
```

---

# 6. Data Resilience and Normalization

The supplied datasets contain real-world messy and incomplete data.

Before analytics are calculated, monday.com records pass through a normalization layer.

The system handles:

- Missing/null values
- Empty strings
- `NA`, `N/A`, and similar representations
- Numeric values stored as text
- Currency symbols
- Comma-separated monetary values
- Inconsistent sector names
- Missing deal values
- Missing closure probabilities
- Missing billing information
- Missing sector information

For example, variations such as:

```text
renewable
Renewables
RENEWABLES
```

can be normalized into a common representation:

```text
Renewables
```

### Missing Financial Data

A missing monetary value is treated as **unknown**, not automatically as zero.

This prevents incomplete records from silently producing misleading financial conclusions.

Data-quality issues are also communicated to the AI layer so they can be mentioned as caveats in relevant answers.

---

# 7. Business Intelligence Analytics

The backend calculates business metrics programmatically.

## Deals Analytics

The application can calculate:

- Total deals
- Active deals
- Pipeline value
- Deal status distribution
- Pipeline by sector
- Missing deal-value count
- Missing closure-probability count
- Missing sector count

For this prototype, deals classified as `Open` or `On Hold` are treated as part of the active pipeline.

This is an explicit implementation assumption.

---

## Work Orders Analytics

The application can calculate:

- Total work orders
- Completed work orders
- Completion rate
- Total order value
- Total billed value
- Total collected amount
- Total receivable amount
- Execution-status distribution
- Work orders by sector
- Missing financial information
- Missing billing information

---

## Cross-Board Analysis

Both boards can be used together to provide broader business context.

For example:

```text
Compare sales pipeline and execution across sectors.
```

The agent can combine sales information from **Deals** with operational information from **Work Orders** to produce a leadership-level response.

---

# 8. Gemini Integration

Google Gemini provides the conversational intelligence layer.

SDK:

```text
@google/genai
```

The processing flow is:

```text
Live monday.com Data
        ↓
Normalization
        ↓
Deterministic BI Calculations
        ↓
Structured Business Summary
        ↓
Google Gemini
        ↓
Executive-Friendly Response
```

Gemini is instructed to:

- Use the supplied business data
- Avoid inventing numbers
- Clearly identify unavailable information
- Mention important data-quality caveats
- Provide business context rather than only raw values
- Ask a concise clarifying question when required
- Distinguish facts from interpretation
- Generate leadership-friendly summaries

---

# 9. Conversational Interface

The React frontend provides a conversational interface for founder-level questions.

Example questions include:

```text
How is our pipeline looking?
```

```text
Which sector has the strongest pipeline?
```

```text
How are our work orders performing?
```

```text
Compare pipeline and execution across sectors.
```

```text
What data quality issues should leadership know about?
```

```text
Prepare a leadership update.
```

---

# 10. Leadership Updates

The optional **leadership updates** requirement is interpreted as an executive-ready briefing generated from current business data.

When requested, the agent structures the response around:

### Executive Summary

A concise overview of the current business situation.

### Sales / Pipeline

Important pipeline metrics, opportunities and sector performance.

### Operations

Work-order execution, billing, collections and operational performance.

### Risks

Important issues such as:

- Missing data
- Pipeline concentration
- Execution concerns
- Billing issues
- Receivable exposure

### Recommended Actions

Practical actions leadership may consider based on the available data.

---

# 11. Error Handling

The backend gracefully handles:

- monday.com authentication failures
- monday.com API failures
- Missing board configuration
- Gemini API failures
- Empty user questions
- Missing financial information
- Missing sector information
- Incomplete business records

The application returns understandable error messages rather than silently failing.

---

# 12. Project Structure

```text
skylark-bi-agent/
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   │
│   │   ├── services/
│   │   │   ├── mondayService.js
│   │   │   └── geminiService.js
│   │   │
│   │   ├── analytics/
│   │   │   └── businessAnalytics.js
│   │   │
│   │   └── utils/
│   │       └── normalize.js
│   │
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── .env
│
├── README.md
├── DECISION_LOG.md
└── .gitignore
```

---

# 13. Local Setup

## Prerequisites

The following tools are required:

- Node.js
- npm
- Git

Verify installation:

```bash
node -v
npm -v
git --version
```

---

## Backend

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create and configure:

```text
.env
```

using:

```env
PORT=5000
MONDAY_API_TOKEN=your_monday_api_token
DEALS_BOARD_ID=your_deals_board_id
WORK_ORDERS_BOARD_ID=your_work_orders_board_id
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
```

Run:

```bash
npm run dev
```

The backend runs locally at:

```text
http://localhost:5000
```

---

## Frontend

Open another terminal.

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
.env
```

with:

```env
VITE_API_URL=http://localhost:5000
```

Start:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

# 14. API Endpoints

## Health Check

```http
GET /
```

Used to verify that the backend is running.

---

## Business Summary

```http
GET /api/summary
```

Retrieves live monday.com data and returns calculated business metrics.

---

## Conversational BI

```http
POST /api/chat
```

Example request:

```json
{
  "question": "How is our pipeline looking?"
}
```

The backend retrieves the latest monday.com data, calculates the business metrics and uses Gemini to generate the response.

---

# 15. Deployment Architecture

The production application uses separate frontend and backend deployments.

```text
                 User / Founder
                       │
                       ▼
              ┌─────────────────┐
              │     Vercel      │
              │ React Frontend  │
              └────────┬────────┘
                       │
                       │ HTTPS
                       ▼
              ┌─────────────────┐
              │     Render      │
              │ Express Backend │
              └────────┬────────┘
                       │
                 ┌─────┴─────┐
                 ▼           ▼
            monday.com     Gemini
            GraphQL API      API
                 │
           ┌─────┴─────┐
           ▼           ▼
         Deals     Work Orders
```

## Frontend — Vercel

Production URL:

```text
https://skylark-bi-agent-tau-black.vercel.app/
```

The Vercel frontend is configured with:

```env
VITE_API_URL=https://skylark-bi-agent-97ci.onrender.com
```

---

## Backend — Render

Production API:

```text
https://skylark-bi-agent-97ci.onrender.com
```

Render stores the backend environment variables:

```env
MONDAY_API_TOKEN=your_monday_api_token
DEALS_BOARD_ID=your_deals_board_id
WORK_ORDERS_BOARD_ID=your_work_orders_board_id
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
```

The real credentials are configured securely in Render and are not included in the repository.

---

# 16. Security

Sensitive credentials are never intentionally exposed to the frontend or committed to the repository.

These include:

- monday.com API token
- Gemini API key

The `.gitignore` excludes:

```text
node_modules
backend/node_modules
frontend/node_modules

backend/.env
frontend/.env

frontend/dist
.DS_Store
```

Anyone running the project locally must provide their own credentials through environment variables.

---

# 17. Key Assumptions

1. monday.com is the source of truth after spreadsheet import.
2. The monday.com integration is read-only.
3. `Open` and `On Hold` deals are considered part of the active pipeline in the prototype.
4. Missing monetary values are excluded from financial aggregations rather than interpreted as zero.
5. Missing sector information is represented as `Unknown`.
6. Core business metrics are calculated deterministically in JavaScript.
7. Gemini is used primarily for conversational interpretation and executive presentation.

---

# 18. Key Trade-offs

## monday.com API Instead of MCP

The monday.com GraphQL API was selected because it provides a direct, lightweight and explainable read-only integration.

Given the six-hour prototype constraint, this reduced infrastructure complexity while satisfying the dynamic monday.com integration requirement.

## Deterministic Analytics Instead of LLM Calculations

Core business metrics are calculated in JavaScript before being provided to Gemini.

This provides:

- Better numerical consistency
- Lower hallucination risk
- Easier debugging
- Easier validation
- Better explainability

## Functionality Over Dashboard Complexity

Development effort was prioritized toward:

1. Live monday.com integration
2. Data resilience
3. Correct business analytics
4. Cross-board analysis
5. Conversational interaction
6. Error handling

rather than building a complex visualization dashboard.

---

# 19. Future Improvements

With additional development time, I would add:

- More robust quarter and date filtering
- Weighted pipeline calculations
- Configurable business definitions
- Fuzzy matching between Deals and Work Orders
- Improved sector normalization
- Historical trend analysis
- Interactive charts
- Conversation memory
- Gemini function/tool calling
- Streaming responses
- Automated unit tests
- Integration tests
- API caching
- Rate-limit handling
- Authentication
- Structured logging and monitoring
- Exportable leadership reports

---

# 20. Assignment Coverage

| Requirement | Implementation |
|---|---|
| monday.com integration | GraphQL API |
| Read Deals board | Implemented |
| Read Work Orders board | Implemented |
| Dynamic data access | Live monday.com API queries |
| Missing/null handling | Normalization layer |
| Inconsistent data handling | Normalization layer |
| Founder-level questions | Gemini conversational layer |
| Pipeline analytics | Backend analytics |
| Sector analysis | Backend analytics |
| Operational metrics | Work Orders analytics |
| Cross-board analysis | Combined business context |
| Data-quality caveats | Data-quality reporting |
| Error handling | Express backend |
| Leadership updates | Executive briefing format |
| Conversational interface | React frontend |
| Hosted prototype | Vercel + Render |
| README | Included |
| Decision Log | `DECISION_LOG.md` |

---

# 21. AI Usage During Development

AI tools were used as development aids for:

- Architecture exploration
- Coding assistance
- Debugging
- Documentation
- Reviewing implementation decisions

The implementation and architectural decisions were reviewed and understood before submission.

---

# Live Application

**Frontend:**  
https://skylark-bi-agent-tau-black.vercel.app/

**Backend:**  
https://skylark-bi-agent-97ci.onrender.com
