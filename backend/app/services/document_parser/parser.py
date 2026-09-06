from typing import Dict, Any, List
from app.services.document_parser.extractors import extract_text_from_document
from app.services.document_parser.sanitizer import clean_text
from app.services.document_parser.section_segmenter import segment_sections
from app.services.document_parser.entity_parser import (
    extract_contact_info,
    extract_education,
    extract_experience,
    extract_projects,
    calculate_completeness_score,
)
from app.services.skill_extractor.extractor import skill_extractor


class ResumeParserService:
    @staticmethod
    def parse_file(file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """End-to-end resume parser orchestrator."""
        # 1. Extract raw text from PDF/DOCX
        raw_text = extract_text_from_document(file_bytes, filename)

        # 2. Sanitize and clean text
        cleaned_text = clean_text(raw_text)

        # 3. Segment into standard sections
        sections = segment_sections(cleaned_text)

        # 4. Extract contact info from header/text
        header_text = sections.get("header", "")
        contact = extract_contact_info(header_text, cleaned_text)

        # 5. Extract Education entries
        education = extract_education(sections.get("education", ""))

        # 6. Extract Experience entries
        experience = extract_experience(sections.get("experience", ""))

        # 7. Extract Projects
        projects = extract_projects(sections.get("projects", ""))

        # 8. Extract Skills using taxonomy & context
        skills = skill_extractor.extract_skills(cleaned_text, section_name="skills" if "skills" in sections else None)

        # 9. Calculate Completeness / Quality Score
        completeness_score = calculate_completeness_score(
            contact=contact,
            sections=sections,
            education=education,
            experience=experience,
            projects=projects,
        )

        parsed_data = {
            "contact": contact,
            "summary": sections.get("summary", ""),
            "education": education,
            "experience": experience,
            "projects": projects,
            "certifications": [
                line.strip()
                for line in sections.get("certifications", "").split("\n")
                if line.strip()
            ],
            "skills_raw": sections.get("skills", ""),
            "extracted_skills": [s["skill_name"] for s in skills],
            "achievements": [
                line.strip()
                for line in sections.get("achievements", "").split("\n")
                if line.strip()
            ],
            "sections_found": list(sections.keys()),
        }

        return {
            "raw_text": cleaned_text,
            "parsed_data": parsed_data,
            "skills": skills,
            "completeness_score": completeness_score,
        }
