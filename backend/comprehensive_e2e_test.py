import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def log_test(name: str, passed: bool, details: str = ""):
    symbol = "✅ PASS" if passed else "❌ FAIL"
    print(f"{symbol} [{name}] {details}")
    if not passed:
        raise AssertionError(f"Test failed: {name} - {details}")

def run_tests():
    print("=" * 65)
    print("MUMBAI TECH CAREER RADAR v2.0 - ENTERPRISE TEST SUITE")
    print("=" * 65)

    # 1. Health check
    req = urllib.request.Request(f"{BASE_URL}/api/health")
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        log_test("System Health Check", resp.status == 200 and data["status"] == "healthy", f"Version: {data.get('version')}")

    # 2. Stats endpoint
    req = urllib.request.Request(f"{BASE_URL}/api/stats")
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        log_test("Dashboard Statistics", data["total_screened"] >= 500, f"Total jobs: {data['total_screened']}, Approved: {data['approved_green']}")
        log_test("Source Platforms Breakdown", len(data.get("sources_breakdown", {})) >= 3, f"Platforms: {list(data.get('sources_breakdown', {}).keys())}")

    # 3. User Registration & Login
    unique_email = f"candidate_{int(resp.headers.get('date', '0').split()[-2].replace(':', '') if 'date' in resp.headers else '999')}@test.com"
    reg_payload = json.dumps({"email": unique_email, "password": "SecurePassword123!", "full_name": "Satya Mumbai Dev"}).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/auth/register", data=reg_payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as reg_resp:
            reg_data = json.loads(reg_resp.read().decode())
            token = reg_data["access_token"]
            log_test("Candidate Registration", reg_resp.status == 200 and "access_token" in reg_data, f"User ID: {reg_data['user']['id']}")
    except urllib.error.HTTPError as e:
        # If already exists, login instead
        login_payload = json.dumps({"email": "demo@mumbaitechradar.com", "password": "demo1234"}).encode()
        req_log = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=login_payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req_log) as log_resp:
            log_data = json.loads(log_resp.read().decode())
            token = log_data["access_token"]
            log_test("Candidate Login (Demo)", log_resp.status == 200 and "access_token" in log_data)

    # 4. Authenticated /api/auth/me
    req = urllib.request.Request(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req) as resp:
        me_data = json.loads(resp.read().decode())
        log_test("User Profile Inspection", "user" in me_data and "profile" in me_data, f"Email: {me_data['user']['email']}")

    # 5. Ingestion History
    req = urllib.request.Request(f"{BASE_URL}/api/ingestion/history")
    with urllib.request.urlopen(req) as resp:
        ing_data = json.loads(resp.read().decode())
        log_test("Ingestion Logs Audit", len(ing_data) > 0, f"Latest run: {ing_data[0]['source_name']} (Fetched: {ing_data[0]['fetched_count']})")

    # 6. Jobs discovery & filtering
    req = urllib.request.Request(f"{BASE_URL}/api/jobs?section=apply_now&limit=5")
    with urllib.request.urlopen(req) as resp:
        jobs = json.loads(resp.read().decode())
        log_test("Apply Now Jobs Query", len(jobs) > 0, f"Sample: {jobs[0]['company']} - {jobs[0]['title']}")
        test_job_id = jobs[0]["id"]

    # 7. AI Resume Matching
    match_payload = json.dumps({
        "job_id": test_job_id,
        "resume_text": "Experienced software engineer with skills in Python, FastAPI, React, Docker, Kubernetes, SQL, and Machine Learning."
    }).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/ai/match", data=match_payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        match_data = json.loads(resp.read().decode())
        log_test("AI Resume Matching Engine", match_data["match_score"] > 0, f"Score: {match_data['match_score']}% ({match_data['match_tier']})")

    # 8. AI Interview Prep Generator
    req = urllib.request.Request(f"{BASE_URL}/api/ai/prep/{test_job_id}")
    with urllib.request.urlopen(req) as resp:
        prep_data = json.loads(resp.read().decode())
        log_test("AI Interview Question Generator", len(prep_data["technical_coding_questions"]) >= 5, f"Tech focus: {prep_data['tech_focus']}")

    # 9. AI Career Copilot Chat
    chat_payload = json.dumps({"message": "What are the internship stipends in Mumbai?"}).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/ai/chat", data=chat_payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        chat_data = json.loads(resp.read().decode())
        log_test("AI Career Copilot Chat", "reply" in chat_data and len(chat_data["reply"]) > 50)

    # 10. Link Health Verification
    check_payload = json.dumps({"url": jobs[0]["direct_application_url"]}).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/jobs/check-link", data=check_payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        link_data = json.loads(resp.read().decode())
        log_test("ATS Link Health Checker", "status" in link_data, f"Status: {link_data.get('status')}")

    # 11. Application Tracker Lifecycle & CSV Export
    track_payload = json.dumps({"job_id": test_job_id, "status": "Applied", "notes": "Automated e2e verification"}).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/tracker", data=track_payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        track_resp = json.loads(resp.read().decode())
        app_id = track_resp.get("application_id")
        log_test("Tracker Add Application", app_id is not None, f"Application ID: {app_id}")

    # CSV Export
    req = urllib.request.Request(f"{BASE_URL}/api/tracker/export/csv")
    with urllib.request.urlopen(req) as resp:
        csv_text = resp.read().decode("utf-8")
        log_test("Application Tracker CSV Export", "Job Title" in csv_text and resp.status == 200, f"CSV length: {len(csv_text)} bytes")

    # 12. Automated Freshness & Deep Verification Cycle
    req = urllib.request.Request(f"{BASE_URL}/api/refresh", data=b"{}", headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        refresh_data = json.loads(resp.read().decode())
        log_test("Deep Scan Freshness Re-Verification", refresh_data["status"] == "success", f"Screened: {refresh_data['total_screened']}, Approved: {refresh_data['approved_green']}")

    print("=" * 65)
    print("ALL 12 PRODUCTION TESTS PASSED SUCCESSFULLY! (100% GREEN)")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()

