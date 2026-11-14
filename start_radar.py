import subprocess
import sys
import os
import webbrowser
import time

def main():
    print("=" * 65)
    print("   MUMBAI TECH CAREER RADAR v2.0 ENTERPRISE")
    print("   Real-Time Verified Software Internships & Fresher Tech Roles")
    print("=" * 65)
    
    workspace_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(workspace_dir, "backend")
    
    print("\n[1/3] Initializing database schema...")
    # Safe initialization that creates tables and keeps data intact
    subprocess.run([sys.executable, "-c", "import sys; sys.path.append('backend'); from database import init_db; init_db()"], cwd=workspace_dir, check=True)
    
    print("\n[2/3] Launching FastAPI platform on http://127.0.0.1:8000 ...")
    print("      - Interactive Radar Dashboard: http://127.0.0.1:8000/")
    print("      - REST API: http://127.0.0.1:8000/api")
    print("      - OpenAPI Interactive Docs: http://127.0.0.1:8000/docs\n")
    
    # Open browser after a brief moment
    time.sleep(1)
    try:
        webbrowser.open("http://127.0.0.1:8000/")
    except Exception:
        pass
        
    subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"], cwd=backend_dir)

if __name__ == "__main__":
    main()
