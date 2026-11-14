export type TrustClassification = 'GREEN' | 'YELLOW' | 'RED' | 'BLACKLISTED';
export type HRQuality = 'EXCELLENT' | 'GOOD' | 'MIXED' | 'POOR' | 'UNKNOWN';
export type WorkArrangement = 'On-site' | 'Hybrid' | 'Remote';
export type JobCategory = 'Internship' | 'Full-time';

export interface Job {
  id: string;
  title: string;
  company: string;
  legal_name: string;
  company_website: string;
  cin_llpin?: string;
  mca_status?: string;
  company_hq: string;
  employee_count?: string;
  
  job_category: JobCategory;
  tech_category: string;
  tech_stack: string[];
  
  work_location: string;
  work_arrangement: WorkArrangement;
  recruitment_drive_location?: string;
  recruitment_drive_type?: string;
  
  stipend_amount?: number;
  stipend_text?: string;
  stipend_verified: number;
  
  salary_ctc?: string;
  salary_fixed?: string;
  salary_variable?: string;
  joining_bonus?: string;
  
  internship_duration?: string;
  ppo_offered: number;
  ppo_details?: string;
  ppo_guaranteed: number;
  
  accommodation_provided: number;
  accommodation_type?: string;
  living_allowance_amount?: number;
  living_allowance_text?: string;
  living_allowance_covers_full_period: number;
  outstation_accommodation_source?: string;
  
  direct_application_url: string;
  direct_application_url_status: string;
  source_announcement_url?: string;
  source_evidence_notes?: string;
  evidence_urls?: string[];
  
  original_publication_date: string;
  last_verified_at: string;
  application_deadline?: string;
  
  trust_classification: TrustClassification;
  is_approved_apply_now: number;
  rejection_reason?: string;
  
  hr_quality: HRQuality;
  hr_feedback_summary?: string;
  recruiter_name?: string;
  recruiter_title?: string;
  recruiter_verified: number;
  fraud_check_status: string;
  fraud_notes?: string;

  source_platform?: string;
  external_job_id?: string;
}

export type ApplicationStatus =
  | 'Discovered'
  | 'Verification Pending'
  | 'Verified'
  | 'Applied'
  | 'Assessment Pending'
  | 'Interview Scheduled'
  | 'Interview Completed'
  | 'Rejected'
  | 'Selected'
  | 'Offer Received'
  | 'Expired';

export interface Application {
  id: number;
  job_id: string;
  status: ApplicationStatus;
  applied_date?: string;
  assessment_date?: string;
  interview_date?: string;
  offer_deadline?: string;
  notes?: string;
  interview_details?: string;
  priority: 'High' | 'Medium' | 'Low';
  match_score?: number;
  created_at: string;
  updated_at: string;
  
  // Joined fields from Job
  title?: string;
  company?: string;
  legal_name?: string;
  work_location?: string;
  work_arrangement?: string;
  stipend_text?: string;
  salary_ctc?: string;
  direct_application_url?: string;
  trust_classification?: TrustClassification;
  application_deadline?: string;
  original_publication_date?: string;
  last_verified_at?: string;
  hr_quality?: HRQuality;
}

export interface DashboardStats {
  total_screened: number;
  approved_green: number;
  needs_verification_yellow: number;
  suspicious_red: number;
  rejected_ledger: number;
  mumbai_internships: number;
  remote_opportunities: number;
  ai_opportunities: number;
  recruitment_drives: number;
  my_tracked_applications: number;
  sources_breakdown?: Record<string, number>;
  freshness: {
    within_3_days: number;
    within_7_days: number;
    reference_date: string;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface MatchResult {
  job_id: string;
  job_title: string;
  company: string;
  match_score: number;
  match_tier: string;
  matched_skills: string[];
  missing_skills: string[];
  recommendation: string;
  total_required_skills: number;
  total_matched: number;
}

export interface InterviewPrep {
  job_id: string;
  title: string;
  company: string;
  tech_focus: string;
  technical_coding_questions: string[];
  system_design_scenarios: string[];
  behavioral_questions: string[];
  interviewer_tips: string[];
}
