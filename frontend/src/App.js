"use client"

import React, { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import "./App.css"

// Import UI components
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Badge } from "./components/ui/badge"
import { Textarea } from "./components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/ui/alert-dialog"

// Icons from lucide-react
import { Search, MapPin, Calendar, Briefcase, Plus, Eye, Edit, Trash2, Building2, Users } from "lucide-react"

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL

// Axios setup
axios.defaults.baseURL = API_BASE_URL

// Utility function to convert snake_case to camelCase
const toCamelCase = (obj) => {
  const camelCaseObj = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
      camelCaseObj[camelKey] = obj[key]
    }
  }
  return camelCaseObj
}

// Auth Context
const AuthContext = React.createContext()

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      setUser(JSON.parse(userData))
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    delete axios.defaults.headers.common["Authorization"]
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

// Navigation Component
const Navigation = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center">
              <Briefcase className="mr-2" />
              JobPlatform
            </Link>
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              Browse Jobs
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">
                  Welcome, {user.full_name}
                  <Badge variant="secondary" className="ml-2">
                    {user.role}
                  </Badge>
                </span>

                {user.role === "employer" && (
                  <Link to="/employer/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    Dashboard
                  </Link>
                )}

                {user.role === "jobseeker" && (
                  <Link to="/jobseeker/applications" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    My Applications
                  </Link>
                )}

                {user.role === "admin" && (
                  <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    Admin Panel
                  </Link>
                )}

                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button>Login / Register</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

