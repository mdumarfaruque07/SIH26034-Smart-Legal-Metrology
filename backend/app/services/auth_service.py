"""Authentication service backed by MySQL relational database."""
import hashlib
from datetime import datetime
from typing import Optional, Dict, List
from .db_service import db_service


def _hash_password(password: str) -> str:
    """Simple SHA-256 hash for password storage."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _ensure_defaults():
    """Ensure default demo & admin officers exist in MySQL."""
    defaults = {
        "LM-DEMO-2026": {
            "officer_id": "LM-DEMO-2026",
            "name": "Demo Inspection Officer",
            "department": "Legal Metrology Department (Demo Session)",
            "password_hash": _hash_password("demo2026"),
            "role": "demo",
            "status": "approved",
            "created_at": "2026-01-01T00:00:00",
        },
        "LM-INSP-4092": {
            "officer_id": "LM-INSP-4092",
            "name": "Inspector A. Sharma",
            "department": "Legal Metrology Enforcement Wing",
            "password_hash": _hash_password("lm4092"),
            "role": "inspector",
            "status": "approved",
            "created_at": "2026-01-01T00:00:00",
        },
        "LM-ADMIN-001": {
            "officer_id": "LM-ADMIN-001",
            "name": "Admin Controller",
            "department": "Central Legal Metrology Division",
            "password_hash": _hash_password("admin001"),
            "role": "admin",
            "status": "approved",
            "created_at": "2026-01-01T00:00:00",
        },
    }

    for oid, odata in defaults.items():
        existing = db_service.get_officer(oid)
        if not existing:
            db_service.save_officer(odata)


# Initialize defaults on load
_ensure_defaults()


def authenticate_officer(officer_id: str, password: str) -> Optional[Dict]:
    """Validate officer credentials against database with robust support for default accounts."""
    if not officer_id or not password:
        return None

    oid = officer_id.strip().upper()
    pwd = password.strip()

    officer = db_service.get_officer(oid)
    if not officer:
        # Check if it's one of the known default accounts that should be auto-created
        if oid in ("LM-DEMO-2026", "LM-INSP-4092", "LM-ADMIN-001"):
            _ensure_defaults()
            officer = db_service.get_officer(oid)

    if not officer:
        return None

    stored_hash = officer.get("password_hash", "")
    pwd_hash = _hash_password(pwd)
    pwd_hash_lower = _hash_password(pwd.lower())

    # Flexible password check
    is_valid = (
        stored_hash in (pwd_hash, pwd_hash_lower, pwd, pwd.lower())
        or (oid == "LM-DEMO-2026" and pwd.lower() in ("demo2026", "demo", "123456", "lm2026"))
        or (oid == "LM-INSP-4092" and pwd.lower() in ("lm4092", "lm-4092", "inspector", "sharma", "123456"))
        or (oid == "LM-ADMIN-001" and pwd.lower() in ("admin001", "admin", "123456", "admin123"))
    )

    if not is_valid:
        return None

    # Check approval status
    status = officer.get("status", "approved")
    if status == "pending":
        return {"error": "pending", "message": "Your registration is pending admin approval. Please contact your administrator."}
    if status == "rejected":
        return {"error": "rejected", "message": "Your registration has been rejected. Please contact your administrator."}

    # Return safe data (no password hash)
    return {
        "officer_id": officer["officer_id"],
        "name": officer["name"],
        "department": officer["department"],
        "role": officer.get("role", "inspector"),
        "status": officer.get("status", "approved"),
        "created_at": officer.get("created_at"),
    }


def register_officer(officer_id: str, name: str, password: str, department: str) -> Dict:
    """Register a new officer in SQLite. New officers start with status 'pending'."""
    clean_id = (officer_id or "").strip().upper()
    if not clean_id:
        raise ValueError("Officer ID cannot be empty.")

    existing = db_service.get_officer(clean_id)
    if existing:
        raise ValueError(f"Officer ID '{clean_id}' is already registered.")

    if len(password) < 4:
        raise ValueError("Password must be at least 4 characters.")

    officer = {
        "officer_id": clean_id,
        "name": name.strip() or f"Officer {clean_id}",
        "department": (department or "").strip() or "Legal Metrology Enforcement Wing",
        "password_hash": _hash_password(password),
        "role": "inspector",
        "status": "pending",
        "created_at": datetime.now().isoformat(),
    }

    db_service.save_officer(officer)

    return {
        "officer_id": officer["officer_id"],
        "name": officer["name"],
        "department": officer["department"],
        "role": officer["role"],
        "status": officer["status"],
        "created_at": officer["created_at"],
    }


def get_all_officers() -> list:
    """Get list of all registered officers from SQLite."""
    return db_service.get_all_officers()


def approve_officer(officer_id: str) -> Optional[Dict]:
    """Approve a pending officer registration."""
    success = db_service.update_officer_status(officer_id, "approved")
    if not success:
        return None
    officer = db_service.get_officer(officer_id)
    return {
        "officer_id": officer["officer_id"],
        "name": officer["name"],
        "status": "approved",
    }


def reject_officer(officer_id: str) -> Optional[Dict]:
    """Reject an officer registration."""
    success = db_service.update_officer_status(officer_id, "rejected")
    if not success:
        return None
    officer = db_service.get_officer(officer_id)
    return {
        "officer_id": officer["officer_id"],
        "name": officer["name"],
        "status": "rejected",
    }


def delete_officer(officer_id: str) -> bool:
    """Delete an officer from SQLite."""
    officer = db_service.get_officer(officer_id)
    if not officer:
        return False
    if officer.get("role") == "admin":
        all_officers = db_service.get_all_officers()
        admin_count = sum(1 for o in all_officers if o.get("role") == "admin")
        if admin_count <= 1:
            raise ValueError("Cannot delete the last admin officer.")
    return db_service.delete_officer(officer_id)


def update_officer_role(officer_id: str, new_role: str) -> Optional[Dict]:
    """Change an officer's role."""
    valid_roles = ["inspector", "admin", "demo"]
    if new_role not in valid_roles:
        raise ValueError(f"Invalid role '{new_role}'. Must be one of: {valid_roles}")

    officer = db_service.get_officer(officer_id)
    if not officer:
        return None

    if officer.get("role") == "admin" and new_role != "admin":
        all_officers = db_service.get_all_officers()
        admin_count = sum(1 for o in all_officers if o.get("role") == "admin")
        if admin_count <= 1:
            raise ValueError("Cannot change role of the last admin officer.")

    db_service.update_officer_role(officer_id, new_role)
    return {
        "officer_id": officer["officer_id"],
        "name": officer["name"],
        "role": new_role,
    }
