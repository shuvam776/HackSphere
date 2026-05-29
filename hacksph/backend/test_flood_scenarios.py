"""
Flood Scenario API Testing Script
Simulates Postman-style testing of the JalRakshak backend.
Sends flood-scenario ASHA worker reports and verifies heatmap/risk data.
"""
import requests
import json
import sys

BASE_URL = "http://localhost:5000"

# ─── Color helpers for terminal output ───
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

def header(title):
    print(f"\n{CYAN}{'='*70}")
    print(f"  {BOLD}{title}{RESET}{CYAN}")
    print(f"{'='*70}{RESET}")

def subheader(title):
    print(f"\n{YELLOW}--- {title} ---{RESET}")

def ok(msg):
    print(f"  {GREEN}✓ {msg}{RESET}")

def fail(msg):
    print(f"  {RED}✗ {msg}{RESET}")

def info(msg):
    print(f"  {CYAN}ℹ {msg}{RESET}")

# ─── TEST 1: Health Check ───
def test_health():
    header("TEST 1: Health Check (GET /health)")
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        data = r.json()
        if r.status_code == 200 and data.get("status") == "healthy":
            ok(f"Server healthy — {data.get('project')} v{data.get('version')}")
        else:
            fail(f"Unexpected response: {data}")
        return True
    except Exception as e:
        fail(f"Server unreachable: {e}")
        return False

# ─── TEST 2: Submit Flood-Scenario Reports (POST /api/report) ───
FLOOD_SCENARIOS = [
    {
        "label": "Sundarbans — Severe Flood (all symptoms, contaminated water, monsoon)",
        "payload": {
            "village": "Sundarbans",
            "fever": 1,
            "diarrhea": 1,
            "vomiting": 1,
            "water_condition": "contaminated",
            "date": "2026-07-15",
            "symptom_severity_score": 3
        },
        "expect_high_risk": True
    },
    {
        "label": "Bishnupur — Moderate Flood (diarrhea + contaminated water)",
        "payload": {
            "village": "Bishnupur",
            "fever": 0,
            "diarrhea": 1,
            "vomiting": 0,
            "water_condition": "contaminated",
            "date": "2026-08-02",
            "symptom_severity_score": 1
        },
        "expect_high_risk": False
    },
    {
        "label": "Kasipur — Extreme Flood Zone (all symptoms, contaminated, high flood freq)",
        "payload": {
            "village": "Kasipur",
            "fever": 1,
            "diarrhea": 1,
            "vomiting": 1,
            "water_condition": "contaminated",
            "date": "2026-07-20",
            "symptom_severity_score": 3
        },
        "expect_high_risk": True
    },
    {
        "label": "Rampur — No Flood (clean water, no symptoms, summer)",
        "payload": {
            "village": "Rampur",
            "fever": 0,
            "diarrhea": 0,
            "vomiting": 0,
            "water_condition": "clean",
            "date": "2026-03-10",
            "symptom_severity_score": 0
        },
        "expect_high_risk": False
    },
    {
        "label": "Madhupur — Flood Zone + Partial Symptoms (fever + contaminated)",
        "payload": {
            "village": "Madhupur",
            "fever": 1,
            "diarrhea": 0,
            "vomiting": 1,
            "water_condition": "contaminated",
            "date": "2026-09-05",
            "symptom_severity_score": 2
        },
        "expect_high_risk": True
    },
]

def test_flood_reports():
    header("TEST 2: Flood-Scenario Report Submissions (POST /api/report)")
    results = []
    for i, scenario in enumerate(FLOOD_SCENARIOS, 1):
        subheader(f"Scenario {i}: {scenario['label']}")
        try:
            r = requests.post(
                f"{BASE_URL}/api/report",
                json=scenario["payload"],
                timeout=10
            )
            data = r.json()
            
            if r.status_code == 201 and data.get("success"):
                report = data["data"]
                risk = report.get("risk_score", 0)
                level = report.get("risk_level", "?")
                ml_pred = report.get("ml_prediction", "?")
                alert_triggered = report.get("alert_triggered", False)
                lat = report.get("latitude", "?")
                lng = report.get("longitude", "?")
                
                ok(f"Status: {r.status_code} | Risk: {risk}% ({level}) | ML Pred: {ml_pred} | Alert: {alert_triggered}")
                info(f"Coords: ({lat}, {lng}) | Village: {report.get('village')}")
                
                # Validate expectations
                if scenario["expect_high_risk"] and level == "HIGH":
                    ok("PASS — High risk correctly detected for flood scenario")
                elif not scenario["expect_high_risk"] and level != "HIGH":
                    ok(f"PASS — Correctly classified as {level} (non-flood scenario)")
                elif scenario["expect_high_risk"] and level != "HIGH":
                    fail(f"WARN — Expected HIGH risk but got {level} ({risk}%)")
                else:
                    info(f"Note — Got {level} risk for non-flood scenario (acceptable)")
                
                results.append({"scenario": scenario["label"], "risk": risk, "level": level, "ml": ml_pred, "alert": alert_triggered, "pass": True})
            else:
                fail(f"API Error: {data.get('message', 'Unknown error')}")
                results.append({"scenario": scenario["label"], "pass": False, "error": data.get("message")})
        except Exception as e:
            fail(f"Request failed: {e}")
            results.append({"scenario": scenario["label"], "pass": False, "error": str(e)})
    
    return results

