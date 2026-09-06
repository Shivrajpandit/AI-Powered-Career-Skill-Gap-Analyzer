import io
import pytest
from fastapi.testclient import TestClient


def test_edge_case_empty_pdf(client: TestClient):
    # Register & Login
    client.post("/api/v1/auth/register", json={"email": "edge@example.com", "password": "Password123!", "full_name": "Edge Tester"})
    login = client.post("/api/v1/auth/login", json={"email": "edge@example.com", "password": "Password123!"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload empty bytes
    files = {"file": ("empty.pdf", b"", "application/pdf")}
    res = client.post("/api/v1/resumes/upload", files=files, headers=headers)
    assert res.status_code in (400, 422)


def test_edge_case_unsupported_file_extension(client: TestClient):
    client.post("/api/v1/auth/register", json={"email": "ext@example.com", "password": "Password123!", "full_name": "Ext Tester"})
    login = client.post("/api/v1/auth/login", json={"email": "ext@example.com", "password": "Password123!"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    files = {"file": ("resume.exe", b"binary content", "application/octet-stream")}
    res = client.post("/api/v1/resumes/upload", files=files, headers=headers)
    assert res.status_code == 400
    assert "Unsupported file format" in res.json()["detail"]


def test_edge_case_non_technical_job(client: TestClient):
    client.post("/api/v1/auth/register", json={"email": "nontech@example.com", "password": "Password123!", "full_name": "Non Tech"})
    login = client.post("/api/v1/auth/login", json={"email": "nontech@example.com", "password": "Password123!"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Job description with general text and soft skills only
    job_payload = {
        "title": "Operations Specialist",
        "company": "General Corp",
        "raw_text": "We are seeking an Operations Specialist. Requirements: Strong communication skills, leadership, problem solving, teamwork. Minimum 1 year experience.",
    }
    job_res = client.post("/api/v1/jobs/analyze", json=job_payload, headers=headers)
    assert job_res.status_code == 201
    job_data = job_res.json()
    assert job_data["title"] == "Operations Specialist"
    # Should detect soft skills
    assert any(s["category"] == "Soft Skills" for s in job_data["skills"])


def test_user_data_isolation_security(client: TestClient):
    """Verify User A cannot read or delete User B's resumes or analyses."""
    # User A
    client.post("/api/v1/auth/register", json={"email": "userA@example.com", "password": "Password123!", "full_name": "User A"})
    loginA = client.post("/api/v1/auth/login", json={"email": "userA@example.com", "password": "Password123!"})
    tokenA = loginA.json()["access_token"]
    headersA = {"Authorization": f"Bearer {tokenA}"}

    # User B
    client.post("/api/v1/auth/register", json={"email": "userB@example.com", "password": "Password123!", "full_name": "User B"})
    loginB = client.post("/api/v1/auth/login", json={"email": "userB@example.com", "password": "Password123!"})
    tokenB = loginB.json()["access_token"]
    headersB = {"Authorization": f"Bearer {tokenB}"}

    # User A creates a job
    jobA = client.post("/api/v1/jobs/analyze", json={
        "title": "Private Job A",
        "raw_text": "Python Developer with 3+ years experience in FastAPI and Docker.",
    }, headers=headersA).json()
    jobA_id = jobA["id"]

    # User B tries to fetch User A's job -> should return 404
    get_res = client.get(f"/api/v1/jobs/{jobA_id}", headers=headersB)
    assert get_res.status_code == 404

    # User B tries to delete User A's job -> should return 404
    del_res = client.delete(f"/api/v1/jobs/{jobA_id}", headers=headersB)
    assert del_res.status_code == 404


def test_full_end_to_end_candidate_lifecycle(client: TestClient):
    """Test full workflow: Register -> Upload PDF -> Analyze Job -> Match -> Generate Roadmap -> Progress Items -> Audit."""
    # 1. Register
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "lifecycle@example.com",
        "password": "SecurePassword123!",
        "full_name": "Lifecycle Candidate",
    })
    assert reg_res.status_code == 201

    # 2. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "lifecycle@example.com",
        "password": "SecurePassword123!",
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Realistic PDF Resume
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    resume_content = """
    Lifecycle Candidate
    lifecycle@example.com | +1 (555) 987-6543 | linkedin.com/in/lifecycle | github.com/lifecycle
    San Francisco, CA

    PROFESSIONAL SUMMARY
    Full Stack Engineer with 4 years experience specializing in Python, React, and PostgreSQL.

    SKILLS
    Languages: Python, TypeScript, SQL
    Frameworks: FastAPI, React, Node.js
    Databases & Cloud: PostgreSQL, Docker, AWS

    EXPERIENCE
    Software Engineer | Tech Corp | 2020 - 2024
    • Designed high-performance REST APIs using FastAPI and PostgreSQL handling 3M requests daily.
    • Improved frontend load time by 40% using React and Vite.
    • Containerized backend applications with Docker and deployed to AWS.

    EDUCATION
    Bachelor of Science in Computer Science | Stanford University | 2016 - 2020

    PROJECTS
    Distributed Cache Engine
    • Engineered distributed caching layer with Redis achieving 99.9% uptime.
    """
    page.insert_text((50, 50), resume_content)
    pdf_bytes = doc.write()
    doc.close()

    # 4. Upload Resume
    upload_res = client.post(
        "/api/v1/resumes/upload",
        files={"file": ("candidate_resume.pdf", pdf_bytes, "application/pdf")},
        headers=headers,
    )
    assert upload_res.status_code == 201
    resume_obj = upload_res.json()
    resume_id = resume_obj["id"]
    assert resume_obj["completeness_score"] > 80.0
    assert len(resume_obj["skills"]) >= 5

    # 5. Create Target Job Posting (AI / Data Engineer)
    job_res = client.post("/api/v1/jobs/analyze", json={
        "title": "Senior AI & Cloud Engineer",
        "company": "Quantum Innovations",
        "raw_text": """
        Requirements:
        • 3+ years experience in Python, FastAPI, and Docker.
        • Strong proficiency in PostgreSQL and AWS.
        • Bachelor's in Computer Science.

        Preferred:
        • Experience with PyTorch, Machine Learning, and Power BI.
        • Knowledge of Kubernetes and CI/CD.
        """,
    }, headers=headers)
    assert job_res.status_code == 201
    job_id = job_res.json()["id"]

    # 6. Run AI Match Analysis
    match_res = client.post("/api/v1/analysis/match", json={
        "resume_id": resume_id,
        "job_id": job_id,
        "weights": {"skill": 0.60, "experience": 0.20, "education": 0.10, "keyword": 0.10},
    }, headers=headers)
    assert match_res.status_code == 201
    analysis_obj = match_res.json()
    analysis_id = analysis_obj["id"]
    assert analysis_obj["overall_match_score"] >= 70.0
    assert "weights_used" in analysis_obj["score_breakdown"]

    # 7. Generate Personalized Roadmap
    roadmap_res = client.post("/api/v1/roadmap/generate", json={
        "analysis_id": analysis_id,
        "target_weeks": 12,
    }, headers=headers)
    assert roadmap_res.status_code == 201
    roadmap_obj = roadmap_res.json()
    assert len(roadmap_obj["items"]) == 3
    stage1_id = roadmap_obj["items"][0]["id"]

    # 8. Progress Roadmap Milestone Item
    progress_res = client.patch(
        f"/api/v1/roadmap/items/{stage1_id}",
        json={"status": "COMPLETED"},
        headers=headers,
    )
    assert progress_res.status_code == 200
    assert progress_res.json()["status"] == "COMPLETED"

    # 9. Audit Resume Quality
    audit_res = client.get(f"/api/v1/roadmap/resumes/{resume_id}/quality-audit", headers=headers)
    assert audit_res.status_code == 200
    audit_data = audit_res.json()
    assert audit_data["overall_quality_score"] >= 80
    assert len(audit_data["strengths"]) >= 2
