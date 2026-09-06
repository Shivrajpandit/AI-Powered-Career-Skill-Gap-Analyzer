from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict, Field


class RoadmapItemResponse(BaseModel):
    id: str
    roadmap_id: str
    stage_order: int
    stage_title: str
    topics: Optional[List[str]] = []
    project_suggestion: Optional[str] = None
    recommended_resources: Optional[List[Dict[str, Any]]] = []
    status: str  # NOT_STARTED, IN_PROGRESS, COMPLETED

    model_config = ConfigDict(from_attributes=True)


class RoadmapItemStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(NOT_STARTED|IN_PROGRESS|COMPLETED)$")


class RoadmapCreate(BaseModel):
    analysis_id: str
    target_weeks: Optional[int] = 12


class LearningRoadmapResponse(BaseModel):
    id: str
    analysis_id: str
    title: str
    summary: Optional[str] = None
    estimated_duration_weeks: int
    items: List[RoadmapItemResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeQualityAuditResponse(BaseModel):
    overall_quality_score: int
    rating: str
    strengths: List[str]
    actionable_improvements: List[str]
    detailed_checks: Dict[str, Any]
