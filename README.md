# 🏛️ Smart Legal Metrology Package Compliance System

> **SIH26034** — Automated Package Label Compliance Inspection & Statutory Enforcement Platform under the Legal Metrology Act, 2009 and Legal Metrology (Packaged Commodities) Rules, 2011.

[![Status](https://img.shields.io/badge/Status-Active%20Production-emerald)](/)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini%20Vision-blue)](/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20(Python%203.10+)-009688)](/)
[![Database](https://img.shields.io/badge/Database-MySQL%208.0+%20(ACID)-orange)](/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20+%20Vite-61DAFB)](/)
[![License](https://img.shields.io/badge/License-Government%20of%20India%20--%20SIH26034-indigo)](/)

---

## 🎯 Problem Statement

Under the **Legal Metrology (Packaged Commodities) Rules, 2011**, all pre-packaged commodities distributed and sold in India must display mandatory statutory declarations (MRP with tax clause, Net Quantity in SI units, complete Manufacturer/Packer address, Date of Packing/Manufacturing, Unit Sale Price, and Consumer Care helpline).

Manual inspection by Legal Metrology Officers presents significant bottlenecks:
- ⏱️ **Time-Intensive** — Field officers manually verify fine-print declarations across thousands of retail products.
- ❌ **Human Error & Inconsistency** — Subjective interpretations in verifying statutory schedules, unit conversions, and date expirations.
- 📋 **Cumbersome Notice Issuance** — Drafting official Form-1 statutory violation notices manually delays legal enforcement.

### 💡 Our Solution
An end-to-end, automated legal compliance platform operating on a clear foundational architecture:
> **Core Architectural Principle:**  
> **AI Extracts & Interprets. Deterministic Rule Engine Makes Legal Compliance Decisions.**

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React 18 + Vite)                       │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Dashboard │  │     New      │  │   Results    │  │  Admin Panel   │ │
│  │ Analytics │  │  Inspection  │  │  Assessment  │  │  Officer RBAC  │ │
│  └─────┬─────┘  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘ │
│        │               │                 │                  │          │
│  ┌─────┴───────────────┴─────────────────┴──────────────────┴────────┐ │
│  │                    API Client Layer (api.js)                      │ │
│  └─────────────────────────────────┬─────────────────────────────────┘ │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ HTTP REST API (Port 8000)
┌────────────────────────────────────┼───────────────────────────────────┐
│                       BACKEND (FastAPI + Python)                       │
│  ┌─────────────────────────────────┴─────────────────────────────────┐ │
│  │                         FastAPI Routers                           │ │
│  │   /api/inspection/*       /api/auth/*        /api/copilot/*       │ │
│  └─────┬───────────────────────────┬─────────────────────────┬───────┘ │
│        │                           │                         │         │
│  ┌─────┴──────────────────┐  ┌─────┴───────────────┐  ┌──────┴───────┐ │
│  │  Deterministic Rule    │  │ Authentication &    │  │  LM-Copilot  │ │
│  │  Engine (12 Rules)     │  │ Role-Based Access   │  │  AI Assistant│ │
│  │  LM-001 to LM-012      │  │ (SHA-256 Auth)      │  │  (Gemini AI) │ │
│  └─────┬──────────────────┘  └─────┬───────────────┘  └──────────────┘ │
│        │                           │                                   │
│  ┌─────┴──────────────────┐  ┌─────┴─────────────────────────────────┐ │
│  │  Google Gemini Vision  │  │  Dedicated MySQL Database Persistence │ │
│  │  Extraction Engine     │  │  Host: localhost:3306 (ACID Storage)  │ │
│  │  (ai_service.py)       │  │  Database: legal_metrology            │ │
│  └────────────────────────┘  └───────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚖️ 12-Rule Statutory Compliance Engine

All compliance verdicts (`PASS`, `FAIL`, `REVIEW`, `NOT_APPLICABLE`) are determined strictly by deterministic mathematical and legal rule functions:

| Rule ID | Statutory Requirement | Statutory Reference | Verification Scope |
|---|---|---|---|
| **LM-001** | Manufacturer / Packer / Importer Name & Address | Rule 6(1)(a) | Verifies complete name and operational postal address with PIN code. |
| **LM-002** | Country of Origin Declaration | Rule 6(1)(aa) | Mandatory origin declaration for imported commodities; verified against domestic markers. |
| **LM-003** | Generic / Common Commodity Identity | Rule 6(1)(b) | Verifies common commodity name distinct from proprietary brand name. |
| **LM-004** | Net Quantity in SI Units | Rule 6(1)(c) & Rule 5 | Strict SI unit checking (`g`, `kg`, `ml`, `l`, `n`). Flags non-standard units (oz, lbs). |
| **LM-005** | Month & Year of Manufacture / Packing | Rule 6(1)(d) | Validates manufacturing or packing timeline (`MM/YYYY` or `pkd` / `mfg` abbreviations). |
| **LM-006** | Best Before / Use By Expiry Period | Rule 6(1)(e) | Computes end-of-month expiry and relative durations against the current inspection date. |
| **LM-007** | Maximum Retail Price (MRP in ₹) | Rule 6(1)(f) | Conspicuous retail price declared in Indian Rupees (₹). |
| **LM-008** | Tax-Inclusive Wording Clause | Rule 6(1)(f) | Mandates *"Inclusive of all taxes"* or statutory equivalent alongside MRP. |
| **LM-009** | Consumer Care Helpline & Redressal Cell | Rule 6(1)(g) | Name, address, telephone/helpline number, and email of grievance redressal officer. |
| **LM-010** | Sectoral Registration (FSSAI / BIS / CDSCO) | FSSAI 2006 / BIS 2016 | 14-digit FSSAI license for food; BIS/ISI marks for electronics & appliances. |
| **LM-011** | Principal Display Panel (PDP) Legibility & Font Size | Rule 7, PCR 2011 | Checks contrast adequacy, non-deceptive formatting, and prominent declaration height. |
| **LM-012** | Mandatory Unit Sale Price (USP) | 2021 Amendment Rules | Declares price per gram (₹/g), per ml (₹/ml), or per unit (₹/N) for packages >1g/1ml/1N. |

---

## ✨ Key Platform Features

### 1. 🤖 Multimodal AI Label Extraction
* High-accuracy Google Gemini vision extraction extracts raw declarations into structured Pydantic schemas.
* Verbatim raw evidence capturing ties every extracted field directly back to visible label text.

### 2. 🗄️ Dedicated MySQL Relational Persistence
* Enterprise-grade persistence on MySQL 8.0+ with full ACID guarantees.
* Isolated per-officer inspection history, immutable audit logs (`audit_logs`), and user credential store (`officers`).
* Real-time database telemetry exposed in the Settings console.

### 3. 📜 Statutory Form-1 Violation Notice Generator
* Automated issuance of statutory enforcement notices under Rule 27(1).
* Pre-formatted legal citations, manufacturer addressee, identified non-compliant clauses, and statutory 14-day response directives.
* Print and PDF export ready.

### 4. 🧠 LM-Copilot AI Legal Assistant
* Intelligent Legal Metrology assistant powered by Google Gemini API.
* Domain-guarded against off-topic queries; specializes in the Legal Metrology Act 2009, 2011 Rules, and 2021 USP amendments.
* Provides authoritative statutory section citations and actionable guidance for field officers.

### 5. 👥 Role-Based Access Control (RBAC) & Admin Portal
* **Three distinct privilege roles**:
  * `admin` — Department supervisor; approves/rejects new inspector accounts and oversees registry audits.
  * `inspector` — Enforcement officer; scans products, reviews violations, and generates legal notices.
  * `demo` — Sandboxed evaluator role for demonstrations and hackathon testing.
* Strict per-officer data segregation ensures field inspectors view only their own cases, while administrators maintain central oversight.

---

## 🚀 Quick Start Setup

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & npm
* **MySQL Server 8.0+** (Local, XAMPP, WAMP, or cloud instance)
* **Google Gemini API Key** (Get free key from [Google AI Studio](https://aistudio.google.com/))

---

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/SIH26034-Smart-Legal-Metrology.git
cd SIH26034-Smart-Legal-Metrology
```

---

### Step 2: Environment Configuration

Create a `.env` file in the project root (or inside `backend/.env`):
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash

# Dedicated MySQL Configuration
USE_MYSQL=true
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD="your_mysql_password"
MYSQL_DATABASE=legal_metrology

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

### Step 3: Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# Start FastAPI server:
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend API: `http://127.0.0.1:8000`
* Interactive API Documentation (Swagger): `http://127.0.0.1:8000/docs`

---

### Step 4: Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
* Access Web Application: `http://localhost:5173`

---

## 🔐 Default Access Credentials

The database automatically initializes the following pre-configured accounts:

| Portal Role | Officer ID | Password | Access Scope |
|---|---|---|---|
| 🔑 **Admin Controller** | `LM-ADMIN-001` | `admin001` | Full department audit, officer approval/revocation, registry view |
| 🛡️ **Enforcement Inspector** | `LM-INSP-4092` | `lm4092` | Package scanning, compliance verification, Form-1 notice issuance |
| ⚡ **Demo Evaluation** | `LM-DEMO-2026` | `demo2026` | Interactive sample packages testing with zero setup required |

---

## 🧪 Automated Testing

Execute the test suite validating statutory rule evaluations:
```bash
cd backend
python -m pytest
```
* All 47 test cases cover boundary conditions, SI unit conformity, month/year date math, FSSAI verification, and packaging exceptions.

---

## 📁 Repository Structure

```
SIH26034-Smart-Legal-Metrology/
├── .env.example                     # Root environment configuration template
├── .gitignore                       # Git ignore preventing credentials/secrets leak
├── README.md                        # Project documentation
├── backend/
│   ├── .env.example                 # Backend environment template
│   ├── requirements.txt             # Python dependencies
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry point & CORS
│   │   ├── schemas.py               # Pydantic data contracts
│   │   ├── api/
│   │   │   ├── auth.py              # Officer registration, login, and admin actions
│   │   │   └── inspection.py        # Analysis, Form-1 notice, & LM-Copilot endpoints
│   │   ├── rules/
│   │   │   └── common_rules.py      # Deterministic compliance rule engine (LM-001..LM-012)
│   │   └── services/
│   │       ├── ai_service.py        # Gemini Vision label extraction
│   │       ├── auth_service.py      # Authentication & RBAC security
│   │       ├── db_service.py        # Dedicated MySQL persistence & telemetry
│   │       └── storage_service.py   # Inspection persistence abstraction
│   └── tests/
│       └── test_rules.py            # Automated statutory rule test suite (47 tests)
└── frontend/
    ├── package.json                 # Frontend dependencies & build scripts
    ├── vite.config.js               # Vite bundler & reverse proxy config
    └── src/
        ├── App.jsx                  # Main root application component & state router
        ├── components/              # Modular UI components (LegalNoticeModal, etc.)
        ├── pages/
        │   ├── Dashboard.jsx        # Compliance statistics & visualization charts
        │   ├── NewInspection.jsx    # Image upload & demo packaging selector
        │   ├── AnalysisProgress.jsx # Real-time analysis status pipeline
        │   ├── Results.jsx          # Rule assessment cards & extracted table
        │   ├── History.jsx          # Searchable officer inspection registry
        │   ├── Settings.jsx         # Statutory rules catalog & MySQL telemetry
        │   └── AdminPanel.jsx       # Officer management & access approvals
        └── services/
            └── api.js               # REST client connecting to FastAPI backend
```

---

## 🏛️ Acknowledgements & Compliance Notice

Developed for **Smart India Hackathon 2026** (Problem Statement: **SIH26034**).  
Under the auspices of the **Department of Consumer Affairs, Ministry of Consumer Affairs, Food & Public Distribution, Government of India**.
