# BackEnd/Routes/admin.py

# ─── Admin-Only Routes ─────────────────────────────────────────────────────────

from fastapi import APIRouter, Depends

from BackEnd.Utils.auth_utils import require_role
from BackEnd.Models.user import UserRole

# ────────────────────────────────────────────────────────────────────────────────
# ── Router Initialization ──────────────────────────────────────────────────────

router = APIRouter(
    tags=["Admin"],
    dependencies=[Depends(require_role(UserRole.ADMIN))]
)

# ────────────────────────────────────────────────────────────────────────────────
# ── Admin Dashboard Endpoint ───────────────────────────────────────────────────

@router.get("/dashboard")
async def admin_dashboard():
    """
    Endpoint: GET /api/auth/admin/dashboard

    Purpose:
    - Provides a basic placeholder response for the admin dashboard.

    Access Control:
    - Restricted to authenticated users with ADMIN role.

    Returns:
        dict: Confirmation message indicating admin access.
    """
    return {"message": "Admin dashboard"}

# ────────────────────────────────────────────────────────────────────────────────
