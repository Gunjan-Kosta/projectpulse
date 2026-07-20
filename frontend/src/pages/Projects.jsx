import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { 
  FiFolder, FiCalendar, FiCpu, FiFile, 
  FiUploadCloud, FiEdit3, FiSave, FiX, FiCheckCircle 
} from 'react-icons/fi';

const Projects = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null); // Leader/Member single project
  const [projectsList, setProjectsList] = useState([]); // Admin list of projects
  
  // Edit forms state for Leader
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      if (user.role === 'admin') {
        const { data: res } = await api.get('/api/admin/teams');
        if (res.success) {
          // Extract projects from teams list
          const projects = res.teams.map(t => ({
            ...t.project,
            teamName: t.name,
            mentorName: t.mentor?.name
          })).filter(p => p._id);
          setProjectsList(projects);
        }
      } else if (user.role === 'mentor') {
        const { data: res } = await api.get('/api/mentor/teams');
        if (res.success) {
          const projects = res.teams.map(t => ({
            ...t.project,
            teamName: t.name,
            leaderName: t.leader?.name
          })).filter(p => p._id);
          setProjectsList(projects);
        }
      } else {
        // Leader or Member
        const { data: res } = await api.get('/api/common/project');
        if (res.success) {
          setProject(res.project);
          // Initialize edit form values
          setName(res.project.name || '');
          setDescription(res.project.description || '');
          setTechStack(res.project.techStack ? res.project.techStack.join(', ') : '');
          setStartDate(res.project.startDate ? new Date(res.project.startDate).toISOString().split('T')[0] : '');
          setEndDate(res.project.endDate ? new Date(res.project.endDate).toISOString().split('T')[0] : '');
          setStatus(res.project.status || 'Not Started');
          setProgress(res.project.progress || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching project deliverables:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProjectData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleUpdateProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: res } = await api.put('/api/leader/project', {
        name,
        description,
        techStack,
        startDate,
        endDate,
        status,
        progress
      });

      if (res.success) {
        toast.success('Project details updated successfully');
        setProject(res.project);
        setIsEditing(false);
        loadProjectData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.error('Please select a file to upload');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);
      const { data: res } = await api.post('/api/leader/project/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        toast.success('Document uploaded successfully');
        setSelectedFile(null);
        // Refresh project documents list
        loadProjectData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'File upload failed. Max 10MB PDFs/ZIPs/Images.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Admin and Mentor view showing all projects list
  if (user.role === 'admin' || user.role === 'mentor') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-800 dark:text-white">Projects Repository</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Overview of all student project modules and deadlines.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase border-b border-slate-200/60 dark:border-slate-800">
                  <th className="p-4 pl-6">Project Name</th>
                  <th className="p-4">Assigned Team</th>
                  {user.role === 'admin' ? <th className="p-4">Mentor</th> : <th className="p-4">Leader</th>}
                  <th className="p-4">Status</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4 pr-6">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {projectsList.length > 0 ? (
                  projectsList.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-800 dark:text-white">{p.name}</td>
                      <td className="p-4 font-semibold text-slate-500">{p.teamName}</td>
                      {user.role === 'admin' ? (
                        <td className="p-4 text-slate-500 font-semibold">{p.mentorName || 'Unassigned'}</td>
                      ) : (
                        <td className="p-4 text-slate-500 font-semibold">{p.leaderName || 'Unassigned'}</td>
                      )}
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                          p.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : p.status === 'In Progress'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                          </div>
                          <span className="font-bold text-[10px]">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 pr-6 font-medium text-slate-400">
                        {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'TBD'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 dark:text-slate-500 font-medium">
                      No projects registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Student Leader/Member View
  if (!project) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <FiFolder size={32} className="mx-auto text-slate-400 mb-2" />
        <h3 className="font-bold text-slate-800 dark:text-white font-poppins">No Project Assigned</h3>
        <p className="text-xs text-slate-500 mt-1">Ask the Admin to assign a project module to your team.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-800 dark:text-white">Project Blueprint</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Detailed view of project scope, timelines, and assets.</p>
        </div>
        {user.role === 'leader' && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <FiEdit3 size={14} /> Edit Blueprint
          </button>
        )}
      </div>

      {isEditing ? (
        // Leader edit panel
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleUpdateProjectSubmit} className="space-y-4">
            <h3 className="text-sm font-bold font-poppins text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 uppercase tracking-wider mb-2">Edit Blueprint</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, MongoDB"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Project Description</label>
              <textarea
                value={description}
                rows={3}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary dark:bg-slate-800 dark:border-slate-700/80 dark:text-white"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">Progress Percentage ({progress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  className="w-full h-1.5 bg-slate-105 rounded-lg appearance-none cursor-pointer focus:outline-none dark:bg-slate-700"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-350"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/10"
              >
                <FiSave /> Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Standard view details
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                {project.status}
              </span>
              <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white mt-3.5">{project.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed">{project.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-800 py-5 text-xs">
              <div className="flex items-center gap-3">
                <FiCalendar className="text-primary text-base" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Timeline</span>
                  <span className="font-bold">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiCpu className="text-accent text-base" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Technology Stack</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.techStack && project.techStack.length > 0 ? (
                      project.techStack.map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800/60 text-[9px] font-bold rounded-md text-slate-500 border border-slate-200/50 dark:border-slate-700/60">
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">None specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Progress */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Project Progress</span>
                <span className="font-bold text-slate-900 dark:text-white font-poppins">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-sm font-bold font-poppins text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">Attached Assets & Docs</h3>
            
            {/* Upload Document Box for Team Leader */}
            {user.role === 'leader' && (
              <form onSubmit={handleFileUpload} className="flex gap-3 items-end p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Attach Document (PDF, ZIP, Image)</label>
                  <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:cursor-pointer"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold disabled:opacity-75"
                >
                  {uploading ? <Spinner size="sm" color="white" /> : <><FiUploadCloud /> Upload</>}
                </button>
              </form>
            )}

            {/* List of Documents */}
            <div className="space-y-3">
              {project.documents && project.documents.length > 0 ? (
                project.documents.map((doc, idx) => {
                  const downloadUrl = window.location.hostname === 'localhost' ? `http://localhost:5000${doc.path}` : doc.path;
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                          <FiFile size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{doc.name}</h4>
                          <span className="text-[9px] text-slate-400">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'TBD'}</span>
                        </div>
                      </div>
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 text-[10px] font-bold text-slate-600 dark:text-slate-300"
                      >
                        Download
                      </a>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center italic">No documents attached yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
