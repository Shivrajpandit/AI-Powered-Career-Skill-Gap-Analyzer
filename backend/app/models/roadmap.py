import uuid
from datetime import datetime, timezone
from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.analysis import Analysis


class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    analysis_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analyses.id", ondelete="CASCADE"), index=True, unique=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estimated_duration_weeks: Mapped[int] = mapped_column(Integer, default=12)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    analysis: Mapped["Analysis"] = relationship("Analysis", back_populates="roadmap")
    items: Mapped[List["RoadmapItem"]] = relationship(
        "RoadmapItem", back_populates="roadmap", cascade="all, delete-orphan"
    )


class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    roadmap_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("learning_roadmaps.id", ondelete="CASCADE"), index=True, nullable=False
    )
    stage_order: Mapped[int] = mapped_column(Integer, nullable=False)  # 1, 2, 3...
    stage_title: Mapped[str] = mapped_column(String(255), nullable=False)
    topics: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    project_suggestion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recommended_resources: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), default="NOT_STARTED", nullable=False
    )  # NOT_STARTED, IN_PROGRESS, COMPLETED

    # Relationships
    roadmap: Mapped["LearningRoadmap"] = relationship("LearningRoadmap", back_populates="items")
