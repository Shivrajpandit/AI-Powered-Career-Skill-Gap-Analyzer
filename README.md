# AI-Powered Career & Skill Gap Analyzer 🎯

> **Turn your resume into a career action plan.**
>
> An explainable, full-stack AI platform that analyzes resumes against real-world job requirements, identifies skill gaps, explains ATS compatibility, and generates a personalized 12-week upskilling roadmap.

<p align="center">

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=Python&logoColor=white)](https://python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-SentenceTransformers-EE4C2C.svg?style=flat&logo=PyTorch&logoColor=white)](https://sbert.net)
[![React](https://img.shields.io/badge/React-18_TypeScript-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?style=flat&logo=Tailwind-CSS&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?style=flat&logo=Docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Project Snapshot](#-project-snapshot)
- [Key Features](#-key-features)
- [Why This Project](#-why-this-project)
- [Analysis Workflow](#-analysis-workflow)
- [System Architecture](#️-system-architecture)
- [Algorithmic Methodology](#-algorithmic-methodology)
- [Semantic Matching](#️-semantic-matching--false-positive-protection)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Quick Start](#-quick-start)
- [Docker Deployment](#-docker-deployment)
- [REST API](#-rest-api)
- [Testing](#-testing)
- [Project Output](#-what-the-analyzer-produces)
- [Resume Highlights](#-resume-project-highlights)
- [Contributing](#-contributing)
- [License](#-license)

---

# 📌 Overview

The **AI-Powered Career & Skill Gap Analyzer** is a full-stack AI platform designed to help students, job seekers, and professionals understand how closely their resume matches a target job description.

Instead of providing only a single ATS score, the platform provides detailed and actionable insights.

It helps answer:

- 🎯 Which skills match the target job?
- 🔍 Which skills are partially related?
- ❌ Which critical skills are missing?
- 📊 How do experience and education affect the match?
- 📝 How can the resume be improved?
- 🚀 What skills should be learned next?
- 📚 What should the candidate focus on during the next 12 weeks?

The system combines **rule-based extraction, skill normalization, semantic embeddings, explainable scoring, and personalized recommendations**.

---

# ⚡ Project Snapshot

| Area | Details |
|---|---|
| **Project Type** | Full-Stack AI / NLP Platform |
| **Purpose** | Resume analysis, job matching, skill-gap detection, and career upskilling |
| **AI/NLP** | Sentence-Transformers, `all-MiniLM-L6-v2`, semantic similarity |
| **Skill Intelligence** | 500+ normalized technical skills |
| **Skill Domains** | Backend, Frontend, Cloud & DevOps, AI & Data Science, Databases, Mobile, Testing/QA, Cybersecurity |
| **Scoring** | Explainable 0–100 ATS compatibility score |
| **Roadmap** | Personalized 12-week learning plan |
| **Frontend** | React 18 + TypeScript + Tailwind CSS |
| **Backend** | FastAPI + Python 3.11+ |
| **Database** | SQLite / PostgreSQL |
| **Deployment** | Docker Compose + Nginx |
| **Testing** | 30 automated tests |

---

# 🌟 Key Features

## 1. 📄 Intelligent Resume Parsing

Supports:

- PDF resumes
- DOCX resumes
- Contact information extraction
- Education detection
- Experience extraction
- Skills extraction
- Projects
- Certifications
- LinkedIn URLs
- GitHub URLs
- Email and phone number detection

### Technologies

- PyMuPDF
- python-docx
- Regex
- Heuristic document segmentation

---

## 2. 🧠 500+ Skill Knowledge Base

The platform maintains a structured taxonomy covering **8 major technical domains**:

- Backend Development
- Frontend Development
- Cloud & DevOps
- AI & Data Science
- Databases
- Mobile Development
- Testing / QA
- Cybersecurity

### Skill Normalization

The system converts different names and aliases into a canonical skill.

```text
React.js              → React
Amazon Web Services   → AWS
PostgreSQL            → Postgres
K8s                   → Kubernetes
