"""Authentication API routes for officer login, registration, and admin management."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from ..services.auth_service import (
    authenticate_officer,
    register_officer,
    get_all_officers,
    approve_officer,
    reject_officer,
    delete_officer,
    update_officer_role,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    officer_id: str
    password: str


class RegisterRequest(BaseModel):
    officer_id: str
    name: str
    password: str
    department: Optional[str] = "Legal Metrology Enforcement Wing"


class AuthResponse(BaseModel):
    success: bool
    message: str
    officer: Optional[dict] = None


class RoleUpdateRequest(BaseModel):
    role: str


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    """Authenticate an officer with ID and password."""
    result = authenticate_officer(req.officer_id.strip().upper(), req.password)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Officer ID or passcode. Please check your credentials.",
        )
    # Check if result is an error (pending/rejected)
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=result["message"],
        )
    return AuthResponse(
        success=True,
        message=f"Welcome, {result['name']}",
        officer=result,
    )


@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest):
    """Register a new enforcement officer. Status starts as 'pending'."""
    try:
        officer = register_officer(
            officer_id=req.officer_id.strip().upper(),
            name=req.name.strip(),
            password=req.password,
            department=req.department or "Legal Metrology Enforcement Wing",
        )
        return AuthResponse(
            success=True,
            message=f"Officer {officer['officer_id']} registered successfully. Your account is pending admin approval.",
            officer=officer,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# ── Admin-Only Endpoints ──


@router.get("/officers")
async def list_officers():
    """List all registered officers (admin use)."""
    return get_all_officers()


@router.put("/officers/{officer_id}/approve")
async def approve(officer_id: str):
    """Approve a pending officer registration."""
    result = approve_officer(officer_id.strip().upper())
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Officer '{officer_id}' not found.",
        )
    return {"success": True, "message": f"Officer {officer_id} approved.", "officer": result}


@router.put("/officers/{officer_id}/reject")
async def reject(officer_id: str):
    """Reject an officer registration."""
    result = reject_officer(officer_id.strip().upper())
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Officer '{officer_id}' not found.",
        )
    return {"success": True, "message": f"Officer {officer_id} rejected.", "officer": result}


@router.delete("/officers/{officer_id}")
async def remove_officer(officer_id: str):
    """Delete an officer."""
    try:
        deleted = delete_officer(officer_id.strip().upper())
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Officer '{officer_id}' not found.",
            )
        return {"success": True, "message": f"Officer {officer_id} deleted."}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/officers/{officer_id}/role")
async def change_role(officer_id: str, req: RoleUpdateRequest):
    """Change an officer's role."""
    try:
        result = update_officer_role(officer_id.strip().upper(), req.role)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Officer '{officer_id}' not found.",
            )
        return {"success": True, "message": f"Officer {officer_id} role changed to {req.role}.", "officer": result}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
