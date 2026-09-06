from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict, Field


class JobSkillResponse(BaseModel):
    id: str
    job_id: str
    skill_name: str
    canonical_name: str
    category: str
    importance: str  # required, preferred
    evidence_text: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class JobDescriptionCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    raw_text: str = Field(..., min_length=20)


class JobDescriptionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    company: Optional[str] = None
    raw_text: str
    parsed_requirements: Optional[Dict[str, Any]] = None
    skills: List[JobSkillResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
