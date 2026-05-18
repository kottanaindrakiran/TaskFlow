from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas, models, dependencies
from .projects import log_activity

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

def check_project_access(db: Session, project_id: int, user: models.User):
    if user.role == models.Role.admin:
        return True
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == user.id
    ).first()
    return member is not None

@router.get("/", response_model=List[schemas.TaskResponse])
def read_tasks(
    project_id: Optional[int] = None,
    status_param: Optional[models.TaskStatus] = None,
    priority: Optional[models.TaskPriority] = None,
    assigned_to: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    query = db.query(models.Task)
    
    if current_user.role != models.Role.admin:
        # User can only see tasks for projects they are members of
        query = query.join(models.Project).join(models.ProjectMember).filter(
            models.ProjectMember.user_id == current_user.id
        )
        
    if project_id:
        query = query.filter(models.Task.project_id == project_id)
    if status_param:
        query = query.filter(models.Task.status == status_param)
    if priority:
        query = query.filter(models.Task.priority == priority)
    if assigned_to:
        query = query.filter(models.Task.assigned_to == assigned_to)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{task_id}", response_model=schemas.TaskResponse)
def read_task(
    task_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if not check_project_access(db, task.project_id, current_user):
        raise HTTPException(status_code=403, detail="Access denied")
        
    return task

@router.post("/", response_model=schemas.TaskResponse)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if not check_project_access(db, task.project_id, current_user):
        raise HTTPException(status_code=403, detail="Access denied")
        
    new_task = models.Task(
        title=task.title,
        description=task.description,
        project_id=task.project_id,
        assigned_to=task.assigned_to,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        created_by=current_user.id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    log_activity(db, new_task.project_id, current_user.id, f"Created task '{new_task.title}'")
    if task.assigned_to:
        assignee = db.query(models.User).filter(models.User.id == task.assigned_to).first()
        if assignee:
            log_activity(db, new_task.project_id, current_user.id, f"Assigned task '{new_task.title}' to {assignee.name}")
            
    return new_task

@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if not check_project_access(db, task.project_id, current_user):
        raise HTTPException(status_code=403, detail="Access denied")
        
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
        
    db.commit()
    db.refresh(task)
    
    log_activity(db, task.project_id, current_user.id, f"Updated task '{task.title}'")
    return task

@router.patch("/{task_id}/status", response_model=schemas.TaskResponse)
def update_task_status(
    task_id: int,
    status_update: schemas.TaskStatusUpdate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if not check_project_access(db, task.project_id, current_user):
        raise HTTPException(status_code=403, detail="Access denied")
        
    old_status = task.status
    task.status = status_update.status
    db.commit()
    db.refresh(task)
    
    log_activity(
        db, 
        task.project_id, 
        current_user.id, 
        f"Changed status of task '{task.title}' from {old_status.value} to {task.status.value}"
    )
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if not check_project_access(db, task.project_id, current_user):
        raise HTTPException(status_code=403, detail="Access denied")
        
    db.delete(task)
    db.commit()
    
    log_activity(db, task.project_id, current_user.id, f"Deleted task '{task.title}'")
    return None
