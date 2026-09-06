import re
from typing import Dict, Any, List, Optional
from app.services.taxonomy.manager import taxonomy_manager
from app.services.matcher.semantic import SemanticMatcher


class ScoringEngine:
    DEFAULT_WEIGHTS = {
        "skill": 0.60,
        "experience": 0.20,
        "education": 0.10,
        "keyword": 0.10,
    }

    @staticmethod
    def calculate_experience_years(experience_entries: List[Dict[str, Any]]) -> float:
        """Estimate total years of experience from resume work history."""
        total_years = 0.0
        for entry in experience_entries:
            date_range = entry.get("date_range", "")
            if not date_range:
                # Default 1.0 year per listed job block if dates unspecified
                total_years += 1.0
                continue

            years = re.findall(r"\b(19\d{2}|20\d{2})\b", date_range)
            if len(years) >= 2:
                y1, y2 = int(years[0]), int(years[1])
                diff = max(1, abs(y2 - y1))
                total_years += float(diff)
            elif len(years) == 1:
                total_years += 1.5
            else:
                total_years += 1.0

        return round(total_years, 1)

class CareerMatchEngine:
    @staticmethod
    def compute_match(
        resume_data: Dict[str, Any],
        resume_skills: List[Dict[str, Any]],
        job_data: Dict[str, Any],
        job_skills: List[Dict[str, Any]],
        weights: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """Perform multi-dimensional hybrid matching and explainable scoring."""
        if weights is None:
            weights = ScoringEngine.DEFAULT_WEIGHTS
        else:
            # Normalize weights to sum to 1.0
            total_w = sum(weights.values())
            if total_w > 0:
                weights = {k: v / total_w for k, v in weights.items()}

        resume_skill_map = {s["canonical_name"]: s for s in resume_skills}
        resume_skill_names = [s["skill_name"] for s in resume_skills]

        matching_skills = []
        related_skills = []
        missing_skills = []
        skill_gap_items = []

        total_skill_weight = 0.0
        earned_skill_weight = 0.0

        for j_skill in job_skills:
            j_name = j_skill["skill_name"]
            j_canonical = j_skill["canonical_name"]
            j_category = j_skill["category"]
            importance = j_skill.get("importance", "required")

            # Weight multiplier: Required skills carry 1.5x weight
            item_weight = 1.5 if importance == "required" else 1.0
            total_skill_weight += item_weight

            # 1. Exact canonical match
            if j_canonical in resume_skill_map:
                r_match = resume_skill_map[j_canonical]
                earned_skill_weight += item_weight * 1.0
                match_entry = {
                    "job_skill": j_name,
                    "resume_skill": r_match["skill_name"],
                    "canonical_name": j_canonical,
                    "category": j_category,
                    "match_type": "EXACT",
                    "similarity_score": 1.0,
                    "importance": importance,
                    "evidence_resume": r_match.get("evidence_text", "Present in resume skills"),
                    "evidence_job": j_skill.get("evidence_text", "Job requirement"),
                }
                matching_skills.append(match_entry)
                continue

            # 2. Taxonomy category/alias matching
            best_sim = 0.0
            best_match_name = None
            best_match_resume_obj = None

            for r_canonical, r_obj in resume_skill_map.items():
                sim = SemanticMatcher.compute_similarity(j_canonical, r_canonical)
                if sim > best_sim:
                    best_sim = sim
                    best_match_name = r_obj["skill_name"]
                    best_match_resume_obj = r_obj

            # 3. High confidence semantic match
            if best_sim >= SemanticMatcher.SEMANTIC_SIMILARITY_THRESHOLD and best_match_name:
                earned_skill_weight += item_weight * best_sim
                related_entry = {
                    "job_skill": j_name,
                    "matched_with_resume_skill": best_match_name,
                    "category": j_category,
                    "match_type": "RELATED_SEMANTIC",
                    "similarity_score": round(best_sim, 2),
                    "importance": importance,
                    "explanation": f"'{best_match_name}' demonstrated in resume relates to required '{j_name}' ({int(best_sim*100)}% semantic alignment).",
                }
                related_skills.append(related_entry)
                skill_gap_items.append({
                    "skill_name": j_name,
                    "category": j_category,
                    "priority": "MEDIUM" if importance == "required" else "LOW",
                    "match_type": "RELATED_ONLY",
                    "related_existing_skill": best_match_name,
                    "similarity_score": round(best_sim, 2),
                })
            else:
                # 4. Missing Skill
                missing_entry = {
                    "skill_name": j_name,
                    "canonical_name": j_canonical,
                    "category": j_category,
                    "importance": importance,
                    "priority": "HIGH" if importance == "required" else "MEDIUM",
                }
                missing_skills.append(missing_entry)
                skill_gap_items.append({
                    "skill_name": j_name,
                    "category": j_category,
                    "priority": "HIGH" if importance == "required" else "MEDIUM",
                    "match_type": "MISSING",
                    "related_existing_skill": None,
                    "similarity_score": 0.0,
                })

        # Calculate Skill Match Percentage
        if total_skill_weight > 0:
            skill_score = min(100.0, round((earned_skill_weight / total_skill_weight) * 100.0, 2))
        else:
            skill_score = 100.0 if not job_skills else 50.0

        # --- 2. Experience Match Score ---
        resume_exp_entries = resume_data.get("experience", [])
        candidate_years = ScoringEngine.calculate_experience_years(resume_exp_entries)
        job_reqs = job_data.get("parsed_requirements", {})
        min_required_years = job_reqs.get("min_experience_years", 0)

        if min_required_years == 0:
            exp_score = 100.0
            exp_explanation = "Job does not mandate strict minimum years of experience."
        elif candidate_years >= min_required_years:
            exp_score = 100.0
            exp_explanation = f"Candidate has {candidate_years} years, meeting the required {min_required_years}+ years."
        else:
            ratio = (candidate_years / min_required_years)
            # Baseline minimum 40% if candidate has relevant projects or partial experience
            exp_score = round(max(40.0, ratio * 100.0), 2)
            exp_explanation = f"Candidate has ~{candidate_years} years vs {min_required_years}+ years specified."

        # --- 3. Education Match Score ---
        edu_entries = resume_data.get("education", [])
        has_degree = len(edu_entries) > 0
        has_masters_or_phd = any(
            any(k in str(e.get("degree", "")).lower() for k in ["master", "m.s", "phd", "m.tech"])
            for e in edu_entries
        )
        if has_masters_or_phd:
            edu_score = 100.0
            edu_explanation = "Advanced Degree (Master's / Ph.D.) detected."
        elif has_degree:
            edu_score = 90.0
            edu_explanation = "Bachelor's degree or higher detected."
        else:
            edu_score = 65.0
            edu_explanation = "No formal degree explicitly parsed; assessed on practical skillset."

        # --- 4. Keyword & Responsibility Match Score ---
        resume_raw = resume_data.get("raw_text", "").lower()
        job_responsibilities = job_reqs.get("responsibilities", [])
        if job_responsibilities:
            keyword_hits = sum(1 for resp in job_responsibilities if any(w in resume_raw for w in resp.lower().split() if len(w) > 4))
            keyword_score = round(min(100.0, max(50.0, (keyword_hits / len(job_responsibilities)) * 100.0)), 2)
        else:
            keyword_score = 80.0
        keyword_explanation = f"Evaluated responsibility overlap across {len(job_responsibilities)} job requirements."

        # --- Final Weighted Score ---
        w_skill = weights.get("skill", 0.60)
        w_exp = weights.get("experience", 0.20)
        w_edu = weights.get("education", 0.10)
        w_key = weights.get("keyword", 0.10)

        overall_score = round(
            (skill_score * w_skill)
            + (exp_score * w_exp)
            + (edu_score * w_edu)
            + (keyword_score * w_key),
            2,
        )

        score_breakdown = {
            "weights_used": {
                "skill_match_weight": f"{int(w_skill*100)}%",
                "experience_match_weight": f"{int(w_exp*100)}%",
                "education_match_weight": f"{int(w_edu*100)}%",
                "keyword_match_weight": f"{int(w_key*100)}%",
            },
            "formula": "Overall = (Skill * W_skill) + (Exp * W_exp) + (Edu * W_edu) + (Keyword * W_key)",
            "calculation_audit": f"({skill_score} * {w_skill}) + ({exp_score} * {w_exp}) + ({edu_score} * {w_edu}) + ({keyword_score} * {w_key}) = {overall_score}%",
            "explanations": {
                "skill_match": f"Matched {len(matching_skills)} exact skills and {len(related_skills)} related skills out of {len(job_skills)} required.",
                "experience_match": exp_explanation,
                "education_match": edu_explanation,
                "keyword_match": keyword_explanation,
            },
            "matching_skills": matching_skills,
            "related_skills": related_skills,
            "missing_skills": missing_skills,
        }

        return {
            "overall_match_score": overall_score,
            "skill_match_score": skill_score,
            "experience_match_score": exp_score,
            "education_match_score": edu_score,
            "keyword_match_score": keyword_score,
            "score_breakdown": score_breakdown,
            "skill_gaps": skill_gap_items,
            "matching_skills_count": len(matching_skills),
            "missing_skills_count": len(missing_skills),
            "related_skills_count": len(related_skills),
        }
