from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User, Role
from app.schemas.auth import UserResponse, UserCreate

router = APIRouter(prefix="/users", tags=["User Management & Access Control"])

@router.get("/", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        UserResponse(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            is_active=u.is_active,
            roles=[r.name for r in u.roles]
        )
        for u in users
    ]

@router.post("/", response_model=UserResponse)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    requested_role = payload.role.upper()
    if requested_role == "ADMIN":
        admin_exists = db.query(User).join(User.roles).filter(Role.name == "ADMIN").first()
        if admin_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only ONE System Administrator is allowed in the platform."
            )

    new_user = User(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        full_name=payload.full_name,
        is_active=True
    )
    role = db.query(Role).filter(Role.name == requested_role).first()
    if role:
        new_user.roles.append(role)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        is_active=new_user.is_active,
        roles=[r.name for r in new_user.roles]
    )

@router.put("/{user_id}/status")
def toggle_user_status(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent disabling the primary Admin account
    if any(r.name == "ADMIN" for r in user.roles):
        raise HTTPException(status_code=400, detail="Cannot deactivate the System Administrator account.")

    user.is_active = not user.is_active
    db.commit()
    return {"status": "success", "user_id": user_id, "is_active": user.is_active}
