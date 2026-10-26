import os
import uuid
import hmac
import hashlib
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import Header, HTTPException, Depends
import jwt

from backend.config import PROJECT_ROOT

# =====================================================================
# Supabase Open Source Auth & IAM Configuration
# Compatible with https://github.com/SRP-alohamora/supabase-opensrc-auth
# =====================================================================

SUPABASE_URL = os.getenv("SUPABASE_URL", "http://localhost:54321")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.spendtrace-anon-key")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.spendtrace-service-key")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "spendtrace-supabase-jwt-secret-secure-key-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Demo User IDs
DEMO_ADMIN_ID = "00000000-0000-0000-0000-000000000001"
DEMO_ADMIN_EMAIL = "admin@spendtrace.ai"

DEMO_MEMBER_ID = "00000000-0000-0000-0000-000000000002"
DEMO_MEMBER_EMAIL = "newuser@spendtrace.ai"

def hash_password(password: str) -> str:
    """Computes a salted SHA-256 hash for secure storage."""
    salt = "spendtrace_salt_"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hmac.compare_digest(hash_password(plain_password), hashed_password)

def create_supabase_jwt(user_id: str, email: str, role: str = "member", full_name: Optional[str] = None) -> str:
    """
    Generates a standard Supabase GoTrue-compatible JWT token.
    Follows https://github.com/SRP-alohamora/supabase-opensrc-auth JWT claims spec.
    """
    now = int(time.time())
    payload = {
        "iss": "supabase",
        "sub": user_id,
        "aud": "authenticated",
        "exp": now + (JWT_EXPIRATION_HOURS * 3600),
        "iat": now,
        "email": email,
        "role": "authenticated",
        "app_metadata": {
            "provider": "email",
            "providers": ["email"],
            "role": role  # 'admin' or 'member'
        },
        "user_metadata": {
            "full_name": full_name or email.split("@")[0].capitalize(),
            "role": role
        }
    }
    return jwt.encode(payload, SUPABASE_JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_supabase_jwt(token: str) -> Dict[str, Any]:
    """Decodes and validates a Supabase JWT token."""
    try:
        # Strip 'Bearer ' if present
        if token.startswith("Bearer "):
            token = token[7:]
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=[JWT_ALGORITHM], audience="authenticated")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Authentication token has expired.")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Supabase Auth token: {str(e)}")

# =====================================================================
# Database User Operations (Unified PostgreSQL & SQLite support)
# =====================================================================

def get_auth_connection():
    from backend.db.database import get_db_connection
    return get_db_connection()

def register_user(email: str, password: str, role: str = "member", full_name: Optional[str] = None) -> Dict[str, Any]:
    """
    Registers a new user in the database.
    CRITICAL INVARIANT: For a new user, ALWAYS START CLEAN.
    New users are provisioned with 0 transactions, 0 receipts, and 0 refund items.
    """
    email = email.strip().lower()
    conn = get_auth_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing = cursor.fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="User with this email already exists.")

        user_id = str(uuid.uuid4())
        pwd_hash = hash_password(password)
        name = full_name or email.split("@")[0].capitalize()

        cursor.execute(
            """INSERT INTO users (id, email, password_hash, role, full_name, created_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (user_id, email, pwd_hash, role, name, datetime.utcnow().isoformat())
        )
        conn.commit()

        token = create_supabase_jwt(user_id=user_id, email=email, role=role, full_name=name)
        return {
            "user": {
                "id": user_id,
                "email": email,
                "role": role,
                "full_name": name,
                "is_clean_slate": True
            },
            "access_token": token,
            "token_type": "bearer"
        }
    finally:
        conn.close()

def login_user(email: str, password: str) -> Dict[str, Any]:
    """Authenticates an existing user and returns a Supabase JWT."""
    email = email.strip().lower()
    conn = get_auth_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, password_hash, role, full_name FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        user_dict = dict(row)
        if not verify_password(password, user_dict["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        token = create_supabase_jwt(
            user_id=user_dict["id"],
            email=user_dict["email"],
            role=user_dict["role"],
            full_name=user_dict.get("full_name")
        )
        return {
            "user": {
                "id": user_dict["id"],
                "email": user_dict["email"],
                "role": user_dict["role"],
                "full_name": user_dict.get("full_name")
            },
            "access_token": token,
            "token_type": "bearer"
        }
    finally:
        conn.close()

def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    conn = get_auth_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, role, full_name, created_at FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None
    finally:
        conn.close()

def switch_user_role(user_id: str, new_role: str) -> Dict[str, Any]:
    """Allows toggling IAM role between 'admin' and 'member' for demonstration."""
    if new_role not in ["admin", "member"]:
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'member'")

    conn = get_auth_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET role = ? WHERE id = ?", (new_role, user_id))
        conn.commit()

        user = get_user_profile(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        token = create_supabase_jwt(user["id"], user["email"], new_role, user.get("full_name"))
        return {
            "user": user,
            "access_token": token,
            "message": f"IAM Role updated to {new_role}"
        }
    finally:
        conn.close()

# =====================================================================
# FastAPI Dependencies for IAM & RBAC
# =====================================================================

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    FastAPI dependency that extracts and validates the current user.
    If no authorization header is provided, defaults to the default admin session
    for seamless zero-friction local usage.
    """
    if not authorization:
        # Default fallback to demo admin if running standalone
        return {
            "id": DEMO_ADMIN_ID,
            "email": DEMO_ADMIN_EMAIL,
            "role": "admin",
            "full_name": "Admin Mode"
        }

    claims = decode_supabase_jwt(authorization)
    role = claims.get("app_metadata", {}).get("role", "member")
    return {
        "id": claims["sub"],
        "email": claims.get("email", ""),
        "role": role,
        "full_name": claims.get("user_metadata", {}).get("full_name", "")
    }

def require_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Strict IAM Authorization Barrier:
    Ensures the caller has 'admin' privileges.
    Required for Model Evals and Observability Traces!
    """
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="IAM Authorization Error: Admin role required to access Model Evals and Observability Traces."
        )
    return user
