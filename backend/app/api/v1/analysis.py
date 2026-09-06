from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.resume import Resume
from app.models.job import JobDescription
from app.models.analysis import Analysis, SkillGap
from app.schemas.analysis import (
    AnalysisCreate,
    AnalysisResponse,
    CompareJobsRequest,
    CompareJobsResponse,
    JobMatchSummary,
)
from app.services.scoring.engine import CareerMatchEngine

router = APIRouter()


@router.post("/match", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
def match_resume_to_job(
    match_in: AnalysisCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Execute AI/NLP hybrid matching and transparent explainable scoring."""
    # 1. Fetch Resume
    resume = (
        db.query(Resume)
        .filter(Resume.id == match_in.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    # 2. Fetch Job Description
    job = (
        db.query(JobDescription)
        .filter(JobDescription.id == match_in.job_id, JobDescription.user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found.",
        )

    # 3. Format resume skills and job skills for matcher
    resume_skills_data = [
        {
            "skill_name": s.skill_name,
            "canonical_name": s.canonical_name,
            "category": s.category,
            "confidence_score": s.confidence_score,
            "evidence_text": s.evidence_text,
        }
        for s in resume.skills
    ]

    job_skills_data = [
        {
            "skill_name": s.skill_name,
            "canonical_name": s.canonical_name,
            "category": s.category,
            "importance": s.importance,
            "evidence_text": s.evidence_text,
        }
        for s in job.skills
    ]

    # 4. Compute Match
    match_result = CareerMatchEngine.compute_match(
        resume_data={
            "raw_text": resume.raw_text,
            "parsed_data": resume.parsed_data or {},
            "education": (resume.parsed_data or {}).get("education", []),
            "experience": (resume.parsed_data or {}).get("experience", []),
        },
        resume_skills=resume_skills_data,
        job_data={
            "raw_text": job.raw_text,
            "parsed_requirements": job.parsed_requirements or {},
        },
        job_skills=job_skills_data,
        weights=match_in.weights,
    )

    # 5. Persist Analysis record
    analysis = Analysis(
        user_id=current_user.id,
        resume_id=resume.id,
        job_id=job.id,
        overall_match_score=match_result["overall_match_score"],
        skill_match_score=match_result["skill_match_score"],
        experience_match_score=match_result["experience_match_score"],
        education_match_score=match_result["education_match_score"],
        keyword_match_score=match_result["keyword_match_score"],
        score_breakdown=match_result["score_breakdown"],
    )
    db.add(analysis)
    db.flush()

    # 6. Persist SkillGap records
    for gap in match_result.get("skill_gaps", []):
        skill_gap = SkillGap(
            analysis_id=analysis.id,
            skill_name=gap["skill_name"],
            category=gap["category"],
            priority=gap["priority"],
            match_type=gap["match_type"],
            related_existing_skill=gap.get("related_existing_skill"),
            similarity_score=gap.get("similarity_score"),
        )
        db.add(skill_gap)

    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("", response_model=List[AnalysisResponse])
def get_user_analyses(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Retrieve all past analyses for the authenticated user."""
    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )
    return analyses


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_by_id(
    analysis_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Retrieve full analysis report by ID."""
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found.",
        )
    return analysis


@router.post("/compare-jobs", response_model=CompareJobsResponse)
def compare_jobs_for_resume(
    req: CompareJobsRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Compare and rank a resume against multiple job descriptions."""
    resume = (
        db.query(Resume)
        .filter(Resume.id == req.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    resume_skills_data = [
        {
            "skill_name": s.skill_name,
            "canonical_name": s.canonical_name,
            "category": s.category,
            "confidence_score": s.confidence_score,
            "evidence_text": s.evidence_text,
        }
        for s in resume.skills
    ]

    rankings = []
    for j_id in req.job_ids:
        job = (
            db.query(JobDescription)
            .filter(JobDescription.id == j_id, JobDescription.user_id == current_user.id)
            .first()
        )
        if not job:
            continue

        job_skills_data = [
            {
                "skill_name": s.skill_name,
                "canonical_name": s.canonical_name,
                "category": s.category,
                "importance": s.importance,
                "evidence_text": s.evidence_text,
            }
            for s in job.skills
        ]

        match_res = CareerMatchEngine.compute_match(
            resume_data={
                "raw_text": resume.raw_text,
                "parsed_data": resume.parsed_data or {},
                "education": (resume.parsed_data or {}).get("education", []),
                "experience": (resume.parsed_data or {}).get("experience", []),
            },
            resume_skills=resume_skills_data,
            job_data={
                "raw_text": job.raw_text,
                "parsed_requirements": job.parsed_requirements or {},
            },
            job_skills=job_skills_data,
        )

        rankings.append(
            JobMatchSummary(
                job_id=job.id,
                title=job.title,
                company=job.company,
                overall_match_score=match_res["overall_match_score"],
                skill_match_score=match_res["skill_match_score"],
                matching_skills_count=match_res["matching_skills_count"],
                missing_skills_count=match_res["missing_skills_count"],
            )
        )

    # Sort descending by overall match score
    rankings.sort(key=lambda x: x.overall_match_score, reverse=True)

    return CompareJobsResponse(resume_id=resume.id, rankings=rankings)


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(
    analysis_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> None:
    """Delete an analysis report."""
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found.",
        )
    db.delete(analysis)
    db.commit()
