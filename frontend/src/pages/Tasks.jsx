import { useState, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const priorityColors = {
  high: 'text-red-500 bg-red-500/10',
  medium: 'text-amber-500 bg-amber-500/10',
  low: 'text-green-500 bg-green-500/10'
};

const avatarColors = ['bg-primary', 'bg-blue-600', 'bg-emerald-600', 'bg-orange-600'];
const getAvatarColor = (id) => avatarColors[(id || 0) % avatarColors.length];

const TaskCard = ({ task, projectsMap, onDragStart }) => {
  const isOverdue = task.status !== 'done' && task.due_date && new Date(task.due_date) < new Date();
  
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="bg-card border border-border p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors mb-4 flex flex-col gap-4 shadow-sm"
    >
      <h4 className="font-semibold text-white leading-snug">{task.title}</h4>
      
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-primary/20 text-primary">
          {projectsMap[task.project_id]?.name || 'Loading'}
        </span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-md capitalize ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${getAvatarColor(task.assignee.id)}`}>
                {task.assignee.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-sm text-text-secondary">{task.assignee.name.split(' ')[0]}</span>
            </>
          ) : (
            <span className="text-sm text-text-muted">Unassigned</span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-medium ${isOverdue ? 'text-red-500' : 'text-text-muted'}`}>
          {isOverdue && <AlertTriangle size={14} />}
          {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : 'No date'}
        </div>
      </div>
    </div>
  );
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks/'),
        api.get('/projects/')
      ]);
      setTasks(tasksRes.data);
      const pMap = {};
      projectsRes.data.forEach(p => { pMap[p.id] = p });
      setProjectsMap(pMap);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    
    // Optimistic update
    setTasks(prev => prev.map(t => t.id == taskId ? { ...t, status: newStatus } : t));
    
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success('Task status updated');
    } catch (err) {
      toast.error('Failed to update task status');
      fetchTasks(); // revert on failure
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  if (loading) return <div className="p-8 text-white">Loading tasks...</div>;

  return (
    <div className="p-8 h-full flex flex-col max-w-[1400px] mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Tasks</h1>
        <button className="flex items-center gap-2 bg-transparent border border-border text-white hover:bg-card px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} /> New task
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {/* Todo Column */}
        <div 
          className="flex-1 min-w-[320px] max-w-[400px] flex flex-col"
          onDrop={(e) => handleDrop(e, 'todo')}
          onDragOver={handleDragOver}
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-text-muted"></div>
              <h3 className="font-semibold text-text-secondary">Todo</h3>
            </div>
            <span className="text-xs font-semibold bg-card border border-border px-2 py-0.5 rounded-full text-text-muted">
              {todoTasks.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {todoTasks.map(task => <TaskCard key={task.id} task={task} projectsMap={projectsMap} onDragStart={handleDragStart} />)}
            <button className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-muted font-medium hover:text-white hover:border-text-secondary transition-colors flex items-center justify-center gap-2">
              <Plus size={18} /> Add task
            </button>
          </div>
        </div>

        {/* In Progress Column */}
        <div 
          className="flex-1 min-w-[320px] max-w-[400px] flex flex-col"
          onDrop={(e) => handleDrop(e, 'in_progress')}
          onDragOver={handleDragOver}
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <h3 className="font-semibold text-blue-500">In progress</h3>
            </div>
            <span className="text-xs font-semibold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">
              {inProgressTasks.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {inProgressTasks.map(task => <TaskCard key={task.id} task={task} projectsMap={projectsMap} onDragStart={handleDragStart} />)}
            <button className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-muted font-medium hover:text-white hover:border-text-secondary transition-colors flex items-center justify-center gap-2">
              <Plus size={18} /> Add task
            </button>
          </div>
        </div>

        {/* Done Column */}
        <div 
          className="flex-1 min-w-[320px] max-w-[400px] flex flex-col"
          onDrop={(e) => handleDrop(e, 'done')}
          onDragOver={handleDragOver}
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <h3 className="font-semibold text-green-500">Done</h3>
            </div>
            <span className="text-xs font-semibold bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
              {doneTasks.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {doneTasks.map(task => <TaskCard key={task.id} task={task} projectsMap={projectsMap} onDragStart={handleDragStart} />)}
            <button className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-muted font-medium hover:text-white hover:border-text-secondary transition-colors flex items-center justify-center gap-2">
              <Plus size={18} /> Add task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
