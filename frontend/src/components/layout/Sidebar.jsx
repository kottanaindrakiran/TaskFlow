import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Team', path: '/team', icon: Users },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="w-[200px] h-full bg-sidebar border-r border-border flex flex-col shrink-0">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
          <CheckSquare size={20} />
        </div>
        <span className="text-xl font-semibold text-white">TaskFlow</span>
      </div>

      {/* Main Navigation */}
      <div className="flex flex-col gap-1 mt-4 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 font-medium transition-colors border-l-2 ${
                isActive
                  ? 'text-white bg-card border-primary'
                  : 'text-text-muted border-transparent hover:text-white hover:bg-card/50'
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}

        {/* Account Section */}
        <div className="mt-8 px-6 mb-2 text-xs font-semibold text-text-muted tracking-wider uppercase">
          Account
        </div>
        <Link
          to="#"
          className="flex items-center gap-3 px-6 py-3 font-medium transition-colors border-l-2 text-text-muted border-transparent hover:text-white hover:bg-card/50"
        >
          <Settings size={20} />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-6 py-3 font-medium transition-colors border-l-2 text-text-muted border-transparent hover:text-white hover:bg-card/50"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* User Profile Bottom */}
      <div className="p-4 border-t border-border flex items-center gap-3 hover:bg-card/50 cursor-pointer transition-colors">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
          {user?.name?.substring(0, 2).toUpperCase() || 'U'}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium text-white truncate">{user?.name}</span>
          <span className="text-xs text-text-muted capitalize">{user?.role}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
