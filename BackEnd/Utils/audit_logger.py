# BackEnd/Utils/audit_logger.py

import logging
from typing import Optional
from fastapi import Request
from sqlalchemy.orm import Session
from BackEnd.Models.audit_log import AuditLog
import json
from contextlib import contextmanager


class AuditLogger:
    """
    Utility class for logging security-related actions and API requests.
    Logs events into the database for auditing purposes.
    """

    def __init__(self):
        # Standard logger setup
        self.logger = logging.getLogger(__name__)

    def log_security_event(
            self,
            db: Session,
            event_type: str,
            user_id: Optional[int],
            request: Request,
            status: str = "success",
            details: Optional[dict] = None
    ):
        """
        Log a security event into the audit_log table.
        Records include action type, IP address, user agent, and request metadata.

        :param db: Database session
        :param event_type: Custom event type (e.g. "login", "failed_auth")
        :param user_id: ID of the user associated with the event (optional)
        :param request: FastAPI request object for context (IP, headers)
        :param status: Outcome status of the event (default: "success")
        :param details: Additional metadata (optional)
        """
        try:
            log = AuditLog(
                action=f"security_{event_type}",
                user_id=user_id,
                ip_address=request.client.host if request.client else "unknown",
                user_agent=request.headers.get("user-agent", "")[:255],
                status=status,
                details=json.dumps({
                    "event": event_type,
                    "path": request.url.path,
                    "method": request.method,
                    "metadata": details or {}
                })[:500]  # Limit JSON payload size
            )
            db.add(log)
            db.commit()
            db.refresh(log)
            logging.info(f"Security event logged: {event_type} for user {user_id}")
        except Exception as e:
            db.rollback()
            logging.error(f"Failed to log security event: {str(e)}", exc_info=True)

    @contextmanager
    def log_action(
            self,
            action: str,
            user_id: Optional[int],
            request: Request,
            db: Session
    ):
        """
        Context manager for automatically logging the success/failure of code blocks.
        Example usage:
            with audit_logger.log_action("delete_child", user_id, request, db):
                perform_sensitive_operation()

        Logs success if no exception is raised; logs failure otherwise.
        """
        try:
            yield  # Execute block wrapped by the context manager
            self.log_security_event(db, action, user_id, request, "success")
        except Exception as e:
            self.log_security_event(db, action, user_id, request, "failed", {"error": str(e)})
            db.rollback()
            raise


# Configure standard Python logging on module import
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Singleton audit logger instance for use throughout the backend
audit_logger = AuditLogger()
