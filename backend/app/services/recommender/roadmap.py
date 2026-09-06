from typing import List, Dict, Any, Optional

# Curated high quality learning resources mapped to technical skills
CURATED_RESOURCES = {
    "python": [
        {"title": "Official Python Tutorial", "url": "https://docs.python.org/3/tutorial/", "type": "Documentation"},
        {"title": "Real Python Tutorials & Guides", "url": "https://realpython.com/", "type": "Article / Course"},
    ],
    "power bi": [
        {"title": "Microsoft Power BI Guided Learning", "url": "https://learn.microsoft.com/en-us/power-bi/", "type": "Documentation"},
        {"title": "Power BI Dashboard Design Best Practices", "url": "https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips", "type": "Guide"},
    ],
    "tableau": [
        {"title": "Tableau Free Training Videos", "url": "https://www.tableau.com/learn/training", "type": "Video Course"},
    ],
    "sql": [
        {"title": "SQLBolt - Interactive SQL Lessons", "url": "https://sqlbolt.com/", "type": "Interactive Tutorial"},
        {"title": "PostgreSQL Official Documentation", "url": "https://www.postgresql.org/docs/", "type": "Documentation"},
    ],
    "statistics": [
        {"title": "StatQuest with Josh Starmer", "url": "https://statquest.org/", "type": "Video Course"},
        {"title": "Khan Academy Statistics & Probability", "url": "https://www.khanacademy.org/math/statistics-probability", "type": "Course"},
    ],
    "docker": [
        {"title": "Docker Get Started Guide", "url": "https://docs.docker.com/get-started/", "type": "Documentation"},
    ],
    "kubernetes": [
        {"title": "Kubernetes Official Tutorials", "url": "https://kubernetes.io/docs/tutorials/", "type": "Documentation"},
    ],
    "machine learning": [
        {"title": "Scikit-Learn Machine Learning in Python", "url": "https://scikit-learn.org/stable/tutorial/index.html", "type": "Documentation"},
        {"title": "Coursera Machine Learning Specialization", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "type": "Course"},
    ],
    "deep learning": [
        {"title": "DeepLearning.AI Deep Learning Specialization", "url": "https://www.deeplearning.ai/", "type": "Course"},
        {"title": "PyTorch Official Tutorials", "url": "https://pytorch.org/tutorials/", "type": "Documentation"},
    ],
    "aws": [
        {"title": "AWS Skill Builder & Free Cloud Practitioner Essentials", "url": "https://explore.skillbuilder.aws/", "type": "Course"},
    ],
    "react": [
        {"title": "React.dev Official Documentation & Quick Start", "url": "https://react.dev/learn", "type": "Documentation"},
    ],
    "fastapi": [
        {"title": "FastAPI Official Tutorial & User Guide", "url": "https://fastapi.tiangolo.com/tutorial/", "type": "Documentation"},
    ],
}