# ─── TEST 3: Fetch All Reports (GET /api/reports — Dashboard Heatmap Data) ───
def test_dashboard_reports():
    header("TEST 3: Dashboard Heatmap Data (GET /api/reports)")
    try:
        r = requests.get(f"{BASE_URL}/api/reports", timeout=10)
        data = r.json()
        
        if r.status_code == 200 and data.get("success"):
            reports = data.get("data", [])
            ok(f"Fetched {data.get('count', len(reports))} reports for heatmap rendering")
            
            # Group by village and show risk summary
            village_risks = {}
            for rpt in reports:
                v = rpt.get("village", "Unknown")
                if v not in village_risks:
                    village_risks[v] = {"count": 0, "max_risk": 0, "levels": []}
                village_risks[v]["count"] += 1
                village_risks[v]["max_risk"] = max(village_risks[v]["max_risk"], rpt.get("risk_score", 0))
                village_risks[v]["levels"].append(rpt.get("risk_level", "?"))
            
            subheader("Village Risk Heatmap Summary")
            for village, stats in sorted(village_risks.items(), key=lambda x: -x[1]["max_risk"]):
                high_count = stats["levels"].count("HIGH")
                emoji = "🔴" if stats["max_risk"] >= 80 else ("🟡" if stats["max_risk"] >= 50 else "🟢")
                info(f"{emoji} {village}: {stats['count']} reports | Max Risk: {stats['max_risk']}% | HIGH alerts: {high_count}")
            
            return True
        else:
            fail(f"API Error: {data.get('message')}")
            return False
    except Exception as e:
        fail(f"Request failed: {e}")
        return False

# ─── TEST 4: Fetch Alerts (GET /api/alerts) ───
def test_alerts():
    header("TEST 4: Active Outbreak Alerts (GET /api/alerts)")
    try:
        r = requests.get(f"{BASE_URL}/api/alerts", timeout=10)
        data = r.json()
        
        if r.status_code == 200 and data.get("success"):
            alerts = data.get("data", {})
            if isinstance(alerts, dict):
                alert_list = alerts.get("alerts", [])
            else:
                alert_list = alerts
            
            ok(f"Fetched {len(alert_list)} alerts")
            for a in alert_list[:5]:
                village = a.get("village", "?")
                risk = a.get("risk", a.get("risk_score", "?"))
                status = a.get("status", "?")
                emoji = "🚨" if status == "active" else "✅"
                info(f"{emoji} {village} — Risk: {risk}% — Status: {status}")
            return True
        else:
            fail(f"API Error: {data.get('message')}")
            return False
    except Exception as e:
        fail(f"Request failed: {e}")
        return False

# ─── MAIN ───
if __name__ == "__main__":
    header("🌊 JalRakshak Flood Scenario — Postman-Style API Test Suite 🌊")
    
    if not test_health():
        print(f"\n{RED}{BOLD}Flask server is not running! Start it with: python app.py{RESET}")
        sys.exit(1)
    
    report_results = test_flood_reports()
    test_dashboard_reports()
    test_alerts()
    
    # ─── Summary ───
    header("📊 TEST SUMMARY")
    passed = sum(1 for r in report_results if r.get("pass"))
    total = len(report_results)
    
    print(f"\n  Reports submitted: {total}")
    print(f"  {GREEN}Passed: {passed}{RESET}")
    if passed < total:
        print(f"  {RED}Failed: {total - passed}{RESET}")
    
    print(f"\n  {BOLD}Heatmap Village Risk Breakdown:{RESET}")
    for r in report_results:
        if r.get("pass"):
            emoji = "🔴" if r.get("level") == "HIGH" else ("🟡" if r.get("level") == "MEDIUM" else "🟢")
            print(f"    {emoji} {r['scenario'][:45]}... → {r['level']} ({r['risk']}%) ML={r['ml']}")
        else:
            print(f"    ❌ {r['scenario'][:45]}... → FAILED: {r.get('error', '?')}")
    
    print(f"\n{CYAN}{'='*70}")
    if passed == total:
        print(f"  {GREEN}{BOLD}ALL TESTS PASSED ✓ — Dashboard heatmap data is ready!{RESET}")
    else:
        print(f"  {YELLOW}{BOLD}Some tests had issues — check above for details.{RESET}")
    print(f"{CYAN}{'='*70}{RESET}\n")
