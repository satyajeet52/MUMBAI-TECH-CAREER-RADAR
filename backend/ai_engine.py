import re
import json
import os
from typing import Dict, Any, List, Optional
import pypdf

# Comprehensive dictionary of technical skills and categories
TECH_SKILL_PATTERNS = {
    "Languages": [
        "python", "java", "javascript", "typescript", "c\\+\\+", "c#", "c", "go", "golang",
        "rust", "ruby", "php", "swift", "kotlin", "sql", "html", "css", "bash", "r"
    ],
    "Frameworks & Libraries": [
        "react", "react\\.js", "react native", "next\\.js", "vue", "angular", "node\\.js", "nodejs",
        "express", "fastapi", "django", "flask", "spring boot", "spring", "asp\\.net", "\\.net",
        "laravel", "graphql", "tailwind", "redux", "pandas", "numpy", "scikit-learn",
        "pytorch", "tensorflow", "keras", "hugging face", "transformers", "langchain", "llama-index"
    ],
    "Cloud & DevOps": [
        "aws", "azure", "gcp", "docker", "kubernetes", "k8s", "ci/cd", "github actions",
        "jenkins", "terraform", "ansible", "linux", "nginx", "prometheus", "grafana"
    ],
    "Databases & Queues": [
        "postgresql", "postgres", "mysql", "mongodb", "redis", "cassandra", "kafka",
        "rabbitmq", "elasticsearch", "sqlite", "dynamodb", "neo4j"
    ],
    "AI & Data": [
        "machine learning", "deep learning", "generative ai", "llm", "rag", "nlp",
        "computer vision", "prompt engineering", "embeddings", "vector database", "fine-tuning",
        "data analysis", "data visualization", "data engineering", "etl"
    ],
    "Core CS & Architecture": [
        "data structures", "algorithms", "system design", "object oriented programming", "oops",
        "microservices", "rest api", "grpc", "distributed systems", "concurrency", "unit testing", "agile"
    ]
}

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        reader = pypdf.PdfReader(file_path)
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
    except Exception as e:
        print(f"PDF extraction error: {e}")
    return text.strip()

