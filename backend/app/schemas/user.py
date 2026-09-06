from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


# Properties to receive via API on update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    password: Optional[str] = Field(None, min_length=6, max_length=100)


# Properties to receive via API on login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Properties returned via API
class UserResponse(UserBase):
    id: str
    role: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
