import io
import fitz  # PyMuPDF
import docx
from fastapi.testclient import TestClient

from app.services.document_parser.sanitizer import clean_text
from app.services.document_parser.section_segmenter import segment_sections
from app.services.document_parser.entity_parser import (
    extract_contact_info,
    extract_education,
    extract_experience,
    extract_projects,
    calculate_completeness_score,
)
from app.services.document_parser.parser import ResumeParserService


SAMPLE_RESUME_TEXT = """
Alex Mercer
alex.mercer@example.com | (555) 123-4567 | San Francisco, CA
https://linkedin.com/in/alexmercer | https://github.com/alexmercer

PROFESSIONAL SUMMARY
Experienced Software Engineer with 4+ years of expertise in Python, FastAPI, and Machine Learning. Passionate about building high-throughput data-driven applications.

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL
Frameworks: FastAPI, React, Node.js, PyTorch, Scikit-Learn
Cloud & Tools: Docker, AWS, PostgreSQL, Git, Redis

WORK EXPERIENCE
Senior Backend Engineer
Acme Corp | 2021 - 2024
• Designed and developed scalable REST APIs handling 5M daily requests using FastAPI and PostgreSQL.
• Reduced database query latency by 35% through query optimization and Redis caching.
• Mentored junior engineers and led code review processes.

Software Developer
Tech Innovations Inc | 2019 - 2021
• Built internal dashboards using React and Python.
• Automated data extraction pipelines reducing manual reporting time by 50%.

EDUCATION
Master of Science in Computer Science
Stanford University | 2017 - 2019 | GPA: 3.85

Bachelor of Science in Information Technology
UC Berkeley | 2013 - 2017

PROJECTS
Skill Gap Analyzer
• Developed an AI application that matches candidate resumes with job descriptions using spaCy and sentence embeddings.

Distributed Task Queue
• Implemented a lightweight task scheduler in Python using Redis and asyncio.

CERTIFICATIONS
AWS Certified Solutions Architect
TensorFlow Developer Certificate
"""


def create_sample_pdf() -> bytes:
    """Create a minimal in-memory PDF for testing."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), SAMPLE_RESUME_TEXT)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes


def create_sample_docx() -> bytes:
    """Create a minimal in-memory DOCX for testing."""
    doc = docx.Document()
    for paragraph in SAMPLE_RESUME_TEXT.strip().split("\n\n"):
        doc.add_paragraph(paragraph)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_text_cleaner():
    dirty = "John   Doe\n\n\n\n• Point 1\r\n• Point 2\t\twith spaces"
    cleaned = clean_text(dirty)
    assert "John Doe" in cleaned
    assert "* Point 1" in cleaned
    assert "* Point 2 with spaces" in cleaned


def test_section_segmenter():
    cleaned = clean_text(SAMPLE_RESUME_TEXT)
    sections = segment_sections(cleaned)
    assert "summary" in sections
    assert "skills" in sections
    assert "experience" in sections
    assert "education" in sections
    assert "projects" in sections
    assert "certifications" in sections


def test_contact_info_extraction():
    cleaned = clean_text(SAMPLE_RESUME_TEXT)
    sections = segment_sections(cleaned)
    contact = extract_contact_info(sections.get("header", ""), cleaned)

    assert contact["email"] == "alex.mercer@example.com"
    assert "123-4567" in contact["phone"]
    assert "linkedin.com/in/alexmercer" in contact["linkedin"]
    assert "github.com/alexmercer" in contact["github"]
    assert "Alex Mercer" in contact["full_name"]


def test_education_extraction():
    cleaned = clean_text(SAMPLE_RESUME_TEXT)
    sections = segment_sections(cleaned)
    edu = extract_education(sections.get("education", ""))
    assert len(edu) >= 1
    assert any("Stanford" in (e.get("institution") or "") or "Stanford" in (e.get("details") or "") for e in edu)


def test_experience_extraction():
    cleaned = clean_text(SAMPLE_RESUME_TEXT)
    sections = segment_sections(cleaned)
    exp = extract_experience(sections.get("experience", ""))
    assert len(exp) >= 1
    assert any(len(e.get("responsibilities", [])) > 0 for e in exp)


def test_completeness_scoring():
    cleaned = clean_text(SAMPLE_RESUME_TEXT)
    sections = segment_sections(cleaned)
    contact = extract_contact_info(sections.get("header", ""), cleaned)
    edu = extract_education(sections.get("education", ""))
    exp = extract_experience(sections.get("experience", ""))
    proj = extract_projects(sections.get("projects", ""))

    score = calculate_completeness_score(contact, sections, edu, exp, proj)
    assert score >= 80.0


def test_pdf_parsing_service():
    pdf_bytes = create_sample_pdf()
    parsed = ResumeParserService.parse_file(pdf_bytes, "sample_resume.pdf")
    assert "Alex Mercer" in parsed["raw_text"]
    assert parsed["parsed_data"]["contact"]["email"] == "alex.mercer@example.com"
    assert parsed["completeness_score"] > 70.0


def test_docx_parsing_service():
    docx_bytes = create_sample_docx()
    parsed = ResumeParserService.parse_file(docx_bytes, "sample_resume.docx")
    assert "Alex Mercer" in parsed["raw_text"]
    assert parsed["parsed_data"]["contact"]["email"] == "alex.mercer@example.com"


def test_resume_api_endpoints(client: TestClient):
    # 1. Register and get token
    user_payload = {
        "email": "resumetest@example.com",
        "password": "Password123!",
        "full_name": "Resume Tester",
    }
    client.post("/api/v1/auth/register", json=user_payload)
    login_res = client.post("/api/v1/auth/login", json={"email": user_payload["email"], "password": user_payload["password"]})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload PDF
    pdf_bytes = create_sample_pdf()
    files = {"file": ("my_resume.pdf", pdf_bytes, "application/pdf")}
    upload_res = client.post("/api/v1/resumes/upload", files=files, headers=headers)
    assert upload_res.status_code == 201
    resume_data = upload_res.json()
    resume_id = resume_data["id"]
    assert resume_data["file_name"] == "my_resume.pdf"
    assert resume_data["file_type"] == "pdf"
    assert resume_data["completeness_score"] > 0

    # 3. List Resumes
    list_res = client.get("/api/v1/resumes", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 4. Get Resume by ID
    get_res = client.get(f"/api/v1/resumes/{resume_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == resume_id

    # 5. Update parsed data
    custom_parsed = resume_data["parsed_data"]
    custom_parsed["contact"]["location"] = "Seattle, WA"
    update_res = client.put(f"/api/v1/resumes/{resume_id}", json={"parsed_data": custom_parsed}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["parsed_data"]["contact"]["location"] == "Seattle, WA"

    # 6. Delete Resume
    delete_res = client.delete(f"/api/v1/resumes/{resume_id}", headers=headers)
    assert delete_res.status_code == 204

    # 7. Verify deletion
    verify_res = client.get(f"/api/v1/resumes/{resume_id}", headers=headers)
    assert verify_res.status_code == 404
