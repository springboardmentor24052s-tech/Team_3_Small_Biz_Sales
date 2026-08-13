from typing import Optional, List
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: str
    email: str
    full_name: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "OWNER"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool
    roles: List[str] = []

    class Config:
        from_attributes = True
