from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .. import schemas, models, dependencies

router = APIRouter(prefix="/api/users", tags=["users"])

class UserRoleUpdate(BaseModel):
    role: models.Role

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user

@router.get("/", response_model=List[schemas.UserResponse])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(dependencies.get_db),
    current_admin: models.User = Depends(dependencies.get_current_admin_user)
):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.patch("/{user_id}/role", response_model=schemas.UserResponse)
def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(dependencies.get_db),
    current_admin: models.User = Depends(dependencies.get_current_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role_update.role
    db.commit()
    db.refresh(user)
    return user
