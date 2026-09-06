# AI-Powered Career & Skill Gap Analyzer 🎯🚀

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=Python&logoColor=white)](https://python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-SentenceTransformers-EE4C2C.svg?style=flat&logo=PyTorch&logoColor=white)](https://sbert.net)
[![React](https://img.shields.io/badge/React-18_TypeScript-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?style=flat&logo=Tailwind-CSS&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?style=flat&logo=Docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **A production-grade, explainable AI platform that bridges the gap between candidate resumes and real-world job requirements.** Parses complex PDF/DOCX resumes, normalizes 500+ technical skills via domain ontologies, computes hybrid semantic vector embeddings (`all-MiniLM-L6-v2`), scores ATS compatibility with mathematical transparency, and generates a personalized 12-week upskilling roadmap.

---

## 📑 Table of Contents
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Algorithmic Methodology & Scoring Engine](#-algorithmic-methodology--scoring-engine)
- [Semantic Vector Matching & False-Positive Guard](#-semantic-vector-matching--false-positive-guard)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Local Development Setup](#local-development-setup)
  - [Docker Compose Deployment](#docker-compose-deployment)
- [REST API Reference](#-rest-api-reference)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Resume & Portfolio Project Highlights](#-resume--portfolio-project-highlights)

---

## 🌟 Key Features

1. **Intelligent Document Extraction (PDF & DOCX)**
   - Multi-format ingestion using PyMuPDF and `python-docx`.
   - Heuristic layout segmentation (Contact, Summary, Experience, Education, Skills, Projects, Certifications).
   - Regex-based entity recognition for emails, phone numbers, LinkedIn/GitHub URLs, and degree levels.

2. **Hierarchical 500+ Skill Knowledge Graph**
   - Curated taxonomy across 8 core domains (*Backend, Frontend, Cloud & DevOps, AI & Data Science, Databases, Mobile, Testing/QA, Cybersecurity*).
   - Alias and synonym normalization (e.g. `React.js` $\rightarrow$ `React`, `Amazon Web Services` $\rightarrow$ `AWS`, `PostgreSQL` $\rightarrow$ `Postgres`).

3. **Hybrid Semantic Matching Engine (`sentence-transformers`)**
   - Combines deterministic exact alias matching with dense neural vector similarity using `all-MiniLM-L6-v2`.
   - **False-Positive Guardrails**: Blacklist heuristics preventing erroneous matches across distinct technologies (e.g. `Java` $\neq$ `JavaScript`, `C++` $\neq$ `C#`).
   - Categorizes skills into: **Exact Matches** ($1.0$), **Related / Semantic Matches** ($\ge 0.78$), and **Critical Skill Gaps** ($< 0.78$).

4. **100% Transparent, Explainable Match Scoring**
   - Replaces opaque AI "black-box" scores with a mathematically grounded 4-pillar formula:
     $$\text{Final Score} = 0.60 \times S_{\text{skills}} + 0.20 \times S_{\text{exp}} + 0.10 \times S_{\text{edu}} + 0.10 \times S_{\text{kw}}$$
   - Comprehensive audit trails providing sentence-level evidence for every detected skill.

5. **Personalized 12-Week Upskilling Roadmap**
   - Dynamically partitions missing skills into structured difficulty milestones (*Weeks 1-4: Core Foundations*, *Weeks 5-8: Intermediate Applied*, *Weeks 9-12: Advanced / Capstone*).
   - Supplies curated documentation links and real-world project suggestions for each target skill.

6. **Resume Quality & Action-Verb Auditor**
   - Scores bullet-point action verbs (e.g. *Architected, Engineered, Optimized*).
   - Computes metric impact density ($\%$ of bullet points containing quantitative business results).
   - Assesses section completeness and ATS formatting health.

7. **Multi-Job Fit Comparison**
   - Compare a single resume across multiple target job openings side-by-side with radar charts and fit breakdowns.

---

## 🏗 System Architecture

```
+-----------------------------------------------------------------------------------+
|                                  REACT FRONTEND                                   |
|  (TypeScript + Vite + Tailwind CSS + Recharts + Lucide Icons + React Router v6)  |
+-----------------------------------------+-----------------------------------------+
                                          | REST API / JSON
                                          v
+-----------------------------------------------------------------------------------+
|                                 FASTAPI BACKEND                                   |
|                                                                                   |
|  +------------------------+  +------------------------+  +---------------------+  |
|  |  JWT Auth & Security   |  | Document Parser Engine |  | Job Text Segmenter  |  |
|  |  (Argon2 + PyJWT)      |  | (PyMuPDF / Docx)       |  | (Regex + Heuristics)|  |
|  +-----------+------------+  +-----------+------------+  +----------+----------+  |
|              |                           |                          |             |
|              v                           v                          v             |
|  +-----------------------------------------------------------------------------+  |
|  |                           SKILL EXTRACTION LAYER                            |  |
|  |   - 500+ Skills Taxonomy (8 Domains) + Boundary-Safe Regex Matchers         |  |
|  |   - Sentence-Level Evidence Extractor & Context Snippets                    |  |
|  +---------------------------------------+-------------------------------------+  |
|                                          |                                        |
|                                          v                                        |
|  +-----------------------------------------------------------------------------+  |
|  |                        HYBRID SEMANTIC MATCHER                              |  |
|  |   - SentenceTransformer ("all-MiniLM-L6-v2") Cosine Similarity              |  |
|  |   - Exact Alias Normalization + False-Positive Negative Blacklist           |  |
|  +---------------------------------------+-------------------------------------+  |
|                                          |                                        |
|                                          v                                        |
|  +-----------------------------------------------------------------------------+  |
|  |                      EXPLAINABLE SCORING ENGINE (0-100)                     |  |
|  |   - Skill Match (60%) + Experience (20%) + Education (10%) + Keywords (10%) |  |
|  +-------------------+-----------------------------------+---------------------+  |
|                      |                                   |                        |
|                      v                                   v                        |
|  +-----------------------------------+   +-------------------------------------+  |
|  | 12-Week Roadmap Generator         |   | Resume Quality & Impact Auditor     |  |
|  | (Difficulty & Domain Clustering)  |   | (Action Verbs, Metrics Density)     |  |
|  +-----------------------------------+   +-------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | Async Engine
                                           v
+-----------------------------------------------------------------------------------+
|                        STORAGE LAYER (PostgreSQL / SQLite)                        |
|        Users | Resumes | Job Descriptions | Analysis Results | Roadmaps           |
+-----------------------------------------------------------------------------------+
```

---

## 📊 Algorithmic Methodology & Scoring Engine

The scoring system provides full transparency into ATS decision-making:

$$\text{Final Match Score} = \sum (W_i \times S_i)$$

| Dimension | Weight ($W_i$) | Calculation Methodology |
|---|---|---|
| **Skill Match ($S_{\text{skills}}$)** | **60%** | $\frac{\text{Count}(\text{Exact}) \times 1.0 + \sum \text{Sim}(\text{Related})}{\text{Total Required Skills}} \times 100$ |
| **Experience ($S_{\text{exp}}$)** | **20%** | $\min\left(1.0, \frac{\text{Years}(\text{Candidate})}{\text{Years}(\text{Required})}\right) \times 100$ |
| **Education ($S_{\text{edu}}$)** | **10%** | Ordinal tier matching (PhD = 4, Master's = 3, Bachelor's = 2, Associate = 1) |
| **Keyword Overlap ($S_{\text{kw}}$)** | **10%** | Normalized Jaccard similarity across technical n-grams |

---

## 🛡 Semantic Vector Matching & False-Positive Guard

Standard naive embedding cosine similarity often pairs fundamentally incompatible programming languages (e.g. `Java` and `JavaScript` score $\sim 0.72$ due to lexical co-occurrence in web tech corpora).

Our hybrid matcher addresses this via a 3-tier validation protocol:
1. **Tier 1: Canonical Alias Index**: Instant $O(1)$ normalization against `skills_taxonomy.json` (e.g. `k8s` $\rightarrow$ `Kubernetes`).
2. **Tier 2: Negative Blacklist Pruning**: Hard negative pairs are rejected immediately ($0.0$ similarity) before vector evaluation:
   - `java` $\leftrightarrow$ `javascript`
   - `c` $\leftrightarrow$ `c++` $\leftrightarrow$ `c#`
   - `r` $\leftrightarrow$ `rust`
   - `python` $\leftrightarrow$ `cython`
3. **Tier 3: Domain-Enriched Dense Vectors**: Embeddings generated via `sentence-transformers/all-MiniLM-L6-v2` with a calibrated threshold ($\theta = 0.78$) to capture genuine equivalents (e.g. `FastAPI` $\leftrightarrow$ `Flask`, `PostgreSQL` $\leftrightarrow$ `MySQL`, `GCP` $\leftrightarrow$ `AWS`).

---

## 💻 Tech Stack

### Backend
- **Framework**: FastAPI (Async Python 3.11+)
- **NLP & Embeddings**: `sentence-transformers` (`all-MiniLM-L6-v2`), `PyTorch`
- **Document Ingestion**: `PyMuPDF` (Fitz), `python-docx`
- **Database & ORM**: SQLAlchemy 2.0 (Async), SQLite / PostgreSQL via `asyncpg`
- **Security**: JWT tokens, Argon2 password hashing via `pwdlib`
- **Package Manager**: Astral `uv`

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS 3.4
- **Visualizations**: Recharts (Custom SVG Gauge, Radar Charts, Progress Bars)
- **Icons**: Lucide React
- **Routing**: React Router v6

### Infrastructure & DevOps
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx (Alpine Linux)
- **Testing**: Pytest, Pytest-AsyncIO (30 Unit & Integration Tests)

---

## 📂 Repository Structure

```
AI-Powered-Career-Skill-Gap-Analyzer/
├── backend/
│   ├── app/
│   │   ├── api/v1/                # REST API route controllers
│   │   │   ├── auth.py            # User registration & JWT authentication
│   │   │   ├── resumes.py         # Resume upload, parsing & retrieval
│   │   │   ├── jobs.py            # Job description ingestion & skill extraction
│   │   │   ├── analysis.py        # Semantic match execution & score audit
│   │   │   └── roadmap.py         # Roadmap generation & quality auditor
│   │   ├── core/                  # Configuration, security & exceptions
│   │   ├── database/              # Async SQLAlchemy engine & base
│   │   ├── models/                # Database entities (User, Resume, Job, Analysis, Roadmap)
│   │   ├── schemas/               # Pydantic validation schemas
│   │   ├── services/              # Core business & AI logic
│   │   │   ├── document_parser/   # PDF/DOCX extractors, cleaners & segmenters
│   │   │   ├── skill_extractor/   # Taxonomy manager, regex extractor & job parser
│   │   │   ├── matcher/           # Semantic vector matcher & scoring engine
│   │   │   └── recommender/       # 12-week roadmap generator & quality auditor
│   │   └── main.py                # FastAPI application entry point
│   ├── data/                      # 500+ Skills taxonomy JSON database
│   ├── tests/                     # 30 Unit, integration & E2E tests
│   ├── Dockerfile                 # Backend container definition
│   └── pyproject.toml             # Python dependencies specification
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Score dial, skill badges, layout & navbar
│   │   ├── context/               # AuthContext & state management
│   │   ├── pages/                 # Dashboard, Upload, Analysis, Roadmap, Compare
│   │   ├── services/              # Axios API client
│   │   ├── types/                 # TypeScript data contracts
│   │   ├── App.tsx                # Main routing & guards
│   │   └── index.css              # Tailwind CSS styling tokens
│   ├── Dockerfile                 # Multi-stage production Nginx container
│   ├── nginx.conf                 # Reverse proxy & SPA routing configuration
│   └── package.json
│
├── docker-compose.yml             # Multi-service production orchestration
└── README.md                      # Comprehensive documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & `npm`
- *(Optional)* **Docker & Docker Compose**

---

### Local Development Setup

#### 1. Clone the repository
```bash
git clone https://github.com/Shivrajpandit/AI-Powered-Career-Skill-Gap-Analyzer.git
cd AI-Powered-Career-Skill-Gap-Analyzer
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment and install dependencies (using uv or pip)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e .

# Start the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be live at: `http://localhost:8000`  
Interactive Swagger Docs: `http://localhost:8000/docs`

#### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend web application will be live at: `http://localhost:5173`

---

### Docker Compose Deployment

Run the complete multi-container stack (PostgreSQL + FastAPI + Nginx Frontend) with a single command:

```bash
docker-compose up --build
```
- Web Application: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate & receive JWT access token | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes |
| `POST` | `/api/v1/resumes/upload` | Upload & parse PDF/DOCX resume file | Yes |
| `GET` | `/api/v1/resumes/` | List all resumes for current user | Yes |
| `GET` | `/api/v1/resumes/{id}` | Fetch parsed resume details & entities | Yes |
| `POST` | `/api/v1/jobs/analyze` | Parse job text and extract required skills | Yes |
| `GET` | `/api/v1/jobs/` | List saved job descriptions | Yes |
| `POST` | `/api/v1/analysis/match` | Run hybrid semantic match & compute scores | Yes |
| `GET` | `/api/v1/analysis/{id}` | Retrieve match audit report & breakdown | Yes |
| `POST` | `/api/v1/roadmap/generate` | Generate 12-week learning roadmap | Yes |
| `GET` | `/api/v1/roadmap/resume/{id}/audit`| Run quality & action-verb audit on resume | Yes |

---

## 🧪 Testing & Quality Assurance

The test suite contains **30 automated tests** covering authentication, file extraction edge cases, taxonomy normalization, vector similarity matching, scoring logic, roadmap generation, and end-to-end candidate workflows.

```bash
# Run pytest test suite from repository root
cd backend
pytest -v
```

### Test Suite Summary:
```text
backend/tests/test_auth.py ..................... [6 passed]
backend/tests/test_resume_parser.py ............ [9 passed]
backend/tests/test_skills_and_jobs.py .......... [4 passed]
backend/tests/test_matcher_and_scoring.py ...... [3 passed]
backend/tests/test_roadmap_and_auditor.py ...... [3 passed]
backend/tests/test_e2e_integration.py .......... [5 passed]
======================= 30 passed in 25.57s =======================
```

---

## 💼 Resume & Portfolio Project Highlights

### Resume Bullet Points (Ready to Copy/Paste)
- **AI-Powered Career & Skill Gap Analyzer (Full-Stack AI Project)**
  - *Engineered an end-to-end career intelligence web platform using **FastAPI**, **React 18**, **TypeScript**, and **Tailwind CSS**, achieving sub-second ATS resume-to-job matching.*
  - *Implemented a hybrid NLP matching pipeline combining a curated 500+ skill taxonomy with **Sentence-Transformers (`all-MiniLM-L6-v2`)** vector embeddings and pairwise negative blacklists, eliminating false positive matches (e.g. Java vs JavaScript).*
  - *Developed an explainable 4-pillar scoring algorithm (60% skills, 20% experience, 10% education, 10% keywords) providing candidate sentence-level evidence excerpts and ATS formatting diagnostics.*
  - *Designed an automated 12-week learning roadmap generator clustering skill gaps into progressive milestones with curated resources, and tested across 30 unit/integration tests with Docker containerization.*

### LinkedIn Showcase Summary
> 🚀 Built and deployed **AI-Powered Career & Skill Gap Analyzer** — a full-stack AI platform that provides transparent, explainable ATS matching, semantic skill gap identification, and personalized learning roadmaps.
> 
> 🔹 **NLP & AI Engine**: Ingests PDF/DOCX resumes via PyMuPDF/docx, normalizes 500+ technical skills, and computes dense vector cosine similarities using PyTorch SentenceTransformers (`all-MiniLM-L6-v2`) with custom false-positive protection.  
> 🔹 **Explainable Scoring**: Transparent 4-factor scoring model with complete audit logs and evidence citation.  
> 🔹 **Interactive Frontend**: Modern dashboard built with React 18, TypeScript, Tailwind CSS, and Recharts featuring SVG score dials and multi-job comparisons.  
> 🔹 **Production DevOps**: Containerized using multi-stage Docker builds and Docker Compose with PostgreSQL.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.