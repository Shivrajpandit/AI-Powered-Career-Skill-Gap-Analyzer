from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class ContactInfo(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None


class EducationEntry(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[str] = None
    gpa: Optional[str] = None
    details: Optional[str] = None


class ExperienceEntry(BaseModel):
    title_company: Optional[str] = None
    date_range: Optional[str] = None
    responsibilities: List[str] = []
    full_text: Optional[str] = None


class ProjectEntry(BaseModel):
    title: str
    description: str


class ParsedResumeData(BaseModel):
    contact: ContactInfo
    summary: Optional[str] = None
    education: List[EducationEntry] = []
    experience: List[ExperienceEntry] = []
    projects: List[ProjectEntry] = []
    certifications: List[str] = []
    skills_raw: Optional[str] = None
    achievements: List[str] = []
    sections_found: List[str] = []


class ResumeSkillResponse(BaseModel):
    id: str
    skill_name: str
    canonical_name: str
    category: str
    confidence_score: float
    evidence_text: Optional[str] = None
    years_of_experience: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    file_name: str
    file_type: str
    raw_text: str
    parsed_data: Optional[Dict[str, Any]] = None
    completeness_score: Optional[float] = 0.0
    skills: List[ResumeSkillResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeUpdate(BaseModel):
    parsed_data: Optional[Dict[str, Any]] = None
