import uuid
from datetime import datetime, timezone
from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.resume import Resume
    from app.models.job import JobDescription
    from app.models.roadmap import LearningRoadmap


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    resume_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False
    )
    job_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("job_descriptions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    overall_match_score: Mapped[float] = mapped_column(Float, nullable=False)
    skill_match_score: Mapped[float] = mapped_column(Float, nullable=False)
    experience_match_score: Mapped[float] = mapped_column(Float, nullable=False)
    education_match_score: Mapped[float] = mapped_column(Float, nullable=False)
    keyword_match_score: Mapped[float] = mapped_column(Float, nullable=False)
    score_breakdown: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="analyses")
    resume: Mapped["Resume"] = relationship("Resume", back_populates="analyses")
    job: Mapped["JobDescription"] = relationship("JobDescription", back_populates="analyses")
    skill_gaps: Mapped[List["SkillGap"]] = relationship(
        "SkillGap", back_populates="analysis", cascade="all, delete-orphan"
    )
    roadmap: Mapped[Optional["LearningRoadmap"]] = relationship(
        "LearningRoadmap", back_populates="analysis", uselist=False, cascade="all, delete-orphan"
    )


class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    analysis_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analyses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    skill_name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False)  # HIGH, MEDIUM, LOW
    match_type: Mapped[str] = mapped_column(String(30), nullable=False)  # MISSING, RELATED_ONLY, PARTIAL
    related_existing_skill: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    similarity_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Relationships
    analysis: Mapped["Analysis"] = relationship("Analysis", back_populates="skill_gaps")
