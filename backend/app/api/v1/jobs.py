from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.job import JobDescription, JobSkill
from app.schemas.job import JobDescriptionCreate, JobDescriptionResponse
from app.services.skill_extractor.job_parser import JobDescriptionParser

router = APIRouter()


@router.post("/analyze", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
def analyze_and_save_job(
    job_in: JobDescriptionCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Analyze job description text, extract requirements and categorized skills, and persist."""
    parsed_result = JobDescriptionParser.parse_job_description(
        raw_text=job_in.raw_text,
        title=job_in.title,
        company=job_in.company or "",
    )

    job = JobDescription(
        user_id=current_user.id,
        title=job_in.title,
        company=job_in.company,
        raw_text=parsed_result["raw_text"],
        parsed_requirements=parsed_result["parsed_requirements"],
    )
    db.add(job)
    db.flush()

    # Add extracted job skills
    for sk in parsed_result.get("skills", []):
        job_skill = JobSkill(
            job_id=job.id,
            skill_name=sk["skill_name"],
            canonical_name=sk["canonical_name"],
            category=sk["category"],
            importance=sk["importance"],
            evidence_text=sk["evidence_text"],
        )
        db.add(job_skill)

    db.commit()
    db.refresh(job)
    return job


@router.get("", response_model=List[JobDescriptionResponse])
def get_user_jobs(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Retrieve all saved job descriptions for current user."""
    jobs = (
        db.query(JobDescription)
        .filter(JobDescription.user_id == current_user.id)
        .order_by(JobDescription.created_at.desc())
        .all()
    )
    return jobs


@router.get("/{job_id}", response_model=JobDescriptionResponse)
def get_job_by_id(
    job_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get details for a specific job description."""
    job = (
        db.query(JobDescription)
        .filter(JobDescription.id == job_id, JobDescription.user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found.",
        )
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> None:
    """Delete a job description by ID."""
    job = (
        db.query(JobDescription)
        .filter(JobDescription.id == job_id, JobDescription.user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found.",
        )
    db.delete(job)
    db.commit()
