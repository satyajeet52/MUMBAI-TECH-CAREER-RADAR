import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "radar.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'user', -- 'user' or 'admin'
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 2. User Profiles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        current_title TEXT,
        skills TEXT, -- JSON array of strings
        preferred_locations TEXT, -- JSON array
        target_roles TEXT, -- JSON array
        min_stipend INTEGER DEFAULT 10000,
        experience_level TEXT DEFAULT 'Fresher',
        github_url TEXT,
        linkedin_url TEXT,
        portfolio_url TEXT,
        bio TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)
    
    # 3. Resumes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        file_name TEXT NOT NULL,
        file_path TEXT,
        extracted_text TEXT,
        parsed_skills TEXT, -- JSON array
        parsed_experience TEXT, -- JSON structure
        education TEXT, -- JSON structure
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)
    
    # 4. Jobs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        legal_name TEXT,
        company_website TEXT,
        cin_llpin TEXT,
        mca_status TEXT,
        company_hq TEXT,
        employee_count TEXT,
        
        job_category TEXT NOT NULL, -- Internship / Full-time
        tech_category TEXT NOT NULL, -- Software Development / AI / Backend / etc.
        tech_stack TEXT, -- JSON array of tags
        
        work_location TEXT NOT NULL, -- e.g. Powai, Mumbai / Remote / Bangalore
        work_arrangement TEXT NOT NULL, -- On-site / Hybrid / Remote
        recruitment_drive_location TEXT, -- e.g. Mumbai, Navi Mumbai
        recruitment_drive_type TEXT, -- Off-Campus Drive / Direct Application / Pooled Campus / Walk-In
        
        stipend_amount INTEGER, -- in INR / month
        stipend_text TEXT,
        stipend_verified INTEGER DEFAULT 0,
        
        salary_ctc TEXT,
        salary_fixed TEXT,
        salary_variable TEXT,
        joining_bonus TEXT,
        
        internship_duration TEXT,
        ppo_offered INTEGER DEFAULT 0,
        ppo_details TEXT,
        ppo_guaranteed INTEGER DEFAULT 0,
        
        accommodation_provided INTEGER DEFAULT 0,
        accommodation_type TEXT, -- Free / Subsidized / None
        living_allowance_amount INTEGER,
        living_allowance_text TEXT,
        living_allowance_covers_full_period INTEGER DEFAULT 0,
        outstation_accommodation_source TEXT,
        
        direct_application_url TEXT NOT NULL,
        direct_application_url_status TEXT DEFAULT 'VERIFIED', -- VERIFIED / ACTIVE / BROKEN / UNAVAILABLE
        source_announcement_url TEXT,
        source_evidence_notes TEXT,
        evidence_urls TEXT, -- JSON array
        
        original_publication_date TEXT NOT NULL, -- YYYY-MM-DD
        last_verified_at TEXT NOT NULL, -- ISO timestamp
        application_deadline TEXT, -- YYYY-MM-DD or Rolling
        
        trust_classification TEXT NOT NULL, -- GREEN / YELLOW / RED / BLACKLISTED
        is_approved_apply_now INTEGER DEFAULT 0, -- 1 if GREEN and meets all location & compensation rules
        rejection_reason TEXT, -- Populated if rejected from Apply Now
        
        hr_quality TEXT DEFAULT 'UNKNOWN', -- EXCELLENT / GOOD / MIXED / POOR / UNKNOWN
        hr_feedback_summary TEXT,
        recruiter_name TEXT,
        recruiter_title TEXT,
        recruiter_verified INTEGER DEFAULT 0,
        fraud_check_status TEXT DEFAULT 'PASSED', -- PASSED / SUSPICIOUS / FAILED
        fraud_notes TEXT,
        
        source_platform TEXT DEFAULT 'Direct ATS', -- Greenhouse, Lever, Ashby, RemoteOK, Remotive, Curated
        external_job_id TEXT,
        raw_job_data TEXT,
        
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Check if extra columns are needed on existing jobs table
    existing_cols = [c[1] for c in cursor.execute("PRAGMA table_info(jobs)").fetchall()]
    new_cols = [
        ("source_platform", "TEXT DEFAULT 'Direct ATS'"),
        ("external_job_id", "TEXT"),
        ("raw_job_data", "TEXT")
    ]
    for col_name, col_type in new_cols:
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE jobs ADD COLUMN {col_name} {col_type};")

    # 5. Application tracker table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT DEFAULT 'default_user',
        job_id TEXT NOT NULL,
        status TEXT NOT NULL, -- Discovered, Verification Pending, Verified, Applied, Assessment Pending, Interview Scheduled, Interview Completed, Rejected, Selected, Offer Received, Expired
        applied_date TEXT,
        assessment_date TEXT,
        interview_date TEXT,
        offer_deadline TEXT,
        notes TEXT,
        interview_details TEXT,
        priority TEXT DEFAULT 'Medium', -- High / Medium / Low
        resume_id TEXT,
        match_score INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );
    """)

    # Check for user_id, resume_id, match_score on applications
    app_cols = [c[1] for c in cursor.execute("PRAGMA table_info(applications)").fetchall()]
    for col_name, col_type in [("user_id", "TEXT DEFAULT 'default_user'"), ("resume_id", "TEXT"), ("match_score", "INTEGER")]:
        if col_name not in app_cols:
            cursor.execute(f"ALTER TABLE applications ADD COLUMN {col_name} {col_type};")

    # 6. Saved jobs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        job_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, job_id),
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );
    """)
    
    # 7. Audit logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_timestamp TEXT NOT NULL,
        total_discovered INTEGER,
        total_approved INTEGER,
        total_rejected INTEGER,
        total_yellow INTEGER,
        total_red INTEGER,
        notes TEXT
    );
    """)

    # 8. Ingestion logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ingestion_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_name TEXT NOT NULL,
        status TEXT NOT NULL, -- SUCCESS / PARTIAL / FAILED
        fetched_count INTEGER DEFAULT 0,
        inserted_count INTEGER DEFAULT 0,
        updated_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        log_details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 9. AI Career Chat Conversations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS career_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL, -- 'user' or 'assistant'
        message TEXT NOT NULL,
        context_job_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Add default demo user if not present
    cursor.execute("SELECT id FROM users WHERE email = 'demo@mumbaitechradar.com'")
    if not cursor.fetchone():
        import hashlib
        # password is 'demo1234'
        demo_hash = hashlib.sha256("demo1234".encode()).hexdigest()
        cursor.execute("""
            INSERT INTO users (id, email, hashed_password, full_name, role)
            VALUES ('default_user', 'demo@mumbaitechradar.com', ?, 'Mumbai Tech Candidate', 'user')
        """, (demo_hash,))
        cursor.execute("""
            INSERT INTO user_profiles (user_id, current_title, skills, preferred_locations, target_roles, min_stipend, experience_level, bio)
            VALUES ('default_user', 'Aspiring Software & AI Engineer', 
                    '["Python", "FastAPI", "React", "TypeScript", "SQL", "Docker", "Machine Learning"]',
                    '["Mumbai", "Navi Mumbai", "Thane", "Remote"]',
                    '["Software Engineer Intern", "Full Stack Developer", "AI Engineer", "Backend Developer"]',
                    15000, 'Fresher', 'Computer Engineering student in Mumbai seeking high-impact software internships and fresher roles.')
        """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database schema successfully expanded and verified.")
