import httpx
import sys

def run_tests():
    c = httpx.Client(base_url="http://127.0.0.1:8000")
    
    # 1. Test Stats
    stats_res = c.get("/api/stats")
    assert stats_res.status_code == 200, f"Stats failed: {stats_res.status_code}"
    stats = stats_res.json()
    print("=== 1. DASHBOARD METRICS AUDIT ===")
    print(f"Total Discovered & Screened: {stats['total_screened']}")
    print(f"Approved GREEN (APPLY NOW): {stats['approved_green']}")
    print(f"Needs Verification (YELLOW): {stats['needs_verification_yellow']}")
    print(f"Suspicious (RED / Blacklisted): {stats['suspicious_red']}")
    print(f"Rejected & Filtered Ledger: {stats['rejected_ledger']}")
    print(f"Freshness within 7-day approved window: {stats['freshness']['within_7_days']}")
    
    # 2. Test Apply Now Section
    apply_res = c.get("/api/jobs?section=apply_now")
    assert apply_res.status_code == 200
    apply_jobs = apply_res.json()
    print(f"\n=== 2. APPLY NOW SECTION ({len(apply_jobs)} OPPORTUNITIES) ===")
    assert len(apply_jobs) >= 20, "Should have 20+ verified opportunities"
    for j in apply_jobs[:3]:
        print(f"✓ {j['title']} | {j['company']} ({j['work_location']})")
        print(f"  Stipend/CTC: {j['stipend_text'] or j['salary_ctc']} | ATS: {j['direct_application_url']}")
        print(f"  Trust: {j['trust_classification']} | HR: {j['hr_quality']}")

    # 3. Test Outstation with Accommodation Section
    out_res = c.get("/api/jobs?section=outstation_with_accommodation")
    assert out_res.status_code == 200
    out_jobs = out_res.json()
    print(f"\n=== 3. OUTSTATION WITH ACCOMMODATION ({len(out_jobs)} ROLES) ===")
    for o in out_jobs:
        print(f"✓ {o['company']}: {o['title']}")
        print(f"  Accommodation: {o['accommodation_type']}")
        print(f"  Living Allowance: {o['living_allowance_text']}")
        print(f"  Stipend: {o['stipend_text']}")

    # 4. Test Rejection Ledger
    rej_res = c.get("/api/jobs?section=rejected_log")
    assert rej_res.status_code == 200
    rej_jobs = rej_res.json()
    print(f"\n=== 4. AUDIT & REJECTION LEDGER ({len(rej_jobs)} ROLES) ===")
    assert len(rej_jobs) > 0, "Rejection ledger must contain rejected entries"
    for r in rej_jobs[:5]:
        print(f"✗ [{r['company']}] {r['title']}")
        print(f"  Rejection Reason: {r['rejection_reason']}")

    # 5. Test Application Tracker
    track_res = c.post("/api/tracker", json={
        "job_id": "dream11-sde-intern-bkc",
        "status": "Applied",
        "notes": "Submitted application via Dream Sports BKC career portal.",
        "priority": "High"
    })
    assert track_res.status_code == 200
    all_tracks = c.get("/api/tracker").json()
    print(f"\n=== 5. APPLICATION TRACKER AUDIT ({len(all_tracks)} ACTIVE) ===")
    for t in all_tracks:
        print(f"• [{t['status']}] {t['title']} at {t['company']} (Priority: {t['priority']})")

    # 6. Test Deep Refresh Engine
    ref_res = c.post("/api/refresh")
    assert ref_res.status_code == 200
    print(f"\n=== 6. DEEP SCAN & REFRESH ENGINE ===")
    print(f"Verdict: {ref_res.json()['message']}")
    print(f"Audit Timestamp: {ref_res.json()['verified_timestamp']}")

    print("\n>>> ALL 6 TEST SUITES PASSED WITH 100% SUCCESS <<<")

if __name__ == "__main__":
    run_tests()

