from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict, Field


class AnalysisCreate(BaseModel):
    resume_id: str
    job_id: str
    weights: Optional[Dict[str, float]] = None


class SkillGapResponse(BaseModel):
    id: str
    analysis_id: str
    skill_name: str
    category: str
    priority: str  # HIGH, MEDIUM, LOW
    match_type: str  # MISSING, RELATED_ONLY, PARTIAL
    related_existing_skill: Optional[str] = None
    similarity_score: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class AnalysisResponse(BaseModel):
    id: str
    user_id: str
    resume_id: str
    job_id: str
    overall_match_score: float
    skill_match_score: float
    experience_match_score: float
    education_match_score: float
    keyword_match_score: float
    score_breakdown: Optional[Dict[str, Any]] = None
    skill_gaps: List[SkillGapResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CompareJobsRequest(BaseModel):
    resume_id: str
    job_ids: List[str] = Field(..., min_length=1)


class JobMatchSummary(BaseModel):
    job_id: str
    title: str
    company: Optional[str] = None
    overall_match_score: float
    skill_match_score: float
    matching_skills_count: int
    missing_skills_count: int


class CompareJobsResponse(BaseModel):
    resume_id: str
    rankings: List[JobMatchSummary]