def parse_resume_text(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    
    # 1. Contact Info
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    email = email_match.group(0) if email_match else None
    
    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    phone = phone_match.group(0) if phone_match else None
    
    github_match = re.search(r"github\.com/([a-zA-Z0-9_-]+)", text, re.I)
    github = f"https://{github_match.group(0)}" if github_match else None

    linkedin_match = re.search(r"linkedin\.com/in/([a-zA-Z0-9_-]+)", text, re.I)
    linkedin = f"https://{linkedin_match.group(0)}" if linkedin_match else None

    # 2. Extract Skills
    found_skills = {}
    all_flat_skills = []
    
    for category, patterns in TECH_SKILL_PATTERNS.items():
        cat_matches = []
        for pat in patterns:
            # Word boundary regex search
            if re.search(rf"\b{pat}\b", text_lower):
                clean_name = pat.replace("\\.", ".").replace("\\+", "+").title()
                if clean_name.lower() in ["c++", "c#", "aws", "gcp", "sql", "ai", "llm", "rag", "nlp", "ci/cd", "k8s", "rest api"]:
                    clean_name = clean_name.upper()
                if clean_name not in cat_matches:
                    cat_matches.append(clean_name)
                    all_flat_skills.append(clean_name)
        if cat_matches:
            found_skills[category] = cat_matches

    # 3. Detect Degree / Education
    degrees = ["B.Tech", "B.E.", "BCA", "MCA", "B.Sc", "M.Tech", "M.S.", "Bachelor of Technology", "Bachelor of Engineering"]
    found_degrees = []
    for deg in degrees:
        if re.search(rf"\b{re.escape(deg)}\b", text, re.I):
            found_degrees.append(deg)

    # 4. Experience estimation
    exp_years = 0
    exp_matches = re.findall(r"(\d+)\+?\s*(?:year|yr)s?\s*(?:of)?\s*experience", text_lower)
    if exp_matches:
        try:
            exp_years = max([int(x) for x in exp_matches])
        except Exception:
            exp_years = 0

    return {
        "email": email,
        "phone": phone,
        "github": github,
        "linkedin": linkedin,
        "skills_by_category": found_skills,
        "flat_skills": list(set(all_flat_skills)),
        "degrees": list(set(found_degrees)),
        "estimated_years_experience": exp_years,
        "summary": text[:400] + ("..." if len(text) > 400 else "")
    }

def calculate_job_match(resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
    candidate_skills = set([s.lower() for s in resume_data.get("flat_skills", [])])
    
    # Extract job required skills
    job_stack = job_data.get("tech_stack", [])
    if isinstance(job_stack, str):
        try:
            job_stack = json.loads(job_stack)
        except Exception:
            job_stack = [s.strip() for s in job_stack.split(",") if s.strip()]
            
    job_skills_lower = [s.lower() for s in job_stack]
    
    # Also check job title and tech category keywords
    title_terms = [t for t in re.findall(r"\w+", job_data.get("title", "").lower()) if len(t) > 2]
    
    matched_skills = []
    missing_skills = []
    
    for s in job_stack:
        s_low = s.lower()
        if any(cs == s_low or s_low in cs or cs in s_low for cs in candidate_skills):
            matched_skills.append(s)
        else:
            missing_skills.append(s)
            
    # Calculate score
    if job_stack:
        skill_ratio = len(matched_skills) / len(job_stack)
    else:
        skill_ratio = 0.7 # Baseline if no explicit stack listed

    # Bonus for title alignment
    title_bonus = 0
    for term in title_terms:
        if any(term in cs for cs in candidate_skills):
            title_bonus += 5
    title_bonus = min(title_bonus, 20)

    # Location alignment
    loc_score = 15 if "mumbai" in str(job_data.get("work_location", "")).lower() or job_data.get("work_arrangement") == "Remote" else 10

    raw_score = int((skill_ratio * 65) + title_bonus + loc_score)
    final_score = min(max(raw_score, 35), 98)

    # Tier badge
    if final_score >= 85:
        match_tier = "EXCELLENT MATCH (High Interview Probability)"
        recommendation = "Your technical profile strongly aligns with this role. Highlight your matching skills in your application and prepare your portfolio repos."
    elif final_score >= 70:
        match_tier = "STRONG MATCH (Good Compatibility)"
        recommendation = f"You match key requirements. Consider brushing up on {', '.join(missing_skills[:3]) if missing_skills else 'core CS fundamentals'} to strengthen your candidacy."
    else:
        match_tier = "PARTIAL MATCH (Skill Gap Identified)"
        recommendation = f"Add projects demonstrating {', '.join(missing_skills[:4]) if missing_skills else 'the required stack'} to elevate your score."

    return {
        "job_id": job_data.get("id"),
        "job_title": job_data.get("title"),
        "company": job_data.get("company"),
        "match_score": final_score,
        "match_tier": match_tier,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommendation": recommendation,
        "total_required_skills": len(job_stack),
        "total_matched": len(matched_skills)
    }

def generate_interview_prep(job_data: Dict[str, Any]) -> Dict[str, Any]:
    title = job_data.get("title", "Software Engineer")
    company = job_data.get("company", "Tech Company")
    tech_stack = job_data.get("tech_stack", [])
    if isinstance(tech_stack, str):
        try:
            tech_stack = json.loads(tech_stack)
        except Exception:
            tech_stack = [tech_stack]
            
    stack_str = ", ".join(tech_stack[:5]) if tech_stack else "Data Structures, Algorithms & System Design"

    technical_questions = [
        f"Explain how you would design and optimize high-concurrency API endpoints using {tech_stack[0] if tech_stack else 'modern frameworks'}.",
        f"What are the trade-offs between relational databases (PostgreSQL/MySQL) and NoSQL stores for a platform like {company}?",
        f"How do you handle race conditions, database transactions (ACID), and distributed locking in backend services?",
        f"Walk us through how you profile memory leaks and CPU bottlenecks in a production service.",
        f"Describe an end-to-end data pipeline or feature you built involving {stack_str}."
    ]

    system_design_prompts = [
        f"Design a real-time event streaming and analytics pipeline for {company} capable of processing 100,000 events/second.",
        f"Design a scalable job discovery and notification service with rate-limiting, deduplication, and low-latency full-text search."
    ]

    behavioral_questions = [
        f"Tell us about a time you identified a critical production bug or performance regression. How did you diagnose and remediate it?",
        f"Why are you interested in joining {company}'s engineering team, and what technical challenges here excite you most?"
    ]

    key_focus_areas = [
        "Time and Space Complexity analysis (Big-O) on all coding questions.",
        "Demonstrate clean, testable, modular code with descriptive variable naming.",
        f"Demonstrate hands-on familiarity with {stack_str}.",
        "Ask thoughtful questions about team architecture, deployment frequency, and technical debt."
    ]

    return {
        "job_id": job_data.get("id"),
        "title": title,
        "company": company,
        "tech_focus": stack_str,
        "technical_coding_questions": technical_questions,
        "system_design_scenarios": system_design_prompts,
        "behavioral_questions": behavioral_questions,
        "interviewer_tips": key_focus_areas
    }

def handle_career_chat(user_message: str, user_profile: Optional[Dict[str, Any]] = None, current_job: Optional[Dict[str, Any]] = None) -> str:
    msg_low = user_message.lower()

    if "stipend" in msg_low or "salary" in msg_low or "pay" in msg_low:
        return (
            "💰 **Mumbai Tech Compensation Intel (2026):**\n\n"
            "- **Software Internships:** In the Mumbai Metropolitan Region (MMR), genuine verified software internships pay between **₹15,000 to ₹60,000/month**. Top product firms (Dream11, Morgan Stanley, Zepto, BrowserStack) pay ₹40,000 - ₹80,000/month.\n"
            "- **Rule Floor:** Mumbai Tech Career Radar strictly filters out any unpaid internships or roles below ₹10,000/month.\n"
            "- **Fresher Full-Time Roles:** Entry-level SDE/GET packages range from **₹6.5 LPA to ₹25+ LPA** across tier-1 product and fintech companies in Powai, BKC, and Navi Mumbai.\n\n"
            "*Tip: Always verify whether full-time PPO conversion terms are documented upfront before accepting an internship.*"
        )
    elif "mumbai" in msg_low or "location" in msg_low or "hub" in msg_low or "bkc" in msg_low or "powai" in msg_low:
        return (
            "📍 **Mumbai Tech Ecosystem Geography:**\n\n"
            "- **Powai (Hiranandani Tech Cluster):** Home to fast-growing startups, fintech scale-ups, and IIT Bombay incubation centers.\n"
            "- **BKC (Bandra-Kurla Complex):** Financial engineering, multinational investment banks (Morgan Stanley, Nomura, Barclays), and enterprise tech.\n"
            "- **Navi Mumbai (Airoli / Ghansoli / Mahape):** Major tech parks (Reliance Corporate Park, Mindspace, Millennium Business Park) hosting Jio, L&T, and engineering campuses.\n"
            "- **Thane & Western Suburbs (Goregaon / Andheri East / Vikhroli):** Media.net, Zepto, CleverTap, and high-velocity consumer tech.\n\n"
            "*All opportunities on this radar enforce strict Mumbai MMR on-site/hybrid or verified India remote arrangements.*"
        )
    elif "resume" in msg_low or "cv" in msg_low or "ats" in msg_low:
        return (
            "📄 **ATS-Optimized Tech Resume Guidelines:**\n\n"
            "1. **Clean Single-Column Format:** Avoid multiple columns, tables, or graphic skill meters that break standard ATS parsers.\n"
            "2. **Quantified Impact (XYZ Formula):** Format bullets as *'Accomplished [X], as measured by [Y], by doing [Z]'* (e.g., *'Reduced API response latency by 42% using Redis caching and async FastAPI endpoints'*).\n"
            "3. **Keywords & Tech Stack:** Explicitly group skills into Languages, Frameworks, Databases, and Developer Tools.\n"
            "4. **Direct Proof:** Include working live demo links and clean GitHub repositories with meaningful commit history.\n\n"
            "*You can upload your resume directly in the 'AI Matcher' tab to get an instant compatibility breakdown against any live job.*"
        )
    elif "interview" in msg_low or "dsa" in msg_low or "prep" in msg_low:
        return (
            "🎯 **Interview Preparation Strategy for Mumbai Tech Companies:**\n\n"
            "1. **Round 1 (Online Assessment):** 2 LeetCode Medium problems (Arrays, Hash Maps, Dynamic Programming, Graphs) + 10 core CS MCQs (OS, DBMS, SQL, Computer Networks).\n"
            "2. **Round 2 (Technical & Live Coding):** Hands-on problem solving, explaining space/time complexity, and designing a modular class structure (OOP principles).\n"
            "3. **Round 3 (Architecture & Projects):** Deep dive into your GitHub projects, explaining database schema, scaling bottlenecks, and security considerations.\n"
            "4. **Round 4 (HR / Cultural Fit):** Discussing ownership, engineering ethics, and adaptability.\n\n"
            "*Select any job card and click 'Interview Prep' to get custom questions tailored to that exact company.*"
        )
    else:
        return (
            "🤖 **Mumbai Tech Radar AI Copilot:**\n\n"
            "I can assist you with:\n"
            "- **Job Compatibility Analysis:** Upload your resume to calculate your match score against any verified Mumbai or Remote opening.\n"
            "- **Company Verification:** Check MCA legal status, verified HR channels, and recruiting track records.\n"
            "- **Salary & Stipend Benchmarks:** Real data on tech compensation across Powai, BKC, Navi Mumbai, and Thane.\n"
            "- **Interview Question Generation:** Custom DSA, System Design, and stack-specific questions for any listing.\n\n"
            "What role or company are you preparing for today?"
        )

