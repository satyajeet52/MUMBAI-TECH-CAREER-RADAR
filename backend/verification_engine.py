from datetime import datetime, date
import re
from typing import Dict, Any, Tuple, List

MUMBAI_MMR_AREAS = [
    "mumbai", "andheri", "powai", "bkc", "bandra", "lower parel", "goregaon", 
    "malad", "kandivali", "borivali", "ghatkopar", "kurla", "vikhroli", "mulund", 
    "dadar", "fort", "nariman point", "thane", "navi mumbai", "vashi", "airoli", 
    "ghansoli", "rabale", "mahape", "kopar khairane", "belapur", "chembur", 
    "worli", "santacruz", "kanjurmarg", "vidyavihar", "seepz", "mindspace"
]

SOFTWARE_KEYWORDS = [
    "software", "developer", "sde", "engineer", "backend", "frontend", "full stack", 
    "fullstack", "web", "application", "java", "python", "php", "c++", "c#", 
    "rust", "go", "golang", "javascript", "typescript", "react", "node", "mobile", 
    "api", "database", "cloud", "devops", "qa", "testing", "sdet", "cybersecurity", 
    "automation", "ai", "artificial intelligence", "generative ai", "llm", "rag", 
    "machine learning", "deep learning", "agentic", "nlp", "computer vision", 
    "prompt engineer", "mlops", "data engineer"
]

def parse_iso_date(date_str: str) -> date:
    if not date_str or date_str in ["PUBLICATION DATE UNKNOWN", "Unknown"]:
        return None
    try:
        return datetime.strptime(date_str[:10], "%Y-%m-%d").date()
    except Exception:
        return None

def is_mumbai_location(loc_str: str) -> bool:
    if not loc_str:
        return False
    loc_lower = loc_str.lower()
    return any(area in loc_lower for area in MUMBAI_MMR_AREAS)

def is_software_role(title: str, tech_category: str) -> bool:
    text = f"{title} {tech_category}".lower()
    return any(kw in text for kw in SOFTWARE_KEYWORDS)

