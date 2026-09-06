import re
from typing import Dict

# Common section header keywords
SECTION_PATTERNS = {
    "summary": re.compile(
        r"^(professional\s+summary|summary|profile|about\s+me|career\s+objective|objective|executive\s+summary)\b",
        re.IGNORECASE,
    ),
    "skills": re.compile(
        r"^(technical\s+skills|core\s+competencies|key\s+skills|skills\s*&\s*expertise|skills|technologies|skill\s+set|tools\s*&\s*technologies)\b",
        re.IGNORECASE,
    ),
    "experience": re.compile(
        r"^(work\s+experience|professional\s+experience|experience|employment\s+history|career\s+history|internships?|work\s+history)\b",
        re.IGNORECASE,
    ),
    "education": re.compile(
        r"^(education|academic\s+background|academic\s+qualifications|academics|qualifications|degrees?)\b",
        re.IGNORECASE,
    ),
    "projects": re.compile(
        r"^(projects|personal\s+projects|academic\s+projects|key\s+projects|technical\s+projects)\b",
        re.IGNORECASE,
    ),
    "certifications": re.compile(
        r"^(certifications?|licenses?|courses?|accreditations?|training)\b",
        re.IGNORECASE,
    ),
    "achievements": re.compile(
        r"^(achievements?|awards?|honors?|publications?|extracurriculars?)\b",
        re.IGNORECASE,
    ),
}


def segment_sections(cleaned_text: str) -> Dict[str, str]:
    """Segment cleaned resume text into standard thematic sections."""
    lines = cleaned_text.split("\n")
    sections: Dict[str, list] = {
        "header": [],
        "summary": [],
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": [],
        "achievements": [],
        "other": [],
    }

    current_section = "header"

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Check if line matches a section header
        # Section headers are typically short (< 40 characters) and not full sentences
        is_header = False
        if len(stripped) < 45 and not stripped.endswith((".", ",", ";")):
            for section_key, pattern in SECTION_PATTERNS.items():
                # Check for exact header match or colon suffix (e.g. "EXPERIENCE:")
                clean_header_candidate = re.sub(r"[:\-_|#*]", "", stripped).strip()
                if pattern.match(clean_header_candidate):
                    current_section = section_key
                    is_header = True
                    break

        if is_header:
            continue

        sections[current_section].append(stripped)

    # Convert list of lines into joined string for each section
    result = {k: "\n".join(v).strip() for k, v in sections.items() if v}
    return result
