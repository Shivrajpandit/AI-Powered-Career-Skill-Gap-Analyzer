from fastapi.testclient import TestClient
from app.services.matcher.semantic import SemanticMatcher
from app.services.scoring.engine import CareerMatchEngine, ScoringEngine


def test_semantic_similarity_synonyms_and_blacklist():
    # Identical terms
    assert SemanticMatcher.compute_similarity("Python", "Python") == 1.0

    # Synonyms / Related terms should have high similarity
    sim_ml = SemanticMatcher.compute_similarity("Machine Learning", "ML")
    assert sim_ml >= 0.70

    sim_viz = SemanticMatcher.compute_similarity("Matplotlib", "Data Visualization")
    assert sim_viz >= 0.50

    # Safety blacklist: distinct technologies must not match
    assert SemanticMatcher.compute_similarity("Java", "JavaScript") == 0.0
    assert SemanticMatcher.compute_similarity("C++", "C#") == 0.0
    assert SemanticMatcher.compute_similarity("Rust", "Ruby") == 0.0


def test_career_match_engine_scoring():
    resume_skills = [
        {"skill_name": "Python", "canonical_name": "python", "category": "Programming", "confidence_score": 1.0, "evidence_text": "5 years python"},
        {"skill_name": "SQL", "canonical_name": "sql", "category": "Programming", "confidence_score": 1.0, "evidence_text": "expert sql"},
        {"skill_name": "Pandas", "canonical_name": "pandas", "category": "Data Science", "confidence_score": 1.0, "evidence_text": "pandas data manipulation"},
    ]

    job_skills = [
        {"skill_name": "Python", "canonical_name": "python", "category": "Programming", "importance": "required", "evidence_text": "Python required"},
        {"skill_name": "SQL", "canonical_name": "sql", "category": "Programming", "importance": "required", "evidence_text": "SQL required"},
        {"skill_name": "Power BI", "canonical_name": "power bi", "category": "Data Science", "importance": "required", "evidence_text": "Power BI required"},
    ]

    resume_data = {
        "raw_text": "Python SQL Pandas developer with 3 years experience at TechCorp.",
        "experience": [{"title_company": "Software Engineer", "date_range": "2021 - 2024"}],
        "education": [{"degree": "Bachelor of Science in Computer Science"}],
    }

    job_data = {
        "raw_text": "Looking for Data Analyst with 2+ years experience.",
        "parsed_requirements": {"min_experience_years": 2, "responsibilities": ["Build SQL queries and reports"]},
    }

    res = CareerMatchEngine.compute_match(
        resume_data=resume_data,
        resume_skills=resume_skills,
        job_data=job_data,
        job_skills=job_skills,
    )

    assert 0.0 <= res["overall_match_score"] <= 100.0
    assert res["matching_skills_count"] == 2  # Python, SQL
    assert res["missing_skills_count"] == 1   # Power BI
    assert "score_breakdown" in res
    assert "weights_used" in res["score_breakdown"]
    assert "calculation_audit" in res["score_breakdown"]


def test_analysis_api_flow(client: TestClient):
    # 1. Register and Login
    user_payload = {"email": "analysistester@example.com", "password": "Password123!", "full_name": "Analysis Tester"}
    client.post("/api/v1/auth/register", json=user_payload)
    login_res = client.post("/api/v1/auth/login", json={"email": user_payload["email"], "password": user_payload["password"]})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload Resume
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Jane Doe\njane@example.com\n\nSKILLS\nPython, SQL, FastApi, PostgreSQL\n\nEXPERIENCE\nSoftware Engineer\nAcme | 2020 - 2024\n* Built APIs\n\nEDUCATION\nB.S. in CS Stanford 2020")
    pdf_bytes = doc.write()
    doc.close()

    upload_res = client.post("/api/v1/resumes/upload", files={"file": ("resume.pdf", pdf_bytes, "application/pdf")}, headers=headers)
    assert upload_res.status_code == 201
    resume_id = upload_res.json()["id"]

    # 3. Create Job Description 1 (High Match)
    job1_res = client.post("/api/v1/jobs/analyze", json={
        "title": "Backend Python Developer",
        "company": "Tech Innovators",
        "raw_text": "Requirements:\n3+ years experience in Python and PostgreSQL.\nExperience with FastAPI and SQL.\nBachelor's in CS.",
    }, headers=headers)
    assert job1_res.status_code == 201
    job1_id = job1_res.json()["id"]

    # 4. Create Job Description 2 (Lower Match)
    job2_res = client.post("/api/v1/jobs/analyze", json={
        "title": "Frontend Lead",
        "company": "Design Studio",
        "raw_text": "Requirements:\n5+ years experience in React, Vue.js, Angular, CSS, and Figma.\nMaster's degree preferred.",
    }, headers=headers)
    assert job2_res.status_code == 201
    job2_id = job2_res.json()["id"]

    # 5. Run Match Analysis on Job 1
    match_res = client.post("/api/v1/analysis/match", json={
        "resume_id": resume_id,
        "job_id": job1_id,
    }, headers=headers)
    assert match_res.status_code == 201
    analysis_data = match_res.json()
    analysis_id = analysis_data["id"]
    assert analysis_data["overall_match_score"] >= 70.0
    assert len(analysis_data["skill_gaps"]) >= 0

    # 6. Get Analysis by ID
    get_analysis = client.get(f"/api/v1/analysis/{analysis_id}", headers=headers)
    assert get_analysis.status_code == 200
    assert get_analysis.json()["id"] == analysis_id

    # 7. Compare Multiple Jobs
    compare_res = client.post("/api/v1/analysis/compare-jobs", json={
        "resume_id": resume_id,
        "job_ids": [job1_id, job2_id],
    }, headers=headers)
    assert compare_res.status_code == 200
    rankings = compare_res.json()["rankings"]
    assert len(rankings) == 2
    # Job 1 (Python) should rank higher than Job 2 (Frontend) for a Python resume
    assert rankings[0]["job_id"] == job1_id
    assert rankings[0]["overall_match_score"] > rankings[1]["overall_match_score"]
