import re
from typing import Dict, Any, List, Optional
import spacy

# Load spaCy pipeline
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = spacy.blank("en")


# Regex patterns
EMAIL_PATTERN = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b"
)
PHONE_PATTERN = re.compile(
    r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b"
)
LINKEDIN_PATTERN = re.compile(
    r"(?:https?://)?(?:www\.)?linkedin\.com/(?:in|pub)/[A-Za-z0-9_-]+/?",
    re.IGNORECASE,
)
GITHUB_PATTERN = re.compile(
    r"(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9_-]+/?",
    re.IGNORECASE,
)
PORTFOLIO_PATTERN = re.compile(
    r"(?:https?://)?(?:www\.)?(?:[a-zA-Z0-9-]+\.)+(?:com|io|me|dev|org|net)(?:/[^\s]*)?",
    re.IGNORECASE,
)

DEGREE_PATTERNS = [
    re.compile(r"\b(Ph\.?D\.?|Doctor of Philosophy)\b", re.IGNORECASE),
    re.compile(r"\b(Master of Science|Master of Arts|M\.?S\.?|M\.?A\.?|M\.?Tech|MBA|M\.?Sc\.?)\b", re.IGNORECASE),
    re.compile(r"\b(Bachelor of Science|Bachelor of Arts|Bachelor of Engineering|B\.?S\.?|B\.?A\.?|B\.?Tech|B\.?E\.?|B\.?Sc\.?|BBA)\b", re.IGNORECASE),
    re.compile(r"\b(Associate Degree|Diploma|High School)\b", re.IGNORECASE),
]

YEAR_PATTERN = re.compile(r"\b(19\d{2}|20\d{2})\b")
GPA_PATTERN = re.compile(r"\b(?:GPA|CGPA)[:\s]*([0-4](?:\.\d{1,2})?|[0-9](?:\.\d{1,2})?\/10|\d(?:\.\d{1,2})?\/4)\b", re.IGNORECASE)


def extract_contact_info(header_text: str, full_text: str) -> Dict[str, Any]:
    """Extract candidate name, email, phone, location, and web profiles."""
    contact: Dict[str, Any] = {
        "full_name": None,
        "email": None,
        "phone": None,
        "location": None,
        "linkedin": None,
        "github": None,
        "portfolio": None,
    }

    # Search in full text or header
    search_text = f"{header_text}\n{full_text[:1000]}"

    # Email
    email_match = EMAIL_PATTERN.search(search_text)
    if email_match:
        contact["email"] = email_match.group(0).lower()

    # Phone
    phone_match = PHONE_PATTERN.search(search_text)
    if phone_match:
        contact["phone"] = phone_match.group(0).strip()

    # LinkedIn
    linkedin_match = LINKEDIN_PATTERN.search(search_text)
    if linkedin_match:
        contact["linkedin"] = linkedin_match.group(0)

    # GitHub
    github_match = GITHUB_PATTERN.search(search_text)
    if github_match:
        contact["github"] = github_match.group(0)

    # Portfolio / Website
    for match in PORTFOLIO_PATTERN.finditer(search_text):
        url = match.group(0)
        if "linkedin.com" not in url and "github.com" not in url:
            contact["portfolio"] = url
            break

    # Name extraction using spaCy PERSON entity or top line heuristic
    header_lines = [line.strip() for line in header_text.split("\n") if line.strip()]
    if header_lines:
        first_line = header_lines[0]
        # If first line looks like a name (not an email or phone, short length)
        if len(first_line.split()) <= 4 and not EMAIL_PATTERN.search(first_line) and not PHONE_PATTERN.search(first_line):
            contact["full_name"] = first_line
        else:
            doc = nlp(header_text)
            for ent in doc.ents:
                if ent.label_ == "PERSON" and len(ent.text.split()) >= 2:
                    contact["full_name"] = ent.text.strip()
                    break

    # Location extraction using spaCy GPE or regex
    doc = nlp(header_text)
    for ent in doc.ents:
        if ent.label_ in ("GPE", "LOC"):
            contact["location"] = ent.text.strip()
            break

    return contact


