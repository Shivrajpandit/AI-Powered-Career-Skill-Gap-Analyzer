import re
from typing import Dict, Any, List
from app.services.skill_extractor.extractor import skill_extractor
from app.services.document_parser.sanitizer import clean_text

EXPERIENCE_REGEX = re.compile(
    r"(\b\d{1,2}(?:\+|-|\s*to\s*\d{1,2})?\s*(?:years?|yrs?)(?:\s*of)?\s*(?:relevant|practical|professional|work)?\s*experience\b)",
    re.IGNORECASE,
)

MIN_YEARS_REGEX = re.compile(r"(\d{1,2})\s*(?:\+|-\s*\d{1,2}|\s*to\s*\d{1,2})?\s*(?:years?|yrs?)", re.IGNORECASE)

EDUCATION_REGEX = re.compile(
    r"\b(bachelor'?s?|master'?s?|ph\.?d\.?|b\.?s\.?|m\.?s\.?|b\.?tech|m\.?tech|computer science|engineering|data science|statistics|mathematics)\b",
    re.IGNORECASE,
)

REQUIRED_SECTION_REGEX = re.compile(
    r"(requirements?|qualifications?|must\s+have|what\s+you('ll)?\s+need|minimum\s+qualifications?|what\s+we('re)?\s+looking\s+for)",
    re.IGNORECASE,
)

PREFERRED_SECTION_REGEX = re.compile(
    r"(preferred\s+qualifications?|nice\s+to\s+have|bonus\s+points?|preferred\s+skills?|good\s+to\s+have|plus|advantages?)",
    re.IGNORECASE,
)

RESPONSIBILITIES_SECTION_REGEX = re.compile(
    r"(responsibilities|what\s+you('ll)?\s+do|key\s+responsibilities|role\s+overview|day\s+to\s+day)",
    re.IGNORECASE,
)


class JobDescriptionParser:
    @staticmethod
    def parse_job_description(raw_text: str, title: str = "", company: str = "") -> Dict[str, Any]:
        """Analyze job description to extract structured requirements and categorized skills."""
        cleaned_text = clean_text(raw_text)

        # 1. Experience detection
        experience_matches = EXPERIENCE_REGEX.findall(cleaned_text)
        min_years = 0
        for match in experience_matches:
            num_match = MIN_YEARS_REGEX.search(match)
            if num_match:
                years = int(num_match.group(1))
                if years > min_years:
                    min_years = years

        # 2. Education requirement detection
        education_matches = list(set(EDUCATION_REGEX.findall(cleaned_text)))
        education_summary = ", ".join([e.title() for e in education_matches]) if education_matches else "Not specified"

        # 3. Section division for required vs preferred
        lines = cleaned_text.split("\n")
        required_text_lines = []
        preferred_text_lines = []
        responsibilities_lines = []
        current_mode = "general"

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            if len(stripped) < 50:
                if PREFERRED_SECTION_REGEX.search(stripped):
                    current_mode = "preferred"
                    continue
                elif REQUIRED_SECTION_REGEX.search(stripped):
                    current_mode = "required"
                    continue
                elif RESPONSIBILITIES_SECTION_REGEX.search(stripped):
                    current_mode = "responsibilities"
                    continue

            if current_mode == "preferred":
                preferred_text_lines.append(stripped)
            elif current_mode == "required":
                required_text_lines.append(stripped)
            elif current_mode == "responsibilities":
                responsibilities_lines.append(stripped)

        # 4. Extract skills with importance labeling
        all_skills = skill_extractor.extract_skills(cleaned_text)
        preferred_skills_canonical = {
            s["canonical_name"] for s in skill_extractor.extract_skills("\n".join(preferred_text_lines))
        }

        categorized_skills: Dict[str, List[str]] = {}
        processed_skills: List[Dict[str, Any]] = []

        for skill in all_skills:
            canonical = skill["canonical_name"]
            category = skill["category"]

            # Determine importance
            if canonical in preferred_skills_canonical:
                importance = "preferred"
            else:
                importance = "required"

            skill_item = {
                "skill_name": skill["skill_name"],
                "canonical_name": canonical,
                "category": category,
                "importance": importance,
                "evidence_text": skill["evidence_text"],
            }
            processed_skills.append(skill_item)

            if category not in categorized_skills:
                categorized_skills[category] = []
            categorized_skills[category].append(skill["skill_name"])

        parsed_requirements = {
            "title": title,
            "company": company,
            "min_experience_years": min_years,
            "experience_summary": f"{min_years}+ years" if min_years > 0 else "Entry-level / Not strictly specified",
            "education_requirements": education_summary,
            "total_skills_count": len(processed_skills),
            "categorized_skills": categorized_skills,
            "responsibilities": responsibilities_lines[:8],
        }

        return {
            "raw_text": cleaned_text,
            "parsed_requirements": parsed_requirements,
            "skills": processed_skills,
        }
