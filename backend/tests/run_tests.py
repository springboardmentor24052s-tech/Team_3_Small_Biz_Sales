"""
Automated Test Runner & Report Generator — MarketMind AI
Runs pytest suite and records detailed test execution logs to test_results.txt
"""

import os
import sys
import subprocess
import datetime

def run_tests_and_generate_report():
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    root_dir = os.path.abspath(os.path.join(backend_dir, ".."))
    
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Run pytest and capture output
    pytest_bin = os.path.join(backend_dir, "venv", "Scripts", "pytest.exe")
    if not os.path.exists(pytest_bin):
        pytest_bin = "pytest"
        
    cmd = [pytest_bin, "-v", "--tb=short", os.path.join(backend_dir, "tests")]
    
    result = subprocess.run(
        cmd,
        cwd=backend_dir,
        capture_output=True,
        text=True
    )
    
    output = result.stdout
    errors = result.stderr
    exit_code = result.returncode
    
    status_text = "ALL TESTS PASSED" if exit_code == 0 else "SOME TESTS FAILED"
    
    report_lines = [
        "=" * 80,
        "  MARKETMIND AI — AUTOMATED TEST EXECUTION REPORT",
        "=" * 80,
        f"Execution Timestamp : {timestamp}",
        f"Execution Status    : {status_text} (Exit Code: {exit_code})",
        f"Python Environment  : {sys.executable}",
        f"Platform            : {sys.platform}",
        "=" * 80,
        "",
        "TEST SUITES EXECUTED:",
        "  1. tests/test_forecasting.py   - AI Forecasting Engine (XGBoost, RF, Prophet)",
        "  2. tests/test_churn.py         - Churn Prediction Engine (RFM, XGBoost, Risk Tiers)",
        "  3. tests/test_api_endpoints.py - FastAPI AI REST Endpoints",
        "  4. tests/test_data_integrity.py- Superstore Transaction Dataset (data.csv)",
        "",
        "=" * 80,
        "PYTEST VERBOSE EXECUTION OUTPUT:",
        "=" * 80,
        output,
        "=" * 80,
    ]
    
    if errors.strip():
        report_lines.extend([
            "STANDARD ERROR / WARNINGS:",
            errors,
            "=" * 80
        ])
        
    report_content = "\n".join(report_lines)
    
    # Save to backend/tests/test_results.txt
    backend_report_path = os.path.join(backend_dir, "tests", "test_results.txt")
    with open(backend_report_path, "w", encoding="utf-8") as f:
        f.write(report_content)
        
    # Save to workspace root test_results.txt
    root_report_path = os.path.join(root_dir, "test_results.txt")
    with open(root_report_path, "w", encoding="utf-8") as f:
        f.write(report_content)
        
    print(f"Report saved to:\n  - {backend_report_path}\n  - {root_report_path}")
    print(report_content)

if __name__ == "__main__":
    run_tests_and_generate_report()
