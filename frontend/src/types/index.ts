export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ContactInfo {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface EducationEntry {
  degree?: string;
  institution?: string;
  year?: string;
  gpa?: string;
  details?: string;
}

export interface ExperienceEntry {
  title_company?: string;
  date_range?: string;
  responsibilities: string[];
  full_text?: string;
}

export interface ProjectEntry {
  title: string;
  description: string;
}

export interface ParsedResumeData {
  contact: ContactInfo;
  summary?: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  certifications: string[];
  skills_raw?: string;
  extracted_skills: string[];
  achievements: string[];
  sections_found: string[];
}

export interface ResumeSkill {
  id: string;
  skill_name: string;
  canonical_name: string;
  category: string;
  confidence_score: number;
  evidence_text?: string;
  years_of_experience?: number;
}

export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  raw_text: string;
  parsed_data: ParsedResumeData;
  completeness_score: number;
  skills: ResumeSkill[];
  created_at: string;
}

export interface JobSkill {
  id: string;
  job_id: string;
  skill_name: string;
  canonical_name: string;
  category: string;
  importance: 'required' | 'preferred';
  evidence_text?: string;
}

export interface JobDescription {
  id: string;
  user_id: string;
  title: string;
  company?: string;
  raw_text: string;
  parsed_requirements?: {
    title: string;
    company?: string;
    min_experience_years: number;
    experience_summary: string;
    education_requirements: string;
    total_skills_count: number;
    categorized_skills: Record<string, string[]>;
    responsibilities: string[];
  };
  skills: JobSkill[];
  created_at: string;
}

export interface SkillGap {
  id: string;
  analysis_id: string;
  skill_name: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  match_type: 'MISSING' | 'RELATED_ONLY' | 'PARTIAL';
  related_existing_skill?: string;
  similarity_score?: number;
}

export interface MatchingSkillDetail {
  job_skill: string;
  resume_skill: string;
  canonical_name: string;
  category: string;
  match_type: string;
  similarity_score: number;
  importance: string;
  evidence_resume: string;
  evidence_job: string;
}

export interface RelatedSkillDetail {
  job_skill: string;
  matched_with_resume_skill: string;
  category: string;
  match_type: string;
  similarity_score: number;
  importance: string;
  explanation: string;
}

export interface ScoreBreakdown {
  weights_used: {
    skill_match_weight: string;
    experience_match_weight: string;
    education_match_weight: string;
    keyword_match_weight: string;
  };
  formula: string;
  calculation_audit: string;
  explanations: {
    skill_match: string;
    experience_match: string;
    education_match: string;
    keyword_match: string;
  };
  matching_skills: MatchingSkillDetail[];
  related_skills: RelatedSkillDetail[];
  missing_skills: Array<{
    skill_name: string;
    canonical_name: string;
    category: string;
    importance: string;
    priority: string;
  }>;
}

export interface Analysis {
  id: string;
  user_id: string;
  resume_id: string;
  job_id: string;
  overall_match_score: number;
  skill_match_score: number;
  experience_match_score: number;
  education_match_score: number;
  keyword_match_score: number;
  score_breakdown: ScoreBreakdown;
  skill_gaps: SkillGap[];
  created_at: string;
}

export interface JobMatchSummary {
  job_id: string;
  title: string;
  company?: string;
  overall_match_score: number;
  skill_match_score: number;
  matching_skills_count: number;
  missing_skills_count: number;
}

export interface CompareJobsResponse {
  resume_id: string;
  rankings: JobMatchSummary[];
}

export interface ResourceItem {
  title: string;
  url: string;
  type: string;
}

export interface RoadmapItem {
  id: string;
  roadmap_id: string;
  stage_order: number;
  stage_title: string;
  topics: string[];
  project_suggestion?: string;
  recommended_resources: ResourceItem[];
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface LearningRoadmap {
  id: string;
  analysis_id: string;
  title: string;
  summary?: string;
  estimated_duration_weeks: number;
  items: RoadmapItem[];
  created_at: string;
}

export interface QualityAudit {
  overall_quality_score: number;
  rating: string;
  strengths: string[];
  actionable_improvements: string[];
  detailed_checks: {
    contact_info: { status: string; issues: string[] };
    quantifiable_metrics: {
      total_bullet_points: number;
      bullets_with_metrics: number;
      metric_coverage_percentage: string;
    };
    action_verbs: {
      strong_verbs_found: number;
      passive_phrases_found: number;
    };
  };
}
