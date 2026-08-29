# 🔍 VendorLens AI

> AI-powered vendor proposal analysis — Upload PDFs → Extract → Score → Compare

---

## ⚡ Quick Start (5 minutes)

### Step 1 — Set up API keys
```bash
cp .env.example .env
# Edit .env and fill in your keys:
#   GROQ_API_KEY     → https://console.groq.com (FREE)
#   GEMINI_API_KEY   → https://aistudio.google.com (FREE)
#   SUPABASE_URL     → Your Supabase project URL
#   SUPABASE_KEY     → Your Supabase anon key
```

### Step 2 — Set up Supabase Database
1. Go to [supabase.com](https://supabase.com) → Your Project → SQL Editor
2. Paste the entire contents of `supabase_schema.sql` and click **Run**

### Step 3 — Start the Backend
```bash
pip install -r requirements.txt
uvicorn main:app --reload
# → Running at http://localhost:8000
```

### Step 4 — Start the Frontend
```bash
cd frontend
npm install
npm run dev
# → Running at http://localhost:5173
```

### Step 5 — Generate Demo PDFs
```bash
pip install reportlab
python demo_pdfs/create_demos.py
# → Creates techsolve_inc.pdf, globalsys_ltd.pdf, quickbuild_co.pdf
```

---

## 🏗 Project Structure

```
VendorLens/
├── main.py                     ← FastAPI app (5 endpoints)
├── requirements.txt
├── .env.example                ← Copy to .env and fill keys
├── supabase_schema.sql         ← Run this in Supabase SQL Editor
│
├── agents/
│   ├── extractor.py            ← Groq LLM extraction (llama-3.3-70b)
│   ├── validator.py            ← Missing field recovery
│   ├── scorer.py               ← Deterministic scoring (cost/SLA/features/speed)
│   └── risk_analyzer.py        ← Rule-based risk engine
│
├── services/
│   └── supabase_client.py      ← All DB operations
│
├── utils/
│   └── pdf_parser.py           ← PyMuPDF smart page extraction
│
├── models/
│   └── schemas.py              ← Pydantic models
│
├── demo_pdfs/
│   └── create_demos.py         ← Generates 3 realistic vendor PDFs
│
└── frontend/                   ← React + Vite TypeScript app
    ├── src/
    │   ├── api.ts              ← All fetch() wrappers
    │   ├── App.tsx             ← Router + sidebar layout
    │   ├── index.css           ← Complete design system
    │   ├── pages/
    │   │   ├── Dashboard.tsx   ← Main comparison view
    │   │   ├── Upload.tsx      ← PDF upload with drag-drop
    │   │   └── Requirements.tsx ← Procurement requirements form
    │   └── components/
    │       ├── Sidebar.tsx
    │       ├── VendorCard.tsx
    │       ├── ScoreBar.tsx
    │       ├── RiskPanel.tsx
    │       └── Toast.tsx
    └── vite.config.ts          ← Dev proxy to localhost:8000
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload vendor PDF, extract & save |
| `GET`  | `/api/compare` | Fetch all vendors, scored & ranked |
| `POST` | `/api/requirements` | Save procurement requirements |
| `GET`  | `/api/requirements/{session_id}` | Fetch saved requirements |
| `DELETE` | `/api/proposals/{id}` | Delete a proposal |
| `GET`  | `/` | Health check |

---

## 🎭 Demo Vendors

| Vendor | Cost | SLA | Weeks | Features | Key Risk |
|--------|------|-----|-------|----------|----------|
| **TechSolve Inc** ⭐ | $52K | 99.9% | 8 | 9/10 | No penalty clause (MEDIUM) |
| **GlobalSys Ltd** | $88K | 99.99% | 14 | 10/10 | Cost outlier (MEDIUM) |
| **QuickBuild Co** | $38K | ❌ None | 5 | 6/10 | No SLA stated (HIGH) |

---

## 📊 Scoring Formula

| Category | Weight | Formula |
|----------|--------|---------|
| Cost | 40% | `(min_cost / vendor_cost) × 40` |
| SLA Uptime | 30% | `(vendor_sla / max_sla) × 30` |
| Features | 20% | `(features_included / 10) × 20` |
| Speed | 10% | `(min_weeks / vendor_weeks) × 10` |

---

## 🚀 Deploy to Render

See [DEPLOY.md](./DEPLOY.md) for full instructions.

**TL;DR:**
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add all 4 env vars in Render dashboard
