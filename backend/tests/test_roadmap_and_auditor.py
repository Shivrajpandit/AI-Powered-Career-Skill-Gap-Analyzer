from fastapi.testclient import TestClient
from app.services.recommender.roadmap import LearningRoadmapGenerator
from app.services.recommender.quality_auditor import ResumeQualityAuditor


def test_roadmap_generator_logic():
    missing = [
        {"skill_name": "Power BI", "category": "Data Science", "priority": "HIGH"},
        {"skill_name": "Statistics", "category": "Data Science", "priority": "HIGH"},
        {"skill_name": "Docker", "category": "DevOps", "priority": "LOW"},
    ]
    related = [{"job_skill": "Tableau", "category": "Data Science"}]

    roadmap = LearningRoadmapGenerator.generate_roadmap(
        analysis_id="test-analysis-id",
        job_title="Senior Data Analyst",
        missing_skills=missing,
        related_skills=related,
        target_weeks=12,
    )

    assert "Senior Data Analyst" in roadmap["title"]
    assert len(roadmap["stages"]) == 3
    assert roadmap["stages"][0]["stage_order"] == 1
    assert any("Power BI" in t or "Statistics" in t for t in roadmap["stages"][0]["topics"])
    assert len(roadmap["stages"][0]["recommended_resources"]) >= 1


def test_resume_quality_auditor_logic():
    strong_text = """
    Jane Doe
    jane@example.com | 555-0199 | linkedin.com/in/janedoe
    
    SUMMARY
    Senior Engineer with 5+ years of experience building scalable backend architectures.

    EXPERIENCE
    Lead Backend Engineer
    Acme Corp | 2021 - 2024
    • Architected distributed microservices handling 10M+ daily requests with 99.99% uptime.
    • Optimized PostgreSQL query execution time by 45% using composite indexing.
    • Automated CI/CD deployment pipelines reducing build times from 30min to 5min.

    PROJECTS
    Skill Analyzer
    • Engineered real-time semantic matcher handling 500+ skills with sub-100ms response time.
    """
    parsed_data = {
        "contact": {"email": "jane@example.com", "phone": "555-0199", "linkedin": "linkedin.com/in/janedoe"},
        "experience": [
            {"responsibilities": [
                "Architected distributed microservices handling 10M+ daily requests with 99.99% uptime.",
                "Optimized PostgreSQL query execution time by 45% using composite indexing.",
                "Automated CI/CD deployment pipelines reducing build times from 30min to 5min.",
            ]}
        ],
        "projects": [
            {"description": "Engineered real-time semantic matcher handling 500+ skills with sub-100ms response time."}
        ],
        "sections_found": ["summary", "skills", "experience", "projects"],
        "extracted_skills": ["Python", "PostgreSQL", "CI/CD"],
    }

    audit = ResumeQualityAuditor.audit_resume(strong_text, parsed_data)
    assert audit["overall_quality_score"] >= 80
    assert audit["rating"] in ("Excellent", "Good")
    assert any("quantified" in s.lower() or "metric" in s.lower() for s in audit["strengths"])


def test_roadmap_and_auditor_api_flow(client: TestClient):
    # 1. Register and Login
    user_payload = {"email": "roadmapuser@example.com", "password": "Password123!", "full_name": "Roadmap User"}
    client.post("/api/v1/auth/register", json=user_payload)
    login_res = client.post("/api/v1/auth/login", json={"email": user_payload["email"], "password": user_payload["password"]})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload Resume
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Roadmap Candidate\nroad@example.com | 555-1111\n\nSKILLS\nPython, SQL, React\n\nEXPERIENCE\nDev | 2022-2024\n* Built APIs handling 1M reqs\n\nEDUCATION\nBS CS")
    pdf_bytes = doc.write()
    doc.close()

    upload_res = client.post("/api/v1/resumes/upload", files={"file": ("resume.pdf", pdf_bytes, "application/pdf")}, headers=headers)
    resume_id = upload_res.json()["id"]

    # 3. Create Job Description
    job_res = client.post("/api/v1/jobs/analyze", json={
        "title": "Full Stack ML Engineer",
        "raw_text": "Requirements:\nPython, PyTorch, Docker, Kubernetes, AWS, React.\nBachelor's in CS.",
    }, headers=headers)
    job_id = job_res.json()["id"]

    # 4. Perform Analysis
    match_res = client.post("/api/v1/analysis/match", json={
        "resume_id": resume_id,
        "job_id": job_id,
    }, headers=headers)
    analysis_id = match_res.json()["id"]

    # 5. Generate Roadmap
    roadmap_res = client.post("/api/v1/roadmap/generate", json={
        "analysis_id": analysis_id,
        "target_weeks": 12,
    }, headers=headers)
    assert roadmap_res.status_code == 201
    roadmap_data = roadmap_res.json()
    assert roadmap_data["analysis_id"] == analysis_id
    assert len(roadmap_data["items"]) == 3
    first_item_id = roadmap_data["items"][0]["id"]
    assert roadmap_data["items"][0]["status"] == "NOT_STARTED"

    # 6. Retrieve Roadmap by Analysis ID
    get_roadmap = client.get(f"/api/v1/roadmap/{analysis_id}", headers=headers)
    assert get_roadmap.status_code == 200
    assert get_roadmap.json()["id"] == roadmap_data["id"]

    # 7. Update Roadmap Item Status
    update_item = client.patch(
        f"/api/v1/roadmap/items/{first_item_id}",
        json={"status": "IN_PROGRESS"},
        headers=headers,
    )
    assert update_item.status_code == 200
    assert update_item.json()["status"] == "IN_PROGRESS"

    # 8. Resume Quality Audit
    audit_res = client.get(f"/api/v1/roadmap/resumes/{resume_id}/quality-audit", headers=headers)
    assert audit_res.status_code == 200
    audit_json = audit_res.json()
    assert "overall_quality_score" in audit_json
    assert len(audit_json["actionable_improvements"]) >= 0
