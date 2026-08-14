from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, Role
from app.schemas.auth import LoginRequest, Token, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact the Administrator."
        )

    role_names = [r.name for r in user.roles] if user.roles else ["OWNER"]
    primary_role = role_names[0]

    # Enforce strict single Admin check: Only the designated primary Admin user can login as ADMIN
    if "ADMIN" in role_names:
        admin_count = db.query(User).join(User.roles).filter(Role.name == "ADMIN").count()
        if user.email != "admin@marketmind.ai" and admin_count > 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized Admin login attempt. System permits only ONE designated System Administrator."
            )

    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": primary_role,
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name
    }

@router.post("/register", response_model=UserResponse)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Enforce rule: Only ONE Admin allowed in system
    if payload.role.upper() == "ADMIN":
        admin_exists = db.query(User).join(User.roles).filter(Role.name == "ADMIN").first()
        if admin_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot create Admin user. There can be only ONE System Administrator in the system."
            )

    new_user = User(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        full_name=payload.full_name
    )
    role = db.query(Role).filter(Role.name == payload.role.upper()).first()
    if not role:
        role = db.query(Role).filter(Role.name == "OWNER").first()
    
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
