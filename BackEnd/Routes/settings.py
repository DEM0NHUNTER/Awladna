# BackEnd/Routes/settings.py

# ─── User Settings API Routes ──────────────────────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
import json

# Models
from BackEnd.Models.settings import UserSettings
from BackEnd.Models.user import User

# Utilities
from BackEnd.Utils.auth_utils import get_current_user
from BackEnd.Utils.database import get_db

# ────────────────────────────────────────────────────────────────────────────────

router = APIRouter(tags=["Settings"])

# ────────────────────────────────────────────────────────────────────────────────
# ── Get Settings Placeholder ───────────────────────────────────────────────────

@router.get("/")
async def get_settings():
    """
    Placeholder endpoint for settings.
    """
    return {"message": "Settings endpoint active."}

# ────────────────────────────────────────────────────────────────────────────────
# ── Reset Scoped Theme ─────────────────────────────────────────────────────────

@router.post("/reset-theme")
def reset_scoped_theme(
    page: str = Query("default", description="Page scope for theme reset."),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Reset the theme settings for a specific page scope (e.g. dashboard, default).
    Theme history is tracked with versioning and timestamps.
    """
    settings = db.query(UserSettings).filter(UserSettings.user_id == user.user_id).first()

    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found.")

    # Define default themes by scope
    default_themes = {
        "default": {"primary": "#3b82f6", "secondary": "#8b5cf6", "version": 1},
        "dashboard": {"primary": "#10b981", "secondary": "#f97316", "version": 1},
    }

    # Load existing theme and history
    theme = json.loads(settings.theme)
    history = json.loads(settings.theme_history)

    # Reset theme for specified page
    theme[page] = default_themes.get(page, default_themes["default"])
    theme["version"] = theme.get("version", 1) + 1

    # Log reset action in theme history
    history.append({
        "timestamp": datetime.utcnow().isoformat(),
        "theme": theme,
        "scope": page,
        "action": "reset",
    })

    # Save updates to database
    settings.theme = json.dumps(theme)
    settings.theme_history = json.dumps(history)
    db.commit()

    return {
        "status": "success",
        "message": f"Theme for page '{page}' reset successfully.",
        "version": theme["version"],
    }
