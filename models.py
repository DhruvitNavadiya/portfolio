from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import List, Optional
from datetime import datetime

class ContactModel(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    subject: str | None = Field(None, max_length=120)
    message: str = Field(..., min_length=5, max_length=500)

class ContactResponse(BaseModel):
    id: str
    message: str = "Contact information received."

# Resume structure

class Experience(BaseModel):
    company: str
    role: str
    duration: str
    highlights: Optional[List[str]] = None  # new field for detailed points

class Education(BaseModel):
    institution: str
    degree: str
    year: str
    status: Optional[str] = None  # e.g., "Graduated in May 2025"

class Project(BaseModel):
    title: str
    description: str
    link : str | None = None

class ResumeModel(BaseModel):
    name: str
    title: str
    summary: str
    skills: List[str]
    experience: List[Experience]
    education: List[Education]
    projects: Optional[List[Project]] = None  # new section for portfolio projects
    