def verify_opportunity(job: Dict[str, Any], reference_date_str: str = "2026-11-13") -> Tuple[bool, str, str]:
    """
    Evaluates a job against the strict Mumbai Tech Career Radar rules.
    Returns: (is_approved, trust_classification, rejection_or_flag_reason)
    """
    ref_date = parse_iso_date(reference_date_str) or date(2026, 11, 13)
    
    # 1. Anti-Fraud & Scam Check
    fraud_status = str(job.get("fraud_check_status", "PASSED")).upper()
    if fraud_status in ["FAILED", "SUSPICIOUS"]:
        return False, "RED", f"Fraud warning: {job.get('fraud_notes', 'Unverified payment or authenticity red flags')}"
    
    if job.get("trust_classification") == "BLACKLISTED":
        return False, "BLACKLISTED", "Company is blacklisted due to confirmed fraudulent practices."
    
    # 2. Software Role Relevance
    title = str(job.get("title", ""))
    tech_cat = str(job.get("tech_category", ""))
    if not is_software_role(title, tech_cat):
        return False, "RED", "Non-software role: Opportunity does not involve active software development or technical AI."

    # 3. Direct Application Link Check
    app_url = str(job.get("direct_application_url", "")).strip()
    generic_domains = ["google.com", "google.co.in", "linkedin.com/feed", "linkedin.com/in", "facebook.com", "twitter.com"]
    if not app_url or app_url == "APPLICATION LINK UNAVAILABLE" or any(gd in app_url.lower() for gd in generic_domains):
        return False, "YELLOW", "APPLICATION LINK UNAVAILABLE: Exact direct ATS/application link missing or generic."
    
    # 4. Freshness Window Check
    pub_date_str = str(job.get("original_publication_date", ""))
    pub_date = parse_iso_date(pub_date_str)
    if not pub_date:
        return False, "YELLOW", "PUBLICATION DATE UNKNOWN: Original publication date cannot be independently confirmed."
    
    days_old = (ref_date - pub_date).days
    if days_old < 0:
        # Future date error
        days_old = 0
        
    if days_old > 14:
        return False, "YELLOW", f"EXPIRED_FRESHNESS: Published {days_old} days ago (exceeds maximum 14-day freshness window)."

    # 5. Location and Arrangement Rules
    is_internship = "intern" in str(job.get("job_category", "")).lower() or "intern" in title.lower()
    work_loc = str(job.get("work_location", ""))
    work_arr = str(job.get("work_arrangement", "")).capitalize() # On-site, Hybrid, Remote
    drive_loc = str(job.get("recruitment_drive_location", ""))
    company_hq = str(job.get("company_hq", ""))
    
    in_mumbai = is_mumbai_location(work_loc)
    is_remote = work_arr.lower() in ["remote", "work-from-home", "fully remote"] or "remote" in work_loc.lower()
    
    if is_internship:
        # INTERNSHIP LOCATION RULES:
        # Accept: Mumbai On-site, Mumbai Hybrid, Remote, International Remote accepting India.
        # Outstation On-site ONLY if accommodation provided AND separate living allowance AND stipend >= 10k.
        # Hybrid outside Mumbai: REJECT!
        if work_arr.lower() == "hybrid" and not in_mumbai:
            return False, "YELLOW", "REJECTED_HYBRID: Hybrid internships outside Mumbai are strictly disallowed."
        
        if not in_mumbai and not is_remote:
            # Outstation on-site
            has_accom = bool(job.get("accommodation_provided", 0))
            living_allow = int(job.get("living_allowance_amount") or 0)
            stipend_amt = int(job.get("stipend_amount") or 0)
            source_proof = str(job.get("outstation_accommodation_source", ""))
            
            if not has_accom:
                return False, "YELLOW", "REJECTED_OUTSTATION: Outstation internship lacks company-provided accommodation."
            if living_allow <= 0 and not job.get("living_allowance_covers_full_period"):
                return False, "YELLOW", "REJECTED_OUTSTATION: Outstation internship lacks confirmed separate living allowance for full duration."
            if stipend_amt < 10000:
                return False, "YELLOW", f"REJECTED_STIPEND: Outstation stipend (₹{stipend_amt}) is below ₹10,000 threshold."
            if not source_proof:
                return False, "YELLOW", "REJECTED_OUTSTATION: Accommodation and allowance arrangements lack reliable confirming evidence."

        # INTERNSHIP STIPEND RULES:
        # Mandatory minimum stipend: ₹10,000 per month.
        stipend_verified = bool(job.get("stipend_verified", 0))
        stipend_amt = int(job.get("stipend_amount") or 0)
        
        if not stipend_verified and stipend_amt == 0:
            return False, "YELLOW", "STIPEND NOT VERIFIED: Compensation details undisclosed; held outside Apply Now."
        if stipend_amt < 10000:
            return False, "YELLOW", f"REJECTED_STIPEND: Stipend of ₹{stipend_amt}/mo is below mandatory minimum threshold of ₹10,000/month."
            
    else:
        # FULL-TIME JOB LOCATION RULES:
        # Accept: Mumbai On-site, Mumbai Hybrid, Remote, International Remote.
        # Outside-Mumbai company holding a recruitment drive in Mumbai: ACCEPT.
        # Hybrid outside Mumbai: REJECT!
        # On-site outside Mumbai without a verified Mumbai recruitment drive: REJECT!
        if work_arr.lower() == "hybrid" and not in_mumbai:
            return False, "YELLOW", "REJECTED_HYBRID: Hybrid full-time jobs outside Mumbai are strictly disallowed."
        
        if not in_mumbai and not is_remote:
            # Check if this outside-Mumbai company is running a drive in Mumbai
            is_mumbai_drive = is_mumbai_location(drive_loc)
            if not is_mumbai_drive:
                return False, "YELLOW", f"REJECTED_LOCATION: Full-time job is outside Mumbai ({work_loc}) without a verified Mumbai recruitment drive."

    # 6. Trust Classification Check
    trust = str(job.get("trust_classification", "YELLOW")).upper()
    if trust != "GREEN":
        return False, trust, f"Trust status is {trust}: Needs full company identity and recruitment verification."

    # All checks passed!
    return True, "GREEN", "VERIFIED: Meets all strict verification, freshness, location, and compensation standards."

