# Spring Boot Job Platform API

This is an **exact clone** of the FastAPI job platform backend, converted to Spring Boot with identical functionality and API contracts.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Role-based access control (admin, employer, jobseeker)
- BCrypt password hashing
- Admin user auto-initialization

### 👥 User Management
- User registration with email validation
- Role-specific registration (employer with company info)
- Secure login with token generation
- Admin user: `admin` / `admin123` (or `admin@jobplatform.com` / `admin123`)

### 💼 Job Management
- **Public Access:**
  - Browse all jobs with pagination
  - Search jobs by keyword (title, company, location, skills)
  - View individual job details

- **Employer Features:**
  - Create job postings
  - Update own job postings
  - Delete own job postings
  - View applications for own jobs
  - Update application status (approved, rejected, waitlisted)

- **Admin Features:**
  - View all jobs
  - Delete any job

### 📄 Job Applications
- **Job Seekers:**
  - Apply to jobs with resume upload
  - View own application history with job details
  - Prevent duplicate applications

- **File Management:**
  - Resume upload with unique filename generation
  - Static file serving for resumes
  - File storage in `/uploads` directory

## Technical Stack

- **Framework:** Spring Boot 3.2.1
- **Security:** Spring Security with JWT
- **Database:** H2 (in-memory for testing)
- **ORM:** Spring Data JPA with Hibernate
- **Validation:** Jakarta Bean Validation
- **File Upload:** MultipartFile support
- **Build Tool:** Maven

## Database Schema

### Users Table
- `user_id` (Primary Key, UUID)
- `email` (Unique, Email validation)
- `password` (BCrypt hashed)
- `role` (admin, employer, jobseeker)
- `full_name`
- `company` (for employers)
- `created_at`

### Jobs Table
- `job_id` (Primary Key, UUID)
- `employer_id` (Foreign Key to Users)
- `title`, `company`, `location`
- `description`, `requirements`
- `salary_range`
- `skills` (List of strings)
- `application_deadline`
- `created_at`

### Applications Table
- `application_id` (Primary Key, UUID)
- `job_id` (Foreign Key to Jobs)
- `applicant_id` (Foreign Key to Users)
- `full_name`, `email`, `phone`
- `cover_letter`
- `resume_filename`
- `status` (applied, approved, rejected, waitlisted)
- `created_at`

## API Endpoints

All endpoints are prefixed with `/api` to match the original FastAPI backend.

### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/jobs` - List jobs with pagination & search
- `GET /api/jobs/search` - Search jobs by keyword  
- `GET /api/jobs/{jobId}` - Get job details

### Job Seeker Endpoints (requires JOBSEEKER role)
- `POST /api/jobs/{jobId}/apply` - Apply to job with resume upload
- `GET /api/jobseeker/applications` - Get own applications with job details

### Employer Endpoints (requires EMPLOYER role)
- `POST /api/employer/jobs` - Create job posting
- `GET /api/employer/jobs` - Get own job postings
- `PUT /api/employer/jobs/{jobId}` - Update own job posting
- `DELETE /api/employer/jobs/{jobId}` - Delete own job posting
- `GET /api/employer/jobs/{jobId}/applications` - Get applications for own job
- `PUT /api/employer/applications/{applicationId}/status` - Update application status

### Admin Endpoints (requires ADMIN role)
- `GET /api/admin/jobs` - Get all jobs
- `DELETE /api/admin/jobs/{jobId}` - Delete any job

## Configuration

### Application Properties
```properties
# Server
server.port=8002

# H2 Database
spring.datasource.url=jdbc:h2:mem:jobplatform
spring.h2.console.enabled=true

# File Upload
spring.servlet.multipart.max-file-size=10MB

# JWT
jwt.secret=your-secret-key-change-in-production
jwt.expiration=86400000

# CORS
cors.allowed-origins=*
```

## Running the Application

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher

### Build and Run
```bash
# Build the project
./mvnw clean package

# Run the application
./mvnw spring-boot:run

# Or run the JAR file
java -jar target/job-platform-api-0.0.1-SNAPSHOT.jar
```

The application will start on port **8002**.

### Testing the API

#### Health Check
```bash
curl http://localhost:8002/api/health
```

#### Admin Login
```bash
curl -X POST http://localhost:8002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin", "password": "admin123"}'
```

#### Register User
```bash
curl -X POST http://localhost:8002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer@test.com",
    "password": "password123",
    "role": "employer",
    "fullName": "John Employer",
    "company": "TechCorp"
  }'
```

#### Create Job (with employer token)
```bash
curl -X POST http://localhost:8002/api/employer/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Senior Java Developer",
    "company": "TechCorp",
    "location": "New York, NY",
    "description": "Looking for an experienced Java developer",
    "requirements": "5+ years of Java experience",
    "salaryRange": "$80,000 - $120,000",
    "skills": ["Java", "Spring Boot", "REST APIs"],
    "applicationDeadline": "2025-09-15T23:59:59Z"
  }'
```

#### Apply to Job (with job seeker token and file upload)
```bash
curl -X POST http://localhost:8002/api/jobs/{jobId}/apply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "fullName=Jane Jobseeker" \
  -F "email=jobseeker@test.com" \
  -F "phone=+1-555-123-4567" \
  -F "coverLetter=I am very interested in this position" \
  -F "resume=@/path/to/resume.pdf"
```

## Key Features Matching Original FastAPI Backend

✅ **Identical API Contracts** - All endpoints match exactly  
✅ **Same Authentication Flow** - JWT tokens with identical structure  
✅ **Role-based Security** - Admin, employer, jobseeker roles  
✅ **File Upload Support** - Resume upload with multipart form data  
✅ **Search Functionality** - Job search by keywords across multiple fields  
✅ **Pagination Support** - List jobs with page/limit parameters  
✅ **Error Handling** - Consistent HTTP status codes and error messages  
✅ **Admin Initialization** - Auto-creates admin user on startup  
✅ **CORS Configuration** - Cross-origin request support  
✅ **Validation** - Input validation with proper error responses  

## Database Features

- **H2 In-Memory Database** - Fast testing with web console at `/h2-console`
- **Auto Schema Generation** - Tables created automatically from entities
- **UUID Primary Keys** - No MongoDB ObjectId issues
- **Relationship Management** - Proper foreign key relationships
- **Transaction Support** - ACID compliance with JPA transactions

## Security Features

- **JWT Authentication** - Stateless token-based auth
- **Password Encryption** - BCrypt hashing
- **Role-based Authorization** - Method-level security
- **CORS Protection** - Configurable cross-origin policies
- **Input Validation** - Bean validation with error responses
- **File Upload Security** - Filename sanitization and storage

## File Management

- **Resume Storage** - Files saved in `/uploads` directory
- **Unique Filenames** - UUID prefixes prevent collisions
- **Static File Serving** - Resume files accessible via `/uploads/*` URLs
- **File Size Limits** - Configurable upload size restrictions

This Spring Boot application provides 100% functional compatibility with the original FastAPI backend while leveraging the Java ecosystem's robust tooling and enterprise features.