class LearningRoadmapGenerator:
    @staticmethod
    def generate_roadmap(
        analysis_id: str,
        job_title: str,
        missing_skills: List[Dict[str, Any]],
        related_skills: List[Dict[str, Any]],
        target_weeks: int = 12,
    ) -> Dict[str, Any]:
        """Generate a personalized, multi-stage learning roadmap based on detected skill gaps."""
        # Partition missing skills by priority
        high_priority = [s for s in missing_skills if s.get("priority") == "HIGH"]
        medium_priority = [s for s in missing_skills if s.get("priority") == "MEDIUM"]
        low_priority = [s for s in missing_skills if s.get("priority") == "LOW"]

        stages = []

        # Stage 1: Month 1 / Core High Priority Fundamentals
        stage1_skills = high_priority[:4] if high_priority else medium_priority[:3]
        stage1_topics = [f"Master fundamentals of {s['skill_name']} ({s['category']})" for s in stage1_skills]
        if not stage1_topics:
            stage1_topics = [f"Deepen proficiency in {job_title} advanced patterns"]

        stage1_resources = []
        for s in stage1_skills:
            canon = s.get("canonical_name", s.get("skill_name", "").lower())
            if canon in CURATED_RESOURCES:
                stage1_resources.extend(CURATED_RESOURCES[canon])
            else:
                stage1_resources.append({
                    "title": f"{s['skill_name']} Official Docs & Reference",
                    "url": f"https://www.google.com/search?q={s['skill_name']}+official+documentation",
                    "type": "Documentation",
                })

        stage1_proj = f"Build a focused standalone prototype applying {', '.join([s['skill_name'] for s in stage1_skills]) if stage1_skills else 'core tools'}."

        stages.append({
            "stage_order": 1,
            "stage_title": "Month 1: Core Fundamentals & High-Priority Gap Closure",
            "topics": stage1_topics,
            "project_suggestion": stage1_proj,
            "recommended_resources": stage1_resources[:4],
            "status": "NOT_STARTED",
        })

        # Stage 2: Month 2 / Applied Tooling & Secondary Skills
        remaining_high = high_priority[4:]
        stage2_skills = remaining_high + medium_priority[:3]
        if not stage2_skills and related_skills:
            stage2_skills = [{"skill_name": r["job_skill"], "category": r.get("category", "Technical")} for r in related_skills[:3]]

        stage2_topics = [f"Hands-on integration with {s['skill_name']}" for s in stage2_skills]
        if not stage2_topics:
            stage2_topics = ["Integration testing, performance optimization, and architectural best practices"]

        stage2_resources = []
        for s in stage2_skills:
            canon = s.get("canonical_name", s.get("skill_name", "").lower())
            if canon in CURATED_RESOURCES:
                stage2_resources.extend(CURATED_RESOURCES[canon])
            else:
                stage2_resources.append({
                    "title": f"{s['skill_name']} Best Practices & Architecture",
                    "url": f"https://www.google.com/search?q={s['skill_name']}+tutorial+guide",
                    "type": "Tutorial",
                })

        stage2_proj = f"Create a production-like service incorporating {', '.join([s['skill_name'] for s in stage2_skills[:3]]) if stage2_skills else 'advanced features'} with automated workflows."

        stages.append({
            "stage_order": 2,
            "stage_title": "Month 2: Applied Tooling & Real-World Integration",
            "topics": stage2_topics,
            "project_suggestion": stage2_proj,
            "recommended_resources": stage2_resources[:4],
            "status": "NOT_STARTED",
        })

        # Stage 3: Month 3 / Capstone Portfolio Project
        stage3_topics = [
            f"End-to-end full stack / data pipeline capstone tailored for {job_title}",
            "Automated CI/CD deployment, documentation, and performance benchmarking",
            "Resume & Portfolio narrative updates showcasing measurable business impact",
        ]
        all_missing_names = [s["skill_name"] for s in (high_priority + medium_priority)[:5]]
        stage3_proj = f"Develop and deploy an end-to-end Portfolio Capstone Project demonstrating {', '.join(all_missing_names) if all_missing_names else 'full stack proficiency'} with live demo URL and GitHub README."

        stages.append({
            "stage_order": 3,
            "stage_title": "Month 3: Portfolio Capstone Project & Interview Readiness",
            "topics": stage3_topics,
            "project_suggestion": stage3_proj,
            "recommended_resources": [
                {"title": "GitHub Portfolio & README Best Practices", "url": "https://docs.github.com/en/get-started/writing-on-github", "type": "Guide"},
                {"title": "System Design & Technical Interview Handbook", "url": "https://www.techinterviewhandbook.org/", "type": "Handbook"},
            ],
            "status": "NOT_STARTED",
        })

        summary = f"A customized {target_weeks}-week roadmap targeting {len(missing_skills)} missing skills and {len(related_skills)} related skills to prepare you for the {job_title} role."

        return {
            "title": f"{job_title} Skill Mastery Roadmap",
            "summary": summary,
            "estimated_duration_weeks": target_weeks,
            "stages": stages,
        }
