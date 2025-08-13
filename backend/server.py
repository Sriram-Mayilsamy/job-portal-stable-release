from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from typing import Optional, List
import jwt
import bcrypt
import uuid
import os
from datetime import datetime, timedelta
import json
from pathlib import Path

# Environment variables
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# MongoDB setup
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# FastAPI app
app = FastAPI(title="Job Platform API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS.split(",") if CORS_ORIGINS != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Security
security = HTTPBearer()

# Pydantic models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str  # "employer" or "jobseeker"
    full_name: str
    company: Optional[str] = None  # For employers

class UserLogin(BaseModel):
    email: str
    password: str

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    description: str
    requirements: str
    salary_range: Optional[str] = None
    skills: List[str] = []
    application_deadline: str  # ISO date string

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    salary_range: Optional[str] = None
    skills: Optional[List[str]] = None
    application_deadline: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str  # "applied", "approved", "rejected", "waitlisted"

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_data: dict) -> str:
    payload = {
        "user_id": user_data["user_id"],
        "email": user_data["email"],
        "role": user_data["role"],
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(required_roles: List[str]):
    def role_checker(current_user: dict = Depends(verify_jwt_token)):
        if current_user["role"] not in required_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Initialize admin user
def init_admin():
    admin_exists = db.users.find_one({"email": "admin"})
    if not admin_exists:
        admin_user = {
            "user_id": str(uuid.uuid4()),
            "email": "admin",
            "password": hash_password("admin123"),
            "role": "admin",
            "full_name": "Administrator",
            "company": None,
            "created_at": datetime.utcnow().isoformat()
        }
        db.users.insert_one(admin_user)
        print("Admin user created")

# API Routes

@app.on_event("startup")
async def startup_event():
    init_admin()

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Auth endpoints
@app.post("/api/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    if db.users.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role
    if user_data.role not in ["employer", "jobseeker"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Create user
    user = {
        "user_id": str(uuid.uuid4()),
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "role": user_data.role,
        "full_name": user_data.full_name,
        "company": user_data.company if user_data.role == "employer" else None,
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.users.insert_one(user)
    
    # Create JWT token
    token = create_jwt_token(user)
    
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "role": user["role"],
            "full_name": user["full_name"],
            "company": user["company"]
        }
    }

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    # Check for admin login
    if credentials.email == "admin" and credentials.password == "admin123":
        admin_user = db.users.find_one({"email": "admin"})
        if admin_user:
            token = create_jwt_token(admin_user)
            return {
                "token": token,
                "user": {
                    "user_id": admin_user["user_id"],
                    "email": admin_user["email"],
                    "role": admin_user["role"],
                    "full_name": admin_user["full_name"],
                    "company": admin_user["company"]
                }
            }
    
    # Regular user login
    user = db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user)
    
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "role": user["role"],
            "full_name": user["full_name"],
            "company": user["company"]
        }
    }