def extract_education(education_text: str) -> List[Dict[str, Any]]:
    """Parse education entries (Degree, Institution, Dates, GPA)."""
    if not education_text:
        return []

    entries = []
    blocks = [b.strip() for b in education_text.split("\n\n") if b.strip()]
    if not blocks or len(blocks) == 1:
        blocks = [line.strip() for line in education_text.split("\n") if line.strip()]

    for block in blocks:
        entry: Dict[str, Any] = {
            "degree": None,
            "institution": None,
            "year": None,
            "gpa": None,
            "details": block,
        }

        # Degree
        for deg_pattern in DEGREE_PATTERNS:
            match = deg_pattern.search(block)
            if match:
                entry["degree"] = match.group(0)
                break

        # Year
        years = YEAR_PATTERN.findall(block)
        if years:
            entry["year"] = " - ".join(years) if len(years) > 1 else years[0]

        # GPA
        gpa_match = GPA_PATTERN.search(block)
        if gpa_match:
            entry["gpa"] = gpa_match.group(1)

        # Institution (spaCy ORG or line fallback)
        doc = nlp(block)
        for ent in doc.ents:
            if ent.label_ == "ORG":
                entry["institution"] = ent.text.strip()
                break

        if not entry["institution"] and not entry["degree"] and len(block) < 10:
            continue

        entries.append(entry)

    return entries


def extract_experience(experience_text: str) -> List[Dict[str, Any]]:
    """Parse work experience entries (Title, Company, Date, Highlights)."""
    if not experience_text:
        return []

    entries = []
    blocks = re.split(r"\n(?=[A-Z0-9][A-Za-z0-9\s,\-\|/]{3,50}\n)", experience_text)

    for block in blocks:
        lines = [line.strip() for line in block.split("\n") if line.strip()]
        if not lines:
            continue

        header_line = lines[0]
        responsibilities = [l.lstrip("*-•▪ ").strip() for l in lines[1:] if len(l.strip()) > 5]

        # Check for date range
        years = YEAR_PATTERN.findall(block)
        date_range = " - ".join(years) if len(years) >= 2 else (years[0] if years else None)

        entry = {
            "title_company": header_line,
            "date_range": date_range,
            "responsibilities": responsibilities,
            "full_text": block,
        }
        entries.append(entry)

    return entries


def extract_projects(projects_text: str) -> List[Dict[str, Any]]:
    """Parse project items from projects section."""
    if not projects_text:
        return []

    entries = []
    blocks = re.split(r"\n(?=[A-Z0-9][A-Za-z0-9\s,\-\|/]{3,50}\n)", projects_text)

    for block in blocks:
        lines = [line.strip() for line in block.split("\n") if line.strip()]
        if not lines:
            continue

        title = lines[0]
        description = " ".join([l.lstrip("*-•▪ ").strip() for l in lines[1:]])

        entries.append({
            "title": title,
            "description": description if description else title,
        })

    return entries


def calculate_completeness_score(
    contact: Dict[str, Any],
    sections: Dict[str, str],
    education: List[Dict[str, Any]],
    experience: List[Dict[str, Any]],
    projects: List[Dict[str, Any]],
) -> float:
    """Calculate 0-100 quality score based on resume structure, completeness and depth."""
    score = 0.0

    # Contact info: 25 points
    if contact.get("full_name"):
        score += 5.0
    if contact.get("email"):
        score += 10.0
    if contact.get("phone"):
        score += 5.0
    if contact.get("linkedin") or contact.get("github") or contact.get("portfolio"):
        score += 5.0

    # Summary: 10 points
    if "summary" in sections and len(sections["summary"]) > 50:
        score += 10.0

    # Experience: 25 points
    if experience:
        score += 15.0
        # Check for bullet points / achievements
        if any(len(exp.get("responsibilities", [])) > 0 for exp in experience):
            score += 10.0

    # Education: 15 points
    if education:
        score += 15.0

    # Projects: 15 points
    if projects:
        score += 15.0

    # Skills section presence: 10 points
    if "skills" in sections and len(sections["skills"]) > 10:
        score += 10.0

    return min(100.0, round(score, 2))
