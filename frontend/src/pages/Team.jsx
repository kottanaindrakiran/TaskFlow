import { useState, useEffect } from 'react';
import { Search, MoreVertical, Shield } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const avatarColors = ['bg-primary', 'bg-blue-600', 'bg-emerald-600', 'bg-orange-600'];
const getAvatarColor = (id) => avatarColors[(id || 0) % avatarColors.length];

export default function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();
  
  const isAdmin = currentUser?.role === 'admin';

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load team members (Admin only)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleRoleToggle = async (targetUser) => {
    if (!isAdmin) return;
    const newRole = targetUser.role === 'admin' ? 'member' : 'admin';
    try {
      await api.patch(`/users/${targetUser.id}/role`, { role: newRole });
      setUsers(users.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  if (!isAdmin) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center max-w-6xl mx-auto w-full text-center">
        <Shield size={48} className="text-primary mb-4 opacity-80" />
        <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
        <p className="text-text-muted">You do not have permission to view the team roster.</p>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-white">Loading team...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Team</h1>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-6 flex justify-between items-center">
        <div className="relative w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members..." 
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
        <button className="bg-primary text-white hover:bg-primary-hover px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Invite member
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-card/50">
              <th className="px-6 py-4 text-sm font-semibold text-text-muted w-16">Avatar</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Email</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Role</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr 
                key={u.id} 
                className="border-b border-border last:border-0 hover:bg-sidebar/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs text-white font-bold ${getAvatarColor(u.id)}`}>
                    {u.name.substring(0,2).toUpperCase()}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                <td className="px-6 py-4 text-text-secondary">{u.email}</td>
                <td className="px-6 py-4">
                  <span 
                    onClick={() => handleRoleToggle(u)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    u.role === 'admin' 
                      ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                      : 'bg-background text-text-secondary border border-border hover:bg-border/50'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-text-muted hover:text-white transition-colors p-1">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-text-muted">No members found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