# Public job endpoints
@app.get("/api/jobs")
async def get_jobs(page: int = 1, limit: int = 10, search: str = ""):
    skip = (page - 1) * limit
    
    # Build search query
    query = {}
    if search:
        query = {
            "$or": [
                {"title": {"$regex": search, "$options": "i"}},
                {"company": {"$regex": search, "$options": "i"}},
                {"location": {"$regex": search, "$options": "i"}},
                {"skills": {"$regex": search, "$options": "i"}}
            ]
        }
    
    # Get jobs (newest first)
    jobs = list(db.jobs.find(query).sort("created_at", -1).skip(skip).limit(limit))
    total = db.jobs.count_documents(query)
    
    # Remove MongoDB _id from results
    for job in jobs:
        job.pop("_id", None)
    
    return {
        "jobs": jobs,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@app.get("/api/jobs/search")
async def search_jobs(keyword: str, page: int = 1, limit: int = 10):
    return await get_jobs(page=page, limit=limit, search=keyword)

@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    job = db.jobs.find_one({"job_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.pop("_id", None)
    return job

# Job seeker endpoints
@app.post("/api/jobs/{job_id}/apply")
async def apply_to_job(
    job_id: str,
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    cover_letter: str = Form(...),
    resume: UploadFile = File(...),
    current_user: dict = Depends(require_role(["jobseeker"]))
):
    # Check if job exists
    job = db.jobs.find_one({"job_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if already applied
    existing_application = db.applications.find_one({
        "job_id": job_id,
        "applicant_id": current_user["user_id"]
    })
    if existing_application:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    # Save resume file
    resume_filename = f"{uuid.uuid4()}_{resume.filename}"
    resume_path = uploads_dir / resume_filename
    
    with open(resume_path, "wb") as buffer:
        content = await resume.read()
        buffer.write(content)
    
    # Create application
    application = {
        "application_id": str(uuid.uuid4()),
        "job_id": job_id,
        "applicant_id": current_user["user_id"],
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "cover_letter": cover_letter,
        "resume_filename": resume_filename,
        "status": "applied",
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.applications.insert_one(application)
    
    application.pop("_id", None)
    return application

@app.get("/api/jobseeker/applications")
async def get_my_applications(current_user: dict = Depends(require_role(["jobseeker"]))):
    applications = list(db.applications.find({"applicant_id": current_user["user_id"]}).sort("created_at", -1))
    
    # Enrich with job details
    for app in applications:
        job = db.jobs.find_one({"job_id": app["job_id"]})
        if job:
            app["job_title"] = job["title"]
            app["job_company"] = job["company"]
        app.pop("_id", None)
    
    return applications

# Employer endpoints
@app.post("/api/employer/jobs")
async def create_job(job_data: JobCreate, current_user: dict = Depends(require_role(["employer"]))):
    job = {
        "job_id": str(uuid.uuid4()),
        "employer_id": current_user["user_id"],
        "title": job_data.title,
        "company": job_data.company,
        "location": job_data.location,
        "description": job_data.description,
        "requirements": job_data.requirements,
        "salary_range": job_data.salary_range,
        "skills": job_data.skills,
        "application_deadline": job_data.application_deadline,
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.jobs.insert_one(job)
    job.pop("_id", None)
    return job

@app.get("/api/employer/jobs")
async def get_my_jobs(current_user: dict = Depends(require_role(["employer"]))):
    jobs = list(db.jobs.find({"employer_id": current_user["user_id"]}).sort("created_at", -1))
    
    for job in jobs:
        job.pop("_id", None)
    
    return jobs

@app.put("/api/employer/jobs/{job_id}")
async def update_job(job_id: str, job_data: JobUpdate, current_user: dict = Depends(require_role(["employer"]))):
    job = db.jobs.find_one({"job_id": job_id, "employer_id": current_user["user_id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not owned by you")
    
    # Update job
    update_data = {k: v for k, v in job_data.dict().items() if v is not None}
    if update_data:
        db.jobs.update_one({"job_id": job_id}, {"$set": update_data})
    
    updated_job = db.jobs.find_one({"job_id": job_id})
    updated_job.pop("_id", None)
    return updated_job

@app.delete("/api/employer/jobs/{job_id}")
async def delete_job(job_id: str, current_user: dict = Depends(require_role(["employer"]))):
    result = db.jobs.delete_one({"job_id": job_id, "employer_id": current_user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found or not owned by you")
    
    # Also delete related applications
    db.applications.delete_many({"job_id": job_id})
    
    return {"message": "Job deleted successfully"}

@app.get("/api/employer/jobs/{job_id}/applications")
async def get_job_applications(job_id: str, current_user: dict = Depends(require_role(["employer"]))):
    # Verify job ownership
    job = db.jobs.find_one({"job_id": job_id, "employer_id": current_user["user_id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not owned by you")
    
    applications = list(db.applications.find({"job_id": job_id}).sort("created_at", -1))
    
    for app in applications:
        app.pop("_id", None)
    
    return applications

@app.put("/api/employer/applications/{application_id}/status")
async def update_application_status(
    application_id: str, 
    status_data: ApplicationStatusUpdate, 
    current_user: dict = Depends(require_role(["employer"]))
):
    # Find application and verify job ownership
    application = db.applications.find_one({"application_id": application_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    job = db.jobs.find_one({"job_id": application["job_id"], "employer_id": current_user["user_id"]})
    if not job:
        raise HTTPException(status_code=403, detail="Not authorized to update this application")
    
    # Validate status
    if status_data.status not in ["applied", "approved", "rejected", "waitlisted"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    # Update application status
    db.applications.update_one(
        {"application_id": application_id},
        {"$set": {"status": status_data.status}}
    )
    
    updated_application = db.applications.find_one({"application_id": application_id})
    updated_application.pop("_id", None)
    return updated_application

# Admin endpoints
@app.get("/api/admin/jobs")
async def get_all_jobs_admin(current_user: dict = Depends(require_role(["admin"]))):
    jobs = list(db.jobs.find().sort("created_at", -1))
    
    for job in jobs:
        job.pop("_id", None)
    
    return jobs

@app.delete("/api/admin/jobs/{job_id}")
async def delete_job_admin(job_id: str, current_user: dict = Depends(require_role(["admin"]))):
    result = db.jobs.delete_one({"job_id": job_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Also delete related applications
    db.applications.delete_many({"job_id": job_id})
    
    return {"message": "Job deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)