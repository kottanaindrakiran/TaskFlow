from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas, models, dependencies

router = APIRouter(prefix="/api/projects", tags=["projects"])

def log_activity(db: Session, project_id: int, user_id: int, action: str):
    activity = models.ActivityLog(
        project_id=project_id,
        user_id=user_id,
        action=action
    )
    db.add(activity)
    db.commit()

@router.get("/", response_model=List[schemas.ProjectResponse])
def read_projects(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if current_user.role == models.Role.admin:
        projects = db.query(models.Project).offset(skip).limit(limit).all()
    else:
        # If member, only return projects they are a member of
        projects = db.query(models.Project).join(
            models.ProjectMember
        ).filter(models.ProjectMember.user_id == current_user.id).offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def read_project(
    project_id: int, 
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if current_user.role != models.Role.admin:
        member = db.query(models.ProjectMember).filter(
            models.ProjectMember.project_id == project_id,
            models.ProjectMember.user_id == current_user.id
        ).first()
        if not member:
            raise HTTPException(status_code=403, detail="Not a member of this project")
            
    return project

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(
    project: schemas.ProjectCreate, 
    db: Session = Depends(dependencies.get_db),
    current_admin: models.User = Depends(dependencies.get_current_admin_user)
):
    new_project = models.Project(
        name=project.name,
        description=project.description,
        created_by=current_admin.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Auto add creator as member
    member = models.ProjectMember(project_id=new_project.id, user_id=current_admin.id)
    db.add(member)
    db.commit()
    
    log_activity(db, new_project.id, current_admin.id, f"Created project '{new_project.name}'")
    
    return new_project

@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(
    project_id: int,
    project_update: schemas.ProjectUpdate,
    db: Session = Depends(dependencies.get_db),
    current_admin: models.User = Depends(dependencies.get_current_admin_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    project.name = project_update.name
    project.description = project_update.description
    db.commit()
    db.refresh(project)
    
    log_activity(db, project.id, current_admin.id, f"Updated project details")
    
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(dependencies.get_db),
    current_admin: models.User = Depends(dependencies.get_current_admin_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return None

@router.post("/{project_id}/members", response_model=schemas.ProjectMemberResponse)
def add_project_member(
    project_id: int,
    member_data: schemas.ProjectMemberCreate,
    db: Session = Depends(dependencies.get_db),
    current_admin: models.User = Depends(dependencies.get_current_admin_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    user = db.query(models.User).filter(models.User.id == member_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    existing = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == member_data.user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")
        
    new_member = models.ProjectMember(
        project_id=project_id,
        user_id=member_data.user_id
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    log_activity(db, project_id, current_admin.id, f"Added user {user.name} to project")
    
    return new_member

@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(dependencies.get_db),
    current_admin: models.User = Depends(dependencies.get_current_admin_user)
):
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == user_id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in project")
        
    user_name = member.user.name
    db.delete(member)
    db.commit()
    
    log_activity(db, project_id, current_admin.id, f"Removed user {user_name} from project")
    
    return None

@router.get("/{project_id}/activity", response_model=List[schemas.ActivityLogResponse])
def get_project_activity(
    project_id: int,
    limit: int = 50,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if current_user.role != models.Role.admin:
        member = db.query(models.ProjectMember).filter(
            models.ProjectMember.project_id == project_id,
            models.ProjectMember.user_id == current_user.id
        ).first()
        if not member:
            raise HTTPException(status_code=403, detail="Not a member of this project")
            
    activities = db.query(models.ActivityLog).filter(
        models.ActivityLog.project_id == project_id
    ).order_by(models.ActivityLog.created_at.desc()).limit(limit).all()
    
    return activities