// Home Page
const HomePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Find Your Dream Job</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with top employers and discover opportunities that match your skills and aspirations. Join thousands
            of professionals who have found their perfect career match.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/jobs")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              <Search className="mr-2 h-5 w-5" />
              Browse Jobs
            </Button>

            {!user && (
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="px-8 py-3">
                Get Started
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Job Seekers</h3>
            <p className="text-gray-600">
              Discover opportunities, apply with ease, and track your applications in real-time.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Employers</h3>
            <p className="text-gray-600">
              Post jobs, manage applications, and find the perfect candidates for your team.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Management</h3>
            <p className="text-gray-600">Streamlined application process with powerful tools for both sides.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Auth Page
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "jobseeker",
    company: "",
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
      const data = isLogin ? { email: formData.email, password: formData.password } : toCamelCase(formData)

      const response = await axios.post(endpoint, data)
      login(response.data.token, response.data.user)
      navigate("/")
    } catch (error) {
      alert(error.response?.data?.detail || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Sign in to your account" : "Join our job platform today"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type={isLogin && formData.email === "admin" ? "text" : "email"}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jobseeker">Job Seeker</SelectItem>
                      <SelectItem value="employer">Employer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === "employer" && (
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                    />
                  </div>
                )}
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
              <strong>Admin Login:</strong>
              <br />
              Email: admin
              <br />
              Password: admin123
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Jobs List Page
const JobsPage = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async (searchTerm = "") => {
    try {
      const response = await axios.get(`/api/jobs?search=${searchTerm}`)
      setJobs(response.data.jobs)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchJobs(search)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Jobs</h1>

        <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl">
          <Input
            placeholder="Search jobs by title, company, location, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      <div className="grid gap-6">
        {jobs.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No jobs found. Try adjusting your search criteria.</p>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.jobId} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex items-center text-gray-600 space-x-4 mb-2">
                    <span className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {job.company}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {job.salaryRange && (
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {job.salaryRange}
                  </Badge>
                )}
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              <Button onClick={() => navigate(`/jobs/${job.jobId}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// Job Detail Page
const JobDetailPage = () => {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`)
      setJob(response.data)
    } catch (error) {
      console.error("Error fetching job:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Job not found.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>

          <div className="flex items-center text-gray-600 space-x-6 mb-4">
            <span className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              {job.company}
            </span>
            <span className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              {job.location}
            </span>
            <span className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Apply by {new Date(job.applicationDeadline).toLocaleDateString()}
            </span>
          </div>

          {job.salaryRange && (
            <Badge variant="secondary" className="text-lg px-4 py-2 mb-4">
              {job.salaryRange}
            </Badge>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Job Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Requirements</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4">
          {user && user.role === "jobseeker" ? (
            <Button onClick={() => navigate(`/jobs/${job.jobId}/apply`)} size="lg">
              Apply Now
            </Button>
          ) : !user ? (
            <Button onClick={() => navigate("/auth")} size="lg">
              Login to Apply
            </Button>
          ) : null}

          <Button variant="outline" onClick={() => navigate("/jobs")}>
            Back to Jobs
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Job Apply Page
const JobApplyPage = () => {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    resume: null,
  })
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== "jobseeker") {
      navigate("/auth")
      return
    }
    fetchJob()
  }, [id, user, navigate])

  const fetchJob = async () => {
    try {
      console.log("Fetching job with ID:", id)
      console.log("Full API URL:", `http://localhost:8002/api/employer/jobs/${id}`)

      const response = await axios.get(`http://localhost:8002/api/employer/jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const jobData = response.data
      console.log("Job data received:", jobData)
      setJob(jobData)
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || user.full_name || "",
        email: user.email || "",
      }))
    } catch (error) {
      console.error("Error fetching job:", error)
      console.error("Error response:", error.response?.data)
      console.error("Error status:", error.response?.status)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("fullName", formData.fullName)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("phone", formData.phone)
      formDataToSend.append("coverLetter", formData.coverLetter)
      formDataToSend.append("resume", formData.resume)

      await axios.post(`/api/jobs/${id}/apply`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      alert("Application submitted successfully!")
      navigate("/jobseeker/applications")
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to submit application")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Job not found.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for {job.title}</h1>
          <p className="text-gray-600">at {job.company}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="resume">Resume (PDF/DOC)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFormData({ ...formData, resume: e.target.files[0] })}
              required
            />
          </div>

          <div>
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              rows={6}
              placeholder="Tell us why you're interested in this position..."
              required
            />
          </div>

          <Button type="submit" size="lg" disabled={submitting} className="w-full">
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

// JobSeeker Applications Page
const JobSeekerApplicationsPage = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await axios.get("/api/jobseeker/applications")
      setApplications(response.data)
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "waitlisted":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Applications</h1>

      {applications.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
          <Button onClick={() => (window.location.href = "/jobs")}>Browse Jobs</Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <Card key={application.applicationId} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{application.jobTitle}</h3>
                  <p className="text-gray-600 mb-2">{application.jobCompany}</p>
                  <p className="text-sm text-gray-500">
                    Applied to {application.jobCompany} on{" "}
                    {application.createdAt && !isNaN(new Date(application.createdAt))
                      ? new Date(application.createdAt).toLocaleDateString()
                      : "Date not available"}
                  </p>
                </div>
                <Badge className={`${getStatusColor(application.status)} capitalize`}>{application.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Employer Dashboard
const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await axios.get("/api/employer/jobs")
      setJobs(response.data)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return

    try {
      await axios.delete(`/api/employer/jobs/${jobId}`)
      setJobs(jobs.filter((job) => job.jobId !== jobId))
      alert("Job deleted successfully")
    } catch (error) {
      alert("Failed to delete job")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
        <Button onClick={() => (window.location.href = "/employer/post-job")}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
          <Button onClick={() => (window.location.href = "/employer/post-job")}>Post Your First Job</Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job.jobId} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex items-center text-gray-600 space-x-4 mb-2">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 line-clamp-2">{job.description}</p>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = `/employer/jobs/${job.jobId}/applications`)}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Applications
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = `/employer/edit-job/${job.jobId}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure? This will permanently delete the job and all applications.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteJob(job.jobId)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Post Job Page
const PostJobPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    salaryRange: "",
    skills: "",
    applicationDeadline: "",
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        description: formData.description,
        requirements: formData.requirements,
        salaryRange: formData.salaryRange, // reverted back to camelCase to match Postman
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        applicationDeadline: formData.applicationDeadline, // reverted back to camelCase to match Postman
      }

      console.log("Sending job data:", jobData) // Add debugging to verify format
      await axios.post("/api/employer/jobs", jobData)
      alert("Job posted successfully!")
      navigate("/employer/dashboard")
    } catch (error) {
      console.error("Job posting error:", error.response?.data) // Add error debugging
      alert(error.response?.data?.detail || "Failed to post job")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Post a New Job</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="salaryRange">Salary Range</Label>
              <Input
                id="salaryRange"
                placeholder="e.g., $80,000 - $120,000"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              rows={4}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="skills">Required Skills (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="e.g., Python, React, MongoDB"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="applicationDeadline">Application Deadline</Label>
              <Input
                id="applicationDeadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? "Posting..." : "Post Job"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/employer/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

// Admin Dashboard
const AdminDashboard = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllJobs()
  }, [])

  const fetchAllJobs = async () => {
    try {
      const response = await axios.get("/api/admin/jobs")
      setJobs(response.data)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return

    try {
      await axios.delete(`/api/admin/jobs/${jobId}`)
      setJobs(jobs.filter((job) => job.jobId !== jobId))
      alert("Job deleted successfully")
    } catch (error) {
      alert("Failed to delete job")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">All Jobs ({jobs.length})</h2>
      </div>

      {jobs.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No jobs found.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job.jobId} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex items-center text-gray-600 space-x-4 mb-2">
                    <span className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {job.company}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </span>
                  </div>
                  <p className="text-gray-700 line-clamp-2">{job.description}</p>
                </div>

                <div className="flex gap-2 ml-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure? This will permanently delete the job and all applications.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteJob(job.jobId)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Job Applications Management Page
const JobApplicationsPage = () => {
  const { id } = useParams()
  const [applications, setApplications] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [id])

  const fetchApplications = async () => {
    try {
      const [jobResponse, applicationsResponse] = await Promise.all([
        axios.get(`/api/jobs/${id}`),
        axios.get(`/api/employer/jobs/${id}/applications`),
      ])

      setJob(jobResponse.data)
      setApplications(applicationsResponse.data)
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `http://localhost:8002/api/employer/applications/${applicationId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      setApplications(applications.map((app) => (app.applicationId === applicationId ? { ...app, status } : app)))
      alert(`Application ${status} successfully`)
    } catch (error) {
      console.error("Status update error:", error)
      alert("Failed to update application status")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "waitlisted":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Applications</h1>
        {job && (
          <p className="text-gray-600">
            For: {job.title} at {job.company}
          </p>
        )}
      </div>

      {applications.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No applications received yet.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <Card key={application.applicationId} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{application.fullName}</h3>
                  <div className="text-gray-600 space-y-1 mb-4">
                    <p>Email: {application.email}</p>
                    <p>Phone: {application.phone}</p>
                    <p>
                      Applied:{" "}
                      {application.createdAt && !isNaN(new Date(application.createdAt))
                        ? new Date(application.createdAt).toLocaleDateString()
                        : "Date not available"}
                    </p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Cover Letter:</h4>
                    <p className="text-gray-700">{application.coverLetter}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Badge className={`${getStatusColor(application.status)} capitalize mb-2`}>
                    {application.status}
                  </Badge>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateApplicationStatus(application.applicationId, "approved")}
                      disabled={application.status === "approved"}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicationStatus(application.applicationId, "waitlisted")}
                      disabled={application.status === "waitlisted"}
                    >
                      Waitlist
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateApplicationStatus(application.applicationId, "rejected")}
                      disabled={application.status === "rejected"}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

const EditJobPage = () => {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    salaryRange: "",
    skills: "",
    applicationDeadline: "",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      console.log("Fetching job with ID:", id)

      const response = await axios.get(`http://localhost:8002/api/employer/jobs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })

      console.log("All jobs received:", response.data)

      // Find the specific job by jobId
      const jobData = response.data.find((job) => job.jobId === id)

      if (!jobData) {
        setError("Job not found or you don't have permission to edit this job")
        setLoading(false)
        return
      }

      console.log("Job data found:", jobData)
      setJob(jobData)

      // Populate form with existing job data
      setFormData({
        title: jobData.title || "",
        company: jobData.company || "",
        location: jobData.location || "",
        description: jobData.description || "",
        requirements: jobData.requirements || "",
        salaryRange: jobData.salaryRange || "",
        skills: Array.isArray(jobData.skills) ? jobData.skills.join(", ") : "",
        applicationDeadline: jobData.applicationDeadline || "",
      })
      setLoading(false)
    } catch (error) {
      console.error("Error fetching job:", error)
      console.error("Error response:", error.response?.data)
      console.error("Error status:", error.response?.status)

      if (error.response?.status === 404) {
        setError("Job not found or you don't have permission to edit this job")
      } else if (error.response?.status === 403) {
        setError("You don't have permission to access this job")
      } else {
        setError("Failed to load job data. Please try again.")
      }
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const jobData = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill),
      }

      console.log("Updating job with data:", jobData)

      const token = localStorage.getItem("token")
      const response = await axios.put(`http://localhost:8002/api/employer/jobs/${id}`, jobData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Job updated successfully:", response.data)
      navigate("/employer/dashboard")
    } catch (error) {
      console.error("Error updating job:", error)
      alert("Failed to update job. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
          <Button onClick={() => navigate("/employer/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <Button onClick={() => navigate("/employer/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Job</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Job Description</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.requirements}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="salaryRange">Salary Range</Label>
              <Input
                id="salaryRange"
                name="salaryRange"
                type="text"
                placeholder="e.g., $50,000 - $70,000"
                value={formData.salaryRange}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                name="skills"
                type="text"
                placeholder="e.g., React, Node.js, MongoDB"
                value={formData.skills}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="applicationDeadline">Application Deadline</Label>
              <Input
                id="applicationDeadline"
                name="applicationDeadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? "Updating..." : "Update Job"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/employer/dashboard")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route
              path="/jobs/:id/apply"
              element={
                <ProtectedRoute allowedRoles={["jobseeker"]}>
                  <JobApplyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobseeker/applications"
              element={
                <ProtectedRoute allowedRoles={["jobseeker"]}>
                  <JobSeekerApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/post-job"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <PostJobPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/edit-job/:id"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <EditJobPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/jobs/:id/applications"
              element={
                <ProtectedRoute allowedRoles={["employer"]}>
                  <JobApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
