# BackEnd/Tasks/progress_email.py

from celery import shared_task
from celery.schedules import crontab
from BackEnd.Utils.email import send_progress_report
from BackEnd.Routes.analytics import get_feedback_analytics
from BackEnd.Utils.database import get_db_session
from BackEnd.Models.user import User
from BackEnd.Tasks.celery_app import celery_app


@shared_task
def send_monthly_report():
    """
    Celery task to send monthly progress reports to all users.
    """
    db = next(get_db_session())
    users = db.query(User).all()

    for user in users:
        analytics = get_feedback_analytics(db, user.user_id)
        send_progress_report(user.email, analytics)

    db.close()


# Schedule monthly reports
celery_app.conf.beat_schedule = {
    "monthly-report": {
        "task": "BackEnd.Tasks.progress_email.send_monthly_report",
        "schedule": crontab(day_of_month=1, hour=0, minute=0),
    }
}
