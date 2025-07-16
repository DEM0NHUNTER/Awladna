# BackEnd/Models/audit_log.py

# ─── Database Model: Audit Log ─────────────────────────────────────────────────

from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func

from BackEnd.Utils.database import Base

# ────────────────────────────────────────────────────────────────────────────────
# ── AuditLog Model ─────────────────────────────────────────────────────────────

class AuditLog(Base):
    """
    SQLAlchemy model representing the audit_logs table.

    Purpose:
    - Stores security and activity events such as user actions, authentication attempts,
      administrative changes, or other critical events.

    Key Columns:
    - id (PK): Unique log entry identifier.
    - action: Short description of the action performed (e.g., 'LOGIN', 'DATA_EXPORT').
    - user_id: ID of the user responsible for the action (nullable for anonymous actions).
    - ip_address: IP address of the requester.
    - user_agent: User-Agent string identifying the client's browser/device.
    - status: Status of the action (e.g., 'SUCCESS', 'FAILURE').
    - details: JSON-encoded extra metadata relevant to the event (optional).
    - created_at: Timestamp of when the log entry was created (defaults to current time).
    """

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)

    action = Column(String, nullable=False)
    user_id = Column(Integer, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    status = Column(String, nullable=False)
    details = Column(JSON, nullable=True)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)

# ────────────────────────────────────────────────────────────────────────────────
