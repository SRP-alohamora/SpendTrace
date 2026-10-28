import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
UPLOAD_DIR = PROJECT_ROOT / "uploads"
DB_PATH = BASE_DIR / "spendtrace.db"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Model & Provider Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gemini-2.0-flash")

# Confidence thresholds
HITL_CONFIDENCE_THRESHOLD = 0.80
DUPLICATE_TIME_WINDOW_HOURS = 24
REFUND_OVERDUE_DAYS = 10

def get_admin_password() -> str:
    """
    Safely retrieves the demo admin password from environment variables or git-ignored secrets file.
    Does not expose sensitive credentials in code repository.
    """
    env_pwd = os.getenv("SPENDTRACE_ADMIN_PASSWORD")
    if env_pwd:
        return env_pwd
    for path in [PROJECT_ROOT / "credentials.json", PROJECT_ROOT / ".secrets.json", BASE_DIR / "credentials.json"]:
        if path.exists():
            try:
                import json
                with open(path, "r") as f:
                    data = json.load(f)
                    pwd = data.get("admin", {}).get("password") or data.get("SPENDTRACE_ADMIN_PASSWORD")
                    if pwd:
                        return str(pwd)
            except Exception:
                pass
    raise RuntimeError(
        "Admin password not configured. Please define SPENDTRACE_ADMIN_PASSWORD in git-ignored .env or credentials.json."
    )

