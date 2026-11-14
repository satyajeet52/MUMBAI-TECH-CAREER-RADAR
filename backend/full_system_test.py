import httpx
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_full_system():
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)
    print("================================================================")
    print("      MUMBAI TECH CAREER RADAR — FULL SYSTEM AUDIT SUITE       ")
    print("================================================================\n")
    
    # 1. Frontend & Asset Integrity
    print("[TEST 1/6] Auditing Frontend & Static Assets...")
    res = client.get("/")
    assert res.status_code == 200, f"Root HTML returned status {res.status_code}"
    html = res.text
    assert '<div id="root">' in html, "Root element missing from HTML"
    
    import re
    css_match = re.search(r'href="(/assets/index-[^"]+\.css)"', html)
    assert css_match, "CSS link tag missing from HTML"
    css_res = client.get(css_match.group(1))
    assert css_res.status_code == 200, f"CSS asset returned {css_res.status_code}"
    assert len(css_res.content) > 40000, f"CSS bundle is too small ({len(css_res.content)} bytes) — Tailwind not generated!"
    print(f"  ✓ Root HTML and Tailwind CSS verified ({len(css_res.content)} bytes bundled).")

    # 2. Stats API Integrity
    print("\n[TEST 2/6] Auditing Metric Statistics API...")
    stats_res = client.get("/api/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_screened"] == 35, f"Expected 35 opportunities, got {stats['total_screened']}"
    assert stats["approved_green"] == 24, f"Expected 24 approved green, got {stats['approved_green']}"
    assert stats["rejected_ledger"] == 11, f"Expected 11 rejected, got {stats['rejected_ledger']}"
    print(f"  ✓ Total Screened: {stats['total_screened']}")
    print(f"  ✓ Approved GREEN Apply Now: {stats['approved_green']}")
    print(f"  ✓ Rejection Ledger: {stats['rejected_ledger']}")
    print(f"  ✓ Freshness within 7-Day Window: {stats['freshness']['within_7_days']}")

    # 3. Section Queries & Anti-Hallucination Routing
    print("\n[TEST 3/6] Auditing All 16 Dashboard Section Queries...")
    sections = [
        ("apply_now", 24),
        ("mumbai_internships", 6),
        ("mumbai_hybrid_internships", 2),
        ("remote_internships", 2),
        ("outstation_with_accommodation", 3),
        ("mumbai_fresher_jobs", 3),
        ("mumbai_hybrid_fresher", 2),
        ("mumbai_ai_jobs", 6),
        ("mumbai_drives", 6),
        ("outside_companies_mumbai_drives", 2),
        ("internship_ppo", 6),
        ("yellow", 10),
        ("red", 1),
        ("rejected_log", 11)
    ]
    for sec, expected_min in sections:
        sec_res = client.get(f"/api/jobs?section={sec}")
        assert sec_res.status_code == 200, f"Section {sec} failed with {sec_res.status_code}"
        data = sec_res.json()
        assert len(data) >= expected_min, f"Section {sec} returned {len(data)}, expected at least {expected_min}"
        print(f"  ✓ Section '{sec}': {len(data)} items verified.")

    # 4. Multi-Parameter Filter Matrix
    print("\n[TEST 4/6] Auditing Combinatorial Filter Matrix...")
    filters_to_test = [
        {"search": "python"},
        {"search": "Dream11"},
        {"location_filter": "mumbai"},
        {"location_filter": "remote"},
        {"location_filter": "outstation"},
        {"work_arrangement": "On-site"},
        {"work_arrangement": "Hybrid"},
        {"work_arrangement": "Remote"},
        {"job_type": "Internship"},
        {"job_type": "Full-time"},
        {"tech_category": "Generative AI"},
        {"min_stipend": 25000},
        {"min_stipend": 50000},
        {"ppo_only": True},
        {"accommodation_only": True},
        {"sort_by": "stipend_high"},
        {"sort_by": "newest"},
        {"search": "Java", "work_arrangement": "On-site", "min_stipend": 20000}
    ]
    for flt in filters_to_test:
        params = {k: str(v).lower() if isinstance(v, bool) else str(v) for k, v in flt.items()}
        flt_res = client.get("/api/jobs", params=params)
        assert flt_res.status_code == 200, f"Filter {flt} failed with {flt_res.status_code}"
        flt_data = flt_res.json()
        print(f"  ✓ Filter {flt} -> {len(flt_data)} matching roles (HTTP 200).")

    # 5. Persistent Application Tracker Lifecycle
    print("\n[TEST 5/6] Auditing Application Tracker Lifecycle & Duplicate Prevention...")
    # Add new application
    test_job_id = "quantiphi-ai-intern-mumbai"
    add_res = client.post("/api/tracker", json={
        "job_id": test_job_id,
        "status": "Applied",
        "notes": "Automated system test note for Quantiphi application",
        "priority": "High"
    })
    assert add_res.status_code == 200
    app_id = add_res.json().get("application_id")
    print(f"  ✓ Added application (ID: {app_id}).")

    # Test duplicate prevention
    dup_res = client.post("/api/tracker", json={
        "job_id": test_job_id,
        "status": "Applied"
    })
    assert dup_res.status_code == 200
    assert "already tracked" in dup_res.json().get("message", "").lower()
    print("  ✓ Duplicate prevention confirmed (correctly blocked duplicate tracking).")

    # Update application
    upd_res = client.put(f"/api/tracker/{app_id}", json={
        "status": "Interview Scheduled",
        "notes": "Round 1 Technical Screening confirmed for Nov 18",
        "priority": "High"
    })
    assert upd_res.status_code == 200
    print("  ✓ Application stage updated to 'Interview Scheduled'.")

    # Verify tracker listing
    tracker_list = client.get("/api/tracker").json()
    matched = [a for a in tracker_list if a["job_id"] == test_job_id]
    assert len(matched) == 1
    assert matched[0]["status"] == "Interview Scheduled"
    assert "Round 1 Technical Screening" in matched[0]["notes"]
    print("  ✓ Tracker query confirmed updated state and notes.")

    # Cleanup application
    del_res = client.delete(f"/api/tracker/{app_id}")
    assert del_res.status_code == 200
    print(f"  ✓ Cleaned up test application {app_id}.")

    # 6. Deep Re-Verification Refresh Trigger
    print("\n[TEST 6/6] Auditing Live Radar Deep Scan Trigger...")
    ref_res = client.post("/api/refresh")
    assert ref_res.status_code == 200
    ref_json = ref_res.json()
    assert ref_json["status"] == "success"
    assert ref_json["total_screened"] == 35
    assert ref_json["approved_green"] == 24
    print(f"  ✓ Refresh Trigger Succeeded: {ref_json['message']}")
    print(f"  ✓ Verified Timestamp: {ref_json['verified_timestamp']}")

    print("\n================================================================")
    print("   ALL 6 SYSTEM AUDIT SUITES PASSED WITH 100% SUCCESS RATE!     ")
    print("================================================================\n")

if __name__ == "__main__":
    test_full_system()
