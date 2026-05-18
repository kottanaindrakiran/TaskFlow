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
            
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs font-medium text-text-muted uppercase">or continue with</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <button type="button" className="w-full bg-card border border-border text-white font-semibold py-3 rounded-lg hover:bg-border/50 transition-colors flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
