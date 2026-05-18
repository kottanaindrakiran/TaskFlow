from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas, models, dependencies

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    query = db.query(models.Task)
    
    if current_user.role != models.Role.admin:
        query = query.join(models.Project).join(models.ProjectMember).filter(
            models.ProjectMember.user_id == current_user.id
        )
        
    total_tasks = query.count()
    completed_tasks = query.filter(models.Task.status == models.TaskStatus.done).count()
    in_progress_tasks = query.filter(models.Task.status == models.TaskStatus.in_progress).count()
    
    now = datetime.now(timezone.utc)
    overdue_tasks = query.filter(
        models.Task.status != models.TaskStatus.done,
        models.Task.due_date < now
    ).count()
    
    recent_tasks = query.order_by(models.Task.due_date.desc()).limit(5).all()
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "in_progress_tasks": in_progress_tasks,
        "overdue_tasks": overdue_tasks,
        "recent_tasks": recent_tasks
    }
