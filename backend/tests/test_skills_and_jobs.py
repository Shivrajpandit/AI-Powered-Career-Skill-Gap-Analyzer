from fastapi.testclient import TestClient
from app.services.taxonomy.manager import taxonomy_manager
from app.services.skill_extractor.extractor import skill_extractor
from app.services.skill_extractor.job_parser import JobDescriptionParser


SAMPLE_JOB_DESCRIPTION = """
We are seeking a Senior Data Scientist to join our AI engineering team at Apex Analytics.

Requirements & Qualifications:
• 3+ years of practical experience in Machine Learning and Python.
• Strong hands-on proficiency in SQL, Pandas, and Scikit-Learn.
• Experience building REST APIs with FastAPI or Flask.
• Solid background in Statistics and Hypothesis Testing.
• Bachelor's or Master's degree in Computer Science, Data Science, or related quantitative field.

Preferred / Nice to Have:
• Hands-on experience with Power BI or Tableau.
• Exposure to Docker containerization and AWS cloud deployments.
• Knowledge of Large Language Models (LLMs) and PyTorch.

Responsibilities:
• Design, train, and deploy predictive ML models.
• Collaborate with cross-functional product and engineering teams.
• Perform exploratory data analysis on multi-terabyte datasets.
"""


def test_taxonomy_normalization():
    # Test canonical lookups
    ml_skill = taxonomy_manager.get_canonical_skill("ml")
    assert ml_skill is not None
    assert ml_skill["canonical"] == "machine learning"
    assert ml_skill["category"] == "Machine Learning"

    postgres_skill = taxonomy_manager.get_canonical_skill("postgres")
    assert postgres_skill is not None
    assert postgres_skill["canonical"] == "postgresql"
    assert postgres_skill["category"] == "Database"

    ts_skill = taxonomy_manager.get_canonical_skill("ts")
    assert ts_skill is not None
    assert ts_skill["canonical"] == "typescript"

    powerbi_skill = taxonomy_manager.get_canonical_skill("powerbi")
    assert powerbi_skill is not None
    assert powerbi_skill["canonical"] == "power bi"


def test_skill_extraction_with_evidence():
    text = "Engineered automated data pipelines in Python and PostgreSQL. Deployed models using Docker."
    skills = skill_extractor.extract_skills(text)
    canonical_names = {s["canonical_name"] for s in skills}

    assert "python" in canonical_names
    assert "postgresql" in canonical_names
    assert "docker" in canonical_names

    # Check evidence presence
    for s in skills:
        assert s["confidence_score"] > 0
        assert "evidence_text" in s
        assert len(s["evidence_text"]) > 5


def test_job_description_parser_logic():
    parsed = JobDescriptionParser.parse_job_description(
        raw_text=SAMPLE_JOB_DESCRIPTION,
        title="Senior Data Scientist",
        company="Apex Analytics",
    )

    reqs = parsed["parsed_requirements"]
    assert reqs["min_experience_years"] == 3
    assert "3+ years" in reqs["experience_summary"]
    assert "Computer Science" in reqs["education_requirements"]

    skills = parsed["skills"]
    assert len(skills) >= 6

    # Required vs Preferred validation
    required_skills = {s["canonical_name"] for s in skills if s["importance"] == "required"}
    preferred_skills = {s["canonical_name"] for s in skills if s["importance"] == "preferred"}

    assert "python" in required_skills
    assert "sql" in required_skills
    assert "statistics" in required_skills
    assert "power bi" in preferred_skills or "docker" in preferred_skills or "aws" in preferred_skills


def test_job_api_endpoints(client: TestClient):
    # 1. Register and get token
    user_payload = {
        "email": "jobtester@example.com",
        "password": "Password123!",
        "full_name": "Job Tester",
    }
    client.post("/api/v1/auth/register", json=user_payload)
    login_res = client.post("/api/v1/auth/login", json={"email": user_payload["email"], "password": user_payload["password"]})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Analyze & Save Job
    job_payload = {
        "title": "Senior Data Scientist",
        "company": "Apex Analytics",
        "raw_text": SAMPLE_JOB_DESCRIPTION,
    }
    analyze_res = client.post("/api/v1/jobs/analyze", json=job_payload, headers=headers)
    assert analyze_res.status_code == 201
    job_data = analyze_res.json()
    job_id = job_data["id"]
    assert job_data["title"] == "Senior Data Scientist"
    assert job_data["company"] == "Apex Analytics"
    assert len(job_data["skills"]) >= 5

    # 3. List Jobs
    list_res = client.get("/api/v1/jobs", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 4. Get Job by ID
    get_res = client.get(f"/api/v1/jobs/{job_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == job_id

    # 5. Delete Job
    delete_res = client.delete(f"/api/v1/jobs/{job_id}", headers=headers)
    assert delete_res.status_code == 204

    # 6. Verify Deletion
    verify_res = client.get(f"/api/v1/jobs/{job_id}", headers=headers)
    assert verify_res.status_code == 404
