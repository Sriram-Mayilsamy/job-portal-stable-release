import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import UI components
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './components/ui/alert-dialog';

// Icons from lucide-react
import { Search, MapPin, Calendar, Briefcase, User, Plus, Eye, Edit, Trash2, FileText, Building2, Clock, Users } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Axios setup
axios.defaults.baseURL = API_BASE_URL;

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Navigation Component
const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
                  <Badge variant="secondary" className="ml-2">{user.role}</Badge>
                </span>
                
                {user.role === 'employer' && (
                  <Link to="/employer/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    Dashboard
                  </Link>
                )}
                
                {user.role === 'jobseeker' && (
                  <Link to="/jobseeker/applications" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    My Applications
                  </Link>
                )}
                
                {user.role === 'admin' && (
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
  );
};

// Home Page
const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with top employers and discover opportunities that match your skills and aspirations.
            Join thousands of professionals who have found their perfect career match.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/jobs')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              <Search className="mr-2 h-5 w-5" />
              Browse Jobs
            </Button>
            
            {!user && (
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="px-8 py-3"
              >
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
            <p className="text-gray-600">
              Streamlined application process with powerful tools for both sides.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Auth Page
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'jobseeker',
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const data = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(endpoint, data);
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? 'Sign in to your account' : 'Join our job platform today'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jobseeker">Job Seeker</SelectItem>
                      <SelectItem value="employer">Employer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'employer' && (
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      required
                    />
                  </div>
                )}
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
              <strong>Admin Login:</strong><br />
              Email: admin<br />
              Password: admin123
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Jobs List Page
const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (searchTerm = '') => {
    try {
      const response = await axios.get(`/api/jobs?search=${searchTerm}`);
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(search);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
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
            <Card key={job.job_id} className="p-6 hover:shadow-lg transition-shadow">
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
                      {new Date(job.application_deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {job.salary_range && (
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {job.salary_range}
                  </Badge>
                )}
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              )}

              <Button onClick={() => navigate(`/jobs/${job.job_id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// Job Detail Page
const JobDetailPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!job) {
    return <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="p-8 text-center">
        <p className="text-gray-500">Job not found.</p>
      </Card>
    </div>;
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
              Apply by {new Date(job.application_deadline).toLocaleDateString()}
            </span>
          </div>

          {job.salary_range && (
            <Badge variant="secondary" className="text-lg px-4 py-2 mb-4">
              {job.salary_range}
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
                  <Badge key={index} variant="outline" className="text-sm">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4">
          {user && user.role === 'jobseeker' ? (
            <Button onClick={() => navigate(`/jobs/${job.job_id}/apply`)} size="lg">
              Apply Now
            </Button>
          ) : !user ? (
            <Button onClick={() => navigate('/auth')} size="lg">
              Login to Apply
            </Button>
          ) : null}
          
          <Button variant="outline" onClick={() => navigate('/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </Card>
    </div>
  );
};

// More components would go here...
// For brevity, I'll add the main App component

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
            {/* Add other routes here */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;