import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { CheckSquare, Shield, BarChart3, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup, user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Logged in successfully');
      } else {
        await signup(name, email, password);
        toast.success('Account created successfully');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Left Branding Side */}
      <div className="hidden lg:flex flex-col flex-1 border-r border-border p-12 justify-center items-center relative overflow-hidden">
        <div className="max-w-md w-full flex flex-col gap-12 z-10">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
              <CheckSquare size={28} />
            </div>
            <span className="text-3xl font-bold text-white">TaskFlow</span>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Manage teams.<br />Track tasks.<br />Ship faster.
            </h1>
            <p className="text-text-muted text-lg">
              A powerful task manager built for high-performance teams.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <div className="flex items-center gap-4 bg-card/50 border border-border p-4 rounded-xl">
              <Shield className="text-primary" size={24} />
              <span className="text-text-secondary font-medium">Role-based access control</span>
            </div>
            <div className="flex items-center gap-4 bg-card/50 border border-border p-4 rounded-xl">
              <BarChart3 className="text-primary" size={24} />
              <span className="text-text-secondary font-medium">Real-time progress dashboard</span>
            </div>
            <div className="flex items-center gap-4 bg-card/50 border border-border p-4 rounded-xl">
              <Users className="text-primary" size={24} />
              <span className="text-text-secondary font-medium">Team collaboration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#111111]">
        <div className="w-full max-w-sm flex flex-col gap-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-text-muted">Sign in to your TaskFlow account</p>
          </div>

          {/* Tab Toggle */}
          <div className="flex p-1 bg-card rounded-lg border border-border">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${isLogin ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${!isLogin ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {!isLogin && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-card border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-card border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <a href="#" className="text-sm font-medium text-primary hover:text-primary-hover">Forgot password?</a>
              </div>
            )}

            <button disabled={loading} type="submit" className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-[#6D28D9] transition-colors mt-2 disabled:opacity-50">
              {loading ? 'Processing...' : `Sign ${isLogin ? 'in' : 'up'} to TaskFlow`}
            </button>
            

          </form>
        </div>
      </div>
    </div>
  );
}
