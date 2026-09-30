import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and render total page numbers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(
                50,
                755,
                "AI-Powered Career & Skill Gap Analyzer — System Architecture & Documentation",
            )
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(50, 747, 562, 747)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(50, 42, 562, 42)

        self.drawString(
            50,
            30,
            "GitHub: https://github.com/Shivrajpandit/AI-Powered-Career-Skill-Gap-Analyzer",
        )
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(562, 30, page_text)
        self.restoreState()


def create_documentation_pdf(filename="AI_Career_Skill_Gap_Analyzer_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=50,
        rightMargin=50,
        topMargin=50,
        bottomMargin=50,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=21,
        textColor=colors.HexColor("#0f172a"),
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#475569"),
    )

    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#1e3a8a"),
        spaceBefore=9,
        spaceAfter=3,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#2563eb"),
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "DocBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=3,
    )

    bullet_style = ParagraphStyle(
        "DocBullet",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.8,
        leading=10.8,
        textColor=colors.HexColor("#1e293b"),
        leftIndent=10,
        firstLineIndent=-6,
        spaceAfter=2,
    )

    code_line_style = ParagraphStyle(
        "CodeLine",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=7,
        leading=9.2,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=0.5,
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=7.8,
        leading=10,
        textColor=colors.HexColor("#0f172a"),
    )

    table_body_style = ParagraphStyle(
        "TableBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.4,
        leading=9.8,
        textColor=colors.HexColor("#1e293b"),
    )

    story = []

    # Header Card
    story.append(Paragraph("AI-Powered Career & Skill Gap Analyzer", title_style))
    story.append(Spacer(1, 2))
    story.append(
        Paragraph(
            "<b>Comprehensive System Architecture, AI Methodology & Technical Documentation</b>",
            subtitle_style,
        )
    )
    story.append(Spacer(1, 4))

    meta_data = [
        [
            Paragraph(
                "<b>GitHub Repository:</b> <font color='#1d4ed8'><u>https://github.com/Shivrajpandit/AI-Powered-Career-Skill-Gap-Analyzer</u></font><br/>"
                "<b>Tech Stack:</b> FastAPI (Python 3.11+) | Sentence-Transformers | React 18 | TypeScript | Tailwind CSS | Docker Compose<br/>"
                "<b>Core Purpose:</b> Explainable ATS resume scoring, semantic skill gap detection, and personalized 12-week upskilling roadmaps.",
                body_style,
            )
        ]
    ]
    meta_table = Table(meta_data, colWidths=[512])
    meta_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
                ("LINELEFT", (0, 0), (-1, -1), 4, colors.HexColor("#2563eb")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(meta_table)
    story.append(Spacer(1, 5))

    # Section 1: Executive Summary
    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(
        Paragraph(
            "The <b>AI-Powered Career & Skill Gap Analyzer</b> is an explainable full-stack AI platform designed to help job candidates, students, and engineers understand how closely their resume matches real-world job requirements. Traditional ATS checkers return opaque percentage scores; this platform provides transparent, actionable insights using <b>rule-based extraction, a 500+ skill taxonomy, SBERT dense vector embeddings, explainable scoring, and an automated 12-week roadmap generator</b>.",
            body_style,
        )
    )

    # Section 2: Architecture
    story.append(Paragraph("2. High-Level Architecture & End-to-End Workflow", h1_style))
    arch_lines = [
        "[ Client Layer: React 18 + TypeScript + Tailwind CSS ]",
        "  - Landing Page, Dashboard, Resume Upload (PDF/DOCX), Job Posting Parser",
        "  - Analysis Detail (Score Dial, Radar Charts, Badge Matrix) & 12-Week Interactive Roadmap",
        "  - Multi-Job Comparison Matrix (Benchmarking single candidate across multiple target roles)",
        "                       |",
        "                       v  REST API Requests (Bearer JWT Authentication)",
        "[ Backend Gateway: FastAPI (Python 3.11+) at /api/v1 ]",
        "  - /auth     : User registration, login, JWT token issuance & profile",
        "  - /resumes  : Multi-format parsing (PyMuPDF / python-docx) & entity sanitization",
        "  - /jobs     : Requirement extraction & structured skill classification",
        "  - /analysis : Hybrid semantic matching, gap classification & explainable scoring",
        "  - /roadmap  : 12-Week progressive milestone roadmap generation",
        "                       |",
        "                       v  AI & Core Intelligence Engine",
        "  - Document Parser & Heuristic Section Segmenter",
        "  - Skill Knowledge Base (500+ Canonical Skills across 8 Tech Domains)",
        "  - Sentence-Transformers Model (all-MiniLM-L6-v2, 384-dimensional dense embeddings)",
        "  - False-Positive Guardrail (Blacklist: Java!=JS, C++!=C#, Rust!=Ruby, React!=React Native)",
        "  - Resume Quality Auditor (Action verbs, metrics, contact completeness)",
        "                       |",
        "                       v  Persistence Layer",
        "[ Database: PostgreSQL (Production) / SQLite (Local) via SQLAlchemy 2.0 ORM ]",
    ]

    arch_paragraphs = [Paragraph(line, code_line_style) for line in arch_lines]
    arch_table = Table([[p] for p in arch_paragraphs], colWidths=[512])
    arch_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
                ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#94a3b8")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.append(arch_table)
    story.append(Spacer(1, 5))

    # Section 3: Algorithmic Methodology
    story.append(Paragraph("3. Algorithmic Methodology & Scoring Formulation", h1_style))
    story.append(
        Paragraph(
            "The matching engine evaluates candidate competencies against role requirements via a 4-tier cascade:",
            body_style,
        )
    )
    story.append(
        Paragraph(
            "- <b>Tier 1 (Exact & Canonical Alias Match):</b> Canonical mapping against taxonomy (e.g., <i>React.js -> React</i>, <i>K8s -> Kubernetes</i>, <i>AWS Cloud -> AWS</i>) yields a match score of <b>1.0</b>.",
            bullet_style,
        )
    )
    story.append(
        Paragraph(
            "- <b>Tier 2 (False-Positive Blacklist Guardrail):</b> Hard-coded domain exclusions eliminate false vector overlaps between distinct technologies like <code>(Java, JavaScript)</code>, <code>(C, C++)</code>, <code>(C++, C#)</code>, <code>(Rust, Ruby)</code>, and <code>(React, React Native)</code>, setting their score to <b>0.0</b>.",
            bullet_style,
        )
    )
    story.append(
        Paragraph(
            "- <b>Tier 3 (Category Boost & SBERT Embeddings):</b> Unmapped terms are encoded using <code>all-MiniLM-L6-v2</code> (384-d dense vectors). Shared taxonomy domain categories add a +0.50 category boost. Cosine similarity >= 0.72 qualifies as a semantic/partial match.",
            bullet_style,
        )
    )
    story.append(
        Paragraph(
            "- <b>Tier 4 (Gap Classification):</b> Skills with similarity &lt; 0.72 are marked as missing critical gaps.",
            bullet_style,
        )
    )

    story.append(Spacer(1, 3))
    story.append(Paragraph("Explainable ATS Weighted Scoring Breakdown:", h2_style))

    scoring_data = [
        [Paragraph("<b>Component</b>", table_header_style), Paragraph("<b>Weight</b>", table_header_style), Paragraph("<b>Evaluation Formula & Criteria</b>", table_header_style)],
        [Paragraph("Hard Technical Skills", table_body_style), Paragraph("<b>50%</b>", table_body_style), Paragraph("Ratio of exact matches (1.0) and partial semantic matches (0.50-0.85) against required job skills.", table_body_style)],
        [Paragraph("Soft Skills", table_body_style), Paragraph("<b>10%</b>", table_body_style), Paragraph("Presence of leadership, problem-solving, agile communication, and teamwork keywords.", table_body_style)],
        [Paragraph("Experience Alignment", table_body_style), Paragraph("<b>20%</b>", table_body_style), Paragraph("Candidate total years of experience vs. target role minimum required years.", table_body_style)],
        [Paragraph("Education Relevance", table_body_style), Paragraph("<b>10%</b>", table_body_style), Paragraph("Degree level matching (Bachelors, Masters, PhD) and technical field alignment.", table_body_style)],
        [Paragraph("Resume Quality & Format", table_body_style), Paragraph("<b>10%</b>", table_body_style), Paragraph("Presence of action verbs, quantifiable metrics/percentages, clear section headings, and contact info.", table_body_style)],
    ]
    scoring_table = Table(scoring_data, colWidths=[120, 50, 342])
    scoring_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    story.append(scoring_table)
    story.append(Spacer(1, 6))

    # Section 4: Skills Taxonomy
    story.append(Paragraph("4. Technical Skills Taxonomy (8 Core Domains)", h1_style))
    taxonomy_data = [
        [Paragraph("<b>Domain</b>", table_header_style), Paragraph("<b>Technologies & Frameworks Covered (500+ Skills)</b>", table_header_style)],
        [Paragraph("Backend Development", table_body_style), Paragraph("Python, FastAPI, Django, Flask, Node.js, Express, Go, Java, Spring Boot, C#, .NET, Rust, Ruby on Rails, GraphQL, REST APIs, Microservices, gRPC", table_body_style)],
        [Paragraph("Frontend Development", table_body_style), Paragraph("React, Next.js, Vue, Angular, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, SASS, Redux, Webpack, Vite, Responsive Design", table_body_style)],
        [Paragraph("Cloud & DevOps", table_body_style), Paragraph("AWS (EC2, S3, Lambda, ECS), GCP, Azure, Docker, Kubernetes, Terraform, CI/CD (GitHub Actions, GitLab), Ansible, Nginx, Prometheus, Grafana", table_body_style)],
        [Paragraph("AI & Data Science", table_body_style), Paragraph("PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, Hugging Face, NLP, LLMs, Computer Vision, LangChain, RAG, MLflow, Apache Spark", table_body_style)],
        [Paragraph("Databases & Storage", table_body_style), Paragraph("PostgreSQL, MySQL, MongoDB, Redis, Cassandra, SQLite, DynamoDB, Elasticsearch, Prisma, SQLAlchemy", table_body_style)],
        [Paragraph("Mobile Development", table_body_style), Paragraph("React Native, Flutter, Swift, iOS, Kotlin, Android SDK, Dart, Jetpack Compose", table_body_style)],
        [Paragraph("Testing / QA", table_body_style), Paragraph("Pytest, Jest, Cypress, Playwright, Selenium, Unit Testing, Integration Testing, TDD", table_body_style)],
        [Paragraph("Cybersecurity", table_body_style), Paragraph("OAuth2, JWT, OWASP Top 10, Penetration Testing, Cryptography, IAM, SOC2, SSL/TLS", table_body_style)],
    ]
    tax_table = Table(taxonomy_data, colWidths=[120, 392])
    tax_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    story.append(tax_table)
    story.append(Spacer(1, 6))

    # Section 5: 12-Week Roadmap
    story.append(Paragraph("5. Personalized 12-Week Upskilling Roadmap Plan", h1_style))
    roadmap_data = [
        [Paragraph("<b>Phase</b>", table_header_style), Paragraph("<b>Duration</b>", table_header_style), Paragraph("<b>Target Goals & Deliverables</b>", table_header_style)],
        [Paragraph("Phase 1: Foundations", table_body_style), Paragraph("Weeks 1 - 3", table_body_style), Paragraph("Core language fundamentals, environment setup, syntax, and foundational missing prerequisites.", table_body_style)],
        [Paragraph("Phase 2: Core Competencies", table_body_style), Paragraph("Weeks 4 - 6", table_body_style), Paragraph("Framework mastery, database integration, REST API development, and hands-on micro-projects.", table_body_style)],
        [Paragraph("Phase 3: Advanced Topics", table_body_style), Paragraph("Weeks 7 - 9", table_body_style), Paragraph("Cloud deployment, architectural patterns, performance optimization, CI/CD, and security testing.", table_body_style)],
        [Paragraph("Phase 4: Capstone & Prep", table_body_style), Paragraph("Weeks 10 - 12", table_body_style), Paragraph("End-to-end full-stack capstone project, GitHub portfolio polish, and technical interview preparation.", table_body_style)],
    ]
    roadmap_table = Table(roadmap_data, colWidths=[120, 70, 322])
    roadmap_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    story.append(roadmap_table)
    story.append(Spacer(1, 6))

    # Section 6: Database Models
    story.append(Paragraph("6. Database Entity-Relationship (ER) Schema", h1_style))
    db_data = [
        [Paragraph("<b>Entity</b>", table_header_style), Paragraph("<b>Key Columns</b>", table_header_style), Paragraph("<b>Description & Relationships</b>", table_header_style)],
        [Paragraph("<code>User</code>", table_body_style), Paragraph("id, email, hashed_password, full_name, is_active, created_at", table_body_style), Paragraph("Account authentication, bcrypt password security, owns Resumes and Jobs.", table_body_style)],
        [Paragraph("<code>Resume</code>", table_body_style), Paragraph("id, user_id, title, file_path, raw_extracted_data, skills, experience_years", table_body_style), Paragraph("Stores parsed document sections, extracted skills array, and candidate profile.", table_body_style)],
        [Paragraph("<code>JobDescription</code>", table_body_style), Paragraph("id, user_id, title, company, raw_text, required_skills, preferred_skills", table_body_style), Paragraph("Stores target role postings with mandatory and optional skill lists.", table_body_style)],
        [Paragraph("<code>MatchAnalysis</code>", table_body_style), Paragraph("id, resume_id, job_id, overall_score, matched_skills, missing_skills, score_breakdown", table_body_style), Paragraph("Persists evaluation metrics, matched skills, gaps, and quality suggestions.", table_body_style)],
        [Paragraph("<code>LearningRoadmap</code>", table_body_style), Paragraph("id, analysis_id, total_weeks, phases, weekly_schedule", table_body_style), Paragraph("Generated 12-week schedule with structured milestones and resource links.", table_body_style)],
    ]
    db_table = Table(db_data, colWidths=[100, 155, 257])
    db_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    story.append(db_table)
    story.append(Spacer(1, 6))

    # Section 7: REST API Endpoints
    story.append(Paragraph("7. REST API Endpoints Specification", h1_style))
    api_data = [
        [Paragraph("<b>Method</b>", table_header_style), Paragraph("<b>Endpoint</b>", table_header_style), Paragraph("<b>Functionality</b>", table_header_style), Paragraph("<b>Auth</b>", table_header_style)],
        [Paragraph("<code>POST</code>", table_body_style), Paragraph("<code>/api/v1/auth/register</code>", table_body_style), Paragraph("Create a new user account", table_body_style), Paragraph("Public", table_body_style)],
        [Paragraph("<code>POST</code>", table_body_style), Paragraph("<code>/api/v1/auth/login</code>", table_body_style), Paragraph("OAuth2 password flow / JWT Bearer token", table_body_style), Paragraph("Public", table_body_style)],
        [Paragraph("<code>GET</code>", table_body_style), Paragraph("<code>/api/v1/auth/me</code>", table_body_style), Paragraph("Get current authenticated user profile", table_body_style), Paragraph("JWT", table_body_style)],
        [Paragraph("<code>POST</code>", table_body_style), Paragraph("<code>/api/v1/resumes/upload</code>", table_body_style), Paragraph("Upload & parse resume (PDF / DOCX)", table_body_style), Paragraph("JWT", table_body_style)],
        [Paragraph("<code>GET</code>", table_body_style), Paragraph("<code>/api/v1/resumes/</code>", table_body_style), Paragraph("List all uploaded user resumes", table_body_style), Paragraph("JWT", table_body_style)],
        [Paragraph("<code>POST</code>", table_body_style), Paragraph("<code>/api/v1/jobs/</code>", table_body_style), Paragraph("Create & parse target job description", table_body_style), Paragraph("JWT", table_body_style)],
        [Paragraph("<code>GET</code>", table_body_style), Paragraph("<code>/api/v1/jobs/</code>", table_body_style), Paragraph("List all job descriptions", table_body_style), Paragraph("JWT", table_body_style)],
        [Paragraph("<code>POST</code>", table_body_style), Paragraph("<code>/api/v1/analysis/run</code>", table_body_style), Paragraph("Execute match analysis between resume and job", table_body_style), Paragraph("JWT", table_body_style)],
        [Paragraph("<code>GET</code>", table_body_style), Paragraph("<code>/api/v1/analysis/{id}</code>", table_body_style), Paragraph("Retrieve full match analysis breakdown", table_body_style), Paragraph("JWT", table_body_style)],
        [Paragraph("<code>GET</code>", table_body_style), Paragraph("<code>/api/v1/roadmap/{analysis_id}</code>", table_body_style), Paragraph("Retrieve / generate 12-week roadmap", table_body_style), Paragraph("JWT", table_body_style)],
        [Paragraph("<code>GET</code>", table_body_style), Paragraph("<code>/health</code>", table_body_style), Paragraph("Health check & service version", table_body_style), Paragraph("Public", table_body_style)],
    ]
    api_table = Table(api_data, colWidths=[48, 160, 249, 55])
    api_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ]
        )
    )
    story.append(api_table)
    story.append(Spacer(1, 6))

    # Section 8: Quick Start & Deployment
    story.append(Paragraph("8. Installation & Deployment Guide", h1_style))
    deploy_lines = [
        "# Option 1: Docker Compose (Full Stack Deployment)",
        "git clone https://github.com/Shivrajpandit/AI-Powered-Career-Skill-Gap-Analyzer.git",
        "cd AI-Powered-Career-Skill-Gap-Analyzer",
        "docker compose up --build",
        "",
        "# Option 2: Local Development Setup",
        "# Backend (FastAPI):",
        "cd backend && python -m venv .venv && .venv\\Scripts\\activate",
        "pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000",
        "",
        "# Frontend (React 18 + Vite):",
        "cd frontend && npm install && npm run dev",
    ]

    deploy_paragraphs = [Paragraph(line, code_line_style) for line in deploy_lines]
    deploy_table = Table([[p] for p in deploy_paragraphs], colWidths=[512])
    deploy_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
                ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#94a3b8")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.append(deploy_table)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated clean PDF documentation: {filename}")


if __name__ == "__main__":
    create_documentation_pdf()
