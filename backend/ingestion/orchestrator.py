import os
import sys
import json
import sqlite3
from datetime import datetime
from typing import Dict, Any, List

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from database import get_connection
from verification_engine import verify_opportunity
try:
    from .greenhouse_connector import GreenhouseConnector
    from .ashby_connector import AshbyConnector
    from .remote_connector import RemoteConnector
except ImportError:
    from greenhouse_connector import GreenhouseConnector
    from ashby_connector import AshbyConnector
    from remote_connector import RemoteConnector

def run_live_ingestion() -> Dict[str, Any]:
    connectors = [
        GreenhouseConnector(),
        AshbyConnector(),
        RemoteConnector()
    ]
    
    total_fetched = 0
    total_inserted = 0
    total_updated = 0
    errors = 0
    source_stats = {}
    
    conn = get_connection()
    cursor = conn.cursor()
    
    all_jobs: List[Dict[str, Any]] = []
    
    for conn_instance in connectors:
        s_name = conn_instance.name
        try:
            jobs = conn_instance.fetch_jobs()
            source_stats[s_name] = len(jobs)
            all_jobs.extend(jobs)
            total_fetched += len(jobs)
        except Exception as e:
            source_stats[s_name] = f"Error: {str(e)}"
            errors += 1

    # Insert or update each job
    for job in all_jobs:
        # Run verification engine
        is_approved, trust, reason = verify_opportunity(job, "2026-11-13")
        job["is_approved_apply_now"] = 1 if is_approved else 0
        job["trust_classification"] = trust
        job["rejection_reason"] = None if is_approved else reason
        
        # Check if job exists by ID or direct_application_url
        cursor.execute("SELECT id FROM jobs WHERE id = ? OR direct_application_url = ?", (job["id"], job["direct_application_url"]))
        existing = cursor.fetchone()
        
        if existing:
            # Update fields
            cursor.execute("""
                UPDATE jobs 
                SET title = ?,
                    company = ?,
                    work_location = ?,
                    work_arrangement = ?,
                    is_approved_apply_now = ?,
                    trust_classification = ?,
                    rejection_reason = ?,
                    last_verified_at = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (
                job["title"], job["company"], job["work_location"], job["work_arrangement"],
                job["is_approved_apply_now"], job["trust_classification"], job["rejection_reason"],
                datetime.now().isoformat(), existing[0]
            ))
            total_updated += 1
        else:
            # Insert new job
            cursor.execute("""
                INSERT INTO jobs (
                    id, title, company, legal_name, company_website, cin_llpin, mca_status, company_hq,
                    employee_count, job_category, tech_category, tech_stack, work_location, work_arrangement,
                    recruitment_drive_location, recruitment_drive_type, stipend_amount, stipend_text,
                    stipend_verified, salary_ctc, salary_fixed, salary_variable, joining_bonus,
                    internship_duration, ppo_offered, ppo_details, ppo_guaranteed, accommodation_provided,
                    accommodation_type, living_allowance_amount, living_allowance_text,
                    living_allowance_covers_full_period, outstation_accommodation_source,
                    direct_application_url, direct_application_url_status, source_announcement_url,
                    source_evidence_notes, evidence_urls, original_publication_date, last_verified_at,
                    application_deadline, trust_classification, is_approved_apply_now, rejection_reason,
                    hr_quality, hr_feedback_summary, recruiter_name, recruiter_title, recruiter_verified,
                    fraud_check_status, fraud_notes, source_platform, external_job_id, raw_job_data
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?,
                    ?, ?,
                    ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?
                )
            """, (
                job["id"], job["title"], job["company"], job["legal_name"], job["company_website"], job["cin_llpin"], job["mca_status"], job["company_hq"],
                job["employee_count"], job["job_category"], job["tech_category"], job["tech_stack"], job["work_location"], job["work_arrangement"],
                job["recruitment_drive_location"], job["recruitment_drive_type"], job["stipend_amount"], job["stipend_text"],
                job["stipend_verified"], job["salary_ctc"], job["salary_fixed"], job["salary_variable"], job["joining_bonus"],
                job["internship_duration"], job["ppo_offered"], job["ppo_details"], job["ppo_guaranteed"], job["accommodation_provided"],
                job["accommodation_type"], job["living_allowance_amount"], job["living_allowance_text"],
                job["living_allowance_covers_full_period"], job["outstation_accommodation_source"],
                job["direct_application_url"], job["direct_application_url_status"], job["source_announcement_url"],
                job["source_evidence_notes"], job["evidence_urls"], job["original_publication_date"], job["last_verified_at"],
                job["application_deadline"], job["trust_classification"], job["is_approved_apply_now"], job["rejection_reason"],
                job["hr_quality"], job["hr_feedback_summary"], job["recruiter_name"], job["recruiter_title"], job["recruiter_verified"],
                job["fraud_check_status"], job["fraud_notes"], job["source_platform"], job["external_job_id"], job["raw_job_data"]
            ))
            total_inserted += 1

    # Log ingestion run
    cursor.execute("""
        INSERT INTO ingestion_logs (source_name, status, fetched_count, inserted_count, updated_count, error_count, log_details)
        VALUES ('Multi-Source Live Connector (GH, Ashby, Remotive, RemoteOK)', 'SUCCESS', ?, ?, ?, ?, ?)
    """, (total_fetched, total_inserted, total_updated, errors, json.dumps(source_stats)))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "message": f"Ingestion completed: {total_fetched} real opportunities fetched ({total_inserted} new, {total_updated} updated).",
        "total_fetched": total_fetched,
        "new_inserted": total_inserted,
        "existing_updated": total_updated,
        "source_breakdown": source_stats,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    res = run_live_ingestion()
    print("Ingestion result:", json.dumps(res, indent=2))
