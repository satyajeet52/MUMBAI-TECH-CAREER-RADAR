# MUMBAI TECH CAREER RADAR v2.0 ENTERPRISE
## Real-Time Verified Software Internships, Fresher Jobs & Off-Campus Recruitment Drives

A production-grade recruitment discovery, verification, and application intelligence platform strictly tailored for software engineering, technical AI, and verified opportunities across the **Mumbai Metropolitan Region (MMR)**, confirmed India-wide remote roles, and eligible outstation internships.

---

### Core Guarantees & Anti-Hallucination Standards
- **Zero Hallucinations:** Every opportunity is cross-verified against corporate MCA/RoC registries, official career boards, direct ATS endpoints, and physical office addresses.
- **Strict ₹10,000/Month Internship Minimum:** Unpaid internships and stipends under ₹10,000/month are automatically filtered out and recorded in the rejection ledger.
- **Strict Location Rules:**
  - Mumbai on-site and hybrid internships in verified MMR locations (Powai, BKC, Andheri, Goregaon, Malad, Thane, Navi Mumbai RCP/Airoli, etc.).
  - Remote / Work-from-home software roles accepting candidates across India.
  - Outstation internships accepted **only** if the company provides both confirmed accommodation and a separate living allowance covering the entire duration.
  - Hybrid positions outside Mumbai are strictly rejected.
  - Outside-Mumbai companies accepted for full-time only when holding verified recruitment drives in Mumbai.
- **Direct ATS Application Links:** Guaranteed direct links (`APPLY DIRECTLY`) leading directly to specific job requisitions, never generic homepages or dead links.
- **Freshness Window:** Prioritizes opportunities published in the last 7 days (maximum 14 days with verified active links).

---

### Key Capabilities & New Features in v2.0

1. **Multi-Source Real-Time Ingestion Pipeline**:
   - **Greenhouse ATS API**: Real-time connector polling public boards (MongoDB, Elastic, GitLab, Stripe).
   - **Ashby Job Board API**: Direct connector for high-growth tech unicorns (Linear, Replit, Ramp).
   - **Remotive & RemoteOK APIs**: Verified worldwide & India-eligible remote software and AI engineering feeds.
   - **Curated MMR Direct ATS Registry**: High-density Mumbai tech employers (Dream11, BrowserStack, Zepto, CleverTap, Jio Platforms, Morgan Stanley, etc.).

2. **AI Resume Parser & Job Match Engine**:
   - Extract technical skills, contact info, and education degrees directly from PDF or text resumes.
   - Calculate precise compatibility scores (0–100%) against any job's required tech stack.
   - Highlights matching vs. missing skills with actionable application advice.

3. **AI Interview Prep Generator**:
   - Generates tailored DSA coding challenges, system design scenarios, and behavioral questions specific to the company's tech stack.

4. **AI Career Copilot Chat**:
   - Instant conversational intelligence on Mumbai tech hubs (BKC vs. Powai vs. Navi Mumbai), salary/stipend benchmarks, and ATS formatting standards.

5. **JWT Authentication & User Profiles**:
   - Secure registration, login, and profile management with salted password hashing.

6. **Application Tracker & CSV Export**:
   - Full application lifecycle tracker (`Discovered` ➔ `Applied` ➔ `Interview Scheduled` ➔ `Selected`).
   - One-click export to `mumbai_tech_career_applications.csv`.

---

### Running the Platform

#### Local Development Server
```bash
# 1. Run backend server (FastAPI)
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000

# 2. Access the platform in your browser
http://127.0.0.1:8000/
```

#### Running Tests
```bash
python backend/comprehensive_e2e_test.py
```
*All 12 production test suites pass 100% green.*

---

### API Reference Summary

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | System health check and engine status |
| `/api/stats` | GET | Live dashboard metrics, counts & source breakdowns |
| `/api/jobs` | GET | Filtered job discovery (sections, search, location, stipend) |
| `/api/jobs/{id}` | GET | Detailed job record and verification dossier |
| `/api/jobs/check-link` | POST | Live HTTP health verification for application links |
| `/api/ingest` | POST | Triggers live multi-source connector ingestion |
| `/api/ingestion/history` | GET | Audit log of recent ingestion cycles |
| `/api/refresh` | POST | Automated deep verification & freshness re-scan |
| `/api/resume/upload` | POST | PDF resume text extraction and skill parsing |
| `/api/ai/match` | POST | Calculates candidate compatibility score for a job |
| `/api/ai/prep/{job_id}` | GET | Generates custom technical interview questions |
| `/api/ai/chat` | POST | Conversational AI Career Copilot |
| `/api/auth/register` | POST | Candidate registration |
| `/api/auth/login` | POST | Candidate JWT login |
| `/api/auth/me` | GET | Authenticated profile details |
| `/api/tracker` | GET/POST | View and add tracked applications |
| `/api/tracker/{id}` | PUT/DELETE | Update stages or remove tracked applications |
| `/api/tracker/export/csv` | GET | Download applications CSV report |
