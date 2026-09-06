import re
from typing import Dict, Any, List

STRONG_ACTION_VERBS = {
    "architected", "engineered", "developed", "designed", "implemented", "deployed",
    "optimized", "automated", "spearheaded", "orchestrated", "refactored", "built",
    "accelerated", "scaled", "streamlined", "mentored", "led", "formulated"
}

WEAK_PHRASES = [
    "responsible for", "worked on", "assisted in", "helped with", "duties included", "handled"
]

METRICS_REGEX = re.compile(
    r"(\b\d{1,3}%\b|\b\d+(?:\.\d+)?\s*(?:k|m|b|x|ms|s|sec|fps|gb|tb)\b|\$\d+[\d,.]*|\b\d+\+?\s*(?:users|requests|customers|clients|projects|queries|teams)\b)",
    re.IGNORECASE,
)


class ResumeQualityAuditor:
    @staticmethod
    def audit_resume(resume_text: str, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform deep quality analysis and generate actionable improvement feedback."""
        score = 100
        strengths: List[str] = []
        improvements: List[str] = []
        detailed_checks: Dict[str, Any] = {}

        # 1. Contact Info Quality Check
        contact = parsed_data.get("contact", {})
        contact_issues = []
        if not contact.get("email"):
            contact_issues.append("Missing contact email address.")
            score -= 10
        if not contact.get("phone"):
            contact_issues.append("Missing phone number.")
            score -= 5
        if not (contact.get("linkedin") or contact.get("github") or contact.get("portfolio")):
            contact_issues.append("Missing professional links (LinkedIn or GitHub profile).")
            score -= 5
        else:
            strengths.append("Includes professional portfolio/profile links (LinkedIn / GitHub).")

        detailed_checks["contact_info"] = {
            "status": "PASS" if not contact_issues else "WARN",
            "issues": contact_issues,
        }

        # 2. Quantifiable Impact & Metrics Check
        experience_list = parsed_data.get("experience", [])
        project_list = parsed_data.get("projects", [])
        all_bullet_points = []

        for exp in experience_list:
            all_bullet_points.extend(exp.get("responsibilities", []))
        for proj in project_list:
            all_bullet_points.append(proj.get("description", ""))

        bullets_with_metrics = 0
        for bp in all_bullet_points:
            if METRICS_REGEX.search(bp):
                bullets_with_metrics += 1

        if all_bullet_points:
            metric_ratio = bullets_with_metrics / len(all_bullet_points)
            if metric_ratio >= 0.40:
                strengths.append(f"Strong quantified achievements: {bullets_with_metrics} bullet points contain measurable metrics (%, numbers, scale).")
            else:
                score -= 15
                improvements.append(
                    "Your experience/project descriptions lack quantifiable outcomes. Quantify your impact with measurable metrics (e.g. 'Improved database query latency by 35%', 'Handled 5M+ daily API requests')."
                )
        else:
            score -= 20
            improvements.append("Add detailed bullet points describing your technical accomplishments and project contributions.")

        detailed_checks["quantifiable_metrics"] = {
            "total_bullet_points": len(all_bullet_points),
            "bullets_with_metrics": bullets_with_metrics,
            "metric_coverage_percentage": f"{int((bullets_with_metrics / max(len(all_bullet_points), 1)) * 100)}%",
        }

        # 3. Action Verbs Check
        strong_verb_count = 0
        weak_phrase_count = 0
        resume_lower = resume_text.lower()

        for verb in STRONG_ACTION_VERBS:
            if re.search(rf"\b{verb}\b", resume_lower):
                strong_verb_count += 1

        for phrase in WEAK_PHRASES:
            if phrase in resume_lower:
                weak_phrase_count += 1

        if strong_verb_count >= 3:
            strengths.append(f"Great use of impactful action verbs ({strong_verb_count} distinct strong action verbs detected).")
        else:
            score -= 10
            improvements.append("Use strong action verbs (e.g. 'Engineered', 'Architected', 'Automated', 'Optimized') at the start of experience bullets instead of passive phrasing.")

        if weak_phrase_count > 0:
            score -= 5
            improvements.append(f"Found {weak_phrase_count} passive phrases (e.g., 'responsible for', 'worked on'). Replace them with direct accomplishments.")

        detailed_checks["action_verbs"] = {
            "strong_verbs_found": strong_verb_count,
            "passive_phrases_found": weak_phrase_count,
        }

        # 4. Section Structure Check
        sections_found = parsed_data.get("sections_found", [])
        if "summary" not in sections_found:
            score -= 5
            improvements.append("Add a concise 2-3 sentence Professional Summary at the top to immediately hook hiring managers.")
        else:
            strengths.append("Contains a clear professional summary section.")

        if "skills" not in sections_found and not parsed_data.get("extracted_skills"):
            score -= 10
            improvements.append("Add a dedicated 'Technical Skills' section categorizing your languages, frameworks, databases, and tools.")
        else:
            strengths.append("Well-defined technical skill categorization.")

        # 5. Length / Word Count Check
        words = len(resume_text.split())
        if words < 60:
            score -= 15
            improvements.append(f"Resume is very brief ({words} words). Expand on your project architectures, tech stack details, and responsibilities.")
        elif words > 1200:
            score -= 5
            improvements.append(f"Resume is quite lengthy ({words} words). Aim for concise 1-2 page formatting focusing on top technical highlights.")
        else:
            strengths.append(f"Optimal resume length ({words} words).")

        final_score = max(10, min(100, score))

        return {
            "overall_quality_score": final_score,
            "rating": "Excellent" if final_score >= 85 else ("Good" if final_score >= 70 else "Needs Improvement"),
            "strengths": strengths,
            "actionable_improvements": improvements,
            "detailed_checks": detailed_checks,
        }
