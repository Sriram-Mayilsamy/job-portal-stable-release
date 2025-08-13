import requests
import sys
import json
from datetime import datetime, timedelta
import uuid
import os

class JobPlatformAPITester:
    def __init__(self, base_url="https://careernexus.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.employer_token = None
        self.jobseeker_token = None
        self.test_job_id = None
        self.test_application_id = None
        self.tests_run = 0
        self.tests_passed = 0
        
        # Test data
        self.test_employer = {
            "email": f"employer_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "full_name": "Test Employer",
            "role": "employer",
            "company": "Test Company Inc"
        }
        
        self.test_jobseeker = {
            "email": f"jobseeker_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "full_name": "Test Job Seeker",
            "role": "jobseeker"
        }
        
        self.test_job = {
            "title": "Senior Software Engineer",
            "company": "Test Company Inc",
            "location": "San Francisco, CA",
            "description": "We are looking for a senior software engineer to join our team.",
            "requirements": "5+ years of experience in Python and React",
            "salary_range": "$120,000 - $150,000",
            "skills": ["Python", "React", "FastAPI", "MongoDB"],
            "application_deadline": (datetime.now() + timedelta(days=30)).isoformat()
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
            
        if files:
            # Remove Content-Type for file uploads
            test_headers.pop('Content-Type', None)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=test_headers)
                else:
                    response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:500]}")

            return success, response.json() if response.text and response.status_code < 500 else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "/api/health",
            200
        )
        return success

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "/api/auth/login",
            200,
            data={"email": "admin", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_user_registration(self):
        """Test user registration for both employer and jobseeker"""
        # Test employer registration
        success1, response1 = self.run_test(
            "Employer Registration",
            "POST",
            "/api/auth/register",
            200,
            data=self.test_employer
        )
        if success1 and 'token' in response1:
            self.employer_token = response1['token']
            print(f"   Employer token obtained: {self.employer_token[:20]}...")

        # Test jobseeker registration
        success2, response2 = self.run_test(
            "Jobseeker Registration",
            "POST",
            "/api/auth/register",
            200,
            data=self.test_jobseeker
        )
        if success2 and 'token' in response2:
            self.jobseeker_token = response2['token']
            print(f"   Jobseeker token obtained: {self.jobseeker_token[:20]}...")

        return success1 and success2

    def test_user_login(self):
        """Test user login"""
        success1, response1 = self.run_test(
            "Employer Login",
            "POST",
            "/api/auth/login",
            200,
            data={"email": self.test_employer["email"], "password": self.test_employer["password"]}
        )

        success2, response2 = self.run_test(
            "Jobseeker Login",
            "POST",
            "/api/auth/login",
            200,
            data={"email": self.test_jobseeker["email"], "password": self.test_jobseeker["password"]}
        )

        return success1 and success2

    def test_job_creation(self):
        """Test job creation by employer"""
        if not self.employer_token:
            print("❌ No employer token available for job creation")
            return False

        success, response = self.run_test(
            "Job Creation",
            "POST",
            "/api/employer/jobs",
            200,
            data=self.test_job,
            headers={'Authorization': f'Bearer {self.employer_token}'}
        )
        
        if success and 'job_id' in response:
            self.test_job_id = response['job_id']
            print(f"   Job created with ID: {self.test_job_id}")
            return True
        return False

    def test_job_listing(self):
        """Test public job listing"""
        success, response = self.run_test(
            "Job Listing",
            "GET",
            "/api/jobs",
            200
        )
        
        if success and 'jobs' in response:
            print(f"   Found {len(response['jobs'])} jobs")
            return True
        return False

    def test_job_search(self):
        """Test job search functionality"""
        success, response = self.run_test(
            "Job Search",
            "GET",
            "/api/jobs?search=Software",
            200
        )
        
        if success and 'jobs' in response:
            print(f"   Search returned {len(response['jobs'])} jobs")
            return True
        return False

    def test_job_detail(self):
        """Test getting job details"""
        if not self.test_job_id:
            print("❌ No test job ID available")
            return False

        success, response = self.run_test(
            "Job Detail",
            "GET",
            f"/api/jobs/{self.test_job_id}",
            200
        )
        
        if success and 'job_id' in response:
            print(f"   Retrieved job: {response['title']}")
            return True
        return False

    def test_employer_job_management(self):
        """Test employer job management endpoints"""
        if not self.employer_token:
            print("❌ No employer token available")
            return False

        # Get employer's jobs
        success1, response1 = self.run_test(
            "Get Employer Jobs",
            "GET",
            "/api/employer/jobs",
            200,
            headers={'Authorization': f'Bearer {self.employer_token}'}
        )

        # Update job (if we have a job ID)
        success2 = True
        if self.test_job_id:
            update_data = {"title": "Updated Senior Software Engineer"}
            success2, response2 = self.run_test(
                "Update Job",
                "PUT",
                f"/api/employer/jobs/{self.test_job_id}",
                200,
                data=update_data,
                headers={'Authorization': f'Bearer {self.employer_token}'}
            )

        return success1 and success2

    def test_job_application(self):
        """Test job application by jobseeker"""
        if not self.jobseeker_token or not self.test_job_id:
            print("❌ Missing jobseeker token or job ID for application test")
            return False

        # Create a dummy resume file
        resume_content = b"This is a test resume content"
        files = {'resume': ('test_resume.pdf', resume_content, 'application/pdf')}
        
        application_data = {
            'full_name': 'Test Job Seeker',
            'email': self.test_jobseeker['email'],
            'phone': '+1234567890',
            'cover_letter': 'I am very interested in this position and believe I would be a great fit.'
        }

        success, response = self.run_test(
            "Job Application",
            "POST",
            f"/api/jobs/{self.test_job_id}/apply",
            200,
            data=application_data,
            files=files,
            headers={'Authorization': f'Bearer {self.jobseeker_token}'}
        )
        
        if success and 'application_id' in response:
            self.test_application_id = response['application_id']
            print(f"   Application created with ID: {self.test_application_id}")
            return True
        return False

    def test_jobseeker_applications(self):
        """Test getting jobseeker's applications"""
        if not self.jobseeker_token:
            print("❌ No jobseeker token available")
            return False

        success, response = self.run_test(
            "Get Jobseeker Applications",
            "GET",
            "/api/jobseeker/applications",
            200,
            headers={'Authorization': f'Bearer {self.jobseeker_token}'}
        )
        
        if success:
            print(f"   Found {len(response)} applications")
            return True
        return False

    def test_employer_application_management(self):
        """Test employer application management"""
        if not self.employer_token or not self.test_job_id:
            print("❌ Missing employer token or job ID")
            return False

        # Get applications for job
        success1, response1 = self.run_test(
            "Get Job Applications",
            "GET",
            f"/api/employer/jobs/{self.test_job_id}/applications",
            200,
            headers={'Authorization': f'Bearer {self.employer_token}'}
        )

        # Update application status
        success2 = True
        if self.test_application_id:
            success2, response2 = self.run_test(
                "Update Application Status",
                "PUT",
                f"/api/employer/applications/{self.test_application_id}/status",
                200,
                data={"status": "approved"},
                headers={'Authorization': f'Bearer {self.employer_token}'}
            )

        return success1 and success2

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False

        success, response = self.run_test(
            "Admin Get All Jobs",
            "GET",
            "/api/admin/jobs",
            200,
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Job Platform API Tests")
        print("=" * 50)

        # Basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed, stopping tests")
            return False

        # Authentication tests
        if not self.test_admin_login():
            print("❌ Admin login failed")
        
        if not self.test_user_registration():
            print("❌ User registration failed")
        
        if not self.test_user_login():
            print("❌ User login failed")

        # Job management tests
        if not self.test_job_creation():
            print("❌ Job creation failed")
        
        if not self.test_job_listing():
            print("❌ Job listing failed")
        
        if not self.test_job_search():
            print("❌ Job search failed")
        
        if not self.test_job_detail():
            print("❌ Job detail failed")
        
        if not self.test_employer_job_management():
            print("❌ Employer job management failed")

        # Application workflow tests
        if not self.test_job_application():
            print("❌ Job application failed")
        
        if not self.test_jobseeker_applications():
            print("❌ Jobseeker applications failed")
        
        if not self.test_employer_application_management():
            print("❌ Employer application management failed")

        # Admin tests
        if not self.test_admin_endpoints():
            print("❌ Admin endpoints failed")

        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = JobPlatformAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())