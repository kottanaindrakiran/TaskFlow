import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const priorityColors = {
  high: 'bg-red-500/10 text-red-500',
  medium: 'bg-amber-500/10 text-amber-500',
  low: 'bg-green-500/10 text-green-500'
};

const statusColors = {
  'todo': 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  'in_progress': 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  'done': 'bg-green-500/10 text-green-500 border border-green-500/20',
  'overdue': 'bg-red-500/10 text-red-500 border border-red-500/20',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectsMap, setProjectsMap] = useState({});

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/projects/')
        ]);
        setStats(statsRes.data);
        const pMap = {};
        projectsRes.data.forEach(p => { pMap[p.id] = p.name });
        setProjectsMap(pMap);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading dashboard...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="text-text-muted font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-card border border-border p-6 rounded-xl flex flex-col">
          <span className="text-text-muted font-medium mb-4">Total Tasks</span>
          <span className="text-4xl font-bold text-blue-500 mb-1">{stats?.total_tasks || 0}</span>
          <span className="text-sm text-text-muted">overall</span>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl flex flex-col">
          <span className="text-text-muted font-medium mb-4">Completed</span>
          <span className="text-4xl font-bold text-green-500 mb-1">{stats?.completed_tasks || 0}</span>
          <span className="text-sm text-green-500/70">{stats?.total_tasks ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0}% done</span>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl flex flex-col">
          <span className="text-text-muted font-medium mb-4">In Progress</span>
          <span className="text-4xl font-bold text-amber-500 mb-1">{stats?.in_progress_tasks || 0}</span>
          <span className="text-sm text-amber-500/70">active now</span>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl flex flex-col">
          <span className="text-text-muted font-medium mb-4">Overdue</span>
          <span className="text-4xl font-bold text-red-500 mb-1">{stats?.overdue_tasks || 0}</span>
          <span className="text-sm text-red-500/70">needs attention</span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-4">Recent tasks</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Task</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Project</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Priority</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Due date</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recent_tasks?.map((task) => {
              const isOverdue = task.status !== 'done' && task.due_date && new Date(task.due_date) < new Date();
              const displayStatus = isOverdue ? 'overdue' : task.status;
              return (
                <tr 
                  key={task.id} 
                  className={`border-b border-border last:border-0 ${isOverdue ? 'bg-[#1A0A0A]' : 'hover:bg-sidebar/50'} transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isOverdue ? 'text-white' : 'text-text-primary'}`}>
                        {task.title}
                      </span>
                      {isOverdue && <AlertTriangle size={14} className="text-red-500" />}
                    </div>
                    {isOverdue && <div className="text-xs text-red-500 mt-1">overdue</div>}
                  </td>
                  <td className="px-6 py-4 text-text-secondary font-medium">{projectsMap[task.project_id] || 'Loading...'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1.5 capitalize ${statusColors[displayStatus]}`}>
                      {displayStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-medium ${isOverdue ? 'text-red-500' : 'text-text-secondary'}`}>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                  </td>
                </tr>
              );
            })}
            {stats?.recent_tasks?.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-text-muted">No recent tasks</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
