from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.resume import Resume
from app.models.analysis import Analysis
from app.models.roadmap import LearningRoadmap, RoadmapItem
from app.schemas.roadmap import (
    RoadmapCreate,
    LearningRoadmapResponse,
    RoadmapItemResponse,
    RoadmapItemStatusUpdate,
    ResumeQualityAuditResponse,
)
from app.services.recommender.roadmap import LearningRoadmapGenerator
from app.services.recommender.quality_auditor import ResumeQualityAuditor

router = APIRouter()


@router.post("/generate", response_model=LearningRoadmapResponse, status_code=status.HTTP_201_CREATED)
def generate_roadmap_for_analysis(
    req: RoadmapCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Generate a personalized multi-stage learning roadmap based on detected skill gaps."""
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == req.analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis report not found.",
        )

    # Check if a roadmap already exists for this analysis
    existing_roadmap = (
        db.query(LearningRoadmap)
        .filter(LearningRoadmap.analysis_id == analysis.id)
        .first()
    )
    if existing_roadmap:
        return existing_roadmap

    # Prepare missing and related skills for generator
    missing_skills = [
        {"skill_name": gap.skill_name, "category": gap.category, "priority": gap.priority}
        for gap in analysis.skill_gaps
        if gap.match_type == "MISSING"
    ]

    related_skills = [
        {"job_skill": gap.skill_name, "category": gap.category}
        for gap in analysis.skill_gaps
        if gap.match_type == "RELATED_ONLY"
    ]

    job_title = analysis.job.title if analysis.job else "Career Target"

    roadmap_data = LearningRoadmapGenerator.generate_roadmap(
        analysis_id=analysis.id,
        job_title=job_title,
        missing_skills=missing_skills,
        related_skills=related_skills,
        target_weeks=req.target_weeks or 12,
    )

    roadmap = LearningRoadmap(
        analysis_id=analysis.id,
        title=roadmap_data["title"],
        summary=roadmap_data["summary"],
        estimated_duration_weeks=roadmap_data["estimated_duration_weeks"],
    )
    db.add(roadmap)
    db.flush()

    for stg in roadmap_data["stages"]:
        item = RoadmapItem(
            roadmap_id=roadmap.id,
            stage_order=stg["stage_order"],
            stage_title=stg["stage_title"],
            topics=stg["topics"],
            project_suggestion=stg["project_suggestion"],
            recommended_resources=stg["recommended_resources"],
            status=stg["status"],
        )
        db.add(item)

    db.commit()
    db.refresh(roadmap)
    return roadmap


@router.get("/{analysis_id}", response_model=LearningRoadmapResponse)
def get_roadmap_by_analysis(
    analysis_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Retrieve the generated learning roadmap for an analysis."""
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis report not found.",
        )

    roadmap = (
        db.query(LearningRoadmap)
        .filter(LearningRoadmap.analysis_id == analysis.id)
        .first()
    )
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No roadmap generated yet for this analysis. Call /roadmap/generate first.",
        )
    return roadmap


@router.patch("/items/{item_id}", response_model=RoadmapItemResponse)
def update_roadmap_item_status(
    item_id: str,
    status_update: RoadmapItemStatusUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Update progress status of a roadmap stage (NOT_STARTED, IN_PROGRESS, COMPLETED)."""
    item = db.query(RoadmapItem).filter(RoadmapItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap milestone item not found.",
        )

    # Verify ownership through roadmap -> analysis -> user_id
    if item.roadmap.analysis.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this roadmap.",
        )

    item.status = status_update.status
    db.commit()
    db.refresh(item)
    return item


@router.get("/resumes/{resume_id}/quality-audit", response_model=ResumeQualityAuditResponse)
def audit_resume_quality(
    resume_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Perform actionable quality analysis on a resume (quantified outcomes, action verbs, structure)."""
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    audit_result = ResumeQualityAuditor.audit_resume(
        resume_text=resume.raw_text,
        parsed_data=resume.parsed_data or {},
    )
    return audit_result
