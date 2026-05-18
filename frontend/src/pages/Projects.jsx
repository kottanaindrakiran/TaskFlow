import { useState, useEffect } from 'react';
import { Plus, ArrowRight, X } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const memberColors = ['bg-primary', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-600'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectActivity, setProjectActivity] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/');
      // Mock progress data for demo since backend doesn't aggregate it in /projects/ yet
      const enhanced = res.data.map(p => ({ ...p, progress: Math.floor(Math.random()*10), total: 10, members: [] }));
      setProjects(enhanced);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects/', { name: newProjectName, description: newProjectDesc });
      toast.success('Project created successfully');
      setShowModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to create project');
    }
  };

  const openProjectDrawer = async (project) => {
    setSelectedProject(project);
    try {
      const res = await api.get(`/projects/${project.id}/activity`);
      setProjectActivity(res.data);
    } catch (err) {
      toast.error('Failed to load activity');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading projects...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-transparent border border-border text-white hover:bg-card px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={18} /> New project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project.id} onClick={() => openProjectDrawer(project)} className="bg-card border border-border p-6 rounded-xl hover:border-primary/50 transition-colors cursor-pointer flex flex-col group">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{project.name}</h3>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/20 text-primary`}>
                Active
              </span>
            </div>
            <p className="text-text-muted mb-6 line-clamp-2 min-h-[48px]">
              {project.description || 'No description provided.'}
            </p>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm text-text-secondary mb-2 font-medium">
                <span>Progress</span>
                <span>{project.progress} / {project.total} tasks</span>
              </div>
              <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(project.progress / project.total) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="mt-auto flex justify-between items-end">
              <div className="flex flex-col gap-2">
                <div className="flex -space-x-2">
                  <div className={`w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs text-white font-bold border-2 border-card`}>
                    {user?.name?.substring(0,2).toUpperCase()}
                  </div>
                </div>
                <span className="text-xs text-text-muted">1 member</span>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-text-muted">Created {new Date(project.created_at).toLocaleDateString()}</span>
                <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:underline">
                  View project <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Project Placeholder */}
        {isAdmin && (
          <div onClick={() => setShowModal(true)} className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-8 text-text-muted hover:text-white hover:border-text-muted hover:bg-card/30 transition-all cursor-pointer min-h-[250px]">
            <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center mb-4">
              <Plus size={24} />
            </div>
            <span className="font-semibold text-lg">Create new project</span>
          </div>
        )}
      </div>
      
      {/* Drawer */}
      {selectedProject && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedProject(null)} />
          <div className="fixed top-0 right-0 h-full w-[400px] bg-card border-l border-border z-50 p-6 flex flex-col overflow-y-auto shadow-2xl transition-transform">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white">{selectedProject.name}</h2>
              <button onClick={() => setSelectedProject(null)} className="text-text-muted hover:text-white"><X size={24}/></button>
            </div>
            
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Activity Log</h3>
            <div className="flex flex-col gap-4">
              {projectActivity.map(act => (
                <div key={act.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0"></div>
                  <div>
                    <p className="text-white">{act.action}</p>
                    <p className="text-xs text-text-muted">{new Date(act.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {projectActivity.length === 0 && <p className="text-text-muted text-sm">No activity recorded yet.</p>}
            </div>
          </div>
        </>
      )}
      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border p-6 rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create New Project</h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Project Name</label>
                <input required type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="Enter project name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                <textarea value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary min-h-[100px]" placeholder="Enter project description"></textarea>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-colors mt-2">
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
